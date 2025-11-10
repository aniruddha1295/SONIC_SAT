"use client";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import FeaturedCard from "@/components/FeaturedCard";
import ContentList from "@/components/ContentList";
import { StatCard } from "@/components/StatCard";
import { useIP } from "@/contexts/IPContext";
import AppRouter from "@/components/AppRouter";
import { useState, useRef, useEffect } from "react";
import { 
  FileText, 
  Users, 
  TrendingUp,
  Music,
  Disc3,
  Play,
  Pause,
  Calendar,
  Hash
} from "lucide-react";

export default function Home() {
  const { registeredIPs } = useIP();
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // Ensure client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Get the most recent IP for featured card
  const mostRecentIP = registeredIPs.length > 0 ? registeredIPs[registeredIPs.length - 1] : null;

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
  

  return (
    <AppRouter>
      <DashboardLayout>
        <div className="space-y-6">
        {/* Featured Content - Most Recent IP */}
        {mostRecentIP ? (
          <FeaturedCard
            title={mostRecentIP.name}
            genre="Audio IP"
            gradient="gradient-card-1"
            audioUrl={`https://ipfs.io/ipfs/${mostRecentIP.cid}`}
            priceAmount={mostRecentIP.priceAmount}
            priceNetwork={mostRecentIP.priceNetwork}
          />
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <StatCard
            label="Registered IP dSFTs"
            value={registeredIPs.length.toString()}
            icon={FileText}
          />
          <StatCard
            label="Profile Views"
            value={registeredIPs.reduce((total, ip) => {
              const views = ip.profileViews;
              return total + (isNaN(views) ? 0 : views);
            }, 0).toString()}
            icon={TrendingUp}
          />
        </div>

        {/* Content Lists */}
        <div className="grid grid-cols-1 gap-6">
          <ContentList
            title="Registered IPs"
            items={registeredIPs.length > 0 ? registeredIPs.slice().reverse().map(ip => ({
              id: ip.id,
              title: ip.name,
              artist: `💰 ${ip.priceAmount} ${ip.priceNetwork} • Created ${new Date(ip.createdAt).toLocaleDateString()}`,
              duration: `${Math.floor(ip.duration / 60)}:${(ip.duration % 60).toString().padStart(2, '0')}`,
              audioUrl: `https://ipfs.io/ipfs/${ip.cid}`
            })) : []}
            type="album"
          />
        </div>

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
    </AppRouter>
  );
}
