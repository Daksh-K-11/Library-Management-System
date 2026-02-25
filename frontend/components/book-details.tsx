"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { ArrowLeft, BookOpen } from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRouter, useParams } from "next/navigation"
import { getToken, API_BASE_URL } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import { Star } from "lucide-react"

export default function BookDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string
  const [bookData, setBookData] = React.useState<any | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const { toast } = useToast()

  React.useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      const token = getToken()
      if (!token) {
        router.push("/")
        return
      }
      try {
        // Adjust endpoint if your API shape is different
        const res = await fetch(`${API_BASE_URL}/books/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) {
          throw new Error("Failed to fetch")
        }
        const json = await res.json()
        // If API wraps the resource, adjust extraction accordingly
        const payload = json?.book || json?.item || json
        setBookData(payload)
      } catch (err) {
        toast({ title: "Failed to load book", description: "Could not fetch book details.", variant: "destructive" })
      } finally {
        setIsLoading(false)
      }
    }

    if (id) load()
  }, [id, router, toast])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-emerald-500/20 text-emerald-700 border-emerald-200"
      case "reading":
        return "bg-blue-500/20 text-blue-700 border-blue-200"
      case "unread":
        return "bg-amber-500/20 text-amber-700 border-amber-200"
      default:
        return "bg-slate-500/20 text-slate-700 border-slate-200"
    }
  }

  return (
    <div className="flex min-h-screen w-full bg-gradient-to-br from-slate-50 to-slate-100">
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 px-6 md:px-8 border-b border-slate-200/50 bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.back()} className="h-10 w-10 p-2 rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold text-foreground">Book</h1>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8">
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[60vh]">
              <BookOpen className="w-12 h-12 text-primary/40 animate-spin" />
            </div>
          ) : !bookData ? (
            <div className="text-center min-h-[60vh]">
              <p className="text-muted-foreground">No book found.</p>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="sm:col-span-1 flex justify-center sm:justify-start">
                  <div className="w-44 h-64 rounded-xl overflow-hidden shadow-lg bg-gradient-to-br from-slate-100 to-slate-200">
                    {bookData.cover_url ? (
                      <img src={bookData.cover_url} alt={bookData.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gradient-to-br from-primary/10 to-primary/5">
                        <BookOpen className="w-16 h-16 text-primary/40" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="sm:col-span-2 space-y-4">
                  <h2 className="text-2xl font-semibold">{bookData.title}</h2>
                  {bookData.authors && (
                    <p className="text-sm text-muted-foreground">{Array.isArray(bookData.authors) ? bookData.authors.join(", ") : bookData.authors}</p>
                  )}

                  {bookData.rating && (
                    <div className="flex items-center gap-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={i < bookData.rating ? "w-4 h-4 fill-amber-400 text-amber-400" : "w-4 h-4 text-slate-200"} />
                      ))}
                      <span className="text-sm font-medium">{bookData.rating}/5</span>
                    </div>
                  )}

                  <div>
                    <Badge className={getStatusColor(bookData.read_status || "unread") + " text-xs font-medium border uppercase tracking-wide"}>{bookData.read_status || "unread"}</Badge>
                  </div>

                  <div className="mt-4 space-y-3">
                    {bookData.publisher && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Publisher</p>
                        <p className="text-sm font-medium text-foreground">{bookData.publisher}</p>
                      </div>
                    )}

                    {bookData.published_year && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Published</p>
                        <p className="text-sm font-medium text-foreground">{bookData.published_year}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {bookData.description && (
                <div className="mt-6">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Description</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{bookData.description}</p>
                </div>
              )}

              {(bookData.categories || bookData.genres) && (
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl">
                  {bookData.categories && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Categories</p>
                      <div className="flex flex-wrap gap-2">{(bookData.categories || []).map((c: string) => <Badge key={c} variant="outline" className="text-xs border-slate-200">{c}</Badge>)}</div>
                    </div>
                  )}

                  {bookData.genres && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Genres</p>
                      <div className="flex flex-wrap gap-2">{(bookData.genres || []).map((g: string) => <Badge key={g} className="text-xs">{g}</Badge>)}</div>
                    </div>
                  )}
                </div>
              )}

              {bookData.tags && (
                <div className="mt-6">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">{(bookData.tags || []).map((t: string) => <Badge key={t} variant="outline" className="text-xs border-slate-200">#{t}</Badge>)}</div>
                </div>
              )}

              {bookData.personal_notes && (
                <div className="mt-6 bg-primary/5 border border-primary/20 rounded-xl p-4">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Personal Notes</p>
                  <p className="text-sm italic text-foreground leading-relaxed">"{bookData.personal_notes}"</p>
                </div>
              )}
            </motion.div>
          )}
        </main>
      </SidebarInset>
    </div>
  )
}
