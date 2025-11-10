"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  FileText, 
  Key, 
  Users, 
  BarChart3, 
  Shield, 
  Settings, 
  HelpCircle,
  Search
} from "lucide-react";

const sidebarItems = [
  { icon: Home, label: "Dashboard", href: "/" },
  { icon: FileText, label: "Register Your IP", href: "/store" },
  { icon: Key, label: "Generate ZPK", href: "/generate" },
  { icon: Users, label: "Collaborations", href: "/collaborations" },
  { icon: BarChart3, label: "Analytics", href: "/analytics" },
  { icon: Shield, label: "Credentials", href: "/credentials" },
  { icon: Settings, label: "Settings", href: "/settings" },
  { icon: HelpCircle, label: "Help", href: "/help" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 h-screen bg-[var(--sidebar-background)] border-r border-[var(--border-color)] flex flex-col">
      {/* SONIC IP Logo Section */}
      <div className="p-6 border-b border-[var(--border-color)]">
        <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity cursor-pointer">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <div>
            <h1 className="text-white font-semibold text-lg">SONIC IP</h1>
          </div>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full bg-[var(--card-background)] border border-[var(--border-color)] rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
          />
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-4 space-y-1">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-orange-500/10 text-orange-500 border-r-2 border-orange-500"
                  : "text-gray-300 hover:text-white hover:bg-[var(--card-background)]"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Empty bottom section */}
      <div className="p-4">
      </div>
    </div>
  );
}
