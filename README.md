# Sakuku - Personal Finance Manager

A modern, beautiful digital wallet app with expense tracking, financial analytics, and AI-powered insights. Built as a Progressive Web App (PWA) for native app-like experience.

## Features

- 📊 **Expense Tracking**: Track income and expenses with categories
- 🤖 **AI Financial Advisor**: Get smart financial insights powered by Google Gemini
- 📈 **Analytics & Reports**: Visualize spending patterns with beautiful charts
- 🌙 **Dark/Light Theme**: Automatic theme switching
- 💾 **Offline Support**: Works without internet connection
- 📱 **PWA Ready**: Install as native app on mobile devices
- 🔄 **Multi-language**: Support for Indonesian and English

## Progressive Web App (PWA)

This app is built as a PWA and can be installed on mobile devices for a native app experience.

### Installation

1. **On Mobile Chrome/Edge**:
   - Open the web app
   - Tap the install prompt when it appears
   - Or tap menu (⋮) → "Add to Home screen"

2. **On iOS Safari**:
   - Open the web app
   - Tap share button → "Add to Home Screen"

3. **On Desktop**:
   - Chrome: Click install button in address bar
   - Edge: Click "Apps" → "Install this site as an app"

### PWA Features

- **Offline Support**: App works without internet
- **Native Feel**: Full-screen experience without browser UI
- **Fast Loading**: Cached for instant startup
- **Background Sync**: Syncs data when online
- **Push Notifications**: (Future feature)

## Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone repository
git clone <repository-url>
cd sakuku

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Build with PWA optimizations
npm run build:pwa
```

### PWA Setup

The app includes all necessary PWA files:

- `public/manifest.json` - App manifest
- `public/sw.js` - Service worker for caching
- `public/icon.svg` - App icon (convert to PNG for production)
- PWA meta tags in `index.html`

### Icon Generation

For production, convert `public/icon.svg` to PNG files:

```bash
# Using ImageMagick
convert public/icon.svg -resize 192x192 public/icon-192.png
convert public/icon.svg -resize 512x512 public/icon-512.png

# Or use online converters
# https://cloudconvert.com/svg-to-png

# Or use web-based tools
# https://favicon.io/favicon-converter/
```

**Important**: The icon now matches the header logo design with the Wallet icon and "SAKUKU" text, providing brand consistency across the PWA installation.

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Vercel will automatically detect Vite configuration
3. Set environment variable: `GEMINI_API_KEY` in Vercel dashboard
4. Deploy automatically on push

### Netlify

1. Connect your repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Enable PWA headers if supported

### Manual Deployment

```bash
# Build the app
npm run build

# Deploy dist/ folder to your hosting service
# Make sure to serve with HTTPS for PWA features
```

### Environment Variables

Create a `.env.local` file in the root directory:

```env
GEMINI_API_KEY=your_google_gemini_api_key_here
```

For Vercel deployment, set this environment variable in the Vercel dashboard under Project Settings > Environment Variables.

### PWA Requirements

- **HTTPS**: Required for service workers
- **Service Worker**: Handles caching and offline support
- **Web App Manifest**: Defines app metadata
- **Responsive Design**: Works on all screen sizes

## Browser Support

- Chrome 70+
- Firefox 68+
- Safari 12.1+
- Edge 79+

## Technologies Used

- **React 19** - UI Framework
- **TypeScript** - Type Safety
- **Tailwind CSS** - Styling
- **Vite** - Build Tool
- **Google Gemini AI** - Financial Insights
- **Recharts** - Data Visualization
- **PWA APIs** - Native App Features

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## License

MIT License - see LICENSE file for details

## Support

For issues and feature requests, please create an issue on GitHub.
