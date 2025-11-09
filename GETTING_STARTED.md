# 🚀 Getting Started with Base Quest

This guide will help you get the Base Quest MiniApp up and running in minutes.

## Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** installed
- **MetaMask** or another Web3 wallet
- **Base Sepolia ETH** for testing ([Get from faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet))
- A **Base Build account** ([Create one here](https://www.base.dev/))

## Installation

### 1. Install Dependencies

```bash
cd base-quest-miniapp
npm install
```

### 2. Install Hardhat for Contract Deployment (Optional)

```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox dotenv
npx hardhat init
```

Choose "Create an empty hardhat.config.js" when prompted.

## Local Development (Without Blockchain)

To test the UI without deploying a contract:

```bash
npm run dev
```

Visit `http://localhost:5173` to see the app.

**Note**: Wallet connection and blockchain features won't work until you deploy the contract.

## Deploy to Base Sepolia (Testnet)

### 1. Set Up Environment

Copy the environment template:
```bash
cp .env.hardhat .env
```

Edit `.env` and add:
- Your wallet's **private key** (NEVER commit this!)
- A **Basescan API key** ([Get one here](https://basescan.org/myapikey))

### 2. Update Contract Addresses

Open `contracts/BaseQuest.sol` and update:
- **Line 32**: Treasury address (where 10% of rewards go)
- **Line 36**: Attester address (for offchain verification)

For testing, you can use any valid Ethereum addresses.

### 3. Deploy Contract

```bash
# Make sure you have Base Sepolia ETH first!
npx hardhat run scripts/deploy.js --network base-sepolia
```

Save the deployed contract address shown in the output.

### 4. Verify Contract (Optional but Recommended)

```bash
npx hardhat verify --network base-sepolia <CONTRACT_ADDRESS> "<TREASURY>" "<ATTESTER>"
```

### 5. Update Frontend Config

Edit `src/config.ts`:
```typescript
export const CONTRACT_ADDRESS = "0xYourDeployedContractAddress";
```

### 6. Run the App

```bash
npm run dev
```

Now you can:
- Connect your wallet
- Join the current week
- Complete tasks
- View the leaderboard

## Farcaster MiniApp Setup

To make this a proper Farcaster MiniApp:

### 1. Deploy to Production

Build and deploy to a hosting service:

```bash
# Build
npm run build

# Deploy to Vercel (example)
npm install -g vercel
vercel --prod

# Or use Netlify, Cloudflare Pages, etc.
```

### 2. Update Manifest

Edit `public/.well-known/farcaster.json`:

1. Replace `https://your-domain.com` with your actual domain
2. Upload images and update all image URLs:
   - App icon (512x512px)
   - Splash image (1200x1200px)
   - Hero image (1200x800px)
   - OG image (1200x630px)
   - Embed preview (3:2 ratio)
   - 3 screenshots
3. Add your Base Builder account address to `baseBuilder.ownerAddress`

### 3. Create Account Association

1. Ensure your manifest is live at `https://your-domain.com/.well-known/farcaster.json`
2. Visit [Base Build Account Tool](https://www.base.dev/)
3. Enter your domain and click "Submit"
4. Click "Verify" and sign with your wallet
5. Copy the generated `accountAssociation` fields
6. Paste into your `farcaster.json` file
7. Re-deploy

### 4. Update Embed Metadata

Edit `index.html` (lines 15-25) and replace:
- Image URL
- Your domain

### 5. Test Your MiniApp

Use the [Base Build Preview Tool](https://www.base.dev/preview):
1. Enter your app URL
2. Check the embed preview
3. Test the launch button
4. Verify account association

### 6. Publish

Create a post on the Base app (or Warpcast) with your MiniApp URL!

## Development Tips

### Hot Reload
The Vite dev server supports hot reload - changes appear instantly without refresh.

### Testing Tasks
- Create test tasks using the contract's `addTask` function
- Use Remix IDE for easy contract interaction
- Monitor transactions on [Base Sepolia Explorer](https://sepolia.basescan.org/)

### Styling
- All colors are in `src/index.css` CSS variables
- Components have individual CSS files
- Font is Space Grotesk (loaded in `index.html`)

### Adding New Features
1. Update contract if needed
2. Update ABI in `src/config.ts`
3. Add functions to `src/contractService.ts`
4. Create/update components
5. Test on Sepolia before mainnet

## Troubleshooting

### "Cannot find module '@farcaster/miniapp-sdk'"
```bash
npm install @farcaster/miniapp-sdk
```

### "Failed to initialize MiniApp"
The MiniApp SDK only works when deployed. For local dev, it's safe to ignore this error.

### "Insufficient entry fee"
The default entry fee is 0.00001 ETH. Make sure you have enough Base Sepolia ETH.

### TypeScript Errors
```bash
# Clear cache and rebuild
rm -rf node_modules
npm install
npm run build
```

### Contract Deployment Fails
- Ensure you have Base Sepolia ETH
- Check your `.env` file has correct PRIVATE_KEY
- Verify RPC URL is correct

## Next Steps

- [ ] Deploy contract to Base Sepolia
- [ ] Test all functionality
- [ ] Create and upload MiniApp images
- [ ] Deploy frontend to production
- [ ] Set up account association
- [ ] Test with Base Build Preview Tool
- [ ] Launch on Base app!

## Resources

- **Base Docs**: https://docs.base.org/
- **Farcaster MiniApps**: https://miniapps.farcaster.xyz/
- **Base Build**: https://www.base.dev/
- **Hardhat Docs**: https://hardhat.org/docs
- **Ethers.js v6**: https://docs.ethers.org/v6/

## Need Help?

- Check the full `README.md` for detailed documentation
- Review `DEPLOYMENT.md` for production checklist
- Join the Base Discord for support

---

Happy building! 🎮⚡
