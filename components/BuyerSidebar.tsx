"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  ShoppingCart, 
  Search,
  Music
} from "lucide-react";

const sidebarItems = [
  { icon: Home, label: "Dashboard", href: "/buyer" },
  { icon: ShoppingCart, label: "Marketplace", href: "/marketplace" },
  { icon: Music, label: "My Collection", href: "/collection" },
];

export default function BuyerSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 h-screen bg-[var(--sidebar-background)] border-r border-[var(--border-color)] flex flex-col">
      {/* SONIC IP Logo Section */}
      <div className="p-6 border-b border-[var(--border-color)]">
        <Link href="/buyer" className="flex items-center space-x-3 hover:opacity-80 transition-opacity cursor-pointer">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <ShoppingCart className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-xl">SONIC IP</span>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="p-4 border-b border-[var(--border-color)]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search IPs..."
            className="w-full bg-[var(--card-background)] border border-[var(--border-color)] rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 text-sm"
          />
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-500/20 text-blue-400 border-l-4 border-blue-500"
                      : "text-gray-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[var(--border-color)]">
        <div className="text-center">
          <p className="text-xs text-gray-500">Buyer Mode</p>
          <p className="text-xs text-gray-400 mt-1">Discover & Collect</p>
        </div>
      </div>
    </div>
  );
}
