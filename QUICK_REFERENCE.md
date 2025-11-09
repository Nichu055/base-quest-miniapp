# ⚡ Base Quest - Quick Reference Card

## 🏃 Quick Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Deploy contract (Sepolia)
npx hardhat run scripts/deploy.js --network base-sepolia

# Verify contract
npx hardhat verify --network base-sepolia <ADDRESS> "<TREASURY>" "<ATTESTER>"
```

## 📝 Files to Update Before Launch

### 1. Smart Contract (`contracts/BaseQuest.sol`)
- Line 32: Treasury address
- Line 36: Attester address

### 2. Frontend Config (`src/config.ts`)
- Line 1: `CONTRACT_ADDRESS`

### 3. Manifest (`public/.well-known/farcaster.json`)
- All image URLs
- `homeUrl` (your domain)
- `baseBuilder.ownerAddress`
- `accountAssociation` (from Base Build)

### 4. HTML Meta (`index.html`)
- Lines 15-25: Embed metadata URLs
- Lines 28-38: OG/Twitter card URLs

## 🎨 Required Images

| Image | Size | File |
|-------|------|------|
| Icon | 512x512px | `/public/images/icon.png` |
| Splash | 1200x1200px | `/public/images/splash.png` |
| Hero | 1200x800px | `/public/images/hero.png` |
| OG Image | 1200x630px | `/public/images/og-image.png` |
| Embed | 3:2 ratio | `/public/images/embed-preview.png` |
| Screenshots | Mobile size | `/public/images/screenshot[1-3].png` |

## 🔗 Important URLs

- **Base Sepolia Faucet**: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
- **Base Build**: https://www.base.dev/
- **Preview Tool**: https://www.base.dev/preview
- **Basescan Sepolia**: https://sepolia.basescan.org/
- **Basescan Mainnet**: https://basescan.org/

## 🎯 Contract Functions (User)

```typescript
// Join current week
await contract.joinWeek({ value: entryFee })

// Complete onchain task
await contract.completeTask(taskId)

// Get player data
await contract.getPlayerData(address)

// Get leaderboard
await contract.getLeaderboard()

// Get current week tasks
await contract.getCurrentWeekTasks()
```

## 🔧 Contract Functions (Admin)

```typescript
// Add task
await contract.addTask("Description", "onchain", 100)

// Update entry fee
await contract.updateEntryFee(newFeeInWei)

// Update attester
await contract.updateAttester(newAddress)

// End week & distribute
await contract.endWeekAndDistribute()

// Pause/unpause
await contract.togglePause()
```

## 📊 Default Configuration

- **Entry Fee**: 0.00001 ETH (1e14 wei)
- **Treasury Cut**: 10%
- **Player Rewards**: 90% to top 10%
- **Week Duration**: 7 days
- **Day Duration**: 24 hours
- **Tasks Per Day**: 3
- **Chain ID (Sepolia)**: 84532
- **Chain ID (Mainnet)**: 8453

## 🎨 Color Palette

```css
--primary-color: #0052FF    /* Base Blue */
--secondary-color: #00D395  /* Green */
--background: #0A0B0D       /* Dark */
--surface: #1A1B1F          /* Card BG */
--text-primary: #FFFFFF     /* White */
--text-secondary: #A0A0A0   /* Gray */
```

## 🚀 Deployment Checklist

- [ ] Deploy contract to Sepolia
- [ ] Update `src/config.ts` with address
- [ ] Test all features
- [ ] Create image assets
- [ ] Deploy frontend
- [ ] Create account association
- [ ] Update farcaster.json
- [ ] Test with Preview Tool
- [ ] Deploy contract to Mainnet
- [ ] Post on Base app

## 📱 MiniApp Specs

- **Web**: 424x695px
- **Mobile**: Adaptive
- **Manifest**: `/.well-known/farcaster.json`
- **Embed**: `fc:miniapp` meta tag
- **Font**: Space Grotesk

## 🐛 Troubleshooting

**Build fails?**
```bash
npm install
npm run build
```

**TypeScript errors?**
```bash
rm -rf node_modules
npm install
```

**Can't connect wallet?**
- Check you're on Base Sepolia (84532)
- Ensure MetaMask is installed
- Check contract address in config.ts

**Contract calls fail?**
- Verify contract is deployed
- Check you've joined the week
- Ensure sufficient gas

## 📚 Documentation Files

1. `README.md` - Main documentation
2. `GETTING_STARTED.md` - Setup guide
3. `DEPLOYMENT.md` - Production checklist  
4. `IMAGE_SPECS.md` - Asset specifications
5. `PROJECT_SUMMARY.md` - Complete overview

## 💡 Pro Tips

- Test on Sepolia before Mainnet
- Use hardware wallet for mainnet deployment
- Keep private keys in `.env` (gitignored)
- Call `endWeekAndDistribute()` every 7 days
- Monitor gas prices before transactions
- Verify contracts on Basescan
- Back up your contract addresses

## 🆘 Need Help?

Check the docs above or:
- Base Discord
- Farcaster Dev Channel
- Base Docs: docs.base.org

---

**Quick Start**: Run `npm install && npm run dev` to begin!
