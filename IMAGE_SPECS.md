# 🎨 Image Asset Specifications for Base Quest MiniApp

All images must be hosted and accessible via HTTPS. Update URLs in `public/.well-known/farcaster.json` and `index.html`.

## Required Images

### 1. App Icon 🎯
- **Dimensions**: 512x512px (1:1 square)
- **Format**: PNG or JPG
- **File**: `/public/images/icon.png`
- **URL**: `https://your-domain.com/images/icon.png`
- **Usage**: App launcher, app lists, notifications
- **Design Tips**:
  - Simple, recognizable logo
  - High contrast for visibility
  - Works at small sizes
  - Transparent or colored background

### 2. Splash Image 💫
- **Dimensions**: 1200x1200px (1:1 square)
- **Format**: PNG or JPG
- **File**: `/public/images/splash.png`
- **URL**: `https://your-domain.com/images/splash.png`
- **Background Color**: `#0052FF` (set in manifest)
- **Usage**: Loading screen when app launches
- **Design Tips**:
  - Should match your brand
  - Can include logo + tagline
  - Keep important content in center
  - Works with splash background color

### 3. Hero Image 🎪
- **Dimensions**: 1200x800px (3:2 aspect ratio)
- **Format**: PNG or JPG
- **File**: `/public/images/hero.png`
- **URL**: `https://your-domain.com/images/hero.png`
- **Usage**: Featured in app store, marketing
- **Design Tips**:
  - Showcase key features
  - Eye-catching visuals
  - Include app name/logo
  - Convey the "streak game" concept

### 4. OG Image (Social Sharing) 🌐
- **Dimensions**: 1200x630px (≈1.91:1)
- **Format**: PNG or JPG
- **Max Size**: < 10MB
- **File**: `/public/images/og-image.png`
- **URL**: `https://your-domain.com/images/og-image.png`
- **Usage**: Twitter, Facebook, Discord link previews
- **Design Tips**:
  - Include app name prominently
  - Show key value prop
  - Bright, engaging graphics
  - Text should be readable at small sizes

### 5. Embed Preview 🖼️
- **Aspect Ratio**: 3:2 (landscape)
- **Min Dimensions**: 600x400px
- **Max Dimensions**: 3000x2000px
- **Format**: PNG or JPG
- **Max Size**: < 10MB
- **File**: `/public/images/embed-preview.png`
- **URL**: `https://your-domain.com/images/embed-preview.png`
- **Usage**: Farcaster embed cards when sharing
- **Design Tips**:
  - Should entice users to click "Start Quest"
  - Show gameplay or rewards
  - Clear call-to-action
  - High quality, sharp image

### 6. Screenshots (3 required) 📱
- **Dimensions**: Mobile device size (recommended 1170x2532px for iPhone 14 Pro)
- **Format**: PNG or JPG
- **Files**: 
  - `/public/images/screenshot1.png`
  - `/public/images/screenshot2.png`
  - `/public/images/screenshot3.png`
- **URLs**:
  - `https://your-domain.com/images/screenshot1.png`
  - `https://your-domain.com/images/screenshot2.png`
  - `https://your-domain.com/images/screenshot3.png`
- **Usage**: App store listings, preview galleries
- **Suggested Content**:
  1. **Screenshot 1**: Daily quests/tasks view
  2. **Screenshot 2**: Player stats showing streak
  3. **Screenshot 3**: Leaderboard with rankings
- **Design Tips**:
  - Capture actual app screens
  - Can add device frame
  - Highlight key features with annotations
  - Show the app at 424x695px dimensions

## Image Creation Tools

### Free Tools
- **Canva**: Easy templates for all image types
- **Figma**: Professional design tool
- **GIMP**: Free Photoshop alternative
- **Photopea**: Online Photoshop clone

### Screenshot Tools
- **Chrome DevTools**: Set viewport to 424x695px
- **Firefox Responsive Design Mode**
- **Screely**: Add device frames
- **Cleanshot**: Mac screenshot tool

## Design Recommendations

### Color Palette
Match your app's colors:
- Primary: `#0052FF` (Base Blue)
- Secondary: `#00D395` (Green accent)
- Background: `#0A0B0D` (Dark)
- Text: `#FFFFFF` (White)

### Themes
Convey these concepts visually:
- ⚡ Speed/Energy (streaks)
- 🎮 Gaming/Fun
- 💰 Rewards/Prizes
- 📊 Progress/Achievement
- 🔗 Blockchain/Onchain

### Typography
Use **Space Grotesk** font (same as app) or similar modern sans-serif:
- Bold for headlines
- Medium for body text
- Keep text minimal and readable

## Hosting Images

### Option 1: Host with App
Place images in `/public/images/` and they'll be served from your domain.

### Option 2: CDN/Cloud Storage
- **Cloudinary**: Free tier, image optimization
- **imgix**: Professional image CDN
- **AWS S3 + CloudFront**: Scalable solution
- **Vercel**: Auto-optimizes images

### Option 3: GitHub
Host in a public repo and use raw URLs (not recommended for production).

## Checklist

Before deploying:

- [ ] All images created at correct dimensions
- [ ] Images compressed (use TinyPNG or similar)
- [ ] Images uploaded to hosting
- [ ] All URLs updated in `farcaster.json`
- [ ] Embed metadata URLs updated in `index.html`
- [ ] Images load correctly (test URLs in browser)
- [ ] Images display properly on mobile and desktop
- [ ] OG image tested with [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [ ] Embed preview tested with [Base Build Preview](https://www.base.dev/preview)

## Example Image Set

Here's a suggested workflow to create all images:

1. **Design in Figma**:
   - Create artboard for each size
   - Reuse design elements across images
   - Export at 2x resolution for sharp quality

2. **Screenshot the App**:
   - Run `npm run dev`
   - Open DevTools, set viewport to 424x695px
   - Navigate through app and capture screens
   - Add device frame in post-processing

3. **Optimize & Upload**:
   - Run through TinyPNG or ImageOptim
   - Upload to your hosting
   - Test all URLs

## Need Inspiration?

Check out other Base MiniApps:
- [Base Build MiniApps](https://www.base.dev/)
- [Farcaster App Directory](https://miniapps.farcaster.xyz/)

---

Good luck with your designs! 🎨
