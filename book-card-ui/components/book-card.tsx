"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Star, BookOpen } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface ApiBook {
  user_book_id: string
  rating?: number
  read_status: "unread" | "reading" | "completed"
  genres?: string[]
  tags?: string[]
  personal_notes?: string
  book: {
    title: string
    authors?: string[]
    publisher?: string
    published_year?: number
    description?: string
    categories?: string[]
    cover_url?: string
  }
}

interface BookCardProps {
  data: ApiBook
  onDelete?: (id: string) => void
}

export function BookCard({ data, onDelete }: BookCardProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (!data || !data.book) return null

  const { book } = data

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
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <motion.div
          onClick={() => setIsOpen(true)}
          className="group relative h-full cursor-pointer"
          whileHover={{ y: -8 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          {/* Card Container */}
          <div className="relative h-full rounded-2xl overflow-hidden bg-gradient-to-br from-white to-slate-50 border border-slate-200/50 shadow-md hover:shadow-2xl transition-shadow duration-300">
            {/* Hover Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Content */}
            <div className="relative h-full flex flex-col p-4">
              {/* Book Cover Area */}
              <div className="mb-4 flex justify-center">
                <motion.div
                  className="relative w-32 h-48 rounded-lg overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 shadow-lg"
                  whileHover={{ scale: 1.05, rotateZ: 2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  {book.cover_url ? (
                    <img
                      src={book.cover_url || "/placeholder.svg"}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gradient-to-br from-primary/10 to-primary/5">
                      <BookOpen className="w-10 h-10 text-primary/40" />
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Title */}
              <h3 className="text-sm font-semibold line-clamp-2 text-foreground text-center mb-2 leading-tight">
                {book.title}
              </h3>

              {/* Author */}
              <p className="text-xs text-muted-foreground text-center mb-3 line-clamp-1">
                {book.authors?.join(", ") || "Unknown Author"}
              </p>

              {/* Rating Stars */}
              {data.rating && (
                <div className="flex items-center justify-center gap-0.5 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "w-3.5 h-3.5",
                        i < data.rating ? "fill-amber-400 text-amber-400" : "text-slate-200",
                      )}
                    />
                  ))}
                </div>
              )}

              {/* Status Badge */}
              <div className="flex justify-center mb-3">
                <Badge
                  className={cn("text-xs font-medium border uppercase tracking-wide", getStatusColor(data.read_status))}
                >
                  {data.read_status}
                </Badge>
              </div>

              {/* View Details Hint */}
              <div className="mt-auto pt-3 border-t border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="text-xs text-center text-primary/60 font-medium">Click to view details</p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Detail Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl rounded-2xl border-slate-200/50 shadow-2xl max-h-[85vh] overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <DialogHeader className="border-b border-slate-100 pb-6">
              <DialogTitle className="text-2xl font-semibold text-foreground text-balance pr-8">
                {book.title}
              </DialogTitle>
            </DialogHeader>

            <div className="p-6 space-y-6">
              {/* Book Cover & Main Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {/* Cover */}
                <motion.div
                  className="sm:col-span-1 flex justify-center sm:justify-start"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <div className="w-40 h-56 rounded-xl overflow-hidden shadow-lg bg-gradient-to-br from-slate-100 to-slate-200">
                    {book.cover_url ? (
                      <img
                        src={book.cover_url || "/placeholder.svg"}
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gradient-to-br from-primary/10 to-primary/5">
                        <BookOpen className="w-14 h-14 text-primary/40" />
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Main Info */}
                <motion.div
                  className="sm:col-span-2 space-y-4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  {/* Author */}
                  {book.authors && book.authors.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                        Author{book.authors.length > 1 ? "s" : ""}
                      </p>
                      <p className="text-sm font-medium text-foreground">{book.authors.join(", ")}</p>
                    </div>
                  )}

                  {/* Rating */}
                  {data.rating && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                        Your Rating
                      </p>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "w-4 h-4",
                              i < data.rating ? "fill-amber-400 text-amber-400" : "text-slate-200",
                            )}
                          />
                        ))}
                        <span className="ml-2 text-sm font-medium text-foreground">{data.rating}/5</span>
                      </div>
                    </div>
                  )}

                  {/* Status */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                      Reading Status
                    </p>
                    <Badge
                      className={cn(
                        "text-xs font-medium border uppercase tracking-wide",
                        getStatusColor(data.read_status),
                      )}
                    >
                      {data.read_status}
                    </Badge>
                  </div>
                </motion.div>
              </div>

              {/* Book Details Grid */}
              <motion.div
                className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                {book.publisher && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                      Publisher
                    </p>
                    <p className="text-sm font-medium text-foreground">{book.publisher}</p>
                  </div>
                )}

                {book.published_year && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                      Published
                    </p>
                    <p className="text-sm font-medium text-foreground">{book.published_year}</p>
                  </div>
                )}
              </motion.div>

              {/* Description */}
              {book.description && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.25 }}
                >
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                    Description
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{book.description}</p>
                </motion.div>
              )}

              {/* Categories & Genres */}
              {(book.categories || data.genres) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                  className="space-y-3"
                >
                  {book.categories && book.categories.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                        Categories
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {book.categories.map((cat) => (
                          <Badge key={cat} variant="outline" className="text-xs border-slate-200">
                            {cat}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {data.genres && data.genres.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                        Genres
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {data.genres.map((genre) => (
                          <Badge key={genre} variant="secondary" className="text-xs">
                            {genre}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Tags */}
              {data.tags && data.tags.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.35 }}
                >
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {data.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs border-slate-200">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Personal Notes */}
              {data.personal_notes && (
                <motion.div
                  className="bg-primary/5 border border-primary/20 rounded-xl p-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                >
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                    Personal Notes
                  </p>
                  <p className="text-sm italic text-foreground leading-relaxed">"{data.personal_notes}"</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>
    </>
  )
}
