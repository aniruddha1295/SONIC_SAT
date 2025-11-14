# 🎵 SonicIPChain - Tokenize Your Voice Assets

A decentralized platform for recording, tokenizing, and managing audio content on the blockchain. Built with Next.js, Ethereum, and IPFS for secure and permanent audio storage.

![SonicIPChain](https://img.shields.io/badge/SonicIPChain-Beta-blue)
![Next.js](https://img.shields.io/badge/Next.js-15.3-black)
![Ethereum](https://img.shields.io/badge/Ethereum-Smart%20Contracts-purple)
![IPFS](https://img.shields.io/badge/IPFS-Lighthouse-green)

## ⚡ Features

- **🎙️ Audio Recording**: Record audio directly in your browser with real-time feedback
- **🔐 Blockchain Storage**: Tokenize your audio as NFTs on the Ethereum blockchain
- **📦 IPFS Integration**: Permanent, decentralized storage using Lighthouse and IPFS
- **💼 My Collection**: Browse and manage all your tokenized audio recordings
- **🔗 Wallet Integration**: Connect with popular wallets using RainbowKit
- **🌐 Multi-Chain Support**: Compatible with Base, Avalanche, and testnets

## 🛠️ Tech Stack

### Frontend
- **Next.js 15.3** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **RainbowKit** - Wallet connection UI
- **Wagmi** - React hooks for Ethereum
- **Ethers.js** - Ethereum library

### Backend & Storage
- **Lighthouse SDK** - IPFS file storage and encryption
- **Hardhat** - Ethereum development environment
- **Solidity** - Smart contract development
- **OpenZeppelin** - Secure smart contract libraries

### Blockchain
- **Ethereum** - Base blockchain
- **Base** - Layer 2 scaling solution
- **Avalanche** - Alternative blockchain support

## 📁 Project Structure

```
sonic/
├── app/                      # Next.js App Router pages
│   ├── collection/          # My Collection page
│   ├── store/               # Audio recording & tokenization
│   ├── page.tsx             # Homepage
│   ├── layout.tsx           # Root layout
│   └── globals.css          # Global styles
├── components/              # React components
│   ├── Footer.tsx
│   ├── header.tsx
│   ├── walletConnect.tsx
│   ├── FeatureTag.tsx
│   └── StatCard.tsx
├── contracts/               # Solidity smart contracts
│   └── SonicIPToken.sol
├── hooks/                   # Custom React hooks
│   └── useEthers.ts
├── lib/                     # Utility libraries
│   ├── contract.ts          # Contract ABIs and addresses
│   ├── audioTokenizationService.ts
│   └── SonicIPToken.sol
├── public/                  # Static assets
│   └── assets/
│       ├── background/
│       └── logos/
├── scripts/                 # Deployment scripts
├── hardhat.config.js        # Hardhat configuration
├── next.config.ts           # Next.js configuration
└── package.json             # Dependencies

```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 22.0.0
- npm or yarn
- MetaMask or any Web3 wallet
- Lighthouse API Key (for IPFS storage)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/hedauav/SONIC.git
   cd SONIC
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   NEXT_PUBLIC_LIGHTHOUSE_API_KEY=your_lighthouse_api_key
   NEXT_PUBLIC_RPC_URL=your_ethereum_rpc_url
   NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_walletconnect_project_id
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 Usage

### Recording Audio

1. Navigate to the **Record** page
2. Connect your Web3 wallet
3. Click the record button and grant microphone permissions
4. Record your audio
5. Preview and upload to IPFS

### Tokenizing Audio

1. After uploading, enter NFT details:
   - Token Name
   - Description
2. Click "Tokenize & Store on Blockchain"
3. Confirm the transaction in your wallet
4. Your audio is now an NFT!

### Managing Collection

1. Navigate to **My Collection**
2. View all your tokenized audio recordings
3. Play, share, or view on IPFS
4. See detailed NFT metadata and storage information

## 🔧 Smart Contract Deployment

1. **Compile contracts**
   ```bash
   npx hardhat compile
   ```

2. **Deploy to testnet**
   ```bash
   npx hardhat run scripts/deploy.js --network base-sepolia
   ```

3. **Update contract address**
   
   Update `CONTRACT_ADDRESS` in `lib/contract.ts` with your deployed contract address

## 📦 Build for Production

```bash
npm run build
npm start
```

## 🌐 Supported Networks

- Base Mainnet
- Base Sepolia (Testnet)
- Avalanche
- Avalanche Fuji (Testnet)

## 🔑 Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_LIGHTHOUSE_API_KEY` | API key for Lighthouse IPFS storage |
| `NEXT_PUBLIC_RPC_URL` | Ethereum RPC endpoint URL |
| `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` | WalletConnect project ID |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Lighthouse](https://lighthouse.storage/) - Decentralized storage
- [IPFS](https://ipfs.io/) - InterPlanetary File System
- [Filecoin](https://filecoin.io/) - Decentralized storage network
- [RainbowKit](https://www.rainbowkit.com/) - Wallet connection
- [Wagmi](https://wagmi.sh/) - React hooks for Ethereum
- [OpenZeppelin](https://openzeppelin.com/) - Smart contract security







