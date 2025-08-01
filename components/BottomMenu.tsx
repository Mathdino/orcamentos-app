"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, FileText, Users, Calculator, Hammer, Home } from "lucide-react";

const menuItems = [
  {
    href: "/",
    icon: Home,
    title: "Início",
  },
  {
    href: "/novo-orcamento",
    icon: Plus,
    title: "Novo",
  },
  {
    href: "/orcamentos",
    icon: FileText,
    title: "Orçamentos",
  },
  {
    href: "/obras",
    icon: Hammer,
    title: "Obras",
  },
  {
    href: "/clientes",
    icon: Users,
    title: "Clientes",
  },
  {
    href: "/financeiro",
    icon: Calculator,
    title: "Financeiro",
  },
];

export default function BottomMenu() {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="flex justify-around items-center py-2 px-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-200 min-w-0 flex-1 ${
                isActive
                  ? "text-[#7eaa37] bg-[#7eaa37]/10"
                  : "text-gray-600 hover:text-[#7eaa37] hover:bg-gray-50"
              }`}
            >
              <Icon
                className={`w-6 h-6 mb-1 ${
                  isActive ? "text-[#7eaa37]" : "text-gray-600"
                }`}
              />
              <span
                className={`text-xs font-medium text-center ${
                  isActive ? "text-[#7eaa37]" : "text-gray-600"
                }`}
              >
                {item.title}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
