"use client";
import { useState } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { useRole } from "@/contexts/RoleContext";
import { Music, Headphones, Zap, Shield, ShoppingCart, ArrowRight, LogOut } from "lucide-react";
import WalletConnectButton from "./WalletConnectButton";
import Link from "next/link";

export default function LandingPage() {
  const { isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { userRole, setUserRole } = useRole();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleRoleSelect = (role: 'buyer' | 'seller') => {
    setUserRole(role);
  };

  const handleDisconnectWallet = () => {
    disconnect();
    setUserRole(null); // Clear the role when disconnecting
  };

  const features = [
    {
      icon: Music,
      title: "Create & Tokenize",
      description: "Turn your audio creations into valuable digital assets on the blockchain"
    },
    {
      icon: Headphones,
      title: "Discover & Purchase",
      description: "Explore unique audio IP from creators worldwide and build your collection"
    },
    {
      icon: Zap,
      title: "Instant Trading",
      description: "Buy and sell audio intellectual property with cryptocurrency payments"
    },
    {
      icon: Shield,
      title: "Secure Ownership",
      description: "Blockchain-verified ownership and transparent transaction history"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.02%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <div className="text-center">
            {/* Logo */}
            <div className="flex items-center justify-center space-x-4 mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center">
                <Music className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-5xl font-bold text-white">SONIC IP</h1>
            </div>

            {/* Tagline */}
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              The Future of
              <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent"> Audio IP</span>
            </h2>
            
            <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Create, tokenize, and trade audio intellectual property on the blockchain. 
              Join the revolution where creators and collectors connect in a decentralized marketplace.
            </p>

            {/* CTA Section */}
            <div className="flex flex-col items-center space-y-6">
              {!isConnected ? (
                <>
                  <WalletConnectButton isConnecting={isConnecting} />
                  <p className="text-gray-400 text-sm">
                    Connect your wallet to access the platform
                  </p>
                </>
              ) : !userRole ? (
                <>
                  <div className="flex flex-col items-center space-y-4 mb-6">
                    <div className="bg-green-500/20 border border-green-500/30 rounded-xl px-6 py-3 text-green-400 font-medium">
                      ✓ Wallet Connected - Choose your role to continue
                    </div>
                    
                    <button 
                      onClick={handleDisconnectWallet}
                      className="text-red-400 hover:text-red-300 transition-colors px-3 py-1 text-sm flex items-center space-x-1"
                      title="Disconnect Wallet"
                    >
                      <LogOut className="w-3 h-3" />
                      <span>Disconnect Wallet</span>
                    </button>
                  </div>
                  
                  {/* Role Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
                    {/* Buyer Card */}
                    <div 
                      onClick={() => handleRoleSelect('buyer')}
                      className="bg-[var(--card-background)] border border-[var(--border-color)] rounded-xl p-6 cursor-pointer hover:border-blue-500 hover:scale-105 transition-all duration-300 group"
                    >
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                          <ShoppingCart className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Buyer</h3>
                        <p className="text-gray-400 text-sm">
                          Discover and purchase unique audio intellectual property
                        </p>
                      </div>
                    </div>

                    {/* Seller Card */}
                    <div 
                      onClick={() => handleRoleSelect('seller')}
                      className="bg-[var(--card-background)] border border-[var(--border-color)] rounded-xl p-6 cursor-pointer hover:border-orange-500 hover:scale-105 transition-all duration-300 group"
                    >
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                          <Music className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Seller</h3>
                        <p className="text-gray-400 text-sm">
                          Create, tokenize, and sell your original audio content
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-green-500/20 border border-green-500/30 rounded-xl px-6 py-3 text-green-400 font-medium mb-6">
                    ✓ Ready to go as {userRole}!
                  </div>
                  
                  {/* Dashboard Navigation */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link href={userRole === 'buyer' ? '/buyer' : '/seller'}>
                      <button className="group bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/25 flex items-center space-x-3">
                        {userRole === 'buyer' ? <ShoppingCart className="w-6 h-6" /> : <Music className="w-6 h-6" />}
                        <span>Go to {userRole === 'buyer' ? 'Buyer' : 'Seller'} Dashboard</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </Link>
                    
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setUserRole(null)}
                        className="text-gray-400 hover:text-white transition-colors px-4 py-2 rounded-lg border border-gray-600 hover:border-gray-400"
                      >
                        Switch Role
                      </button>
                      
                      <button 
                        onClick={handleDisconnectWallet}
                        className="text-red-400 hover:text-red-300 transition-colors px-4 py-2 rounded-lg border border-red-600 hover:border-red-400 flex items-center space-x-2"
                        title="Disconnect Wallet"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Disconnect</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-black/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-white mb-4">Why Choose SONIC IP?</h3>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Experience the next generation of audio intellectual property management
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-orange-500/50 transition-all duration-300 hover:transform hover:scale-105">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-xl font-semibold text-white mb-3">{feature.title}</h4>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-gradient-to-r from-gray-900 to-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-orange-400 mb-2">1000+</div>
              <div className="text-gray-300">Audio IPs Created</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-400 mb-2">500+</div>
              <div className="text-gray-300">Active Creators</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-400 mb-2">$2M+</div>
              <div className="text-gray-300">Total Volume Traded</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="py-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-gray-500">
            © 2024 SONIC IP. Revolutionizing audio intellectual property on the blockchain.
          </p>
        </div>
      </div>
    </div>
  );
}