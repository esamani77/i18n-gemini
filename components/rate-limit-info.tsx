import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useTranslations } from "next-intl";
export function RateLimitInfo() {
  const t = useTranslations("translator");
  return (
    <Alert variant="warning" className="bg-amber-50 border-amber-200 text-amber-800">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{t("rate_limit_title")}</AlertTitle>
      <AlertDescription className="text-sm">
        <p>{t("rate_limit_description")}</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>{t("rate_limit_rpm")}</li>
          <li>{t("rate_limit_tpm")}</li>
          <li>{t("rate_limit_rpd")}</li>
        </ul>
        <p className="mt-2">
          {t("rate_limit_description")}
        </p>
      </AlertDescription>
    </Alert>
  )
}
