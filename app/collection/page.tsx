"use client";
import BuyerDashboardLayout from "@/components/BuyerDashboardLayout";
import { StatCard } from "@/components/StatCard";
import MarketplaceCard from "@/components/MarketplaceCard";
import { useIP } from "@/contexts/IPContext";
import { useRole } from "@/contexts/RoleContext";
import { useAccount } from "wagmi";
import RoleSelection from "@/components/RoleSelection";
import { useState, useEffect } from "react";
import { 
  Music, 
  TrendingUp,
  Wallet,
  Package
} from "lucide-react";
import { RegisteredIP } from "@/contexts/IPContext";

export default function MyCollection() {
  const { userRole, isRoleSelected } = useRole();
  const { isConnected } = useAccount();
  const [purchasedIPs, setPurchasedIPs] = useState<RegisteredIP[]>([]);
  const [isClient, setIsClient] = useState(false);

  // Ensure client-side rendering
  useEffect(() => {
    setIsClient(true);
    // Load purchased IPs from localStorage
    const stored = localStorage.getItem('sonic-purchased-ips');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setPurchasedIPs(parsed);
      } catch (error) {
        console.error('Error loading purchased IPs:', error);
      }
    }
  }, []);

  // Redirect to seller dashboard if user switched to seller role
  useEffect(() => {
    if (userRole === 'seller') {
      window.location.href = '/seller';
    }
  }, [userRole]);

  if (!isClient) {
    return (
      <BuyerDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-white">Loading...</div>
        </div>
      </BuyerDashboardLayout>
    );
  }

  if (isConnected && !isRoleSelected) {
    return <RoleSelection />;
  }

  // Calculate collection stats
  const totalSpent = purchasedIPs.reduce((total, ip) => {
    const amount = parseFloat(ip.priceAmount);
    return total + (isNaN(amount) ? 0 : amount);
  }, 0);

  const totalItems = purchasedIPs.length;
  const uniqueCreators = new Set(purchasedIPs.map(ip => ip.creator)).size;
  const totalDuration = purchasedIPs.reduce((total, ip) => total + ip.duration, 0);

  const handleResell = (ip: RegisteredIP) => {
    alert(
      `Resell functionality for "${ip.name}" would be implemented here.\n\n` +
      `This would allow you to list your owned NFT back on the marketplace.`
    );
  };

  return (
    <BuyerDashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">My Collection</h1>
          <p className="opacity-90">Your owned audio intellectual property NFTs</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            label="Total Items"
            value={totalItems.toString()}
            icon={Package}
          />
          <StatCard
            label="Total Spent"
            value={`${totalSpent.toFixed(3)} ETH`}
            icon={Wallet}
          />
          <StatCard
            label="Unique Creators"
            value={uniqueCreators.toString()}
            icon={Music}
          />
          <StatCard
            label="Total Duration"
            value={`${Math.floor(totalDuration / 60)}m ${totalDuration % 60}s`}
            icon={TrendingUp}
          />
        </div>

        {/* Collection Items */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Your NFT Collection</h2>
            {purchasedIPs.length > 0 && (
              <span className="text-sm text-gray-400 bg-gray-800 px-2 py-1 rounded">
                {purchasedIPs.length} items owned
              </span>
            )}
          </div>
          
          {purchasedIPs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {purchasedIPs.map((ip) => (
                <div key={`owned-${ip.id}`} className="relative">
                  <div className="absolute top-2 right-2 z-10">
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                      OWNED
                    </span>
                  </div>
                  <MarketplaceCard
                    ip={ip}
                    onPurchase={handleResell}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[var(--card-background)] border border-[var(--border-color)] rounded-xl p-12 text-center">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No NFTs in Collection</h3>
              <p className="text-gray-400 mb-4">
                You haven't purchased any audio IP NFTs yet.
              </p>
              <p className="text-gray-500 text-sm">
                Visit the marketplace to discover and purchase unique audio content!
              </p>
            </div>
          )}
        </div>
      </div>
    </BuyerDashboardLayout>
  );
}