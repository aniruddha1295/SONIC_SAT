"use client"
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ArrowRight } from "lucide-react";

export const WalletConnect = () => {

    return (
        <ConnectButton.Custom>
            {({
                account,
                chain,
                openChainModal,
                openConnectModal,
                openAccountModal,
                authenticationStatus,
                mounted,
            }) => {
                const ready = mounted && authenticationStatus !== 'loading';
                const connected =
                    ready &&
                    account &&
                    chain &&
                    (!authenticationStatus ||
                        authenticationStatus === 'authenticated');
                return (
                    <div
                        {...(!ready && {
                            'aria-hidden': true,
                            'style': {
                                opacity: 0,
                                pointerEvents: 'none',
                                userSelect: 'none',
                            },
                        })}
                    >
                        {(() => {
                            if (!connected) {
                                return (
                                    <button onClick={openConnectModal} type="button">
                                        <div className="items-center inline-flex bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold transition-colors focus:outline-none justify-center text-center px-8 py-3 rounded-xl text-base shadow-lg shadow-orange-500/30">
                                            <span className="mr-2">Connect Wallet to Start</span>
                                            <ArrowRight className="w-4 h-4" />
                                        </div>
                                    </button>
                                );
                            }
                            if (chain.unsupported) {
                                return (
                                    <button onClick={openChainModal} className="text-white items-center inline-flex bg-red-600 hover:bg-red-700 border border-red-600 transition-colors focus:outline-none justify-center text-center px-4 py-2 rounded-lg text-sm">
                                        Wrong network
                                    </button>
                                );
                            }
                            return (
                                <div className="flex items-center space-x-3">
                                    <button 
                                        onClick={openAccountModal}
                                        className="bg-[var(--card-background)] border border-[var(--border-color)] rounded-lg px-3 py-2 hover:bg-gray-700 transition-colors"
                                        title="Click to view account details and disconnect"
                                    >
                                        <span className="text-white text-sm font-medium">
                                            {account.displayName}
                                        </span>
                                    </button>
                                    <button 
                                        onClick={openChainModal}
                                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                                    >
                                        {chain.name}
                                    </button>
                                </div>
                            );
                        })()}
                    </div>
                );
            }}
        </ConnectButton.Custom>
    );
};