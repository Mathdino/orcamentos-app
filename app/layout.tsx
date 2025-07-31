import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import Header from "@/components/Header"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "HS Color - Sistema de Orçamentos",
  description: "Sistema completo para gerenciamento de orçamentos de pintura",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
      </head>
      <body className={inter.className + " bg-white text-black min-h-screen"}>
        <Header />
        <div className="pt-20">{/* padding para o header */}
          {children}
        </div>
        <Toaster />
      </body>
    </html>
  )
}
