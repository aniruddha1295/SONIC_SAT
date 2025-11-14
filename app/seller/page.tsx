"use client";
import DashboardLayout from "@/components/DashboardLayout";
import FeaturedCard from "@/components/FeaturedCard";
import { StatCard } from "@/components/StatCard";

import { useIP } from "@/contexts/IPContext";
import { useRole } from "@/contexts/RoleContext";
import { useAccount } from "wagmi";
import RoleSelection from "@/components/RoleSelection";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { 
  FileText, 
  Users, 
  TrendingUp,
  Music,
  Disc3,
  Play,
  Pause,
  Calendar,
  Hash,
  Plus,
  Check,
  X
} from "lucide-react";

export default function SellerDashboard() {
  const { registeredIPs, updateRegisteredIPPrice } = useIP();

  const { userRole, isRoleSelected } = useRole();
  const { isConnected } = useAccount();
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftPrice, setDraftPrice] = useState("");
  const [draftNetwork, setDraftNetwork] = useState("");

  // Ensure client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Redirect to buyer dashboard if user switched to buyer role
  useEffect(() => {
    if (userRole === 'buyer') {
      window.location.href = '/buyer';
    }
  }, [userRole]);

  // Handle role switching - show role selection if no role is selected
  if (!isClient) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-white">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (isConnected && !isRoleSelected) {
    return <RoleSelection />;
  }
  
  // Get the most recent IP for featured card
  const mostRecentIP = registeredIPs.length > 0 ? registeredIPs[registeredIPs.length - 1] : null;
  const mostRecentAudioUrl = mostRecentIP
    ? mostRecentIP.audioFileName
      ? `https://gateway.lighthouse.storage/ipfs/${mostRecentIP.cid}/${mostRecentIP.audioFileName}`
      : `https://gateway.lighthouse.storage/ipfs/${mostRecentIP.cid}`
    : undefined;

  const togglePlayback = async (ip: any) => {
    const audioUrl = `https://ipfs.io/ipfs/${ip.cid}`;
    
    if (playingId === ip.id) {
      // Pause current playing
      audioRef.current?.pause();
      setPlayingId(null);
    } else {
      // Play new audio
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        try {
          await audioRef.current.play();
          setPlayingId(ip.id);
        } catch (error) {
          console.error('Audio playback failed:', error);
          // Try alternative gateway
          const alternativeUrl = audioUrl.replace('ipfs.io', 'gateway.lighthouse.storage');
          audioRef.current.src = alternativeUrl;
          try {
            await audioRef.current.play();
            setPlayingId(ip.id);
          } catch (fallbackError) {
            console.error('Fallback audio playback failed:', fallbackError);
            alert('Unable to play audio. The file may still be processing on IPFS.');
          }
        }
      }
    }
  };

  const handleAudioEnded = () => {
    setPlayingId(null);
  };

  const handleAudioError = () => {
    console.error('Audio loading error');
    setPlayingId(null);
  };

  const startEditing = (ipId: string, currentPrice: string, currentNetwork: string) => {
    setEditingId(ipId);
    setDraftPrice(currentPrice);
    setDraftNetwork(currentNetwork);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setDraftPrice("");
    setDraftNetwork("");
  };

  const saveEditing = (ipId: string) => {
    const price = draftPrice.trim();
    if (!price) return;
    updateRegisteredIPPrice(ipId, price, draftNetwork || "ETH");
    setEditingId(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-10">
        {/* Welcome Section */}
        <div className="relative bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-2xl p-8 text-white overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Music className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Seller Dashboard</h1>
              </div>
            </div>
            <p className="text-white/90 text-lg">Manage your audio intellectual property and track your earnings</p>
          </div>
        </div>

        {/* Quick Actions */}
        <Link href="/store">
          <div className="relative bg-gradient-to-r from-[var(--card-background)] to-gray-800/50 border border-[var(--border-color)] rounded-2xl py-4 px-6 cursor-pointer hover:border-orange-500 hover:shadow-lg hover:shadow-orange-500/20 transition-all duration-300 group w-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-orange-300 transition-colors">Register New IP</h3>
                  <p className="text-gray-400 text-sm mt-1">Upload and tokenize your audio content</p>
                </div>
              </div>
              <div className="text-orange-500 opacity-50 group-hover:opacity-100 transition-opacity">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </Link>

        {/* Featured Content - Most Recent IP */}
        {mostRecentIP ? (
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Disc3 className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Latest Creation</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-gray-600 to-transparent"></div>
            </div>
            <FeaturedCard
              title={mostRecentIP.name}
              genre="Your Audio IP"
              gradient="gradient-card-1"
              audioUrl={mostRecentAudioUrl}
              priceAmount={mostRecentIP.priceAmount}
              priceNetwork={mostRecentIP.priceNetwork}
            />
          </div>
        ) : (
          <Link href="/store">
            <div className="cursor-pointer hover:scale-[1.02] transition-transform">
              <FeaturedCard
                title="Register Your First IP"
                genre="Get Started"
                gradient="gradient-card-1"
              />
            </div>
          </Link>
        )}

        {/* Stats Section */}
        <div>
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Performance Overview</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-600 to-transparent"></div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <StatCard
            label="Registered IPs"
            value={registeredIPs.length.toString()}
            icon={FileText}
          />
          <StatCard
            label="Total Views"
            value={registeredIPs.reduce((total, ip) => {
              const views = ip.profileViews;
              return total + (isNaN(views) ? 0 : views);
            }, 0).toString()}
            icon={TrendingUp}
          />
          <StatCard
            label="This Month"
            value="0 Sales"
            icon={Calendar}
          />
          </div>
        </div>

        {/* Your Registered IPs with editable prices */}
        <div className="bg-[var(--card-background)] rounded-xl border border-[var(--border-color)] p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Your Registered IPs</h3>
            <button className="text-orange-500 hover:text-orange-400 text-sm font-medium">
              View All
            </button>
          </div>

          {registeredIPs.length === 0 ? (
            <p className="text-gray-400 text-sm">You haven't registered any IPs yet.</p>
          ) : (
            <div className="space-y-3">
              {registeredIPs.slice().reverse().map((ip, index) => (
                <div
                  key={ip.id}
                  className="flex items-center space-x-4 p-3 rounded-lg hover:bg-white/5 transition-colors group"
                >
                  {/* Index */}
                  <div className="w-8 text-gray-400 text-sm">
                    {String(index + 1).padStart(2, '0')}
                  </div>

                  {/* Thumbnail */}
                  <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-700 rounded-lg flex items-center justify-center">
                    <div className="w-6 h-6 bg-white/20 rounded" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-medium text-sm truncate">{ip.name}</h4>
                    <p className="text-gray-400 text-xs truncate">
                      Created {new Date(ip.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Price + inline edit */}
                  <div className="flex items-center space-x-3">
                    {editingId === ip.id ? (
                      <>
                        <input
                          type="number"
                          value={draftPrice}
                          onChange={(e) => setDraftPrice(e.target.value)}
                          className="w-20 bg-transparent border border-orange-500 rounded-md px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-400"
                        />
                        <select
                          value={draftNetwork || ip.priceNetwork}
                          onChange={(e) => setDraftNetwork(e.target.value)}
                          className="bg-transparent border border-gray-600 rounded-md px-2 py-1 text-xs text-gray-200 focus:outline-none"
                        >
                          <option className="bg-[var(--card-background)]" value="ETH">ETH</option>
                          <option className="bg-[var(--card-background)]" value="USDT">USDT</option>
                          <option className="bg-[var(--card-background)]" value="USDC">USDC</option>
                          <option className="bg-[var(--card-background)]" value="FIL">FIL</option>
                        </select>
                        <button
                          onClick={() => saveEditing(ip.id)}
                          className="text-green-400 hover:text-green-300"
                          title="Save"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="text-red-400 hover:text-red-300"
                          title="Cancel"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="text-xs font-semibold text-green-400 whitespace-nowrap">
                          {ip.priceAmount} {ip.priceNetwork}
                        </div>
                        <button
                          onClick={() => startEditing(ip.id, ip.priceAmount, ip.priceNetwork)}
                          className="text-xs text-gray-300 hover:text-white border border-gray-600 hover:border-gray-400 rounded-lg px-2 py-1"
                        >
                          Edit Price
                        </button>
                      </>
                    )}
                  </div>

                  {/* Duration */}
                  <div className="text-gray-400 text-xs w-12 text-right">
                    {`${Math.floor(ip.duration / 60)}:${(ip.duration % 60).toString().padStart(2, '0')}`}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Performance Analytics */}
        {registeredIPs.length > 0 && (
          <div className="bg-[var(--card-background)] border border-[var(--border-color)] rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Performance Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-400 mb-1">
                  {(registeredIPs.reduce((total, ip) => total + ip.profileViews, 0) / registeredIPs.length).toFixed(0)}
                </div>
                <div className="text-gray-400 text-sm">Avg. Views per IP</div>
              </div>
              <div className="text-center p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-400 mb-1">
                  {registeredIPs.length > 0 ? Math.floor(registeredIPs.reduce((total, ip) => total + ip.duration, 0) / registeredIPs.length / 60) : 0}m
                </div>
                <div className="text-gray-400 text-sm">Avg. Duration</div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        onEnded={handleAudioEnded}
        onError={handleAudioError}
        preload="metadata"
        crossOrigin="anonymous"
      />
    </DashboardLayout>
  );
}