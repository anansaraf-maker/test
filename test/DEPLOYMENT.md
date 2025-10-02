# 🚀 Secure Deployment Guide

Deploy your Nordic Power Watch with a secure backend that hides your ENTSO-E API key using Vercel's free tier.

## 📁 Files Added

✅ **package.json** - Dependencies for Vercel
✅ **vercel.json** - Vercel configuration  
✅ **api/dayahead.js** - Secure serverless API endpoint
✅ **Updated frontend** - Now calls secure API

## 🔧 Deployment Steps

### Step 1: Get Your ENTSO-E API Key
1. Register at [ENTSO-E Transparency Platform](https://transparency.entsoe.eu/restful/static_content/Static%20content/web%20api/Guide.html)
2. Generate your free API key
3. Keep it safe - you'll need it for Vercel

### Step 2: Deploy to Vercel
1. **Sign up** at [vercel.com](https://vercel.com) (free)
2. **Import your project**:
   - Click "New Project"
   - Import from Git (GitHub/GitLab) or upload folder
   - Select your Nordic Power Watch folder
3. **Configure environment variable**:
   - In project settings → Environment Variables
   - Add: `ENTSOE_TOKEN` = `your-api-key-here`
4. **Deploy** - Vercel will build and deploy automatically!

### Step 3: Test Your Deployment
1. Visit your deployed URL (e.g., `your-app.vercel.app`)
2. Check the data source indicator:
   - 🟢 **Live Data** = Success! Using real ENTSO-E data
   - 🟡 **Demo Data** = API key issue or ENTSO-E down
3. Open browser console to see detailed logs

## 🔒 Security Benefits

✅ **API Key Hidden** - Never exposed to users  
✅ **CORS Enabled** - Works from any domain  
✅ **Rate Limited** - Vercel handles traffic spikes  
✅ **Auto-scaling** - Handles any number of users  
✅ **Free Tier** - No cost for normal usage  

## 🛠️ Local Development

To test locally before deploying:

```bash
# Install Vercel CLI
npm i -g vercel

# Set environment variable
vercel env add ENTSOE_TOKEN

# Run locally
vercel dev
```

Your app will be available at `http://localhost:3000`

## 🌍 Alternative Deployment Options

### GitHub Pages + Vercel API
- Host static files on GitHub Pages (free)
- Use Vercel only for the API endpoint
- Update `API_URL` to your Vercel API domain

### Netlify Functions
- Similar setup with `netlify/functions/dayahead.js`
- Environment variable: `ENTSOE_TOKEN`

### Railway/Render
- Deploy the entire project as a Node.js app
- Add build script to serve static files

## 🔧 Troubleshooting

### "ENTSOE_TOKEN not set" Error
- Check environment variable in Vercel dashboard
- Redeploy after adding the variable

### CORS Issues
- API includes proper CORS headers
- Should work from any domain

### Data Not Loading
- Check browser console for errors
- Verify API endpoint is accessible
- Test API directly: `your-app.vercel.app/api/dayahead`

### Rate Limiting
- ENTSO-E has rate limits (400 requests/minute)
- Vercel caches responses automatically
- Consider adding Redis cache for high traffic

## 📊 Monitoring

Monitor your deployment:
- **Vercel Dashboard**: View function logs and analytics
- **Browser Console**: Check API responses
- **Network Tab**: Monitor API call timing

## 🎯 Next Steps

Once deployed, you can:
1. **Custom Domain**: Add your own domain in Vercel
2. **Analytics**: Add Vercel Analytics for usage stats
3. **Caching**: Implement Redis for better performance
4. **Alerts**: Set up monitoring for API failures

Your Nordic Power Watch is now production-ready with enterprise-grade security! 🌟
