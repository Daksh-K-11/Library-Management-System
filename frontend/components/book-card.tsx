"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Star, BookOpen } from "lucide-react"
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
}

export function BookCard({ data }: BookCardProps) {
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

  const ratingValue = data.rating ?? 0


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
            {/* Hover Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Content */}
            <div className="relative flex gap-4 p-4 items-start">
              {/* Left: Book Cover */}
              <motion.div
                className="relative w-24 h-36 shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 shadow-md"
                whileHover={{ scale: 1.05, rotateZ: 1.5 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                {book.cover_url ? (
                  <img
                    src={book.cover_url}
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-gradient-to-br from-primary/10 to-primary/5">
                    <BookOpen className="w-8 h-8 text-primary/40" />
                  </div>
                )}
              </motion.div>

              {/* Right: Book Info */}
              <div className="flex flex-col flex-1 min-w-0">
                {/* Title */}
                <h3 className="text-base font-semibold text-xl text-foreground leading-snug line-clamp-2">
                  {book.title}
                </h3>

                {/* Author */}
                <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                  {book.authors?.join(", ") || "Unknown Author"}
                </p>

                {/* Rating */}
                {data.rating && (
                  <div className="flex items-center gap-0.5 mt-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "w-4 h-4",
                          i < ratingValue
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-200"
                        )}
                      />
                    ))}
                  </div>
                )}

                {/* Status */}
                <div className="mt-2">
                  <Badge
                    className={cn(
                      "text-xs font-medium border uppercase tracking-wide",
                      getStatusColor(data.read_status)
                    )}
                  >
                    {data.read_status}
                  </Badge>
                </div>

                {/* Hover Hint */}
                <div className="mt-auto pt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-xs text-primary/60 font-medium">
                    Click to view details
                  </p>
                </div>
              </div>
            </div>
          </div>

        </motion.div>
      </motion.div>
    </>
  )
}



