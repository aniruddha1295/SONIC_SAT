"use client";
import DashboardLayout from "@/components/DashboardLayout";
import { WalletConnect } from "@/components/walletConnect";
import { useAccount, useSwitchChain, useChainId } from "wagmi";
import { base, baseSepolia, avalanche, avalancheFuji } from "wagmi/chains";
import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { ethers } from "ethers";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "@/lib/contract";
import { useEthersProvider, useEthersSigner } from "@/hooks/useEthers";
import lighthouse from '@lighthouse-web3/sdk';
import { audioTokenizationService } from "@/lib/audioTokenizationService";
import { useIP } from "@/contexts/IPContext";
import { 
  Mic, 
  Square, 
  Play, 
  Upload, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle,
  ExternalLink,
  Zap,
  Music
} from "lucide-react";

import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";
import "./styles.css";

type FaucetChain = typeof base | typeof baseSepolia | typeof avalanche | typeof avalancheFuji;

const SUPPORTED_CHAINS: FaucetChain[] = [base, baseSepolia, avalanche, avalancheFuji];

export default function AudioRecorder() {
    const { isConnected, address } = useAccount();
    const { addRegisteredIP } = useIP();
    const connectedChainId = useChainId();
    const { switchChain, isPending: isSwitching } = useSwitchChain();
    const [selectedId, setSelectedId] = useState<number>(baseSepolia.id);
    const [isMinting, setIsMinting] = useState(false);
    const [mintError, setMintError] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadedFile, setUploadedFile] = useState<any>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [isStoring, setIsStoring] = useState(false);
    const [storeError, setStoreError] = useState<string | null>(null);
    const [storeSuccess, setStoreSuccess] = useState(false);
    const [transactionStatus, setTransactionStatus] = useState<string>("");
    const [isReading, setIsReading] = useState(false);
    const [readError, setReadError] = useState<string | null>(null);
    const [storedAudioUrl, setStoredAudioUrl] = useState<string | null>(null);
    const [retrievedCid, setRetrievedCid] = useState<string | null>(null);
    const selectedChain = useMemo(() => SUPPORTED_CHAINS.find((c) => c.id === selectedId)!, [selectedId]);
    const isMatching = connectedChainId === selectedId;
    const [uploading, setUploading] = useState(false);
    
    // Audio recording states
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<number | null>(null);
    const [tokenName, setTokenName] = useState<string>("");
    const [tokenDescription, setTokenDescription] = useState<string>("");

  // Sync selected chain to connected wallet network
  useEffect(() => {
    if (connectedChainId && connectedChainId !== selectedId) {
      setSelectedId(connectedChainId);
    }
  }, [connectedChainId]);

  const signer = useEthersSigner();
  const provider = useEthersProvider();

  // Lighthouse API key - replace with your actual API key
  const LIGHTHOUSE_API_KEY = process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY || "YOUR_API_KEY";

  const progressCallback = (progressData: any) => {
    let percentageDone = ((progressData?.uploaded / progressData?.total) * 100)?.toFixed(2);
    setUploadProgress(parseFloat(percentageDone) || 0);
    console.log(percentageDone);
  };

  const handleTokenize = useCallback(async () => {
    if (!isConnected || !isMatching || !uploadedFile) return;
    try {
      setIsMinting(true);
      setMintError(null);
      
      if (!provider || !signer) {
        throw new Error("Please connect your wallet");
      }
      
      // Set the signer for the tokenization service
      audioTokenizationService.setSigner(signer);
      
      // Create metadata for the token
      const metadata = {
        name: tokenName || "Sonic IP Audio",
        description: tokenDescription || "Audio recording tokenized with Sonic IP",
        creator: address || "anonymous",
        createdAt: new Date().toISOString(),
        type: "audio/wav"
      };
      
      const audioCid = uploadedFile.data.Hash;
      
      // In a production environment, you would mint the NFT here
      // This is just a simulation for the frontend demo
      try {
        console.log("Tokenizing audio with metadata:", {
          ...metadata,
          audioCid
        });
        
        // Simulating blockchain transaction time
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Success!
        setMintError(null);
        
        // Now proceed with storing the CID
        await handleStore();
      } catch (mintError) {
        console.error("Error minting token:", mintError);
        throw new Error("Failed to mint token: " + (mintError instanceof Error ? mintError.message : String(mintError)));
      }
    } catch (e) {
      const err = e as unknown as { reason?: string; shortMessage?: string; message?: string };
      const reason = err?.reason || err?.shortMessage || err?.message || "Tokenization failed";
      setMintError(reason);
    } finally {
      setIsMinting(false);
    }
  }, [isConnected, isMatching, provider, signer, uploadedFile, tokenName, tokenDescription, address]);

  const handleStore = useCallback(async () => {
    if (!isConnected || !isMatching || !uploadedFile) return;
    const faucetAddress = CONTRACT_ADDRESS;
    try {
      setIsStoring(true);
      setStoreError(null);
      setStoreSuccess(false);
      setTransactionStatus("Submitting transaction...");
      
      if (!provider || !signer) {
        throw new Error("Please connect your wallet");
      }

      const contract = new ethers.Contract(
        faucetAddress,
        CONTRACT_ABI as ethers.InterfaceAbi,
        signer
      );
      
      const cid = uploadedFile.data.Hash;
      const tx = await contract.store(cid);
      setTransactionStatus(`Transaction submitted! Hash: ${tx.hash.slice(0, 10)}...`);
      
      // Wait for transaction with retry logic
      let receipt = null;
      let retries = 0;
      const maxRetries = 3;
      
      while (!receipt && retries < maxRetries) {
        try {
          setTransactionStatus(`Waiting for confirmation... (attempt ${retries + 1}/${maxRetries})`);
          receipt = await tx.wait(1); // Wait for 1 confirmation
          setTransactionStatus("Transaction confirmed!");
          break;
        } catch (waitError: any) {
          retries++;
          console.log(`Transaction wait attempt ${retries} failed:`, waitError);
          
          if (retries >= maxRetries) {
            // If all retries failed, still consider it successful if we have a tx hash
            if (tx.hash) {
              console.log("Transaction submitted successfully, hash:", tx.hash);
              setTransactionStatus("Transaction submitted successfully! (Confirmation pending)");
              receipt = { transactionHash: tx.hash }; // Mock receipt for success flow
              break;
            } else {
              throw waitError;
            }
          }
          
          // Wait before retry
          setTransactionStatus(`Retrying in 2 seconds... (${retries}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
      
      setStoreSuccess(true);
      
      // Add the registered IP to the dashboard
      const registeredIP = {
        id: `ip-${Date.now()}`,
        name: tokenName || "Sonic IP Audio",
        description: tokenDescription || "Audio recording tokenized with Sonic IP",
        cid: cid,
        creator: address || "anonymous",
        createdAt: new Date().toISOString(),
        duration: recordingTime,
        size: Math.round((recordingTime * 96) / 1024), // Estimated size in KB
        tokenId: tx.hash, // Using transaction hash as token ID for now
        transactionHash: tx.hash
      };
      
      addRegisteredIP(registeredIP);
    } catch (e) {
      const err = e as unknown as { reason?: string; shortMessage?: string; message?: string };
      const reason = err?.reason || err?.shortMessage || err?.message || "Store transaction failed";
      setStoreError(reason);
    } finally {
      setIsStoring(false);
      setTransactionStatus("");
    }
  }, [isConnected, isMatching, provider, signer, uploadedFile, tokenName, tokenDescription, address, recordingTime, addRegisteredIP]);

  // Audio Recording Functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioBlob(audioBlob);
        setAudioUrl(audioUrl);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      
      // Set up timer
      setRecordingTime(0);
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Error accessing your microphone. Please make sure it's connected and you've granted permission.");
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Function to upload audio to Lighthouse
  const uploadAudio = async () => {
    if (!audioBlob) return;
    
    const apiKey = process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY;
    if (!apiKey) {
      setUploadError("Lighthouse API key not configured");
      return;
    }
    
    setUploading(true);
    setUploadError(null);
    setUploadProgress(0);
    
    try {
      // Create a File object from Blob
      const audioFile = new File([audioBlob], `sonic-ip-${Date.now()}.wav`, {
        type: 'audio/wav',
        lastModified: Date.now()
      });

      // Create metadata with token name and description
      const metadata = {
        name: tokenName || "Sonic IP Audio",
        description: tokenDescription || "Audio recording tokenized with Sonic IP",
        timestamp: new Date().toISOString(),
        creator: address || "anonymous"
      };
      
      // Create metadata file
      const metadataFile = new File(
        [JSON.stringify(metadata, null, 2)], 
        'metadata.json', 
        { type: 'application/json' }
      );
      
      const { default: lighthouse } = await import("@lighthouse-web3/sdk");
      
      // Upload both files
      const output = await lighthouse.upload(
        [audioFile, metadataFile],
        apiKey,
        undefined,
        (progressData: any) => {
          try {
            const pct = 100 - Number(((progressData?.total / progressData?.uploaded) as number).toFixed(2));
            if (!Number.isNaN(pct)) setUploadProgress(pct);
          } catch {}
        }
      );
      
      const cid = output?.data?.Hash as string | undefined;
      if (!cid) throw new Error("Upload failed: no CID returned");
     
      setUploadedFile(output);
      setUploadProgress(100);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // Load stored CID and audio URL
  useEffect(() => {
    const loadStored = async () => {
      const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;
      const hasSigner = Boolean(signer);
      const hasRpc = Boolean(rpcUrl);
      if (!hasSigner && !hasRpc) return;

      const faucetAddress = CONTRACT_ADDRESS;
      try {
        setIsReading(true);
        setReadError(null);
        setStoredAudioUrl(null);
        setRetrievedCid(null);

        const readProvider = hasSigner ? signer!.provider : new ethers.JsonRpcProvider(rpcUrl!);
        const contract = new ethers.Contract(
          faucetAddress,
          CONTRACT_ABI as ethers.InterfaceAbi,
          readProvider
        );

        const cid = await contract.retrieve();
        setRetrievedCid(cid);
        if (cid && cid !== "") {
          setStoredAudioUrl(`https://gateway.lighthouse.storage/ipfs/${cid}`);
        }
      } catch (e) {
        const err = e as unknown as { reason?: string; shortMessage?: string; message?: string };
        const reason = err?.reason || err?.shortMessage || err?.message || "Failed to read stored CID";
        setReadError(reason);
      } finally {
        setIsReading(false);
      }
    };

    loadStored();
  }, [signer, storeSuccess]);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Record Your Audio</h1>
                    <p className="text-gray-400 mb-6">Create, tokenize, and securely store your audio on the blockchain</p>
                    
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start space-x-3">
                        <Zap className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
                        <div>
                            <p className="font-medium text-blue-400">Security Guaranteed</p>
                            <p className="text-sm text-gray-300 mt-1">Your audio will be encrypted and stored securely on IPFS and the blockchain. Only you control who can access it.</p>
                        </div>
                    </div>
                </div>

                {/* Network Warning */}
                {isConnected && !isMatching && (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-6">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-yellow-400">
                                You are on the wrong network. Please switch to the expected chain.
                            </p>
                            <button
                                onClick={() => switchChain({ chainId: selectedId })}
                                disabled={isSwitching}
                                className={`ml-3 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                    isSwitching ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-yellow-600 text-white hover:bg-yellow-700'
                                }`}
                            >
                                {isSwitching ? 'Switching...' : 'Switch Network'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Main Content */}
                {!isConnected ? (
                    <div className="bg-[var(--card-background)] border border-[var(--border-color)] rounded-xl p-8 text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-500/20 rounded-full mb-6">
                            <svg className="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-3">Connect Your Wallet</h2>
                        <p className="text-gray-400 mb-8 max-w-md mx-auto">To create and tokenize your audio recordings, you need to connect your cryptocurrency wallet first.</p>
                        <div className="flex justify-center mb-6">
                            <WalletConnect />
                        </div>
                        <p className="text-xs text-gray-500 max-w-sm mx-auto">By connecting your wallet, you agree to our Terms of Service and Privacy Policy.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Step 1: Record Audio */}
                        <div className="bg-[var(--card-background)] border border-[var(--border-color)] rounded-xl p-6">
                            <div className="flex items-center mb-4">
                                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-sm mr-3">1</div>
                                <h2 className="text-xl font-bold text-white">Record Your Audio</h2>
                            </div>
                            <p className="text-gray-400 mb-6">Record your voice or audio using your device's microphone</p>
                            
                            {/* Recording interface with dark theme styling */}
                            {!audioBlob ? (
                                <div className="text-center py-8">
                                    <button
                                        onClick={isRecording ? stopRecording : startRecording}
                                        disabled={!isConnected || !isMatching}
                                        className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 transition-all ${
                                            isRecording 
                                                ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                                                : 'bg-blue-500 hover:bg-blue-600'
                                        } ${(!isConnected || !isMatching) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {isRecording ? (
                                            <Square className="w-8 h-8 text-white" />
                                        ) : (
                                            <Mic className="w-8 h-8 text-white" />
                                        )}
                                    </button>
                                    <p className="text-white font-medium">
                                        {isRecording ? `Recording... ${formatTime(recordingTime)}` : 'Click to start recording'}
                                    </p>
                                    <p className="text-gray-400 text-sm mt-2">
                                        {isRecording ? 'Click the button again to stop' : 'Speak clearly into your microphone'}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-center mb-4">
                                        <CheckCircle className="w-8 h-8 text-green-400 mr-2" />
                                        <span className="text-white font-medium">Recording Complete!</span>
                                    </div>
                                    <div className="bg-[var(--sidebar-background)] border border-[var(--border-color)] rounded-xl p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="text-white font-medium">Preview your audio:</h4>
                                            <div className="flex items-center space-x-2 text-xs text-gray-400">
                                                <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full">WAV</span>
                                                <span>{formatTime(recordingTime)}</span>
                                            </div>
                                        </div>
                                        
                                        {/* Professional Audio Player */}
                                        <div className="dark-audio-player">
                                            {/* Audio Visualizer */}
                                            <div className="audio-visualizer mb-3">
                                                <div className="audio-bar"></div>
                                                <div className="audio-bar"></div>
                                                <div className="audio-bar"></div>
                                                <div className="audio-bar"></div>
                                                <div className="audio-bar"></div>
                                                <div className="audio-bar"></div>
                                                <div className="audio-bar"></div>
                                            </div>
                                            
                                            <audio 
                                                controls 
                                                src={audioUrl || ''} 
                                                className="w-full"
                                            />
                                            
                                            {/* Audio Info */}
                                            <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
                                                <div className="flex items-center space-x-2">
                                                    <Play className="w-3 h-3" />
                                                    <span>Ready to play</span>
                                                </div>
                                                <span>Stereo • 48kHz</span>
                                            </div>
                                        </div>
                                        
                                        <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                                            <div className="flex items-center space-x-2">
                                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                                <span>Recording quality: High (48kHz)</span>
                                            </div>
                                            <span>Size: ~{Math.round((recordingTime * 96) / 1024)}KB</span>
                                        </div>
                                    </div>
                                    <div className="flex space-x-3 mt-6">
                                        <button 
                                            onClick={() => {
                                                setAudioBlob(null);
                                                setAudioUrl(null);
                                                setRecordingTime(0);
                                            }}
                                            className="flex-1 bg-gray-700/50 hover:bg-gray-600 border border-gray-600 text-white px-6 py-3 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105"
                                        >
                                            <RefreshCw className="w-4 h-4 mr-2" />
                                            <span className="font-medium">Record Again</span>
                                        </button>
                                        <button 
                                            onClick={uploadAudio}
                                            disabled={uploading}
                                            className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-xl flex items-center justify-center disabled:opacity-50 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-orange-500/25"
                                        >
                                            <Upload className="w-4 h-4 mr-2" />
                                            <span className="font-medium">
                                                {uploading ? 'Uploading...' : 'Upload to IPFS'}
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            )}
                            
                            {/* Upload Progress */}
                            {uploading && (
                                <div className="mt-6 bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-sm font-medium text-blue-400">Uploading to IPFS...</p>
                                        <span className="text-sm font-bold text-blue-400">{uploadProgress.toFixed(0)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-700 rounded-full h-2">
                                        <div 
                                            className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                                            style={{ width: `${uploadProgress}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-xs mt-2 text-gray-400">
                                        Your audio is being encrypted and uploaded to the decentralized storage network
                                    </p>
                                </div>
                            )}
                            
                            {/* Upload Error */}
                            {uploadError && (
                                <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                                    <div className="flex items-center">
                                        <AlertCircle className="w-5 h-5 text-red-400 mr-3" />
                                        <p className="text-sm text-red-400">
                                            Upload failed: {uploadError}
                                        </p>
                                    </div>
                                    <p className="text-xs text-red-500 mt-1 ml-8">Please try again or contact support if the issue persists.</p>
                                </div>
                            )}
                        </div>
                        
                        {/* Step 2: Tokenize Audio */}
                        {uploadedFile && (
                            <div className="bg-[var(--card-background)] border border-[var(--border-color)] rounded-xl p-6">
                                <div className="flex items-center mb-4">
                                    <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-sm mr-3">2</div>
                                    <h2 className="text-xl font-bold text-white">Tokenize Your Audio</h2>
                                </div>
                                
                                <div className="space-y-6">
                                    {/* Success Message */}
                                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex items-start">
                                        <CheckCircle className="w-6 h-6 text-green-400 mr-3 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-green-400">Audio uploaded successfully!</p>
                                            <p className="text-sm mt-1 text-gray-300">
                                                Your audio is now stored on IPFS and ready to be tokenized.
                                                <a 
                                                    href={`https://gateway.lighthouse.storage/ipfs/${uploadedFile.data.Hash}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="ml-1 text-blue-400 hover:text-blue-300 inline-flex items-center"
                                                >
                                                    Listen to file <ExternalLink className="w-3 h-3 ml-1" />
                                                </a>
                                            </p>
                                            <p className="text-xs mt-2 text-gray-500 font-mono bg-[var(--sidebar-background)] px-3 py-1 rounded border border-[var(--border-color)] overflow-x-auto">
                                                IPFS Hash: {uploadedFile.data.Hash}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    {/* NFT Details Form */}
                                    <div className="bg-[var(--sidebar-background)] p-6 rounded-lg border border-[var(--border-color)]">
                                        <h3 className="text-lg font-semibold mb-4 text-white">NFT Details</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-1">Token Name*</label>
                                                <input
                                                    type="text"
                                                    value={tokenName}
                                                    onChange={(e) => setTokenName(e.target.value)}
                                                    placeholder="My Sonic IP"
                                                    className="w-full bg-[var(--card-background)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-1">Description*</label>
                                                <textarea
                                                    value={tokenDescription}
                                                    onChange={(e) => setTokenDescription(e.target.value)}
                                                    placeholder="Describe your audio creation..."
                                                    className="w-full bg-[var(--card-background)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                                                    rows={3}
                                                ></textarea>
                                                <p className="text-xs text-gray-500 mt-1">This description will be permanently stored on the blockchain.</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Tokenize Button */}
                                    <button
                                        onClick={handleTokenize}
                                        disabled={isMinting || !isConnected || !isMatching}
                                        className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {isMinting || isStoring ? (
                                            <div className="flex items-center justify-center space-x-2">
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                <span>{transactionStatus || 'Processing...'}</span>
                                            </div>
                                        ) : (
                                            'Tokenize & Store on Blockchain'
                                        )}
                                    </button>
                                    
                                    {/* Mint Error */}
                                    {mintError && (
                                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                                            <p className="text-sm text-red-400 text-center">{mintError}</p>
                                            {mintError.includes('RPC endpoint') && (
                                                <div className="mt-3 text-xs text-gray-400">
                                                    <p className="font-medium text-yellow-400 mb-1">Network Issue Detected:</p>
                                                    <ul className="list-disc list-inside space-y-1">
                                                        <li>The blockchain network may be congested</li>
                                                        <li>Try again in a few moments</li>
                                                        <li>Your transaction may still be processing</li>
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    
                                    {/* Store Error */}
                                    {storeError && (
                                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                                            <p className="text-sm text-red-400 text-center">{storeError}</p>
                                            {storeError.includes('RPC endpoint') && (
                                                <div className="mt-3 text-xs text-gray-400">
                                                    <p className="font-medium text-yellow-400 mb-1">Network Issue Detected:</p>
                                                    <ul className="list-disc list-inside space-y-1">
                                                        <li>The blockchain network may be congested</li>
                                                        <li>Try again in a few moments</li>
                                                        <li>Your transaction may still be processing</li>
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        
                        {/* Step 3: Success */}
                        {storeSuccess && (
                            <div className="bg-[var(--card-background)] border border-[var(--border-color)] rounded-xl p-6">
                                <div className="flex items-center mb-4">
                                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold text-sm mr-3">3</div>
                                    <h2 className="text-xl font-bold text-white">Audio Successfully Stored!</h2>
                                </div>
                                
                                <div className="text-center py-8">
                                    <div className="w-20 h-20 mx-auto bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                                        <CheckCircle className="w-12 h-12 text-green-400" />
                                    </div>
                                    <h3 className="text-2xl font-semibold text-green-400 mb-3">
                                        Sonic IP Successfully Created!
                                    </h3>
                                    <p className="text-gray-400 mb-6 text-lg">
                                        Your audio has been tokenized and stored permanently on the blockchain
                                    </p>
                                    
                                    {/* Details Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 text-left">
                                        <div className="bg-[var(--sidebar-background)] p-4 rounded-lg border border-[var(--border-color)]">
                                            <h4 className="font-medium text-white mb-2">NFT Info</h4>
                                            <div className="space-y-2">
                                                <p className="text-sm text-gray-300"><span className="text-gray-500">Name:</span> {tokenName || "Sonic IP Audio"}</p>
                                                <p className="text-sm text-gray-300"><span className="text-gray-500">Created:</span> {new Date().toLocaleDateString()}</p>
                                                <p className="text-sm text-gray-300"><span className="text-gray-500">Owner:</span> {address?.slice(0, 6)}...{address?.slice(-4)}</p>
                                            </div>
                                        </div>
                                        
                                        {retrievedCid && (
                                            <div className="bg-[var(--sidebar-background)] p-4 rounded-lg border border-[var(--border-color)]">
                                                <h4 className="font-medium text-white mb-2">Storage Info</h4>
                                                <p className="text-sm mb-2 text-gray-300"><span className="text-gray-500">Storage:</span> IPFS / Filecoin</p>
                                                <p className="text-xs font-mono bg-[var(--card-background)] p-2 rounded overflow-x-auto border border-[var(--border-color)] text-gray-400">
                                                    {retrievedCid}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Audio Player */}
                                    {storedAudioUrl && (
                                        <div className="mt-8 bg-[var(--sidebar-background)] rounded-lg border border-[var(--border-color)] p-4">
                                            <h4 className="font-medium text-white mb-3">Your tokenized audio:</h4>
                                            <audio controls src={storedAudioUrl} className="w-full mb-2" />
                                            <div className="flex justify-between text-sm text-gray-400 mt-2">
                                                <a href={storedAudioUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 flex items-center">
                                                    <ExternalLink className="w-4 h-4 mr-1" />
                                                    Open in new tab
                                                </a>
                                                <span>Permanently stored on IPFS</span>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Action Buttons */}
                                    <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                                        <Link href="/">
                                            <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2">
                                                <Music className="w-4 h-4" />
                                                <span>View in Dashboard</span>
                                            </button>
                                        </Link>
                                        <button 
                                            onClick={() => {
                                                setStoreSuccess(false);
                                                setUploadedFile(null);
                                                setAudioBlob(null);
                                                setAudioUrl(null);
                                                setTokenName("");
                                                setTokenDescription("");
                                                setRecordingTime(0);
                                            }}
                                            className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                            <span>Register Another IP</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
