# Debugging Contact Form Issues

## Quick Checks

### 1. Check if Function is Deployed
After pushing to GitHub and Cloudflare deploys:
- Go to your site: `virtualpavi.com/api/contact`
- You should get a response (even if it's an error) - if you get "404 Not Found", the function isn't deploying

### 2. Check Browser Console
1. Open your contact page: `virtualpavi.com/contact`
2. Press F12 to open Developer Tools
3. Go to **Console** tab
4. Fill out and submit the form
5. Look for console messages:
   - "Submitting form to /api/contact..."
   - "Response status: [number]"
   - "Response data: [object]"

### 3. Common Issues and Fixes

**Issue: "404 Not Found" when submitting**
- **Cause:** Function not deploying to Cloudflare
- **Fix:** Cloudflare Pages Functions must be in `/functions` directory at root
  - Current path: `/functions/api/contact.ts` ✅ (should work)
  - The URL `/api/contact` maps to `/functions/api/contact.ts`

**Issue: "Server configuration error"**
- **Cause:** Environment variable not set
- **Fix:** 
  1. Go to Cloudflare Dashboard → Your Pages project
  2. Settings → Environment variables
  3. Verify `WEB3FORMS_ACCESS_KEY` exists
  4. **Important:** Click "Redeploy" after adding env vars

**Issue: "Access key not found" from Web3Forms**
- **Cause:** Wrong or invalid access key
- **Fix:** Verify your key at https://web3forms.com
  - Should look like: `628296bf-d226-4e8d-a156-1ab02accddf4`
  - Make sure you verified your email

**Issue: Form submits but no email received**
- **Check spam folder** first
- **Verify email:** `contact@virtualpavi.com`
- **Check Web3Forms dashboard:** https://web3forms.com/dashboard
  - See if submissions are being received there

## Testing the API Key Directly

Test your Web3Forms key works (without Cloudflare):

```bash
# Windows PowerShell
curl.exe -X POST https://api.web3forms.com/submit `
  -H "Content-Type: application/json" `
  -d '{
    \"access_key\": \"628296bf-d226-4e8d-a156-1ab02accddf4\",
    \"name\": \"Test\",
    \"email\": \"test@example.com\",
    \"message\": \"Test message\"
  }'
```

Expected response:
```json
{"success": true, "message": "Email sent successfully"}
```

If this works, your key is valid and the issue is with the Cloudflare deployment.

## Check Cloudflare Logs

1. Go to Cloudflare Dashboard
2. Workers & Pages → Your project
3. Click on latest deployment
4. Go to **Functions** tab
5. Check for any error logs

## Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Cloudflare Pages connected to repo
- [ ] Build completed successfully
- [ ] Function shows in Cloudflare Functions tab
- [ ] Environment variable `WEB3FORMS_ACCESS_KEY` set
- [ ] Redeployed after adding env variable
- [ ] Browser console shows no 404 errors
- [ ] Web3Forms email verified

## Still Not Working?

### Fallback: Direct Web3Forms (No Serverless)

If Cloudflare Functions aren't working, you can use direct submission (less secure, but works):

Edit `src/pages/contact.astro`:
- Remove the `<script>` section at the bottom
- Change form opening tag to:
```html
<form 
  action="https://api.web3forms.com/submit" 
  method="POST"
  class="space-y-4"
>
  <input type="hidden" name="access_key" value="YOUR_KEY_HERE" />
  <input type="hidden" name="redirect" value="https://virtualpavi.com/contact?success=true" />
```

This exposes the key in HTML (not ideal) but will work immediately.

## Get Help

- Cloudflare Community: https://community.cloudflare.com
- Web3Forms Support: support@web3forms.com
- Share: Browser console output + Cloudflare Functions logs
