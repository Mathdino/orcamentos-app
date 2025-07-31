"use client";

import Image from "next/image";
import Link from "next/link";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import React, { useState } from "react";

const menuItems = [
  { label: "Início", href: "/" },
  { label: "Novo Orçamento", href: "/novo-orcamento" },
  { label: "Orçamentos", href: "/orcamentos" },
  { label: "Obras", href: "/obras" },
  { label: "Financeiro", href: "/financeiro" },
  { label: "Clientes", href: "/clientes" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header
      className="fixed top-0 left-0 w-full z-50 border-b border-blue-400 shadow-lg"
      style={{ background: "#080d10" }}
    >
      <div className="container mx-auto flex items-center justify-between py-2 px-4">
        <Link href="/">
          <Image
            src="/logo.png"
            alt="Logo H.S Color"
            width={96}
            height={96}
            className="h-8 w-auto"
            priority
          />
        </Link>
        <nav className="hidden md:flex gap-6">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-white font-semibold hover:text-[#7eaa37] transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Abrir menu">
                <Menu className="w-7 h-7" style={{ color: "#FFF" }} />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="border-l border-green-400">
              <nav className="flex flex-col gap-4 mt-8">
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-black text-lg font-semibold hover:text-[#7eaa37] transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
