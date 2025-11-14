"use client";

import { WalletConnect } from "@/components/walletConnect";

interface WalletConnectButtonProps {
  isConnecting?: boolean;
}

export default function WalletConnectButton({ isConnecting }: WalletConnectButtonProps) {
  return (
    <div className="inline-flex items-center justify-center">
      {/* Use the existing RainbowKit-based wallet button directly */}
      <WalletConnect />
      {isConnecting && (
        <span className="ml-2 text-xs text-gray-400">Connecting...</span>
      )}
    </div>
  );
}
