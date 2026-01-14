"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react"
import { API_BASE_URL } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { storeToken } from "@/lib/auth"
import { useRouter } from "next/navigation"

type AuthMode = "login" | "register"

export function AuthForm() {
  const [mode, setMode] = React.useState<AuthMode>("login")
  const [isLoading, setIsLoading] = React.useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email")
    const password = formData.get("password")
    const name = formData.get("name")

    try {
      const endpoint = mode === "login" ? "/auth/login" : "/auth/register"
      const payload = mode === "login" ? { email, password } : { email, password, name }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (response.status === 400 && mode === "register") {
        toast({ title: "User already exists", variant: "destructive" })
        return
      }

      if (response.status === 401 && mode === "login") {
        toast({ title: "Invalid credentials", variant: "destructive" })
        return
      }

      if (!response.ok) throw new Error("Something went wrong")

      const data = await response.json()

      if (mode === "login") {
        await storeToken(data.access_token)
        toast({ title: "Welcome back to Archive" })
        // Redirect logic would go here
        router.push("/dashboard")
      } else {
        toast({ title: "Registration successful", description: "Please log in to continue." })
        setMode("login")
      }
    } catch (error) {
      toast({
        title: "Authentication failed",
        description: "Please check your network or credentials.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-[440px]">
      <motion.div
        layout
        className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl shadow-black/5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-3xl font-serif text-foreground mb-2">
              {mode === "login" ? "Welcome back" : "Create an account"}
            </h2>
            <p className="text-muted-foreground mb-8 text-sm">
              {mode === "login" ? "Enter your credentials to continue" : "Join the elite circle of librarians"}
            </p>
          </motion.div>
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-gap-6 flex flex-col gap-6">
          {mode === "register" && (
            <div className="space-y-2">
              <label className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground px-1">Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                <Input
                  name="name"
                  placeholder="Your full name"
                  className="pl-12 h-14 bg-secondary/30 border-none rounded-2xl focus-visible:ring-1 focus-visible:ring-primary/20 transition-all"
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground px-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
              <Input
                name="email"
                type="email"
                placeholder="name@company.com"
                className="pl-12 h-14 bg-secondary/30 border-none rounded-2xl focus-visible:ring-1 focus-visible:ring-primary/20 transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <label className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">Password</label>
              {mode === "login" && (
                <button
                  type="button"
                  className="text-[10px] font-bold tracking-widest uppercase text-primary hover:opacity-70 transition-opacity"
                >
                  Forgot?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
              <Input
                name="password"
                type="password"
                placeholder="••••••••"
                className="pl-12 h-14 bg-secondary/30 border-none rounded-2xl focus-visible:ring-1 focus-visible:ring-primary/20 transition-all"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-14 rounded-2xl text-base font-medium shadow-lg hover:shadow-primary/20 transition-all group"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <span className="flex items-center gap-2">
                {mode === "login" ? "Log in to Archive" : "Begin your journey"}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </Button>
        </form>

        <div className="mt-8 pt-8 border-t border-secondary text-center">
          <p className="text-sm text-muted-foreground">
            {mode === "login" ? "Don't have an account?" : "Already a member?"}{" "}
            <button
              onClick={() => setMode(mode === "login" ? "register" : "login")}
              className="text-primary font-bold hover:underline underline-offset-4 transition-all"
            >
              {mode === "login" ? "Sign up" : "Log in"}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
