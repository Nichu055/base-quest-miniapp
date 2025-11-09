# Base Quest - The Onchain Streak Game 🎮⚡

A Farcaster MiniApp built on Base where users complete daily onchain and offchain quests to maintain streaks and win weekly ETH rewards.

## 🎯 Features

- **Daily Quests**: Complete 3 tasks every 24 hours to maintain your streak
- **Streak Tracking**: Build consecutive day streaks onchain
- **Base Points (BP)**: Earn reputation points for each completed task
- **Weekly Leaderboards**: Top 10% of players share 90% of the prize pool
- **Multiple Quest Types**:
  - Onchain tasks (swap, bridge, etc.)
  - Offchain tasks (predictions, trivia, social actions)
  - Verified by attester for offchain completion

## 🏗️ Architecture

### Smart Contract (`BaseQuest.sol`)
- Deployed on Base network
- Manages streaks, tasks, and rewards
- Weekly prize pool distribution
- Supports both onchain and attester-verified offchain tasks

### Frontend (React + Vite + TypeScript)
- Farcaster MiniApp integration
- Web3 wallet connection
- Real-time task completion
- Live leaderboard
- Countdown timers for daily/weekly resets

### MiniApp Specifications
- **Web Dimensions**: 424x695px
- **Mobile**: Adaptive to device dimensions
- **Embed Metadata**: Rich preview with launch button
- **Manifest**: `.well-known/farcaster.json`

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MetaMask or Web3 wallet
- Base Sepolia ETH for testing

### Installation

1. **Install Dependencies**
```bash
cd base-quest-miniapp
npm install
```

2. **Deploy Smart Contract**
```bash
# Install Hardhat or Foundry (recommended)
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox

# Deploy to Base Sepolia
npx hardhat run scripts/deploy.js --network base-sepolia
```

3. **Update Configuration**
Edit `src/config.ts` with your deployed contract address:
```typescript
export const CONTRACT_ADDRESS = "0xYourDeployedContractAddress";
```

4. **Update Farcaster Manifest**
Edit `public/.well-known/farcaster.json`:
- Add your domain URLs
- Update image URLs
- Add Base Builder account address

5. **Run Development Server**
```bash
npm run dev
```

## 📝 Deployment Steps

### 1. Deploy Contract

**Update these placeholder addresses in the contract constructor:**
- Treasury address (receives 10% of prize pool)
- Attester address (for offchain task verification)

Deploy to Base Sepolia first for testing, then Base Mainnet.

### 2. Build Frontend

```bash
npm run build
```

### 3. Host on Vercel/Netlify

```bash
# Example: Vercel
vercel --prod

# Or Netlify
netlify deploy --prod
```

### 4. Create Account Association

1. Ensure `.well-known/farcaster.json` is accessible at your domain
2. Go to [Base Build Account Association](https://www.base.dev/)
3. Paste your domain and verify
4. Copy the generated `accountAssociation` fields into your manifest

### 5. Test MiniApp

Use the [Base Build Preview Tool](https://www.base.dev/preview) to validate:
- Embed metadata displays correctly
- Launch button works
- Account association is valid
- All manifest fields are present

### 6. Publish

Create a post in the Base app with your MiniApp URL to publish!

## 🎨 Customization

### Fonts
The app uses **Space Grotesk** for a modern, clean look. To change:
1. Update the Google Fonts link in `index.html`
2. Update CSS variables in `src/index.css`

### Colors
Edit CSS variables in `src/index.css`:
```css
:root {
  --primary-color: #0052FF;
  --secondary-color: #00D395;
  --background: #0A0B0D;
  /* ... */
}
```

### Tasks
Add/modify tasks using the admin functions in the contract:
```solidity
addTask("Task description", "onchain", 100);
```

## 🔐 Security Considerations

- Entry fees are configurable (default: 0.00001 ETH)
- Treasury address is immutable after deployment
- Attester address can be updated by owner
- Owner can pause contract in emergencies
- Weekly distribution requires manual trigger for safety

## 📊 Contract Functions

### User Functions
- `joinWeek()` - Join current week's challenge (payable)
- `completeTask(taskId)` - Complete an onchain task
- `getPlayerData(address)` - View player stats
- `getLeaderboard()` - View current rankings

### Admin Functions
- `addTask()` - Add new tasks for current week
- `updateEntryFee()` - Change entry fee
- `updateAttester()` - Change attester address
- `endWeekAndDistribute()` - Trigger weekly payout
- `togglePause()` - Emergency pause

## 🌐 Network Information

**Base Sepolia (Testnet)**
- Chain ID: 84532
- RPC: https://sepolia.base.org
- Faucet: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet

**Base Mainnet**
- Chain ID: 8453
- RPC: https://mainnet.base.org

## 📱 MiniApp Metadata

The app includes proper Farcaster MiniApp metadata:
- `fc:miniapp` meta tag for embeds
- Open Graph tags for social sharing
- Twitter Card support
- Optimized splash screen and icons

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📄 License

MIT License - feel free to use this as a template for your own Base MiniApps!

## 🔗 Resources

- [Farcaster MiniApps Docs](https://miniapps.farcaster.xyz/)
- [Base Docs](https://docs.base.org/)
- [Base Build](https://www.base.dev/)
- [Ethers.js Docs](https://docs.ethers.org/v6/)

---

Built with ⚡ on Base
