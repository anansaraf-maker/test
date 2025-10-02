# Finland Electricity Price Tracker

A beautiful, interactive web application that displays real-time electricity market prices in Finland using data from the ENTSO-E Transparency Platform API.

## Features

- **Real-time Data**: Fetches day-ahead electricity prices from ENTSO-E API
- **Interactive Visualization**: 24-hour line graph with Chart.js
- **Glitter Effects**: Magical particle animations on graph interactions
- **Pastel Design**: Beautiful gradient backgrounds and modern UI
- **Responsive**: Works perfectly on desktop and mobile devices
- **Error Handling**: Graceful fallbacks and retry functionality

## Quick Start

1. **Open the application**: Simply open `index.html` in your web browser
2. **API Key Setup** (optional): 
   - Get your free API key from [ENTSO-E Transparency Platform](https://transparency.entsoe.eu/content/static_content/Static%20content/web%20api/Guide.html)
   - Replace `'YOUR_API_KEY_HERE'` in `script.js` with your actual API key
3. **Demo Mode**: The app works with realistic mock data even without an API key

## Technical Details

### API Integration
- **Endpoint**: ENTSO-E Transparency Platform API
- **Data Type**: Day-ahead electricity prices (Document Type A44)
- **Domain**: Finland (10YFI-1--------U)
- **Format**: XML response parsed to JSON

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
