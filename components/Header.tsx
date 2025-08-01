"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  { label: "Início", href: "/" },
  { label: "Novo Orçamento", href: "/novo-orcamento" },
  { label: "Orçamentos", href: "/orcamentos" },
  { label: "Obras", href: "/obras" },
  { label: "Financeiro", href: "/financeiro" },
  { label: "Clientes", href: "/clientes" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header
      className="fixed top-0 left-0 w-full z-50 border-b border-grenn-400 shadow-lg"
      style={{ background: "#080d10" }}
    >
      <div className="container mx-auto flex items-center justify-between py-2 px-4">
        <Link href="/">
          <Image
            src="/logo.png"
            alt="Logo Orcamentos"
            width={96}
            height={96}
            className="h-8 w-auto"
            priority
          />
        </Link>
        <nav className="hidden md:flex gap-6">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`font-semibold transition-colors ${
                  isActive
                    ? "text-[#7eaa37]"
                    : "text-white hover:text-[#7eaa37]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
