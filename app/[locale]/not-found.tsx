import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-emerald-600 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-slate-800 mb-4">Page Not Found</h2>
        <p className="text-slate-600 mb-8">The page you are looking for doesn't exist or has been moved.</p>
        <Link href="/">
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Home className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  )
}
