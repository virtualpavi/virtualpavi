# Contact Form Setup Instructions

Your contact form uses a **secure serverless function** that keeps your API keys private. Form submissions are processed server-side and sent to your email via Web3Forms.

## Quick Setup (3 minutes)

### 1. Get Your Web3Forms Access Key

- Go to https://web3forms.com
- Enter your email: `contact@virtualpavi.com`
- Click "Create Access Key"
- Check your email and verify
- **Copy the access key** (you'll need it in step 3)

### 2. Deploy to Cloudflare Pages (if not done yet)

- Push your code to GitHub
- In Cloudflare Dashboard → Workers & Pages → Create application
- Connect your GitHub repo `virtualpavi`
- Build settings:
  - **Framework preset:** Astro
  - **Build command:** `npm run build`
  - **Build output directory:** `dist`
- Click "Save and Deploy"

### 3. Add Environment Variable to Cloudflare Pages

1. In Cloudflare Dashboard, go to your Pages project
2. Click **Settings** → **Environment variables**
3. Add new variable:
   - **Variable name:** `WEB3FORMS_ACCESS_KEY`
   - **Value:** (paste your access key from step 1)
   - **Environment:** Production (and Preview if you want)
4. Click **Save**
5. **Redeploy** your site (Settings → Deployments → click ⋯ → Retry deployment)

### 4. Test Your Form

- Go to your live site: `virtualpavi.com/contact`
- Fill out and submit the form
- You should receive an email at `contact@virtualpavi.com`

## How It Works

✅ **Secure:** API key stored in Cloudflare environment variables (never in code)  
✅ **Serverless:** Cloudflare Pages Function (`/functions/api/contact.ts`) handles submissions  
✅ **Static site compatible:** Works perfectly with Astro's static output  
✅ **Spam protection:** Web3Forms includes honeypot and rate limiting  
✅ **No backend needed:** All processing happens at the edge  

## Architecture

```
User submits form 
  → Frontend JS calls /api/contact
  → Cloudflare Pages Function processes request
  → Function uses WEB3FORMS_ACCESS_KEY from env
  → Sends to Web3Forms API
  → Web3Forms forwards to contact@virtualpavi.com
  → User sees success message
```

## Security Features

- API keys never exposed to frontend
- HTTPS enforced
- Rate limiting via Cloudflare + Web3Forms
- No data stored (emails sent immediately)
- CORS protection
- Environment variable isolation

## Troubleshooting

**Form doesn't work locally:**
- Cloudflare Pages Functions only work when deployed
- Test on your live site after deployment

**Not receiving emails:**
- Check spam folder
- Verify Web3Forms access key is correct in Cloudflare env vars
- Check Web3Forms dashboard for submission logs

**"Failed to send" error:**
- Ensure environment variable `WEB3FORMS_ACCESS_KEY` is set
- Redeploy after adding env variables
- Check Cloudflare Pages function logs (Functions → Logs)

## Free Tier Limits

- **Web3Forms:** 250 submissions/month
- **Cloudflare Pages:** Unlimited requests on free plan
- More than enough for a portfolio site

## Need Help?

- Web3Forms Docs: https://docs.web3forms.com
- Cloudflare Pages Functions: https://developers.cloudflare.com/pages/functions/
- Support: support@web3forms.com
