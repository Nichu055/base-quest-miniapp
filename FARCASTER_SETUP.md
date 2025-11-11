# Setting up Farcaster Account Association

After deploying your app, you need to associate it with your Farcaster account.

## Steps:

1. **Deploy your app** to a public domain (Vercel, Netlify, etc.)
   - Example: `your-app.vercel.app`

2. **Disable Deployment Protection** (Vercel only)
   - Go to Vercel Dashboard → Your Project → Settings → Deployment Protection
   - Toggle "Vercel Authentication" to OFF
   - Click Save

3. **Generate Account Association**
   - Go to: https://base.dev/account-association
   - Or use Warpcast: Settings → Developer → Domains
   
4. **Enter your domain** (without https://)
   - Example: `your-app.vercel.app`
   - Click "Submit" or "Generate"

5. **Sign the message** in your wallet
   - This proves you own the Farcaster account

6. **Copy the credentials**
   - You'll get three values:
     - `header`
     - `payload`
     - `signature`

7. **Update `farcaster.json`**
   - Replace the placeholder values in `public/.well-known/farcaster.json`
   - Update all `your-domain.com` URLs with your actual domain

8. **Update `index.html`**
   - Update the `fc:miniapp` meta tag URLs
   - Update Open Graph URLs

9. **Create required images**:
   - `icon.png` - 1024x1024px PNG (app icon)
   - `splash.png` - 200x200px PNG (loading screen)
   - `hero.png` - 1200x630px PNG (promotional banner)
   - `og-image.png` - 1200x630px PNG (social sharing)
   - `embed-preview.png` - 3:2 aspect ratio (feed preview)
   - `screenshot-1.png` - 1284x2778px portrait (app preview)

10. **Deploy and verify**
    - Push your changes
    - Visit https://base.dev/preview
    - Enter your domain to test

## Important Notes:

- The `accountAssociation` must be signed by your Farcaster custody address or auth address
- The domain in the signature MUST exactly match your deployed domain
- All image URLs should use absolute paths (https://)
- The manifest is served at `/.well-known/farcaster.json`

## Testing:

```bash
# Test that your manifest is accessible
curl https://your-domain.com/.well-known/farcaster.json

# Should return your farcaster.json content
```
