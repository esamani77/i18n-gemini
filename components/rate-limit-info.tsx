import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function RateLimitInfo() {
  return (
    <Alert variant="warning" className="bg-amber-50 border-amber-200 text-amber-800">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>API Rate Limits</AlertTitle>
      <AlertDescription className="text-sm">
        <p>The Gemini API has the following rate limits:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>15 requests per minute (RPM)</li>
          <li>1,000,000 tokens per minute (TPM)</li>
          <li>1,500 requests per day (RPD)</li>
        </ul>
        <p className="mt-2">
          The application will automatically pause when approaching these limits and resume when possible.
        </p>
      </AlertDescription>
    </Alert>
  )
}
