# Nordic Power Watch 🌟

A stunning, interactive web application that displays real-time electricity market prices across all Nordic countries using data from the ENTSO-E Transparency Platform API.

## ✨ Features

### 🏔️ **Multi-Country Comparison**
- **Finland** 🇫🇮 - Real-time ENTSO-E integration
- **Sweden** 🇸🇪 - Nuclear and hydro power data
- **Norway** 🇳🇴 - Hydro-dominated pricing
- **Denmark** 🇩🇰 - Wind power market dynamics

### 🎨 **Modern Glass Morphism Design**
- **Dynamic Color Themes**: Background changes based on price levels
  - 🟢 Green gradients for low prices (<40 EUR/MWh)
  - 🟠 Orange gradients for medium prices (40-70 EUR/MWh)
  - 🔴 Red gradients for high prices (>70 EUR/MWh)
- **Glass Morphism Cards**: Frosted glass effect with backdrop blur
- **Floating Particles**: Animated background particles
- **Dark/Light Mode**: Toggle between themes

### 🎪 **Interactive Elements**
- **Glitter Burst Effects**: Magical particles on chart hover
- **Confetti Celebrations**: When prices drop significantly
- **Click for Details**: Detailed price breakdown modals
- **Country Toggles**: Show/hide specific countries
- **Live Price Ticker**: Real-time scrolling prices

### 📊 **Advanced Analytics**
- **24-Hour Comparison Charts**: Multi-line visualization
- **Best Time Recommendations**: Cheapest hours to use electricity
- **Price Breakdown**: Average, peak, and off-peak analysis
- **Cheapest Country Indicator**: Live comparison winner

## 🚀 Quick Start

### Option 1: Demo Mode (Instant)
1. **Open the application**: Simply open `index.html` in your web browser
2. **Enjoy**: The app works immediately with realistic mock data

### Option 2: Secure Production Deployment (Recommended)
1. **Get API Key**: Register for free at [ENTSO-E Transparency Platform](https://transparency.entsoe.eu/restful/static_content/Static%20content/web%20api/Guide.html)
2. **Deploy to Vercel**: 
   - Sign up at [vercel.com](https://vercel.com) (free)
   - Import this project
   - Add environment variable: `ENTSOE_TOKEN` = `your-api-key`
   - Deploy automatically!
3. **Live Data**: Enjoy real-time electricity prices with enterprise security!

📖 **Detailed deployment guide**: See [DEPLOYMENT.md](DEPLOYMENT.md)

### 🔒 Why Secure Deployment?
- ✅ **API Key Hidden** - Never exposed to users
- ✅ **Production Ready** - Handles unlimited users
- ✅ **Free Hosting** - Vercel's generous free tier
- ✅ **Auto-scaling** - No server management needed

## Technical Details

### 🔌 API Integration
- **Primary Source**: ENTSO-E Transparency Platform API
- **Data Type**: Day-ahead electricity prices (Document Type A44)
- **Countries**: Finland, Sweden, Norway, Denmark
- **Format**: XML response parsed to JSON
- **Caching**: 5-minute intelligent caching system
- **Fallback**: Graceful degradation to cached/mock data
- **Retry Logic**: 3 attempts with exponential backoff
- **Timeout**: 10-second request timeout

### 📊 Data Source Indicators
- 🟢 **Live Data**: Real-time from ENTSO-E API
- 🟡 **Cached Data**: Recent data from local cache
- 🔴 **Demo Data**: Realistic mock data for demonstration
- ⚪ **Loading**: Data fetch in progress

### Color Scheme
- **Background**: Soft pastel green gradient (#E8F5E8 to #C8E6C9)
- **Hero Section**: Pastel pink (#FCE4EC)
- **Title Bubble**: White with soft shadow
- **Graph Line**: Indigo (#4F46E5)
- **Graph Points**: Pink (#EC4899)

### Interactive Features
- **Hover Effects**: Glitter particle burst on graph data points
- **Tooltips**: Detailed price and time information
- **Auto-refresh**: Updates every hour automatically
- **Error Recovery**: Retry button for failed requests

## File Structure

```
├── index.html          # Main HTML structure
├── styles.css          # Complete styling and animations
├── script.js           # JavaScript functionality and API integration
└── README.md           # This file
```

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## API Key Setup (Optional)

To use real ENTSO-E data instead of mock data:

1. Register at [ENTSO-E Transparency Platform](https://transparency.entsoe.eu/)
2. Generate your API key
3. Replace the API key in `script.js`:

```javascript
const CONFIG = {
    // ... other config
    API_KEY: 'your-actual-api-key-here'
};
```

## Development

The application is built with vanilla HTML, CSS, and JavaScript for maximum compatibility and performance. No build process required!

### Dependencies
- Chart.js (loaded via CDN)
- Modern web browser with ES6 support

## License

This project is open source and available under the MIT License.
