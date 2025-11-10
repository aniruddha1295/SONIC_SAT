"use client";
import { Play, Pause } from "lucide-react";
import { useState, useRef } from "react";

interface FeaturedCardProps {
  title: string;
  genre: string;
  collaborations: string;
  imageUrl?: string;
  gradient?: string;
  audioUrl?: string;
}

export default function FeaturedCard({
  title,
  genre,
  collaborations,
  imageUrl,
  gradient = "gradient-card-1",
  audioUrl
}: FeaturedCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlayback = async () => {
    if (!audioUrl || !audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      try {
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
    console.error('Audio loading error for URL:', audioUrl);
    setIsPlaying(false);
  };
  return (
    <div className={`relative p-6 rounded-xl ${gradient} text-white overflow-hidden`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-4 right-4 w-32 h-32 rounded-full border-2 border-white/20"></div>
        <div className="absolute bottom-4 right-8 w-20 h-20 rounded-full border border-white/20"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="mb-4">
          <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Recent IP</span>
        </div>

        <h2 className="text-3xl font-bold mb-2">{title}</h2>
        
        <div className="mb-6">
          <p className="text-sm opacity-90">Genre: {genre}</p>
          <p className="text-sm opacity-90">Collaborations: {collaborations}</p>
        </div>


        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button 
            onClick={togglePlayback}
            disabled={!audioUrl}
            className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span className="text-sm font-medium">{isPlaying ? 'Pause' : 'Play'}</span>
          </button>
        </div>
        
        {/* Hidden Audio Element */}
        {audioUrl && (
          <audio
            ref={audioRef}
            src={audioUrl}
            onEnded={handleAudioEnded}
            onError={handleAudioError}
            preload="metadata"
            crossOrigin="anonymous"
          />
        )}
      </div>

      {/* Artist Image */}
      {imageUrl && (
        <div className="absolute right-6 top-1/2 transform -translate-y-1/2">
          <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-white/20"></div>
          </div>
        </div>
      )}
    </div>
  );
}
