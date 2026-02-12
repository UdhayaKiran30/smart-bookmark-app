'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, LogOut, Loader2, ExternalLink, Search } from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

type Bookmark = {
    id: string
    title: string
    url: string
}

export default function Dashboard() {
    const router = useRouter()

    const [user, setUser] = useState<any>(null)
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
    const [title, setTitle] = useState('')
    const [url, setUrl] = useState('')
    const [loading, setLoading] = useState(true)
    const [adding, setAdding] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')

    // 🔹 Get Logged User
    useEffect(() => {
        const getUser = async () => {
            const { data } = await supabase.auth.getUser()
            if (!data.user) {
                router.push('/')
            } else {
                setUser(data.user)
                fetchBookmarks()
            }
        }

        getUser()
    }, [])

    // 🔹 Fetch Bookmarks
    const fetchBookmarks = async () => {
        setLoading(true)
        const { data } = await supabase
            .from('bookmarks')
            .select('*')
            .order('created_at', { ascending: false })

        if (data) setBookmarks(data)
        setLoading(false)
    }

    // 🔹 Add Bookmark
    const addBookmark = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title || !url) return

        setAdding(true)
        const newBookmark = { title, url, user_id: user.id } // Optimistic update prep

        // Optimistic update
        const tempId = Math.random().toString(36).substring(7)
        setBookmarks([{ ...newBookmark, id: tempId, created_at: new Date().toISOString() } as any, ...bookmarks])

        const { error } = await supabase.from('bookmarks').insert([newBookmark])

        if (error) {
            console.error('Error adding bookmark:', error)
            // Revert on error
            setBookmarks(bookmarks.filter(b => b.id !== tempId))
        } else {
            // Refetch to get real ID if needed, or just let realtime handle it
            // For now, let's just clear the form
            setTitle('')
            setUrl('')
        }
        setAdding(false)
    }

    // 🔹 Delete Bookmark
    const deleteBookmark = async (id: string) => {
        // Optimistic update
        setBookmarks(bookmarks.filter((b) => b.id !== id))
        await supabase.from('bookmarks').delete().eq('id', id)
    }

    // 🔹 Realtime Listener
    useEffect(() => {
        const channel = supabase
            .channel('bookmarks')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'bookmarks'
                },
                () => {
                    fetchBookmarks()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [user])

    // 🔹 Logout
    const logout = async () => {
        await supabase.auth.signOut()
        router.push('/')
    }

    const filteredBookmarks = bookmarks.filter(b =>
        b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.url.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-indigo-200 shadow-lg">
                            S
                        </div>
                        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                            SmartMarks
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500 hidden sm:block">
                            {user?.email}
                        </span>
                        <button
                            onClick={logout}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Sidebar / Add Form */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-4 space-y-6"
                    >
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <Plus className="w-5 h-5 text-indigo-500" />
                                Add New Bookmark
                            </h2>
                            <form onSubmit={addBookmark} className="space-y-4">
                                <div>
                                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                    <input
                                        id="title"
                                        type="text"
                                        placeholder="Awesome Website"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                                    <input
                                        id="url"
                                        type="url"
                                        placeholder="https://example.com"
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={!title || !url || adding}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
                                >
                                    {adding ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            <Plus className="w-5 h-5" />
                                            Add Bookmark
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </motion.div>

                    {/* Main Content / List */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Search Bar */}
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="relative"
                        >
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search bookmarks..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none text-gray-700"
                            />
                        </motion.div>

                        {/* Loading State */}
                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm animate-pulse h-32">
                                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                                        <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <AnimatePresence mode="popLayout">
                                    {filteredBookmarks.map((bookmark) => (
                                        <motion.div
                                            key={bookmark.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            whileHover={{ y: -2 }}
                                            className="group bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between h-full min-h-[140px]"
                                        >
                                            <div>
                                                <h3 className="font-bold text-gray-800 text-lg mb-1 line-clamp-1" title={bookmark.title}>
                                                    {bookmark.title}
                                                </h3>
                                                <a
                                                    href={bookmark.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-gray-500 text-sm hover:text-indigo-600 transition-colors break-all line-clamp-2 flex items-center gap-1 group-hover:underline"
                                                >
                                                    {bookmark.url}
                                                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </a>
                                            </div>

                                            <div className="flex justify-end mt-4 pt-4 border-t border-gray-50">
                                                <button
                                                    onClick={() => deleteBookmark(bookmark.id)}
                                                    className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors duration-200"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {filteredBookmarks.length === 0 && (
                                    <div className="col-span-full py-12 text-center text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
                                        <p>No bookmarks found.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
