"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function FinanceiroRedirect() {
  const router = useRouter()
  useEffect(() => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, "0")
    router.replace(`/financeiro/${year}-${month}`)
  }, [router])
  return null
}
