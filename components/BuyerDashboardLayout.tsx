"use client";
import { ReactNode } from "react";
import BuyerSidebar from "./BuyerSidebar";
import BuyerDashboardHeader from "./BuyerDashboardHeader";

interface BuyerDashboardLayoutProps {
  children: ReactNode;
}

export default function BuyerDashboardLayout({ children }: BuyerDashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-[var(--main-background)]">
      <BuyerSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <BuyerDashboardHeader />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
