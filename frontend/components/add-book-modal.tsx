"use client"

import { useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, ScanLine } from "lucide-react"
import { getToken, API_BASE_URL } from "@/lib/auth"

interface Props {
  open: boolean
  onClose: () => void
  onBookAdded: () => void
}

export function AddBookModal({ open, onClose, onBookAdded }: Props) {
  const [isbn, setIsbn] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [fetchedBook, setFetchedBook] = useState<any>(null)

  const isValidISBN = (value: string) => {
    return /^\d{10}(\d{3})?$/.test(value)
  }

  const handleSearch = async () => {
    if (!isValidISBN(isbn)) {
      alert("ISBN must be exactly 10 or 13 digits.")
      return
    }

    const token = getToken()
    setIsLoading(true)

    try {
      const res = await fetch(
        `${API_BASE_URL}/isbn/?isbn=${isbn}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      if (!res.ok) throw new Error()

      const data = await res.json()
      setFetchedBook(data)
    } catch {
      alert("Book not found.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddBook = async () => {
    const token = getToken()
    if (!token || !fetchedBook) return

    try {
      const res = await fetch(`${API_BASE_URL}/books/${isbn}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          genres: [],
          tags: [],
          personal_notes: "",
          rating: null,
          read_status: "unread",
        }),
      })

      if (!res.ok) throw new Error()

      onBookAdded()
      onClose()
    } catch {
      alert("Failed to add book.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg rounded-2xl">
        {!fetchedBook ? (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Add Book</h2>

            <Input
              value={isbn}
              onChange={(e) => setIsbn(e.target.value)}
              placeholder="Enter ISBN (10 or 13 digits)"
            />

            <div className="flex gap-3">
              <Button onClick={handleSearch} disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin" /> : "Search"}
              </Button>

              {/* Placeholder for future barcode */}
              <Button variant="outline" disabled>
                <ScanLine className="w-4 h-4 mr-2" />
                Scan (Soon)
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">
              {fetchedBook.title}
            </h2>

            <div className="flex gap-4">
              {fetchedBook.cover_url && (
                <img
                  src={fetchedBook.cover_url}
                  className="w-24 h-36 object-cover rounded-lg shadow"
                />
              )}

              <div className="space-y-2 text-sm">
                <p><strong>Author:</strong> {fetchedBook.authors?.join(", ")}</p>
                <p><strong>Publisher:</strong> {fetchedBook.publisher}</p>
                <p><strong>Year:</strong> {fetchedBook.published_year}</p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setFetchedBook(null)}>
                Back
              </Button>
              <Button onClick={handleAddBook}>
                Add to Library
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
