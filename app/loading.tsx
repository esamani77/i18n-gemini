import { redirect } from "next/navigation"

export default function GlobalLoading() {
  // Redirect to the default locale
  redirect("/en")
}
