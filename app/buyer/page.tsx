"use client";
import BuyerDashboardLayout from "@/components/BuyerDashboardLayout";
import { StatCard } from "@/components/StatCard";
import MarketplaceCard from "@/components/MarketplaceCard";
import TransactionModal from "@/components/TransactionModal";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [selectedIP, setSelectedIP] = useState<RegisteredIP | null>(null);

  // Ensure client-side rendering and load purchased IPs
  useEffect(() => {
    setIsClient(true);
    // Load purchased IPs from localStorage
    const stored = localStorage.getItem('sonic-purchased-ips');
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as (RegisteredIP | null | undefined)[];
        const cleaned = parsed.filter((ip): ip is RegisteredIP => !!ip && !!ip.id);
        setPurchasedIPs(cleaned);
        if (cleaned.length !== parsed.length) {
          localStorage.setItem('sonic-purchased-ips', JSON.stringify(cleaned));
        }
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

  // Build a safe list of purchased IP IDs (guard against null/invalid entries)
  const purchasedIds = purchasedIPs
    .filter((ip): ip is RegisteredIP => !!ip && !!ip.id)
    .map((ip) => ip.id);

  // Filter IPs based on search query and exclude already purchased ones
  const availableForPurchase = registeredIPs.filter(ip => {
    // Exclude already purchased IPs by ID
    const isPurchased = purchasedIds.includes(ip.id);
    return !isPurchased;
  });

  const filteredIPs = availableForPurchase.filter(ip => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      ip.name.toLowerCase().includes(query) ||
      ip.description.toLowerCase().includes(query) ||
      ip.creator.toLowerCase().includes(query) ||
      ip.priceAmount.toLowerCase().includes(query) ||
      ip.priceNetwork.toLowerCase().includes(query)
    );
  });

  // Mock data for buyer stats
  const totalSpent = purchasedIPs.reduce((total, ip) => {
    const amount = parseFloat(ip.priceAmount);
    return total + (isNaN(amount) ? 0 : amount);
  }, 0);
  const availableIPs = filteredIPs.length || 0;
  const totalViews = registeredIPs.reduce((total, ip) => {
    const views = ip.profileViews;
    return total + (isNaN(views) ? 0 : views);
  }, 0);

  const handlePurchase = (ip: RegisteredIP) => {
    setSelectedIP(ip);
    setShowTransactionModal(true);
  };

  const handleTransactionSuccess = (ip: RegisteredIP) => {
    // Add to purchased IPs
    const newPurchasedIPs = [...purchasedIPs, ip];
    setPurchasedIPs(newPurchasedIPs);
    
    // Save to localStorage for persistence
    localStorage.setItem('sonic-purchased-ips', JSON.stringify(newPurchasedIPs));
    
    // Close modal
    setShowTransactionModal(false);
    setSelectedIP(null);
  };

  const handleTransactionClose = () => {
    setShowTransactionModal(false);
    setSelectedIP(null);
  };

  // Get featured IPs (newest first) from filtered results
  const featuredIPs = filteredIPs
    .slice()
    .sort((a, b) => {
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      if (!isNaN(aTime) && !isNaN(bTime)) {
        return bTime - aTime; // most recent first
      }
      // Fallback to views if dates are invalid
      return b.profileViews - a.profileViews;
    })
    .slice(0, 6);

  return (
    <BuyerDashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">IP Marketplace</h1>
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
            <div className="flex items-center space-x-3">
              <h2 className="text-xl font-semibold text-white">
                {searchQuery.trim()
                  ? `Search Results for "${searchQuery}"`
                  : "Featured IPs"}
              </h2>
              {searchQuery.trim() && (
                <span className="text-sm text-gray-400 bg-gray-800 px-2 py-1 rounded">
                  {filteredIPs.length} found
                </span>
              )}
            </div>
            {!searchQuery.trim() && (
              <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                View All
              </button>
            )}
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

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={showTransactionModal}
        onClose={handleTransactionClose}
        ip={selectedIP}
        onSuccess={handleTransactionSuccess}
      />
    </BuyerDashboardLayout>
  );
}