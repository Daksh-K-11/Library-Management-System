// "use client"

// import { useState } from "react"
// import { motion } from "framer-motion"
// import { Star, BookOpen, X, Trash2, Save, Edit2, EyeOff, CheckCircle, AlertCircle } from "lucide-react"
// import { Badge } from "@/components/ui/badge"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Textarea } from "@/components/ui/textarea"
// import { cn } from "@/lib/utils"
// import { useToast } from "@/hooks/use-toast"
// import { getToken, API_BASE_URL } from "@/lib/auth"
// import type { ApiBook } from "@/components/book-card"

// interface BookDetailViewProps {
//   book: ApiBook
//   onClose: () => void
//   onDelete: (id: string) => void
//   onRefresh: () => void
//   libraryId?: string | null
// }

// export function BookDetailView({ book, onClose, onDelete, onRefresh, libraryId }: BookDetailViewProps) {
//   const [isEditing, setIsEditing] = useState(false)
//   const [isSaving, setIsSaving] = useState(false)
//   const [isDeleting, setIsDeleting] = useState(false)
//   const [showNotification, setShowNotification] = useState<{ type: "success" | "error"; message: string } | null>(null)
//   const { toast } = useToast()
//   const isInLibrary = !!libraryId

//   const [editData, setEditData] = useState({
//     rating: book.rating ?? 0,
//     read_status: book.read_status,
//     personal_notes: book.personal_notes || "",
//     genres: book.genres || [],
//     tags: book.tags || [],
//   })


//   const [newGenre, setNewGenre] = useState("")
//   const [newTag, setNewTag] = useState("")

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case "completed":
//         return "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-700 border-emerald-300"
//       case "reading":
//         return "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-700 border-blue-300"
//       case "unread":
//         return "bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-700 border-amber-300"
//       default:
//         return "bg-gradient-to-r from-slate-500/20 to-slate-600/20 text-slate-700 border-slate-300"
//     }
//   }

//   const showStatusNotification = (type: "success" | "error", message: string) => {
//     setShowNotification({ type, message })
//     setTimeout(() => setShowNotification(null), 4000)
//   }

//   const handleSave = async () => {
//     const token = getToken()
//     if (!token) return

//     setIsSaving(true)
//     try {
//       const response = await fetch(`${API_BASE_URL}/books/${book.user_book_id}`, {
//         method: "PATCH",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           rating: editData.rating,
//           read_status: editData.read_status,
//           personal_notes: editData.personal_notes,
//           genres: editData.genres,
//           tags: editData.tags,
//         }),
//       })

//       if (response.ok) {
//         showStatusNotification("success", "Book updated successfully!")
//         setIsEditing(false)
//         setTimeout(() => {
//           onRefresh()
//         }, 500)
//       } else {
//         showStatusNotification("error", "Failed to update book")
//       }
//     } catch (error) {
//       showStatusNotification("error", "Error updating book")
//     } finally {
//       setIsSaving(false)
//     }
//   }

//   const handleDelete = async () => {
//     const token = getToken()
//     if (!token) return

//     setIsDeleting(true)
//     try {
//       const response = await fetch(`${API_BASE_URL}/books`, {
//         method: "DELETE",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({ user_book_ids: [book.user_book_id] }),
//       })

//       if (response.ok) {
//         showStatusNotification("success", "Book deleted successfully!")
//         setTimeout(() => {
//           onDelete(book.user_book_id)
//           onClose()
//           onRefresh()
//         }, 500)
//       } else {
//         showStatusNotification("error", "Failed to delete book")
//       }
//     } catch (error) {
//       showStatusNotification("error", "Error deleting book")
//     } finally {
//       setIsDeleting(false)
//     }
//   }

//   const addGenre = () => {
//     if (newGenre.trim() && !editData.genres.includes(newGenre)) {
//       setEditData((prev) => ({
//         ...prev,
//         genres: [...prev.genres, newGenre],
//       }))
//       setNewGenre("")
//     }
//   }

//   const removeGenre = (genre: string) => {
//     setEditData((prev) => ({
//       ...prev,
//       genres: prev.genres.filter((g) => g !== genre),
//     }))
//   }

//   const addTag = () => {
//     if (newTag.trim() && !editData.tags.includes(newTag)) {
//       setEditData((prev) => ({
//         ...prev,
//         tags: [...prev.tags, newTag],
//       }))
//       setNewTag("")
//     }
//   }

//   const removeTag = (tag: string) => {
//     setEditData((prev) => ({
//       ...prev,
//       tags: prev.tags.filter((t) => t !== tag),
//     }))
//   }

//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       transition={{ duration: 0.2 }}
//       className="fixed inset-0 bg-black/50 backdrop-blur-lg z-40"
//       onClick={onClose}
//     >
//       <AnimatePresence>
//         {showNotification && (
//           <motion.div
//             initial={{ opacity: 0, y: -20, scale: 0.9 }}
//             animate={{ opacity: 1, y: 0, scale: 1 }}
//             exit={{ opacity: 0, y: -20, scale: 0.9 }}
//             transition={{ type: "spring", stiffness: 300, damping: 20 }}
//             className={cn(
//               "fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl flex items-center gap-3 shadow-2xl backdrop-blur-sm border",
//               showNotification.type === "success"
//                 ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-emerald-300 text-emerald-700"
//                 : "bg-gradient-to-r from-red-500/20 to-rose-500/20 border-red-300 text-red-700",
//             )}
//           >
//             {showNotification.type === "success" ? (
//               <CheckCircle className="w-5 h-5 flex-shrink-0" />
//             ) : (
//               <AlertCircle className="w-5 h-5 flex-shrink-0" />
//             )}
//             <span className="font-semibold text-sm">{showNotification.message}</span>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       <motion.div
//         initial={{ y: 100, opacity: 0, scale: 0.95 }}
//         animate={{ y: 0, opacity: 1, scale: 1 }}
//         exit={{ y: 100, opacity: 0, scale: 0.95 }}
//         transition={{ type: "spring", damping: 20, stiffness: 300 }}
//         onClick={(e) => e.stopPropagation()}
//         className="absolute inset-4 md:inset-8 lg:inset-12 bg-gradient-to-br from-white via-slate-50 to-blue-50 rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-white/80"
//       >
//         {/* Header */}
//         <div className="flex items-center justify-between p-6 md:p-8 border-b border-gradient-to-r from-blue-200/30 to-purple-200/30 bg-gradient-to-r from-white/60 to-blue-50/60 backdrop-blur-sm">
//           <div className="flex-1">
//             <motion.h1
//               initial={{ opacity: 0, x: -20 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ delay: 0.1 }}
//               className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 to-blue-600 bg-clip-text text-transparent text-pretty"
//             >
//               {book.book.title}
//             </motion.h1>
//           </div>

//           <div className="flex items-center gap-3">
//             <motion.button
//               whileHover={{ scale: 1.1, rotate: 5 }}
//               whileTap={{ scale: 0.95 }}
//               onClick={() => setIsEditing(!isEditing)}
//               className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
//             >
//               {isEditing ? (
//                 <EyeOff className="w-5 h-5 text-slate-600" />
//               ) : (
//                 <Edit2 className="w-5 h-5 text-slate-600" />
//               )}
//             </motion.button>

//             <motion.button
//               whileHover={{ scale: 1.1, rotate: -5 }}
//               whileTap={{ scale: 0.95 }}
//               onClick={onClose}
//               className="p-3 hover:bg-gradient-to-r hover:from-red-100 hover:to-pink-100 rounded-xl transition-all duration-200"
//             >
//               <X className="w-5 h-5 text-slate-600" />
//             </motion.button>
//           </div>
//         </div>

//         {/* Content */}
//         <div className="flex-1 overflow-y-auto p-6 md:p-8">
//           <div className="max-w-4xl mx-auto space-y-8">
//             {/* Book Cover & Main Info */}
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.2 }}
//               className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start"
//             >
//               {/* Cover */}
//               <motion.div whileHover={!isEditing ? { scale: 1.08, rotateY: 5 } : {}} className="md:col-span-1">
//                 <div className="w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-xl bg-gradient-to-br from-blue-100 to-purple-100 border-2 border-gradient-to-r from-blue-200 to-purple-200">
//                   {book.book.cover_url ? (
//                     <img
//                       src={book.book.cover_url || "/placeholder.svg"}
//                       alt={book.book.title}
//                       className="w-full h-full object-cover"
//                     />
//                   ) : (
//                     <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-200 to-purple-200">
//                       <BookOpen className="w-16 h-16 text-blue-400/60" />
//                     </div>
//                   )}
//                 </div>
//               </motion.div>

//               {/* Main Info */}
//               <motion.div
//                 initial={{ opacity: 0, x: 20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ delay: 0.3 }}
//                 className="md:col-span-3 space-y-6"
//               >
//                 {/* Author */}
//                 {book.book.authors && book.book.authors.length > 0 && (
//                   <motion.div
//                     whileHover={{ x: 5 }}
//                     className="p-4 rounded-xl bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200/50"
//                   >
//                     <p className="text-xs font-bold uppercase tracking-widest text-cyan-600 mb-2">Author</p>
//                     <p className="text-lg font-medium text-slate-900">{book.book.authors.join(", ")}</p>
//                   </motion.div>
//                 )}

//                 {/* Rating */}
//                 <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50">
//                   <p className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-3">Your Rating</p>
//                   {isEditing ? (
//                     <div className="flex items-center gap-2">
//                       {[1, 2, 3, 4, 5].map((star) => (
//                         <motion.button
//                           key={star}
//                           whileHover={{ scale: 1.3, rotate: 15 }}
//                           whileTap={{ scale: 0.85 }}
//                           onClick={() => setEditData((prev) => ({ ...prev, rating: star }))}
//                           className="transition-transform"
//                         >
//                           <Star
//                             className={cn(
//                               "w-7 h-7 cursor-pointer transition-all drop-shadow-sm",
//                               star <= editData.rating
//                                 ? "fill-amber-400 text-amber-500"
//                                 : "text-slate-300 hover:text-amber-300",
//                             )}
//                           />
//                         </motion.button>
//                       ))}
//                     </div>
//                   ) : (
//                     <div className="flex items-center gap-2">
//                       {[...Array(5)].map((_, i) => (
//                         <Star
//                           key={i}
//                           className={cn(
//                             "w-5 h-5 drop-shadow-sm",
//                             i < (book.rating ?? 0) ? "fill-amber-400 text-amber-500" : "text-slate-200",
//                           )}
//                         />
//                       ))}
//                       <span className="ml-2 text-base font-bold text-amber-600">{book.rating ?? 0}/5</span>
//                     </div>
//                   )}
//                 </div>

//                 {/* Status */}
//                 <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/50">
//                   <p className="text-xs font-bold uppercase tracking-widest text-slate-600 mb-3">Reading Status</p>
//                   {isEditing ? (
//                     <div className="flex gap-2 flex-wrap">
//                       {["unread", "reading", "completed"].map((status) => (
//                         <motion.button
//                           key={status}
//                           whileHover={{ scale: 1.08 }}
//                           whileTap={{ scale: 0.95 }}
//                           onClick={() => setEditData((prev) => ({ ...prev, read_status: status as any }))}
//                           className={cn(
//                             "px-4 py-2 rounded-full font-semibold transition-all border-2",
//                             editData.read_status === status
//                               ? getStatusColor(status)
//                               : "bg-white text-slate-600 border-slate-300 hover:border-slate-400",
//                           )}
//                         >
//                           {status}
//                         </motion.button>
//                       ))}
//                     </div>
//                   ) : (
//                     <Badge
//                       className={cn(
//                         "text-xs font-semibold border-2 uppercase tracking-wide",
//                         getStatusColor(book.read_status),
//                       )}
//                     >
//                       {book.read_status}
//                     </Badge>
//                   )}
//                 </div>

//                 {/* Publisher & Year */}
//                 <div className="grid grid-cols-2 gap-4">
//                   {book.book.publisher && (
//                     <motion.div
//                       whileHover={{ y: -2 }}
//                       className="p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200/50"
//                     >
//                       <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-1">Publisher</p>
//                       <p className="text-sm font-medium text-slate-900">{book.book.publisher}</p>
//                     </motion.div>
//                   )}
//                   {book.book.published_year && (
//                     <motion.div
//                       whileHover={{ y: -2 }}
//                       className="p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200/50"
//                     >
//                       <p className="text-xs font-bold uppercase tracking-widest text-purple-600 mb-1">Published</p>
//                       <p className="text-sm font-medium text-slate-900">{book.book.published_year}</p>
//                     </motion.div>
//                   )}
//                 </div>
//               </motion.div>
//             </motion.div>

//             {/* Description */}
//             {book.book.description && (
//               <motion.div
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 transition={{ delay: 0.4 }}
//                 className="p-6 rounded-2xl bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200/50"
//               >
//                 <p className="text-xs font-bold uppercase tracking-widest text-slate-600 mb-4">Description</p>
//                 <p className="text-base text-slate-700 leading-relaxed">{book.book.description}</p>
//               </motion.div>
//             )}

//             {/* Categories */}
//             {book.book.categories && book.book.categories.length > 0 && (
//               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}>
//                 <p className="text-xs font-bold uppercase tracking-widest text-slate-600 mb-3">Categories</p>
//                 <div className="flex flex-wrap gap-2">
//                   {book.book.categories.map((cat) => (
//                     <motion.div key={cat} whileHover={{ scale: 1.05 }} className="inline-block">
//                       <Badge variant="outline" className="text-xs border-slate-300 bg-slate-50 hover:bg-slate-100">
//                         {cat}
//                       </Badge>
//                     </motion.div>
//                   ))}
//                 </div>
//               </motion.div>
//             )}

//             {/* Genres - Editable */}
//             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
//               <p className="text-xs font-bold uppercase tracking-widest text-slate-600 mb-3">Genres</p>
//               {isEditing ? (
//                 <div className="space-y-3">
//                   <div className="flex gap-2">
//                     <Input
//                       value={newGenre}
//                       onChange={(e) => setNewGenre(e.target.value)}
//                       onKeyPress={(e) => e.key === "Enter" && addGenre()}
//                       placeholder="Add a genre..."
//                       className="h-10 bg-white border-2 border-blue-200/50 rounded-lg focus:border-blue-400 focus:ring-blue-400/20"
//                     />
//                     <Button
//                       onClick={addGenre}
//                       size="sm"
//                       className="rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
//                     >
//                       Add
//                     </Button>
//                   </div>
//                   <div className="flex flex-wrap gap-2">
//                     {editData.genres.map((genre) => (
//                       <motion.div
//                         key={genre}
//                         initial={{ scale: 0.8, opacity: 0 }}
//                         animate={{ scale: 1, opacity: 1 }}
//                         exit={{ scale: 0.8, opacity: 0 }}
//                       >
//                         <Badge
//                           variant="secondary"
//                           className="text-xs bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300"
//                         >
//                           {genre}
//                           <button onClick={() => removeGenre(genre)} className="ml-2 hover:text-blue-950 font-bold">
//                             ×
//                           </button>
//                         </Badge>
//                       </motion.div>
//                     ))}
//                   </div>
//                 </div>
//               ) : (
//                 <div className="flex flex-wrap gap-2">
//                   {editData.genres.length > 0 ? (
//                     editData.genres.map((genre) => (
//                       <motion.div key={genre} whileHover={{ scale: 1.05 }}>
//                         <Badge className="text-xs bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300">
//                           {genre}
//                         </Badge>
//                       </motion.div>
//                     ))
//                   ) : (
//                     <p className="text-sm text-slate-500 italic">No genres added</p>
//                   )}
//                 </div>
//               )}
//             </motion.div>

//             {/* Tags - Editable */}
//             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}>
//               <p className="text-xs font-bold uppercase tracking-widest text-slate-600 mb-3">Tags</p>
//               {isEditing ? (
//                 <div className="space-y-3">
//                   <div className="flex gap-2">
//                     <Input
//                       value={newTag}
//                       onChange={(e) => setNewTag(e.target.value)}
//                       onKeyPress={(e) => e.key === "Enter" && addTag()}
//                       placeholder="Add a tag..."
//                       className="h-10 bg-white border-2 border-purple-200/50 rounded-lg focus:border-purple-400 focus:ring-purple-400/20"
//                     />
//                     <Button
//                       onClick={addTag}
//                       size="sm"
//                       className="rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
//                     >
//                       Add
//                     </Button>
//                   </div>
//                   <div className="flex flex-wrap gap-2">
//                     {editData.tags.map((tag) => (
//                       <motion.div
//                         key={tag}
//                         initial={{ scale: 0.8, opacity: 0 }}
//                         animate={{ scale: 1, opacity: 1 }}
//                         exit={{ scale: 0.8, opacity: 0 }}
//                       >
//                         <Badge
//                           variant="outline"
//                           className="text-xs border-2 border-purple-300 bg-purple-50 text-purple-800"
//                         >
//                           #{tag}
//                           <button onClick={() => removeTag(tag)} className="ml-2 hover:text-purple-950 font-bold">
//                             ×
//                           </button>
//                         </Badge>
//                       </motion.div>
//                     ))}
//                   </div>
//                 </div>
//               ) : (
//                 <div className="flex flex-wrap gap-2">
//                   {editData.tags.length > 0 ? (
//                     editData.tags.map((tag) => (
//                       <motion.div key={tag} whileHover={{ scale: 1.05 }}>
//                         <Badge
//                           variant="outline"
//                           className="text-xs border-2 border-purple-300 bg-purple-50 text-purple-800"
//                         >
//                           #{tag}
//                         </Badge>
//                       </motion.div>
//                     ))
//                   ) : (
//                     <p className="text-sm text-slate-500 italic">No tags added</p>
//                   )}
//                 </div>
//               )}
//             </motion.div>

//             {/* Personal Notes - Editable */}
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ delay: 0.6 }}
//               className="p-6 rounded-2xl bg-gradient-to-r from-pink-50 via-purple-50 to-blue-50 border-2 border-gradient-to-r from-pink-200 to-blue-200"
//             >
//               <p className="text-xs font-bold uppercase tracking-widest text-slate-600 mb-3">Personal Notes</p>
//               {isEditing ? (
//                 <Textarea
//                   value={editData.personal_notes}
//                   onChange={(e) => setEditData((prev) => ({ ...prev, personal_notes: e.target.value }))}
//                   placeholder="Add your personal notes..."
//                   className="min-h-32 bg-white border-2 border-purple-200/50 rounded-lg text-sm focus:border-purple-400 focus:ring-purple-400/20"
//                 />
//               ) : (
//                 <p className="text-base italic text-slate-700 leading-relaxed">
//                   {editData.personal_notes || "No personal notes added"}
//                 </p>
//               )}
//             </motion.div>
//           </div>
//         </div>

//         {/* Footer */}
//         <div className="flex items-center justify-between gap-4 p-6 md:p-8 border-t border-gradient-to-r from-blue-200/30 to-purple-200/30 bg-gradient-to-r from-white/60 to-blue-50/60 backdrop-blur-sm">
//           <motion.button
//             whileHover={{ scale: 1.05, backgroundColor: "rgba(239, 68, 68, 0.1)" }}
//             whileTap={{ scale: 0.95 }}
//             onClick={handleDelete}
//             disabled={isDeleting}
//             className="flex items-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 disabled:opacity-50 font-semibold border border-red-200/50"
//           >
//             <Trash2 className="w-4 h-4" />
//             <span className="text-sm">{isDeleting
//               ? isInLibrary ? "Removing..." : "Deleting..."
//               : isInLibrary ? "Remove" : "Delete"}</span>
//           </motion.button>

//           {isEditing && (
//             <motion.button
//               initial={{ opacity: 0, x: 20 }}
//               animate={{ opacity: 1, x: 0 }}
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//               onClick={handleSave}
//               disabled={isSaving}
//               className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 disabled:opacity-50 font-semibold shadow-lg shadow-emerald-500/20"
//             >
//               <Save className="w-4 h-4" />
//               <span className="text-sm">{isSaving ? "Saving..." : "Save Changes"}</span>
//             </motion.button>
//           )}
//         </div>
//       </motion.div>
//     </motion.div>
//   )
// }

// import { AnimatePresence } from "framer-motion"

























"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Star,
  BookOpen,
  X,
  Trash2,
  Save,
  Edit2,
  EyeOff,
  AlertCircle,
  Undo2,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { getToken, API_BASE_URL } from "@/lib/auth"
import type { ApiBook } from "@/components/book-card"

interface BookDetailViewProps {
  book: ApiBook
  onClose: () => void
  onDelete: (id: string) => void
  onRefresh: () => void
  libraryId?: string | null
}

export function BookDetailView({
  book,
  onClose,
  onDelete,
  onRefresh,
  libraryId,
}: BookDetailViewProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showNotification, setShowNotification] = useState<{ type: "success" | "error"; message: string } | null>(null)

  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const [newGenre, setNewGenre] = useState("")
  const [newTag, setNewTag] = useState("")

  const showStatusNotification = (type: "success" | "error", message: string) => {
    setShowNotification({ type, message })
    setTimeout(() => setShowNotification(null), 4000)
  }

  const handleSave = async () => {
    const token = getToken()
    if (!token) return

    setIsSaving(true)
    try {
      const response = await fetch(`${API_BASE_URL}/books/${book.user_book_id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating: editData.rating,
          read_status: editData.read_status,
          personal_notes: editData.personal_notes,
          genres: editData.genres,
          tags: editData.tags,
        }),
      })

      if (response.ok) {
        showStatusNotification("success", "Book updated successfully!")
        setIsEditing(false)
        setTimeout(() => {
          onRefresh()
        }, 500)
      } else {
        showStatusNotification("error", "Failed to update book")
      }
    } catch (error) {
      showStatusNotification("error", "Error updating book")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    const token = getToken()
    if (!token) return

    setIsDeleting(true)
    try {
      const response = await fetch(`${API_BASE_URL}/books`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ user_book_ids: [book.user_book_id] }),
      })

      if (response.ok) {
        showStatusNotification("success", "Book deleted successfully!")
        setTimeout(() => {
          onDelete(book.user_book_id)
          onClose()
          onRefresh()
        }, 500)
      } else {
        showStatusNotification("error", "Failed to delete book")
      }
    } catch (error) {
      showStatusNotification("error", "Error deleting book")
    } finally {
      setIsDeleting(false)
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

  const isInLibrary = !!libraryId

  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // 🔥 deletion flow state
  // const [pendingDelete, setPendingDelete] = useState(false)
  // const [deleteFailed, setDeleteFailed] = useState(false)

  // const deleteTimerRef = useRef<NodeJS.Timeout | null>(null)

  const [editData, setEditData] = useState({
    rating: book.rating ?? 0,
    read_status: book.read_status,
    personal_notes: book.personal_notes || "",
    genres: book.genres || [],
    tags: book.tags || [],
  })

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


  const handleDeleteClick = async () => {
  const token = getToken()
  if (!token) return

  setIsDeleting(true)

  try {
    const endpoint = isInLibrary
      ? `${API_BASE_URL}/librarybooks/${libraryId}`
      : `${API_BASE_URL}/books`

    const res = await fetch(endpoint, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        user_book_ids: [book.user_book_id],
      }),
    })

    if (!res.ok) throw new Error("Delete failed")

    onDelete(book.user_book_id)
    onRefresh()
    onClose()
  } catch {
    showStatusNotification("error", "Failed to delete book")
  } finally {
    setIsDeleting(false)
    setConfirmingDelete(false)
  }
}

  

  // Cleanup timer on unmount
  // useEffect(() => {
  //   return () => {
  //     if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current)
  //   }
  // }, [])

  return (
    <>


      {/* ───────────────── Modal Overlay ───────────────── */}
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
                     bg-white rounded-3xl shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b">
            <h1 className="text-2xl font-bold">{book.book.title}</h1>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setIsEditing(!isEditing)}>
                {isEditing ? <EyeOff /> : <Edit2 />}
              </Button>
              <Button variant="ghost" onClick={onClose}>
                <X />
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 md:p-8">
            <div className="max-w-4xl mx-auto space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start"
              >
                {/* Cover */}
                <motion.div whileHover={!isEditing ? { scale: 1.08, rotateY: 5 } : {}} className="md:col-span-1">
                  <div className="w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-xl bg-gradient-to-br from-blue-100 to-purple-100 border-2 border-gradient-to-r from-blue-200 to-purple-200">
                    {book.book.cover_url ? (
                      <img
                        src={book.book.cover_url || "/placeholder.svg"}
                        alt={book.book.title}
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
                  className="md:col-span-3 space-y-6"
                >
                  {/* Author */}
                  {book.book.authors && book.book.authors.length > 0 && (
                    <motion.div
                      whileHover={{ x: 5 }}
                      className="p-4 rounded-xl bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200/50"
                    >
                      <p className="text-xs font-bold uppercase tracking-widest text-cyan-600 mb-2">Author</p>
                      <p className="text-lg font-medium text-slate-900">{book.book.authors.join(", ")}</p>
                    </motion.div>
                  )}

                  {/* Rating */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50">
                    <p className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-3">Your Rating</p>
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <motion.button
                            key={star}
                            whileHover={{ scale: 1.3, rotate: 15 }}
                            whileTap={{ scale: 0.85 }}
                            onClick={() => setEditData((prev) => ({ ...prev, rating: star }))}
                            className="transition-transform"
                          >
                            <Star
                              className={cn(
                                "w-7 h-7 cursor-pointer transition-all drop-shadow-sm",
                                star <= editData.rating
                                  ? "fill-amber-400 text-amber-500"
                                  : "text-slate-300 hover:text-amber-300",
                              )}
                            />
                          </motion.button>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "w-5 h-5 drop-shadow-sm",
                              i < (book.rating ?? 0) ? "fill-amber-400 text-amber-500" : "text-slate-200",
                            )}
                          />
                        ))}
                        <span className="ml-2 text-base font-bold text-amber-600">{book.rating ?? 0}/5</span>
                      </div>
                    )}
                  </div>

                  {/* Status */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/50">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-600 mb-3">Reading Status</p>
                    {isEditing ? (
                      <div className="flex gap-2 flex-wrap">
                        {["unread", "reading", "completed"].map((status) => (
                          <motion.button
                            key={status}
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setEditData((prev) => ({ ...prev, read_status: status as any }))}
                            className={cn(
                              "px-4 py-2 rounded-full font-semibold transition-all border-2",
                              editData.read_status === status
                                ? getStatusColor(status)
                                : "bg-white text-slate-600 border-slate-300 hover:border-slate-400",
                            )}
                          >
                            {status}
                          </motion.button>
                        ))}
                      </div>
                    ) : (
                      <Badge
                        className={cn(
                          "text-xs font-semibold border-2 uppercase tracking-wide",
                          getStatusColor(book.read_status),
                        )}
                      >
                        {book.read_status}
                      </Badge>
                    )}
                  </div>

                  {/* Publisher & Year */}
                  <div className="grid grid-cols-2 gap-4">
                    {book.book.publisher && (
                      <motion.div
                        whileHover={{ y: -2 }}
                        className="p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200/50"
                      >
                        <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-1">Publisher</p>
                        <p className="text-sm font-medium text-slate-900">{book.book.publisher}</p>
                      </motion.div>
                    )}
                    {book.book.published_year && (
                      <motion.div
                        whileHover={{ y: -2 }}
                        className="p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200/50"
                      >
                        <p className="text-xs font-bold uppercase tracking-widest text-purple-600 mb-1">Published</p>
                        <p className="text-sm font-medium text-slate-900">{book.book.published_year}</p>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              </motion.div>

              {/* Description */}
              {book.book.description && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="p-6 rounded-2xl bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200/50"
                >
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-600 mb-4">Description</p>
                  <p className="text-base text-slate-700 leading-relaxed">{book.book.description}</p>
                </motion.div>
              )}

              {/* Categories */}
              {book.book.categories && book.book.categories.length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-600 mb-3">Categories</p>
                  <div className="flex flex-wrap gap-2">
                    {book.book.categories.map((cat) => (
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
                {isEditing ? (
                  <div className="space-y-3">
                    <div className="flex gap-2">
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
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {editData.genres.length > 0 ? (
                      editData.genres.map((genre) => (
                        <motion.div key={genre} whileHover={{ scale: 1.05 }}>
                          <Badge className="text-xs bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300">
                            {genre}
                          </Badge>
                        </motion.div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500 italic">No genres added</p>
                    )}
                  </div>
                )}
              </motion.div>

              {/* Tags - Editable */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-600 mb-3">Tags</p>
                {isEditing ? (
                  <div className="space-y-3">
                    <div className="flex gap-2">
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
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {editData.tags.length > 0 ? (
                      editData.tags.map((tag) => (
                        <motion.div key={tag} whileHover={{ scale: 1.05 }}>
                          <Badge
                            variant="outline"
                            className="text-xs border-2 border-purple-300 bg-purple-50 text-purple-800"
                          >
                            #{tag}
                          </Badge>
                        </motion.div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500 italic">No tags added</p>
                    )}
                  </div>
                )}
              </motion.div>

              {/* Personal Notes - Editable */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="p-6 rounded-2xl bg-gradient-to-r from-pink-50 via-purple-50 to-blue-50 border-2 border-gradient-to-r from-pink-200 to-blue-200"
              >
                <p className="text-xs font-bold uppercase tracking-widest text-slate-600 mb-3">Personal Notes</p>
                {isEditing ? (
                  <Textarea
                    value={editData.personal_notes}
                    onChange={(e) => setEditData((prev) => ({ ...prev, personal_notes: e.target.value }))}
                    placeholder="Add your personal notes..."
                    className="min-h-32 bg-white border-2 border-purple-200/50 rounded-lg text-sm focus:border-purple-400 focus:ring-purple-400/20"
                  />
                ) : (
                  <p className="text-base italic text-slate-700 leading-relaxed">
                    {editData.personal_notes || "No personal notes added"}
                  </p>
                )}
              </motion.div>
            </div>
          </div>


          {/* Footer */}
          {/* <div className="flex justify-between p-6 border-t">
            <Button
              onClick={handleDeleteClick}
              className="bg-red-600 text-white hover:bg-red-700 active:bg-red-800 transition-all duration-200 ease-in-out hover:scale-105 active:scale-95 shadow-sm hover:shadow-md"
            >
              <Trash2 className="w-4 h-4 mr-2 transition-transform duration-200 group-hover:rotate-12" />
              {isInLibrary ? "Remove" : "Delete"}
            </Button>

            {isEditing && (
              <Button
                className="
        bg-blue-600 
        text-white 
        hover:bg-blue-700 
        active:bg-blue-800
        transition-all 
        duration-200 
        hover:scale-105 
        active:scale-95
        shadow-sm 
        hover:shadow-md
      "
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            )}
          </div> */}
          {/* Footer */}
          <div className="flex justify-between items-center p-6 border-t">

            {!confirmingDelete ? (
              <>
                {/* Delete Button */}
                <Button
                  onClick={() => setConfirmingDelete(true)}
                  className="
          bg-red-600 text-white
          hover:bg-red-700
          active:bg-red-800
          transition-all duration-200
          hover:scale-105 active:scale-95
          shadow-sm hover:shadow-md
        "
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {isInLibrary ? "Remove" : "Delete"}
                </Button>

                {isEditing && (
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="
            bg-blue-600 text-white
            hover:bg-blue-700
            active:bg-blue-800
            transition-all duration-200
            hover:scale-105 active:scale-95
            shadow-sm hover:shadow-md
          "
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                )}
              </>
            ) : (
              /* Confirmation State */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-between w-full"
              >
                <span className="text-sm font-medium text-red-600">
                  Are you sure you want to {isInLibrary ? "remove" : "delete"} this book?
                </span>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setConfirmingDelete(false)}
                    className="transition hover:scale-105"
                  >
                    Cancel
                  </Button>

                  <Button
                    onClick={handleDeleteClick}
                    disabled={isDeleting}
                    className="
            bg-red-600 text-white
            hover:bg-red-700
            active:bg-red-800
            transition-all duration-200
            hover:scale-105 active:scale-95
            shadow-md hover:shadow-lg
          "
                  >
                    {isDeleting ? "Deleting..." : "Confirm"}
                  </Button>
                </div>
              </motion.div>
            )}
          </div>


        </motion.div>
      </motion.div>
    </>
  )
}
