"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
    Star,
    BookOpen,
    X,
    Save,
    Edit2,
    EyeOff,
    Loader2,
    ScanLine,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
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
    const [isSaving, setIsSaving] = useState(false)
    const [showNotification, setShowNotification] = useState<{ type: "success" | "error"; message: string } | null>(null)
    const [confirmingDelete, setConfirmingDelete] = useState(false)

    const [newGenre, setNewGenre] = useState("")
    const [newTag, setNewTag] = useState("")

    const [editData, setEditData] = useState({
        rating: 0,
        read_status: "unread" as "unread" | "reading" | "completed",
        personal_notes: "",
        genres: [] as string[],
        tags: [] as string[],
    })

    const isValidISBN = (value: string) => {
        return /^\d{10}(\d{3})?$/.test(value)
    }

    const showStatusNotification = (type: "success" | "error", message: string) => {
        setShowNotification({ type, message })
        setTimeout(() => setShowNotification(null), 4000)
    }

    const handleSearch = async () => {
        if (!isValidISBN(isbn)) {
            showStatusNotification("error", "ISBN must be exactly 10 or 13 digits.")
            return
        }

        const token = getToken()
        setIsLoading(true)

        try {
            const res = await fetch(`${API_BASE_URL}/isbn/?isbn=${isbn}`, {
                headers: { Authorization: `Bearer ${token}` },
            })

            if (!res.ok) throw new Error()

            const data = await res.json()
            setFetchedBook(data)
            setEditData({
                rating: 0,
                read_status: "unread",
                personal_notes: "",
                genres: [],
                tags: [],
            })
        } catch {
            showStatusNotification("error", "Book not found.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleAddBook = async () => {
        const token = getToken()
        if (!token || !fetchedBook) return

        setIsSaving(true)
        try {
            const res = await fetch(`${API_BASE_URL}/books/${isbn}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    genres: editData.genres,
                    tags: editData.tags,
                    personal_notes: editData.personal_notes,
                    rating: editData.rating || null,
                    read_status: editData.read_status,
                }),
            })

            if (!res.ok) throw new Error()

            showStatusNotification("success", "Book added successfully!")
            setTimeout(() => {
                onBookAdded()
                onClose()
                setFetchedBook(null)
                setIsbn("")
            }, 500)
        } catch {
            showStatusNotification("error", "Failed to add book.")
        } finally {
            setIsSaving(false)
        }
    }

    const addGenre = () => {
        if (newGenre.trim() && !editData.genres.includes(newGenre)) {
            setEditData((prev) => ({
                ...prev,
                genres: [...prev.genres, newGenre],
            }))
            setNewGenre("")
        }
    }

    const removeGenre = (genre: string) => {
        setEditData((prev) => ({
            ...prev,
            genres: prev.genres.filter((g) => g !== genre),
        }))
    }

    const addTag = () => {
        if (newTag.trim() && !editData.tags.includes(newTag)) {
            setEditData((prev) => ({
                ...prev,
                tags: [...prev.tags, newTag],
            }))
            setNewTag("")
        }
    }

    const removeTag = (tag: string) => {
        setEditData((prev) => ({
            ...prev,
            tags: prev.tags.filter((t) => t !== tag),
        }))
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed":
                return "bg-emerald-500/20 text-emerald-700 border-emerald-300"
            case "reading":
                return "bg-blue-500/20 text-blue-700 border-blue-300"
            case "unread":
                return "bg-amber-500/20 text-amber-700 border-amber-300"
            default:
                return "bg-slate-500/20 text-slate-700 border-slate-300"
        }
    }


    if (!open) return null

    return (
        <>
            {/* Notification Toast */}
            {showNotification && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={cn(
                        "fixed top-4 right-4 z-50 px-4 py-3 rounded-lg font-medium text-sm",
                        showNotification.type === "success"
                            ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                            : "bg-red-100 text-red-700 border border-red-200"
                    )}
                >
                    {showNotification.message}
                </motion.div>
            )}


            {/* Main Modal Overlay */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-lg z-40"
                onClick={onClose}
            >
                <motion.div
                    initial={{ y: 100, opacity: 0, scale: 0.95 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: 100, opacity: 0, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="absolute inset-4 md:inset-8 lg:inset-12
                     bg-white rounded-3xl shadow-2xl flex flex-col max-h-[90vh]"
                >
                    {!fetchedBook ? (
                        <>
                            {/* ISBN Search Header */}
                            <div className="flex justify-between items-center p-6 border-b">
                                <h1 className="text-2xl font-bold">Add Book</h1>
                                <Button variant="ghost" onClick={onClose}>
                                    <X />
                                </Button>
                            </div>

                            {/* ISBN Search Content */}
                            <div className="flex-1 overflow-y-auto p-6 md:p-8">
                                <div className="max-w-2xl mx-auto space-y-6">
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-4"
                                    >
                                        <div>
                                            <label className="text-sm font-semibold text-slate-700 mb-2 block">
                                                Enter ISBN (10 or 13 digits)
                                            </label>
                                            <Input
                                                value={isbn}
                                                onChange={(e) => setIsbn(e.target.value)}
                                                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                                                placeholder="Enter ISBN (10 or 13 digits)"
                                                className="h-12 text-base"
                                            />
                                        </div>

                                        <div className="flex gap-3 flex-col sm:flex-row">
                                            <Button
                                                onClick={handleSearch}
                                                disabled={isLoading}
                                                className="flex-1 h-10 bg-blue-600 hover:bg-blue-700 text-white"
                                            >
                                                {isLoading ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                        Searching...
                                                    </>
                                                ) : (
                                                    "Search"
                                                )}
                                            </Button>

                                            <Button variant="outline" disabled className="flex-1 h-10">
                                                <ScanLine className="w-4 h-4 mr-2" />
                                                Scan (Soon)
                                            </Button>
                                        </div>
                                    </motion.div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Book Detail Header */}
                            <div className="flex justify-between items-center p-6 border-b">
                                <h1 className="text-2xl font-bold line-clamp-2">{fetchedBook.title}</h1>
                                <div className="flex gap-2">
                                    <Button variant="ghost" onClick={onClose}>
                                        <X />
                                    </Button>
                                </div>
                            </div>

                            {/* Book Detail Content */}
                            <div className="flex-1 overflow-y-auto p-6 md:p-8">
                                <div className="max-w-4xl mx-auto space-y-8">
                                    {/* Book Info Grid */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8 items-start"
                                    >
                                        {/* Cover */}
                                        <motion.div whileHover={{ scale: 1.08, rotateY: 5 }} className="md:col-span-1">
                                            <div className="w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-xl bg-gradient-to-br from-blue-100 to-purple-100 border-2 border-gradient-to-r from-blue-200 to-purple-200">
                                                {fetchedBook.cover_url ? (
                                                    <img
                                                        src={fetchedBook.cover_url}
                                                        alt={fetchedBook.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-200 to-purple-200">
                                                        <BookOpen className="w-16 h-16 text-blue-400/60" />
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>

                                        {/* Main Info */}
                                        <motion.div
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.3 }}
                                            className="md:col-span-3 space-y-4 md:space-y-6"
                                        >
                                            {/* Author */}
                                            {fetchedBook.authors && fetchedBook.authors.length > 0 && (
                                                <motion.div
                                                    whileHover={{ x: 5 }}
                                                    className="p-4 rounded-xl bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200/50"
                                                >
                                                    <p className="text-xs font-bold uppercase tracking-widest text-cyan-600 mb-2">Author</p>
                                                    <p className="text-lg font-medium text-slate-900">{fetchedBook.authors.join(", ")}</p>
                                                </motion.div>
                                            )}

                                            <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50">
                                                <p className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-3">
                                                    Your Rating
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <motion.button
                                                            key={star}
                                                            whileHover={{ scale: 1.3, rotate: 15 }}
                                                            whileTap={{ scale: 0.85 }}
                                                            onClick={() => setEditData((prev) => ({ ...prev, rating: star }))}
                                                        >
                                                            <Star
                                                                className={cn(
                                                                    "w-7 h-7 cursor-pointer",
                                                                    star <= editData.rating
                                                                        ? "fill-amber-400 text-amber-500"
                                                                        : "text-slate-300 hover:text-amber-300"
                                                                )}
                                                            />
                                                        </motion.button>
                                                    ))}
                                                </div>
                                            </div>


                                            {/* Status */}
                                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/50">
                                                <p className="text-xs font-bold uppercase tracking-widest text-slate-600 mb-3">
                                                    Reading Status
                                                </p>
                                                <div className="flex gap-2 flex-wrap">
                                                    {["unread", "reading", "completed"].map((status) => (
                                                        <motion.button
                                                            key={status}
                                                            whileHover={{ scale: 1.08 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() =>
                                                                setEditData((prev) => ({ ...prev, read_status: status as any }))
                                                            }
                                                            className={cn(
                                                                "px-4 py-2 rounded-full font-semibold border-2 text-sm",
                                                                editData.read_status === status
                                                                    ? getStatusColor(status)
                                                                    : "bg-white text-slate-600 border-slate-300"
                                                            )}
                                                        >
                                                            {status}
                                                        </motion.button>
                                                    ))}
                                                </div>
                                            </div>


                                            {/* Publisher & Year */}
                                            <div className="grid grid-cols-2 gap-3 md:gap-4">
                                                {fetchedBook.publisher && (
                                                    <motion.div
                                                        whileHover={{ y: -2 }}
                                                        className="p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200/50"
                                                    >
                                                        <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-1">Publisher</p>
                                                        <p className="text-sm font-medium text-slate-900 line-clamp-2">{fetchedBook.publisher}</p>
                                                    </motion.div>
                                                )}
                                                {fetchedBook.published_year && (
                                                    <motion.div
                                                        whileHover={{ y: -2 }}
                                                        className="p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200/50"
                                                    >
                                                        <p className="text-xs font-bold uppercase tracking-widest text-purple-600 mb-1">Published</p>
                                                        <p className="text-sm font-medium text-slate-900">{fetchedBook.published_year}</p>
                                                    </motion.div>
                                                )}
                                            </div>
                                        </motion.div>
                                    </motion.div>

                                    {/* Description */}
                                    {fetchedBook.description && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.4 }}
                                            className="p-6 rounded-2xl bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200/50"
                                        >
                                            <p className="text-xs font-bold uppercase tracking-widest text-slate-600 mb-4">Description</p>
                                            <p className="text-base text-slate-700 leading-relaxed">{fetchedBook.description}</p>
                                        </motion.div>
                                    )}

                                    {/* Categories */}
                                    {fetchedBook.categories && fetchedBook.categories.length > 0 && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}>
                                            <p className="text-xs font-bold uppercase tracking-widest text-slate-600 mb-3">Categories</p>
                                            <div className="flex flex-wrap gap-2">
                                                {fetchedBook.categories.map((cat: string) => (
                                                    <motion.div key={cat} whileHover={{ scale: 1.05 }} className="inline-block">
                                                        <Badge variant="outline" className="text-xs border-slate-300 bg-slate-50 hover:bg-slate-100">
                                                            {cat}
                                                        </Badge>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Genres - Editable */}
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                                        <p className="text-xs font-bold uppercase tracking-widest text-slate-600 mb-3">Genres</p>
                                        <div className="space-y-3">
                                            <div className="flex gap-2 flex-col sm:flex-row">
                                                <Input
                                                    value={newGenre}
                                                    onChange={(e) => setNewGenre(e.target.value)}
                                                    onKeyPress={(e) => e.key === "Enter" && addGenre()}
                                                    placeholder="Add a genre..."
                                                    className="h-10 bg-white border-2 border-blue-200/50 rounded-lg focus:border-blue-400 focus:ring-blue-400/20"
                                                />
                                                <Button
                                                    onClick={addGenre}
                                                    size="sm"
                                                    className="rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                                                >
                                                    Add
                                                </Button>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {editData.genres.map((genre) => (
                                                    <motion.div
                                                        key={genre}
                                                        initial={{ scale: 0.8, opacity: 0 }}
                                                        animate={{ scale: 1, opacity: 1 }}
                                                        exit={{ scale: 0.8, opacity: 0 }}
                                                    >
                                                        <Badge
                                                            variant="secondary"
                                                            className="text-xs bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300"
                                                        >
                                                            {genre}
                                                            <button onClick={() => removeGenre(genre)} className="ml-2 hover:text-blue-950 font-bold">
                                                                ×
                                                            </button>
                                                        </Badge>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>

                                    {/* Tags - Editable */}
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}>
                                        <p className="text-xs font-bold uppercase tracking-widest text-slate-600 mb-3">Tags</p>

                                        <div className="space-y-3">
                                            <div className="flex gap-2 flex-col sm:flex-row">
                                                <Input
                                                    value={newTag}
                                                    onChange={(e) => setNewTag(e.target.value)}
                                                    onKeyPress={(e) => e.key === "Enter" && addTag()}
                                                    placeholder="Add a tag..."
                                                    className="h-10 bg-white border-2 border-purple-200/50 rounded-lg focus:border-purple-400 focus:ring-purple-400/20"
                                                />
                                                <Button
                                                    onClick={addTag}
                                                    size="sm"
                                                    className="rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
                                                >
                                                    Add
                                                </Button>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {editData.tags.map((tag) => (
                                                    <motion.div
                                                        key={tag}
                                                        initial={{ scale: 0.8, opacity: 0 }}
                                                        animate={{ scale: 1, opacity: 1 }}
                                                        exit={{ scale: 0.8, opacity: 0 }}
                                                    >
                                                        <Badge
                                                            variant="outline"
                                                            className="text-xs border-2 border-purple-300 bg-purple-50 text-purple-800"
                                                        >
                                                            #{tag}
                                                            <button onClick={() => removeTag(tag)} className="ml-2 hover:text-purple-950 font-bold">
                                                                ×
                                                            </button>
                                                        </Badge>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>

                                    {/* Personal Notes - Editable */}
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.6 }}
                                        className="p-6 rounded-2xl bg-gradient-to-r from-pink-50 via-purple-50 to-blue-50 border-2 border-gradient-to-r from-pink-200 to-blue-200"
                                    >
                                        <p className="text-xs font-bold uppercase tracking-widest text-slate-600 mb-3">Personal Notes</p>

                                        <Textarea
                                            value={editData.personal_notes}
                                            onChange={(e) => setEditData((prev) => ({ ...prev, personal_notes: e.target.value }))}
                                            placeholder="Add your personal notes..."
                                            className="min-h-32 bg-white border-2 border-purple-200/50 rounded-lg text-sm focus:border-purple-400 focus:ring-purple-400/20"
                                        />

                                    </motion.div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex justify-between items-center p-6 border-t flex-wrap gap-3">
                                {!confirmingDelete ? (
                                    <>
                                        <Button
                                            onClick={() => setFetchedBook(null)}
                                            variant="outline"
                                            className="h-10"
                                        >
                                            Back
                                        </Button>

                                        <div className="flex gap-3 flex-wrap justify-end">
                                            <Button
                                                onClick={handleAddBook}
                                                disabled={isSaving}
                                                className="bg-blue-600 text-white hover:bg-blue-700 h-10"
                                            >
                                                <Save className="w-4 h-4" />
                                                {isSaving ? "Adding..." : "Add Book"}
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    /* Confirmation State */
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="flex items-center justify-between w-full"
                                    >
                                        <span className="text-sm font-medium text-red-600">
                                            Are you sure you want to discard this book?
                                        </span>

                                        <div className="flex gap-3">
                                            <Button
                                                variant="outline"
                                                onClick={() => setConfirmingDelete(false)}
                                                className="h-10 transition hover:scale-105"
                                            >
                                                Cancel
                                            </Button>

                                            <Button
                                                onClick={() => {
                                                    setFetchedBook(null)
                                                    setConfirmingDelete(false)
                                                    setIsbn("")
                                                    setEditData({
                                                        rating: 0,
                                                        read_status: "unread",
                                                        personal_notes: "",
                                                        genres: [],
                                                        tags: [],
                                                    })
                                                }}
                                                className="bg-red-600 text-white hover:bg-red-700 h-10 transition-all duration-200 hover:scale-105 active:scale-95"
                                            >
                                                Discard
                                            </Button>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </>
                    )}
                </motion.div>
            </motion.div>
        </>
    )
}
