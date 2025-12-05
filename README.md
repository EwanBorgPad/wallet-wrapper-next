# Solana Wrapped - Next.js Version

A beautiful Next.js app that generates a "Wrapped" style summary of your Solana wallet activity for 2025, with dynamic Open Graph image generation for social media sharing.

## Features

- 🚀 Fast transaction fetching using Helius Labs API
- 🎨 Beautiful animated UI with Framer Motion
- 📊 Comprehensive wallet statistics
- 🖼️ Dynamic OG image generation with @vercel/og
- 🔒 Secure API key handling (server-side only)
- ☁️ Deployable on Vercel

## Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Helius API key

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env.local` file:

```bash
HELIUS_API_KEY=your_helius_api_key_here
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app  # Optional, for OG images
```

### Local Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment to Vercel

1. **Push to GitHub/GitLab/Bitbucket**

2. **Import project to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your repository

3. **Set environment variables:**
   - Add `HELIUS_API_KEY` in Vercel project settings
   - Optionally add `NEXT_PUBLIC_APP_URL` with your Vercel domain

4. **Deploy:**
   - Vercel will automatically deploy on push

## How OG Images Work

The app generates dynamic Open Graph images using Vercel's `@vercel/og` library:

- **Default:** `/` → Shows default OG image
- **With address:** `/?address=YOUR_WALLET_ADDRESS` → Generates custom OG image with wallet stats

The OG image route (`/api/og`) accepts query parameters:
- `address` - Wallet address (required for dynamic image)
- `txCount` - Transaction count (optional, will fetch if not provided)
- `activeDays` - Active days (optional)
- `topProtocol` - Top protocol name (optional)
- `activityLevel` - Activity level 1-10 (optional)

## API Endpoints

- `GET /api/transactions?address=<solana_address>&limit=<number>` - Fetch wallet transactions
- `GET /api/og?address=<address>&...` - Generate dynamic OG image

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── og/
│   │   │   └── route.tsx        # OG image generation
│   │   └── transactions/
│   │       └── route.ts         # Transactions API
│   ├── components/
│   │   └── SolanaWrappedApp.tsx # Main app component
│   ├── lib/
│   │   └── backendApi.ts         # API client
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Main page with metadata
│   └── globals.css              # Global styles
├── public/                       # Static assets
└── package.json
```

## Tech Stack

- **Frontend:** Next.js 15, React 19, Tailwind CSS, Framer Motion
- **OG Images:** @vercel/og
- **API:** Helius Labs Solana RPC
- **Icons:** Lucide React

## Usage

1. Enter a Solana wallet address on the landing page
2. View your personalized "Wrapped" story
3. Share on Twitter/X with a custom OG image

The OG image will automatically update based on the wallet address in the URL, making each share unique!

