"use client";
import { useRole } from "@/contexts/RoleContext";
import { useAccount } from "wagmi";
import RoleSelection from "./RoleSelection";
import { usePathname } from "next/navigation";

interface AppRouterProps {
  children: React.ReactNode;
}

export default function AppRouter({ children }: AppRouterProps) {
  const { userRole, isRoleSelected } = useRole();
  const { isConnected } = useAccount();
  const pathname = usePathname();

  // Don't show role selection for specific pages that don't need it
  const excludedPaths = ['/', '/store'];
  const isExcludedPath = excludedPaths.some(path => pathname.startsWith(path));

  // If wallet is connected and no role is selected (and not on excluded paths), show role selection
  if (isConnected && !isRoleSelected && !isExcludedPath) {
    return <RoleSelection />;
  }

  return <>{children}</>;
}
