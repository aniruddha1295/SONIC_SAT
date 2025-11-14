"use client";
import { useState, useEffect } from "react";
import { X, Loader2, CheckCircle, XCircle, ExternalLink, Wallet } from "lucide-react";
import { RegisteredIP } from "@/contexts/IPContext";
import { useAccount, useBalance, useSendTransaction, useWaitForTransactionReceipt, useSwitchChain } from "wagmi";
import { parseEther, formatEther } from "viem";
import { sepolia } from "wagmi/chains";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  ip: RegisteredIP | null;
  onSuccess: (ip: RegisteredIP) => void;
}

type TransactionState = 
  | 'connecting' 
  | 'wrong-network'
  | 'switching-network'
  | 'checking-balance' 
  | 'confirming' 
  | 'pending' 
  | 'success' 
  | 'failed' 
  | 'insufficient-balance'
  | 'user-rejected';

export default function TransactionModal({ isOpen, onClose, ip, onSuccess }: TransactionModalProps) {
  const [transactionState, setTransactionState] = useState<TransactionState>('connecting');
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  // Web3 hooks
  const { address, isConnected, chain } = useAccount();
  const { data: balance } = useBalance({ address });
  const { switchChain } = useSwitchChain();
  const { sendTransaction, data: txHash, error: txError, isPending: isTxPending } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Handle transaction state changes
  useEffect(() => {
    if (isTxPending) {
      setTransactionState('pending');
    }
  }, [isTxPending]);

  useEffect(() => {
    if (isConfirming) {
      setTransactionState('pending');
    }
  }, [isConfirming]);

  useEffect(() => {
    if (isConfirmed && txHash) {
      setTransactionState('success');
      setTimeout(() => {
        onSuccess(ip!);
        onClose();
      }, 2000);
    }
  }, [isConfirmed, txHash, ip, onSuccess, onClose]);

  useEffect(() => {
    if (txError) {
      if (txError.message?.includes('User rejected')) {
        setTransactionState('user-rejected');
        setErrorMessage('Transaction was rejected by user.');
      } else {
        setTransactionState('failed');
        setErrorMessage(txError.message || 'Transaction failed. Please try again.');
      }
    }
  }, [txError]);

  useEffect(() => {
    if (isOpen && ip) {
      startTransaction();
    }
  }, [isOpen, ip]);

  const startTransaction = async () => {
    if (!ip || !address) return;

    try {
      // Step 1: Check if wallet is connected
      setTransactionState('connecting');
      if (!isConnected) {
        setErrorMessage('Please connect your wallet first.');
        setTransactionState('failed');
        return;
      }

      // Step 2: Check balance on the currently connected network
      setTransactionState('checking-balance');

      if (!balance) {
        setErrorMessage('Unable to fetch balance. Please try again.');
        setTransactionState('failed');
        return;
      }

      const requiredAmount = parseEther(ip.priceAmount);
      const userBalance = balance.value;
      
      if (userBalance < requiredAmount) {
        setTransactionState('insufficient-balance');
        setErrorMessage(
          `Insufficient balance. You have ${formatEther(userBalance)} ETH but need ${ip.priceAmount} ETH.`
        );
        return;
      }

      // Step 4: Prepare and send transaction
      setTransactionState('confirming');
      
      // Create a simple ETH transfer transaction to the IP creator
      // In a real NFT marketplace, this would be a smart contract call
      try {
        sendTransaction({
          to: ip.creator as `0x${string}`,
          value: requiredAmount,
        });
      } catch (error: any) {
        if (error.message?.includes('User rejected')) {
          setTransactionState('user-rejected');
          setErrorMessage('Transaction was rejected by user.');
        } else {
          setTransactionState('failed');
          setErrorMessage(error.message || 'Transaction failed. Please try again.');
        }
        return;
      }

    } catch (error: any) {
      setTransactionState('failed');
      setErrorMessage(error.message || 'An unexpected error occurred. Please try again.');
    }
  };

  const handleClose = () => {
    if (transactionState === 'pending') {
      const confirmed = window.confirm('Transaction is still pending. Are you sure you want to close?');
      if (!confirmed) return;
    }
    onClose();
  };

  const handleSwitchNetwork = async () => {
    setTransactionState('switching-network');
    try {
      await switchChain({ chainId: sepolia.id });
      // After switching, restart the transaction
      setTimeout(() => {
        startTransaction();
      }, 1000);
    } catch (error: any) {
      setTransactionState('failed');
      setErrorMessage('Failed to switch network. Please switch to Sepolia manually.');
    }
  };

  const resetAndRetry = () => {
    setTransactionState('connecting');
    setErrorMessage('');
    startTransaction();
  };

  if (!isOpen || !ip) return null;

  const getStateContent = () => {
    switch (transactionState) {
      case 'connecting':
        return {
          icon: <Wallet className="w-12 h-12 text-blue-400 animate-pulse" />,
          title: 'Connecting to MetaMask',
          description: 'Please wait while we connect to your wallet...',
          showSpinner: true
        };

      case 'wrong-network':
        return {
          icon: <XCircle className="w-12 h-12 text-yellow-400" />,
          title: 'Wrong Network',
          description: 'Please switch to Sepolia testnet to continue.',
          showSpinner: false,
          extra: (
            <div className="mt-4">
              <button 
                onClick={handleSwitchNetwork}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Switch to Sepolia
              </button>
            </div>
          )
        };

      case 'switching-network':
        return {
          icon: <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />,
          title: 'Switching Network',
          description: 'Please confirm network switch in your wallet...',
          showSpinner: false
        };

      case 'checking-balance':
        return {
          icon: <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />,
          title: 'Checking Balance',
          description: 'Verifying you have sufficient funds for this purchase...',
          showSpinner: false
        };

      case 'confirming':
        return {
          icon: <Wallet className="w-12 h-12 text-orange-400 animate-bounce" />,
          title: 'Confirm Transaction',
          description: 'Please confirm the transaction in your MetaMask wallet.',
          showSpinner: false,
          extra: balance ? (
            <div className="mt-4 p-4 bg-gray-800 rounded-lg">
              <div className="text-sm text-gray-300 space-y-1">
                <div className="flex justify-between">
                  <span>Your Balance:</span>
                  <span className="text-green-400">{parseFloat(formatEther(balance.value)).toFixed(4)} ETH</span>
                </div>
                <div className="flex justify-between">
                  <span>Purchase Amount:</span>
                  <span className="text-white">{ip.priceAmount} {ip.priceNetwork}</span>
                </div>
                <div className="flex justify-between border-t border-gray-600 pt-1">
                  <span>Remaining Balance:</span>
                  <span className="text-gray-400">{(parseFloat(formatEther(balance.value)) - parseFloat(ip.priceAmount)).toFixed(4)} ETH</span>
                </div>
              </div>
            </div>
          ) : null
        };

      case 'pending':
        return {
          icon: <Loader2 className="w-12 h-12 text-yellow-400 animate-spin" />,
          title: 'Transaction Pending',
          description: 'Your transaction is being processed on the blockchain...',
          showSpinner: false,
          extra: txHash ? (
            <div className="mt-4 space-y-2">
              <div className="text-sm text-gray-400">Transaction Hash:</div>
              <div className="flex items-center space-x-2 bg-gray-800 p-2 rounded">
                <code className="text-xs text-blue-400 flex-1 truncate">{txHash}</code>
                <button 
                  onClick={() => window.open(`https://sepolia.etherscan.io/tx/${txHash}`, '_blank')}
                  className="text-blue-400 hover:text-blue-300"
                  title="View on Etherscan"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : null
        };

      case 'success':
        return {
          icon: <CheckCircle className="w-12 h-12 text-green-400" />,
          title: 'Purchase Successful!',
          description: `${ip.name} has been added to your collection.`,
          showSpinner: false,
          extra: (
            <div className="mt-4 text-center">
              <div className="text-sm text-green-400 mb-2">Transaction Confirmed</div>
              <div className="text-xs text-gray-400">Redirecting to your collection...</div>
            </div>
          )
        };

      case 'insufficient-balance':
        return {
          icon: <XCircle className="w-12 h-12 text-red-400" />,
          title: 'Insufficient Balance',
          description: errorMessage,
          showSpinner: false,
          extra: balance ? (
            <div className="mt-4 space-y-3">
              <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                <div className="text-sm text-red-300 space-y-1">
                  <div className="flex justify-between">
                    <span>Your Balance:</span>
                    <span>{parseFloat(formatEther(balance.value)).toFixed(4)} ETH</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Required:</span>
                    <span>{ip.priceAmount} {ip.priceNetwork}</span>
                  </div>
                  <div className="flex justify-between text-red-400 font-semibold border-t border-red-500/30 pt-1">
                    <span>Shortfall:</span>
                    <span>{(parseFloat(ip.priceAmount) - parseFloat(formatEther(balance.value))).toFixed(4)} ETH</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={resetAndRetry}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : null
        };

      case 'user-rejected':
        return {
          icon: <XCircle className="w-12 h-12 text-yellow-400" />,
          title: 'Transaction Cancelled',
          description: 'You cancelled the transaction in MetaMask.',
          showSpinner: false,
          extra: (
            <div className="mt-4">
              <button 
                onClick={resetAndRetry}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          )
        };

      case 'failed':
        return {
          icon: <XCircle className="w-12 h-12 text-red-400" />,
          title: 'Transaction Failed',
          description: errorMessage,
          showSpinner: false,
          extra: (
            <div className="mt-4">
              <button 
                onClick={resetAndRetry}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          )
        };

      default:
        return { icon: null, title: '', description: '', showSpinner: false };
    }
  };

  const content = getStateContent();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--card-background)] border border-[var(--border-color)] rounded-2xl p-6 max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Purchase NFT</h2>
          <button 
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
            disabled={transactionState === 'pending'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            {content.icon}
          </div>
          
          <h3 className="text-xl font-semibold text-white mb-2">
            {content.title}
          </h3>
          
          <p className="text-gray-400 mb-4">
            {content.description}
          </p>

          {content.extra}

          {content.showSpinner && (
            <div className="mt-4">
              <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}