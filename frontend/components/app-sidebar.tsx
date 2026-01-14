"use client"
import React from "react"
import { LibraryIcon, BookOpen, Settings, Plus, LogOut, Trash2, Edit3, MoreHorizontal } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { getToken, API_BASE_URL } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface Library {
  id: string
  name: string
  is_public: boolean
  slug: string
}

interface AppSidebarProps {
  activeLibraryId: string | null
  onLibrarySelect: (id: string | null) => void
}

export function AppSidebar({ activeLibraryId, onLibrarySelect }: AppSidebarProps) {
  const [libraries, setLibraries] = React.useState<Library[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  // Create library modal state
  const [isLibraryModalOpen, setIsLibraryModalOpen] = React.useState(false)
  const [newLibPublic, setNewLibPublic] = React.useState(false)
  const [newLibName, setNewLibName] = React.useState("")

  // Rename modal state (you said rename button is proper)
  const [isRenameModalOpen, setIsRenameModalOpen] = React.useState(false)
  const [renameLibName, setRenameLibName] = React.useState("")
  const [selectedLibraryForRename, setSelectedLibraryForRename] = React.useState<Library | null>(null)

  // Public URL modal state (new)
  const [isPublicDialogOpen, setIsPublicDialogOpen] = React.useState(false)
  const [selectedLibraryForPublic, setSelectedLibraryForPublic] = React.useState<Library | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  const fetchLibraries = React.useCallback(async () => {
    const token = getToken()
    if (!token) return

    try {
      const response = await fetch(`${API_BASE_URL}/library`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        // `data` is expected to be the array you provided which includes slug
        setLibraries(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error("[v0] Error fetching libraries:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchLibraries()
  }, [fetchLibraries])

  const handleCreateLibrary = async () => {
    const token = getToken()
    try {
      const response = await fetch(`${API_BASE_URL}/library`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newLibName, is_public: newLibPublic }),
      })

      if (response.ok) {
        toast({ title: "Library created" })
        setIsLibraryModalOpen(false)
        setNewLibName("")
        // Re-fetch or optimistically update — re-fetching keeps it simple
        fetchLibraries()
      }
    } catch (error) {
      toast({ title: "Failed to create library", variant: "destructive" })
    }
  }

  const deleteLibrary = async (id: string) => {
    const token = getToken()
    try {
      const response = await fetch(`${API_BASE_URL}/library/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        setLibraries((prev) => prev.filter((l) => l.id !== id))
        if (activeLibraryId === id) onLibrarySelect(null)
        toast({ title: "Library deleted" })
      }
    } catch (error) {
      toast({ title: "Failed to delete library", variant: "destructive" })
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("athenaeum_token")
    router.push("/")
  }

  // ---------- Rename handlers ----------
  const openRenameDialog = (lib: Library) => {
    setSelectedLibraryForRename(lib)
    setRenameLibName(lib.name)
    setIsRenameModalOpen(true)
  }

  const handleRenameLibrary = async () => {
    if (!selectedLibraryForRename) return
    const token = getToken()
    try {
      const response = await fetch(`${API_BASE_URL}/library/${selectedLibraryForRename.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: renameLibName }),
      })

      if (response.ok) {
        setLibraries((prev) =>
          prev.map((l) => (l.id === selectedLibraryForRename.id ? { ...l, name: renameLibName } : l))
        )
        toast({ title: "Library renamed" })
        setIsRenameModalOpen(false)
      }
    } catch {
      toast({ title: "Failed to rename library", variant: "destructive" })
    }
  }

  // ---------- Public URL handlers ----------
  const openPublicDialog = (lib: Library) => {
    setSelectedLibraryForPublic(lib)
    setIsPublicDialogOpen(true)
  }

  const handleChangePrivacy = async (lib: Library, newIsPublic: boolean) => {
    const token = getToken()
    try {
      const response = await fetch(`${API_BASE_URL}/library/${lib.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_public: newIsPublic }),
      })

      if (response.ok) {
        // Update libraries list
        setLibraries((prev) => prev.map((l) => (l.id === lib.id ? { ...l, is_public: newIsPublic } : l)))
        // reflect change in the currently-open dialog (if any)
        setSelectedLibraryForPublic((prev) => (prev && prev.id === lib.id ? { ...prev, is_public: newIsPublic } : prev))
        toast({ title: newIsPublic ? "Library is now public" : "Library made private" })
      } else {
        toast({ title: "Failed to update privacy", variant: "destructive" })
      }
    } catch (err) {
      toast({ title: "Failed to update privacy", variant: "destructive" })
    }
  }

  // Helper to build public url using slug ({{BaseURL}}/public/library/{slug})
  const buildPublicUrl = (slug: string | undefined) => {
    if (!slug) return ""
    return `${window.location.origin}/public/library/${slug}`
  }

  const handleCopyPublicUrl = async (slug: string) => {
    const url = `${API_BASE_URL}/public/library/${slug}`

    try {
      await navigator.clipboard.writeText(url)
      toast({
        title: "Public URL copied",
        description: "Anyone with this link can view the library",
      })
    } catch {
      toast({
        title: "Failed to copy",
        variant: "destructive",
      })
    }
  }


  return (
    <Sidebar variant="inset" className="border-r border-border/50">
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3 text-primary">
          <LibraryIcon className="w-6 h-6" />
          <span className="text-xl font-serif font-bold tracking-tight">Athenaeum</span>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4">
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 mb-2 text-[10px] font-bold tracking-widest uppercase text-muted-foreground/60">
            Collections
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeLibraryId === null}
                  onClick={() => onLibrarySelect(null)}
                  tooltip="My Library"
                  className="h-11 rounded-xl"
                >
                  <BookOpen className="w-4 h-4" />
                  <span className="font-medium">My Library</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {libraries.map((lib) => (
                <SidebarMenuItem key={lib.id} className="group/item relative">
                  <SidebarMenuButton
                    isActive={activeLibraryId === lib.id}
                    onClick={() => onLibrarySelect(lib.id)}
                    tooltip={lib.name}
                    className="h-11 rounded-xl pr-8"
                  >
                    <LibraryIcon className="w-4 h-4" />
                    <span className="font-medium truncate">{lib.name}</span>
                  </SidebarMenuButton>

                  <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/item:opacity-100 transition-opacity">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg">
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56 rounded-xl">
                        <DropdownMenuItem
                          className="gap-2"
                          onClick={() => openRenameDialog(lib)}
                        >
                          <Edit3 className="w-4 h-4" /> Rename
                        </DropdownMenuItem>

                        {/* Public URL menu item opens dialog */}
                        <DropdownMenuItem
                          onClick={() => openPublicDialog(lib)}
                          className="gap-2"
                        >
                          {/* small label + obscured or actual url in small text below */}
                          <div className="flex flex-col items-start">
                            <span className="font-medium">Public URL</span>
                          </div>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => deleteLibrary(lib.id)}
                          className="gap-2 text-destructive focus:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="px-2 mb-2 text-[10px] font-bold tracking-widest uppercase text-muted-foreground/60">
            Management
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Add New Library" className="h-11 rounded-xl" onClick={() => setIsLibraryModalOpen(true)}>
                  <Plus className="w-4 h-4" />
                  <span className="font-medium">Add New Library</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Settings" className="h-11 rounded-xl">
                  <Settings className="w-4 h-4" />
                  <span className="font-medium">Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 mt-auto">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              className="h-11 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/5"
            >
              <LogOut className="w-4 h-4" />
              <span className="font-medium">Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      {/* Create Library Dialog */}
      <Dialog open={isLibraryModalOpen} onOpenChange={setIsLibraryModalOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl border-slate-200/50 shadow-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold text-foreground">Create New Library</DialogTitle>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold tracking-widest uppercase text-muted-foreground">
                  Library Name
                </Label>
                <Input
                  value={newLibName}
                  onChange={(e) => setNewLibName(e.target.value)}
                  placeholder="e.g. Rare Editions"
                  className="h-10 bg-slate-100/50 border-slate-200/50 rounded-lg text-sm"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="public"
                  checked={newLibPublic}
                  onCheckedChange={(checked) => setNewLibPublic(!!checked)}
                />
                <Label htmlFor="public" className="text-sm font-medium cursor-pointer">
                  Make library public
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreateLibrary} className="w-full h-10 rounded-lg">
                Create Collection
              </Button>
            </DialogFooter>
          </motion.div>
        </DialogContent>
      </Dialog>

      {/* Rename Dialog */}
      <Dialog open={isRenameModalOpen} onOpenChange={setIsRenameModalOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl border-slate-200/50 shadow-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold text-foreground">Rename Library</DialogTitle>
            </DialogHeader>

            <div className="grid gap-6 py-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold tracking-widest uppercase text-muted-foreground">
                  New Name
                </Label>
                <Input
                  value={renameLibName}
                  onChange={(e) => setRenameLibName(e.target.value)}
                  placeholder="e.g. Three More"
                  className="h-10 bg-slate-100/50 border-slate-200/50 rounded-lg text-sm"
                />
              </div>
            </div>

            <DialogFooter>
              <Button onClick={handleRenameLibrary} className="w-full h-10 rounded-lg">
                Save Changes
              </Button>
            </DialogFooter>
          </motion.div>
        </DialogContent>
      </Dialog>

      {/* Public URL Dialog */}
      <Dialog open={isPublicDialogOpen} onOpenChange={setIsPublicDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl border-slate-200/50 shadow-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold text-foreground">Public URL</DialogTitle>
            </DialogHeader>

            <div className="grid gap-6 py-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold tracking-widest uppercase text-muted-foreground">
                  Library
                </Label>
                <div className="text-sm font-medium">{selectedLibraryForPublic?.name}</div>
              </div>

              {/* <div className="space-y-2">
                <Label className="text-xs font-bold tracking-widest uppercase text-muted-foreground">
                  Public URL
                </Label>

                <Input
                  value={
                    selectedLibraryForPublic
                      ? selectedLibraryForPublic.is_public
                        ? buildPublicUrl(selectedLibraryForPublic.slug)
                        : "••••••••••••••••••••"
                      : ""
                  }
                  readOnly
                  className="h-10 bg-slate-100/50 border-slate-200/50 rounded-lg text-sm"
                />
              </div> */}
              <div className="space-y-2">
                <Label className="text-xs font-bold tracking-widest uppercase text-muted-foreground">
                  Public URL
                </Label>

                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={
                      selectedLibraryForPublic?.is_public
                        ? `${API_BASE_URL}/public/library/${selectedLibraryForPublic.slug}`
                        : "••••••••••••••••••••••••••••"
                    }
                    className="h-10 bg-slate-100/50 border-slate-200/50 rounded-lg text-sm"
                  />

                  {selectedLibraryForPublic?.is_public && (
                    <Button
                      variant="secondary"
                      className="h-10 rounded-lg"
                      onClick={() => handleCopyPublicUrl(selectedLibraryForPublic.slug)}
                    >
                      Copy
                    </Button>
                  )}
                </div>
              </div>


              <div className="flex items-center gap-3">
                <Checkbox
                  id="toggle-public"
                  checked={selectedLibraryForPublic?.is_public ?? false}
                  onCheckedChange={(checked) => {
                    if (!selectedLibraryForPublic) return
                    // toggle privacy and update UI
                    handleChangePrivacy(selectedLibraryForPublic, !!checked)
                  }}
                />
                <Label htmlFor="toggle-public" className="text-sm font-medium cursor-pointer">
                  Make library public
                </Label>
              </div>
            </div>

            <DialogFooter>
              <Button onClick={() => setIsPublicDialogOpen(false)} className="w-full h-10 rounded-lg">
                Done
              </Button>
            </DialogFooter>
          </motion.div>
        </DialogContent>
      </Dialog>
    </Sidebar>
  )
}
