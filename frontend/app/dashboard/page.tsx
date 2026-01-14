"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Plus, Loader2, BookOpen, LibraryIcon } from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import { BookCard, type ApiBook } from "@/components/book-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { getToken, API_BASE_URL } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { BookDetailView } from "@/components/book-detail-view"

function DashboardContent() {
  const [books, setBooks] = React.useState<ApiBook[]>([])
  const [activeLibraryId, setActiveLibraryId] = React.useState<string | null>(null)
  const [isLibraryModalOpen, setIsLibraryModalOpen] = React.useState(false)
  const [newLibName, setNewLibName] = React.useState("")
  const [newLibPublic, setNewLibPublic] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(true)
  const [selectedBook, setSelectedBook] = React.useState<ApiBook | null>(null)
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
        if (activeLibraryId) {
          setBooks(Array.isArray(data.books) ? data.books : [])
          return
        } else {
          setBooks(Array.isArray(data.items) ? data.items : [])
        }
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

  React.useEffect(() => {
    setIsLoading(true)
    fetchBooks()
  }, [fetchBooks])

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
        fetchBooks()
        toast({ title: "Book removed successfully" })
      }
    } catch (error) {
      toast({ title: "Failed to remove book", variant: "destructive" })
    }
  }

  return (
    <div className="flex min-h-screen w-full bg-gradient-to-br from-slate-50 to-slate-100">
      <AppSidebar activeLibraryId={activeLibraryId} onLibrarySelect={(id) => setActiveLibraryId(id)} />
      <SidebarInset>
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 px-6 md:px-8 transition-[width,height] ease-linear group-has-data-[view=sidebar]/sidebar-wrapper:h-12 border-b border-slate-200/50 bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="-ml-1" />
            <div className="h-4 w-px bg-slate-200" />
            <h1 className="text-lg font-semibold text-foreground hidden sm:block">
              {activeLibraryId ? "Custom Library" : "My Library"}
            </h1>
          </div>

          <div className="flex items-center gap-3 flex-1 max-w-sm mx-4 md:mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
              <Input
                placeholder="Search books..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 bg-slate-100/50 border-slate-200/50 rounded-full focus-visible:ring-1 focus-visible:ring-primary/30 text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <Button className="h-10 rounded-full gap-2 shadow-lg shadow-primary/10 text-sm">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add</span>
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8">
          {isLoading ? (
            <motion.div
              className="flex flex-col items-center justify-center min-h-[60vh] gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              >
                <Loader2 className="w-8 h-8 text-primary/40" />
              </motion.div>
              <p className="text-sm text-muted-foreground font-medium italic">Opening the archives...</p>
            </motion.div>
          ) : books.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max">
                <AnimatePresence>
                  {books.map((book) => (
                    <div key={book.user_book_id} onClick={() => setSelectedBook(book)} role="button" tabIndex={0}>
                      <BookCard data={book} onDelete={handleDelete} />
                    </div>
                  ))}
                </AnimatePresence>
              </div>

              <AnimatePresence>
                {selectedBook && (
                  <BookDetailView
                    book={selectedBook}
                    onClose={() => setSelectedBook(null)}
                    onDelete={(id) => {
                      setBooks((prev) => prev.filter((b) => b.user_book_id !== id))
                      setSelectedBook(null)
                    }}
                    onRefresh={fetchBooks}
                  />
                )}
              </AnimatePresence>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center min-h-[60vh] text-center"
            >
              <motion.div
                className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              >
                <BookOpen className="w-10 h-10 text-primary/30" />
              </motion.div>
              <h2 className="text-2xl font-semibold mb-2 text-foreground">Your library is waiting</h2>
              <p className="text-muted-foreground max-w-sm mb-8">
                Start your digital archive by adding your first book to the collection.
              </p>
              <Button
                variant="outline"
                className="h-12 rounded-full px-8 border-slate-200/50 hover:bg-slate-100 text-foreground bg-transparent"
              >
                <Plus className="w-4 h-4 mr-2" />
                Begin Collection
              </Button>
            </motion.div>
          )}
        </main>

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
      </SidebarInset>
    </div>
  )
}

export default function DashboardPage() {
  return <DashboardContent />
}
