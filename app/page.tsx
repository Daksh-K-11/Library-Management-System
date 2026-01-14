import { AuthForm } from "@/components/auth-form"
import { Library } from "lucide-react"

export default function LoginPage() {
  return (
    <main className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background overflow-hidden">
      {/* Left Section: Branding & Slogan */}
      <div className="hidden lg:flex flex-col justify-between p-12 xl:p-24 relative overflow-hidden">
        {/* Subtle decorative elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] aspect-square bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] aspect-square bg-primary/5 rounded-full blur-3xl animate-pulse delay-700" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 text-primary mb-24">
            <Library className="w-8 h-8" />
            <span className="text-2xl font-serif font-bold tracking-tight">Athenaeum</span>
          </div>

          <div className="max-w-xl space-y-8">
            <h1 className="text-7xl xl:text-8xl font-serif text-foreground leading-[1.1]">
              Optimal <br />
              organization <br />
              <span className="italic">meets</span> exquisite <br />
              design
            </h1>

            <p className="text-xl text-muted-foreground leading-relaxed max-w-md">
              Transform your digital collection into a functional work of art with our custom library management
              solutions.
            </p>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-8 text-sm text-muted-foreground/60 font-medium tracking-wide uppercase">
          <span>Established 1892</span>
          <span className="w-1 h-1 bg-muted-foreground/30 rounded-full" />
          <span>Curated for Excellence</span>
        </div>
      </div>

      {/* Right Section: Auth Form */}
      <div className="flex items-center justify-center p-6 md:p-12 relative">
        {/* Mobile Logo */}
        <div className="lg:hidden absolute top-8 left-8 flex items-center gap-2 text-primary">
          <Library className="w-6 h-6" />
          <span className="font-serif font-bold">Athenaeum</span>
        </div>

        <AuthForm />
      </div>
    </main>
  )
}
