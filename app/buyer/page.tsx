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
  ShoppingCart, 
  Music, 
  TrendingUp,
  Wallet
} from "lucide-react";
import { RegisteredIP } from "@/contexts/IPContext";

export default function BuyerDashboard() {
  const { registeredIPs } = useIP();
  const { userRole, isRoleSelected } = useRole();
  const { isConnected } = useAccount();
  const [purchasedIPs, setPurchasedIPs] = useState<RegisteredIP[]>([]);
  const [isClient, setIsClient] = useState(false);

  // Ensure client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Redirect to seller dashboard if user switched to seller role
  useEffect(() => {
    if (userRole === 'seller') {
      window.location.href = '/';
    }
  }, [userRole]);

  // Handle role switching - show role selection if no role is selected
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

  // Mock data for buyer stats
  const totalSpent = purchasedIPs.reduce((total, ip) => {
    const amount = parseFloat(ip.priceAmount);
    return total + (isNaN(amount) ? 0 : amount);
  }, 0);
  const availableIPs = registeredIPs.length || 0;
  const totalViews = registeredIPs.reduce((total, ip) => {
    const views = ip.profileViews;
    return total + (isNaN(views) ? 0 : views);
  }, 0);

  const handlePurchase = (ip: RegisteredIP) => {
    // Mock purchase - in real app this would integrate with wallet
    alert(`Purchase initiated for "${ip.name}" - ${ip.priceAmount} ${ip.priceNetwork}\n\nThis would connect to your wallet for payment.`);
    setPurchasedIPs(prev => [...prev, ip]);
  };

  // Get featured IPs (most viewed)
  const featuredIPs = registeredIPs
    .sort((a, b) => b.profileViews - a.profileViews)
    .slice(0, 6);

  return (
    <BuyerDashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Welcome to the IP Marketplace</h1>
          <p className="opacity-90">Discover and purchase unique audio intellectual property from creators worldwide</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            label="Available IPs"
            value={availableIPs.toString()}
            icon={Music}
          />
          <StatCard
            label="My Purchases"
            value={purchasedIPs.length.toString()}
            icon={ShoppingCart}
          />
          <StatCard
            label="Total Spent"
            value={`${totalSpent.toFixed(2)} ETH`}
            icon={Wallet}
          />
          <StatCard
            label="Market Activity"
            value={totalViews.toString()}
            icon={TrendingUp}
          />
        </div>

        {/* Featured IPs Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Featured IPs</h2>
            <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
              View All
            </button>
          </div>
          
          {featuredIPs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredIPs.map((ip) => (
                <MarketplaceCard
                  key={ip.id}
                  ip={ip}
                  onPurchase={handlePurchase}
                />
              ))}
            </div>
          ) : (
            <div className="bg-[var(--card-background)] border border-[var(--border-color)] rounded-xl p-12 text-center">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Music className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No IPs Available Yet</h3>
              <p className="text-gray-400 mb-4">
                There are no intellectual properties available for purchase at the moment.
              </p>
              <p className="text-gray-500 text-sm">
                Check back later or encourage creators to register their IPs!
              </p>
            </div>
          )}
        </div>

        {/* Recent Purchases */}
        {purchasedIPs.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Recent Purchases</h2>
            <div className="bg-[var(--card-background)] border border-[var(--border-color)] rounded-xl p-6">
              <div className="space-y-4">
                {purchasedIPs.slice(-3).map((ip) => (
                  <div key={`purchased-${ip.id}`} className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div>
                      <h4 className="text-white font-medium">{ip.name}</h4>
                      <p className="text-gray-400 text-sm">Purchased successfully</p>
                    </div>
                    <div className="text-green-400 font-semibold">
                      {ip.priceAmount} {ip.priceNetwork}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </BuyerDashboardLayout>
  );
}
