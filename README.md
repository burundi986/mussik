# Musiiik — React Music Streaming Application

A modern music streaming web application built with React, Vite, and Tailwind CSS. Musiiik connects to the Deezer, Audiomack, and Audius APIs for music discovery and streaming.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📝 Features

- **Search**: Live search across songs, artists, and albums with debounced results
- **Music Player**: Full-featured audio player with seek, volume, shuffle, repeat, queue
- **Browse**: Browse trending, popular artists, albums, and playlists
- **Library**: Your personal library with liked songs and playlists
- **Responsive Design**: Works from mobile to desktop (1024px+)

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite 8, Tailwind CSS 4, Zustand 5
- **Routing**: React Router DOM 7
- **Audio**: HTML5 Audio API
- **Icons**: Custom SVG icons with dangerouslySetInnerHTML
- **Build**: Vite production build, deployable to any static host
- **Styling**: Tailwind CSS with custom CSS variables

## 📁 Project Structure

```
musiiik/
├── src/                    # Source code
│   ├── components/         # Reusable UI components
│   │   ├── ui/             # Individual UI components (buttons, inputs, modals, etc.)
│   │   └── pages/          # Page components (Home, Search, Browse, etc.)
│   ├── store/              # Zustand state management
│   ├── api/                # API services (Deezer, Audiomack, Audius integration)
│   ├── config/             # Application configuration
│   ├── hooks/              # Custom React hooks
│   └── layout/             # Layout components (AppLayout, Sidebar, MusicPlayer, TopNavigation)
│   └── main.jsx            # Entry point
├── vite.config.js          # Vite configuration
├── package.json            # Dependencies and scripts
├── index.css               # Global Tailwind + custom styles
└── .env*                 # Environment variables
```

## ⚙️ Environment Variables

Copy `.env.example` and modify as needed:

```bash
cp .env.example .env
```

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_APP_TITLE` | No | App title, defaults to "Musiiik" |
| `VITE_API_BASE_URL` | Yes | Backend API base URL |
| `VITE_APP_VERSION` | No | App version, defaults to "0.0.0" |
| `NODE_ENV` | No | Environment, "development" or "production" |
| `VITE_AUDIOMACK_CONSUMER_KEY` | No | Audiomack consumer key from https://developer.audiomack.com/ |
| `VITE_AUDIOMACK_CONSUMER_SECRET` | No | Audiomack consumer secret |
| `VITE_AUDIUS_APP_NAME` | No | App name Audius attaches to each request, defaults to "musiik" |
| `VITE_AUDIUS_API_KEY` | No | Audius API key from https://api.audius.co/plans — only raises rate limits |
| `VITE_AUDIUS_API_SECRET` | No | Audius key secret for signed write requests; unused by the read-only service |

> **Warning**
> Anything prefixed with `VITE_` is inlined into the client bundle at build time
> and is readable by every visitor. Never put a secret in a `VITE_` variable on a
> publicly deployed site — proxy privileged calls through a serverless function
> instead. The Audius read endpoints work without any credentials, so
> `VITE_AUDIUS_API_KEY` is optional and only affects rate limits.

## 📦 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server at http://localhost:3000 |
| `npm run build` | Build production bundle |
| `npm run preview` | Preview production build |
| `npm run lint` | Run Oxlint code linting |

## 📱 Deployment

Musiiik is a static single-page app. Build it and serve the `dist/` directory
from any static host (Vercel, Netlify, GitHub Pages, Cloudflare Pages):

```bash
npm run build
```

Because routing uses `BrowserRouter`, the host must rewrite unknown paths to
`index.html` so deep links like `/search` resolve to the app.

## 🔧 Development

- Components are organized under `src/components/ui/` and `src/components/pages/`
- State is managed with Zustand in `src/store/index.js`
- API calls go through `src/api/services/deezer.js`
- Global styles in `src/index.css`
- Icons in `src/components/ui/Icon.jsx`

## 📄 License

MITc