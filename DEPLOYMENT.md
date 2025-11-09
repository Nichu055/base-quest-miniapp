# Base Quest - Deployment Checklist ✅

## Pre-Deployment

- [ ] Test contract thoroughly on Base Sepolia
- [ ] Update treasury address in contract (line 32)
- [ ] Update attester address in contract (line 36)
- [ ] Verify contract on Basescan
- [ ] Test all contract functions
- [ ] Ensure sufficient entry fee is set

## Smart Contract Deployment

### Base Sepolia (Testing)
```bash
# Deploy using your preferred tool (Hardhat/Foundry/Remix)
# Example treasury: 0x1234567890123456789012345678901234567890
# Example attester: 0x0987654321098765432109876543210987654321

# Save deployed contract address
```

### Base Mainnet (Production)
```bash
# After successful Sepolia testing
# Deploy with ACTUAL treasury and attester addresses
# DO NOT use test addresses on mainnet!
```

- [ ] Contract deployed to Sepolia: `0x________________`
- [ ] Contract deployed to Mainnet: `0x________________`
- [ ] Contract verified on Basescan
- [ ] Initial tasks added for Week 1

## Frontend Configuration

- [ ] Update `src/config.ts` with contract address
- [ ] Test wallet connection on Sepolia
- [ ] Test all user flows (join, complete tasks, view leaderboard)
- [ ] Verify MiniApp SDK initialization
- [ ] Check responsive design at 424x695px

## Image Assets

Create and upload these images (required for MiniApp):

- [ ] **App Icon** (512x512px, PNG/JPG)
  - Path: `/public/images/icon.png`
  - URL: `https://your-domain.com/images/icon.png`

- [ ] **Splash Image** (1200x1200px, PNG/JPG)
  - Path: `/public/images/splash.png`
  - URL: `https://your-domain.com/images/splash.png`

- [ ] **Hero Image** (3:2 aspect ratio, 1200x800px)
  - Path: `/public/images/hero.png`
  - URL: `https://your-domain.com/images/hero.png`

- [ ] **OG Image** (1200x630px for social sharing)
  - Path: `/public/images/og-image.png`
  - URL: `https://your-domain.com/images/og-image.png`

- [ ] **Embed Preview** (3:2 aspect, 600-3000px wide)
  - Path: `/public/images/embed-preview.png`
  - URL: `https://your-domain.com/images/embed-preview.png`

- [ ] **Screenshots** (3 images, various app screens)
  - `https://your-domain.com/images/screenshot1.png`
  - `https://your-domain.com/images/screenshot2.png`
  - `https://your-domain.com/images/screenshot3.png`

## Farcaster Manifest

- [ ] Update `public/.well-known/farcaster.json`:
  - [ ] Replace `homeUrl` with your domain
  - [ ] Replace all image URLs with actual URLs
  - [ ] Add your Base Builder `ownerAddress`
  - [ ] Update `webhookUrl` if using webhooks
  - [ ] Set `noindex` to `false` for production

## Hosting & DNS

- [ ] Build production bundle: `npm run build`
- [ ] Deploy to hosting (Vercel/Netlify/etc.)
- [ ] Verify `.well-known/farcaster.json` is accessible
- [ ] Test HTTPS and SSL certificate
- [ ] Configure custom domain
- [ ] Set up redirect from www to non-www (or vice versa)

## Account Association

- [ ] Visit [Base Build Account Association](https://www.base.dev/)
- [ ] Enter your app URL
- [ ] Click "Verify" and sign with your Base Account
- [ ] Copy generated `accountAssociation` fields
- [ ] Paste into `farcaster.json` manifest
- [ ] Re-deploy to make changes live

## Testing & Validation

- [ ] Use [Base Build Preview Tool](https://www.base.dev/preview)
- [ ] Verify embed preview displays correctly
- [ ] Test launch button functionality
- [ ] Validate account association
- [ ] Check all metadata fields
- [ ] Test on mobile device
- [ ] Test wallet connection flow
- [ ] Complete a full user journey (join week → complete tasks → view leaderboard)

## Launch

- [ ] Create post on Base app with your MiniApp URL
- [ ] Share in relevant Farcaster channels
- [ ] Monitor contract for first users
- [ ] Set up analytics/monitoring
- [ ] Prepare customer support channels

## Post-Launch

- [ ] Monitor gas costs and optimize if needed
- [ ] Track weekly participation
- [ ] Manually trigger `endWeekAndDistribute()` each week
- [ ] Add new tasks weekly for variety
- [ ] Collect user feedback
- [ ] Plan feature updates

## Weekly Maintenance

Every 7 days:
- [ ] Call `endWeekAndDistribute()` on contract
- [ ] Verify rewards distributed correctly
- [ ] Add new tasks for upcoming week
- [ ] Check leaderboard and congratulate winners
- [ ] Post weekly recap

## Emergency Procedures

If issues arise:
- [ ] `togglePause()` can immediately stop new joins
- [ ] `updateEntryFee()` can adjust economics
- [ ] `updateAttester()` can change offchain verifier
- [ ] Owner can always add/disable tasks

## Notes

**Treasury Address**: Where 10% of prize pool goes
**Attester Address**: Signs offchain task completions
**Entry Fee**: Currently 0.00001 ETH (adjustable)

---

Good luck with your launch! 🚀
