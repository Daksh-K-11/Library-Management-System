"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Plus, Loader2, BookOpen, LibraryIcon } from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import { BookCard } from "@/components/book-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { getToken, API_BASE_URL } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Suspense } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

function DashboardContent() {
  const [books, setBooks] = React.useState([])
  const [activeLibraryId, setActiveLibraryId] = React.useState<string | null>(null)
  const [isLibraryModalOpen, setIsLibraryModalOpen] = React.useState(false)
  const [newLibName, setNewLibName] = React.useState("")
  const [newLibPublic, setNewLibPublic] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(true)
  const { toast } = useToast()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = React.useState("")

  const fetchBooks = React.useCallback(async () => {
    const token = getToken()
    if (!token) {
      router.push("/")
      return
    }

    try {
      const endpoint = activeLibraryId
        ? `${API_BASE_URL}/librarybooks/${activeLibraryId}`
        : `${API_BASE_URL}/books?q=${searchQuery}`

      const response = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setBooks(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      toast({
        title: "Error fetching library",
        description: "Could not sync with your collection.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [searchQuery, activeLibraryId, router, toast])

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
        window.location.reload()
      }
    } catch (error) {
      toast({ title: "Failed to create library", variant: "destructive" })
    }
  }

  const handleDelete = async (id: string) => {
    const token = getToken()
    try {
      const endpoint = activeLibraryId ? `${API_BASE_URL}/librarybooks/${activeLibraryId}` : `${API_BASE_URL}/books`

      const response = await fetch(endpoint, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ user_book_ids: [id] }),
      })

      if (response.ok) {
        setBooks((prev) => prev.filter((b) => b.user_book_id !== id))
        toast({ title: "Book removed successfully" })
      }
    } catch (error) {
      toast({ title: "Failed to remove book", variant: "destructive" })
    }
  }

  return (
    <div className="flex min-h-screen w-full bg-background/50">
      <AppSidebar activeLibraryId={activeLibraryId} onLibrarySelect={(id) => setActiveLibraryId(id)} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 px-8 transition-[width,height] ease-linear group-has-data-[view=sidebar]/sidebar-wrapper:h-12 border-b border-border/40 bg-white/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="-ml-1" />
            <div className="h-4 w-px bg-border/50" />
            <h1 className="text-lg font-serif font-medium">{activeLibraryId ? "Custom Library" : "My Library"}</h1>
          </div>

          <div className="flex items-center gap-4 flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
              <Input
                placeholder="Search your collection..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 bg-secondary/30 border-none rounded-xl focus-visible:ring-1 focus-visible:ring-primary/20"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setIsLibraryModalOpen(true)}
              className="h-10 rounded-xl gap-2 border-primary/20 hover:bg-primary/5"
            >
              <LibraryIcon className="w-4 h-4" />
              <span className="hidden sm:inline">New Library</span>
            </Button>
            <Button className="h-10 rounded-xl gap-2 shadow-lg shadow-primary/5">
              <Plus className="w-4 h-4" />
              <span>Add Book</span>
            </Button>
          </div>
        </header>

        <main className="p-8">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary/40" />
              <p className="text-sm text-muted-foreground font-medium italic">Opening the archives...</p>
            </div>
          ) : books.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence>
                {books.map((book) => (
                  <BookCard key={book.user_book_id} book={book} onEdit={() => {}} onDelete={handleDelete} />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center min-h-[60vh] text-center"
            >
              <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mb-6">
                <BookOpen className="w-10 h-10 text-primary/30" />
              </div>
              <h2 className="text-2xl font-serif mb-2">Your library is waiting</h2>
              <p className="text-muted-foreground max-w-sm mb-8">
                Start your digital archive by adding your first book to the collection.
              </p>
              <Button
                variant="outline"
                className="h-12 rounded-xl px-8 border-primary/20 hover:bg-primary/5 bg-transparent"
              >
                <Plus className="w-4 h-4 mr-2" />
                Begin Collection
              </Button>
            </motion.div>
          )}
        </main>

        <Dialog open={isLibraryModalOpen} onOpenChange={setIsLibraryModalOpen}>
          <DialogContent className="sm:max-w-md rounded-[2rem] border-none shadow-2xl p-8">
            <DialogHeader>
              <DialogTitle className="text-2xl font-serif">Create New Library</DialogTitle>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground px-1">
                  Library Name
                </Label>
                <Input
                  value={newLibName}
                  onChange={(e) => setNewLibName(e.target.value)}
                  placeholder="e.g. Rare Editions"
                  className="h-12 bg-secondary/30 border-none rounded-xl"
                />
              </div>
              <div className="flex items-center space-x-2 px-1">
                <Checkbox
                  id="public"
                  checked={newLibPublic}
                  onCheckedChange={(checked) => setNewLibPublic(!!checked)}
                />
                <Label htmlFor="public" className="text-sm font-medium">
                  Make library public
                </Label>
              </div>
            </div>
            <DialogFooter className="sm:justify-start">
              <Button onClick={handleCreateLibrary} className="w-full h-12 rounded-xl">
                Create Collection
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={null}>
      <DashboardContent />
    </Suspense>
  )
}
