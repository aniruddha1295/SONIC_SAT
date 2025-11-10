"use client";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import FeaturedCard from "@/components/FeaturedCard";
import ContentList from "@/components/ContentList";
import { StatCard } from "@/components/StatCard";
import { useIP } from "@/contexts/IPContext";
import { useState, useRef } from "react";
import { 
  FileText, 
  Users, 
  Shield, 
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
  const audioRef = useRef<HTMLAudioElement>(null);
  
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
    <DashboardLayout>
      <div className="space-y-6">
        {/* Featured Content - Most Recent IP */}
        {mostRecentIP ? (
          <FeaturedCard
            title={mostRecentIP.name}
            genre="Audio IP"
            collaborations="1"
            gradient="gradient-card-1"
            audioUrl={`https://ipfs.io/ipfs/${mostRecentIP.cid}`}
          />
        ) : (
          <Link href="/store">
            <div className="cursor-pointer hover:scale-[1.02] transition-transform">
              <FeaturedCard
                title="Register Your First IP"
                genre="Get Started"
                collaborations="0"
                gradient="gradient-card-1"
              />
            </div>
          </Link>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            label="Registered IP dSFTs"
            value={registeredIPs.length.toString()}
            icon={FileText}
            trend={{ value: registeredIPs.length > 0 ? "100" : "0", isPositive: true }}
          />
          <StatCard
            label="Creator Credentials"
            value="3"
            icon={Shield}
            trend={{ value: "8", isPositive: true }}
          />
          <StatCard
            label="Profile Views"
            value="1254"
            icon={TrendingUp}
            trend={{ value: "23", isPositive: true }}
          />
        </div>

        {/* Content Lists */}
        <div className="grid grid-cols-1 gap-6">
          <ContentList
            title="Registered IPs"
            items={registeredIPs.length > 0 ? registeredIPs.slice().reverse().map(ip => ({
              id: ip.id,
              title: ip.name,
              artist: `Created ${new Date(ip.createdAt).toLocaleDateString()}`,
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
  );
}
