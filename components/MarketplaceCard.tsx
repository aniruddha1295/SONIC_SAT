"use client";
import { Play, Pause, ShoppingCart } from "lucide-react";
import { useState, useRef } from "react";
import { RegisteredIP } from "@/contexts/IPContext";

interface MarketplaceCardProps {
  ip: RegisteredIP;
  onPurchase: (ip: RegisteredIP) => void;
}

export default function MarketplaceCard({ ip, onPurchase }: MarketplaceCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlayback = async () => {
    const audioUrl = `https://ipfs.io/ipfs/${ip.cid}`;
    
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      try {
        audioRef.current.src = audioUrl;
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (error) {
        console.error('Audio playback failed:', error);
        // Try alternative gateway
        const alternativeUrl = audioUrl.replace('ipfs.io', 'gateway.lighthouse.storage');
        audioRef.current.src = alternativeUrl;
        try {
          await audioRef.current.play();
          setIsPlaying(true);
        } catch (fallbackError) {
          console.error('Fallback audio playback failed:', fallbackError);
          alert('Unable to play audio. The file may still be processing on IPFS.');
        }
      }
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const handleAudioError = () => {
    console.error('Audio loading error for IP:', ip.id);
    setIsPlaying(false);
  };

  const handlePurchase = () => {
    onPurchase(ip);
  };

  return (
    <div className="bg-[var(--card-background)] border border-[var(--border-color)] rounded-xl p-6 hover:border-blue-500/50 transition-all duration-300 hover:scale-[1.02]">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-1">{ip.name}</h3>
          <p className="text-gray-400 text-sm">by {ip.creator.slice(0, 6)}...{ip.creator.slice(-4)}</p>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-blue-400">{ip.priceAmount} {ip.priceNetwork}</div>
          <div className="text-xs text-gray-500">{ip.profileViews} views</div>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-300 text-sm mb-4 line-clamp-2">{ip.description}</p>

      {/* Audio Info */}
      <div className="flex items-center justify-between mb-4 text-xs text-gray-500">
        <span>Duration: {Math.floor(ip.duration / 60)}:{(ip.duration % 60).toString().padStart(2, '0')}</span>
        <span>Created: {new Date(ip.createdAt).toLocaleDateString()}</span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-3">
        <button 
          onClick={togglePlayback}
          className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors flex-1"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          <span className="text-sm font-medium">{isPlaying ? 'Pause' : 'Preview'}</span>
        </button>
        
        <button 
          onClick={handlePurchase}
          className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <ShoppingCart className="w-4 h-4" />
          <span className="text-sm font-medium">Buy</span>
        </button>
      </div>

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        onEnded={handleAudioEnded}
        onError={handleAudioError}
        preload="metadata"
        crossOrigin="anonymous"
      />
    </div>
  );
}
