import { redirect } from "next/navigation"

export default function GlobalNotFound() {
  // Redirect to the default locale's not-found page
  redirect("/en/not-found")
}
