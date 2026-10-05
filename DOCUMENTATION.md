# Musiiik Documentation

Complete documentation for the Musiiik music streaming application.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Feature Inventory](#feature-inventory)
3. [Architecture](#architecture)
4. [State Management](#state-management)
5. [API System](#api-system)
6. [Music Player](#music-player)
7. [Authentication & Security](#authentication--security)
8. [Database](#database)
9. [Installation](#installation)
10. [Development Workflow](#development-workflow)
11. [Testing](#testing)
12. [Performance](#performance)
13. [Limitations](#limitations)
14. [Future Improvements](#future-improvements)

---

## Project Overview

Musiiik is a music streaming web application built with React 19, Vite 8, and Tailwind CSS 4. It uses the free Deezer, Audiomack, and Audius APIs to provide real music data and the HTML5 Audio API for playback. State management is handled by Zustand.

## Feature Inventory

### Search
- **What**: Real-time debounced search across songs, artists, albums from Audius and Deezer
- **Where**: `src/components/pages/SearchPage.jsx`
- **Default source**: `audius`. The filter order is Audius / Every source / Deezer,
  and only the **Every source** branch queries both providers
- **Components**: `SearchPage`, `SearchSuggestions`, `SearchHistory`, `SearchFilters`
- **How it works**: User types â†’ `useDebounce` delays 350ms â†’ the page queries the
  selected providers â†’ Deezer tracks/artists/albums and Audius tracks/users/playlists
  are bucketed into the same three carousels, each item tagged with a `source`
- **Source filter**: In **Every source** mode both providers are queried with
  `Promise.allSettled`, so one failing provider still renders the other's results
  and a notice names the one that failed
- **Race handling**: The effect tracks a local `cancelled` flag and cleans it up,
  so a slow response cannot overwrite a newer query or source change
- **Queue**: Carousels pass the full item list and the tapped index to `playTrack`,
  so Next/Prev walk the results instead of stopping after one track
- **Features**: Search suggestions, search history (localStorage), category
  filters, source filters, per-card source badges, clear history
- **API**: `audiusService.searchAll()` and
  `apiService.searchSongs/searchArtists/searchAlbums()`
- **Type**: Frontend-only
- **Limitations**: Audius playlists are presented in the Albums carousel; no
  genres or podcast results; up to 10 tracks and 5 artists/albums per provider

### Home
- **What**: Trending music on Audius, so the app shows real content on first load
- **Where**: `src/pages/Home.jsx`
- **How it works**: `getTrendingTracks({ limit: 20 })` and
  `getTrendingPlaylists({ limit: 10 })` run concurrently, render as two
  carousels, and share the search queue wiring
- **Type**: Frontend-only
- **Notes**: Audius "trending" reflects all-network uploads, so long DJ sets and
  remixes appear alongside full songs

### Music Player
- **What**: Full-featured audio player
- **Where**: `src/components/layout/MusicPlayer.jsx`
- **Features**: Play, Pause, Previous, Next, Seek, Volume, Mute, Shuffle, Repeat, Progress bar, Duration, Queue, Album art
- **Audio Engine**: HTML5 `<audio>` element
- **Audio Source**: `getAudioSource(currentTrack)` in `src/utils/helpers.js`
  prefers an Audius `streamUrl` (a full track) and falls back to a Deezer
  `preview`. `audioSource` is hoisted above the effect so the dependency array
  holds a plain value
- **State**: Zustand store (`currentTrack`, `isPlaying`, `queue`, `shuffleEnabled`, `repeatMode`, `volume`, `isMuted`)
- **Persistence**: Player state persists between page navigation (Zustand store)
- **Type**: Frontend-only (Deezer previews and Audius streams)
- **Limitations**: Deezer offers only ~30 second previews; Audius streams the full track but depends on its CDN staying reachable

### Browse
- **What**: Generic browse page template
- **Where**: `src/pages/Browse.jsx`
- **Type**: Placeholder page

### Library
- **What**: Personal library page
- **Where**: `src/pages/Library.jsx`
- **Type**: Placeholder page

### Settings
- **What**: Settings page
- **Where**: `src/pages/Settings.jsx`
- **Type**: Placeholder page

### Audius Integration
- **What**: Read-only Audius API service for search, trending, and streaming
- **Where**: `src/api/services/audius.js`
- **How**: Calls `https://api.audius.co/v1` with `app_name` on every request
- **Type**: Read-only client (write endpoints need request signing and are intentionally omitted)
- **Features**: Track/user/playlist search, trending by genre, stream URL construction

### Toast Notifications
- **What**: Context-based toast notification system
- **Where**: `src/components/ui/Toast.jsx`
- **Features**: Success, error, warning, info toasts with auto-dismiss
- **Type**: Frontend-only

### Sidebar Navigation
- **What**: Collapsible sidebar with navigation sections
- **Where**: `src/components/layout/Sidebar.jsx`
- **Config**: `src/config/nav.js`
- **Features**: Collapsible, active path highlighting
- **Type**: Frontend-only

### Top Navigation
- **What**: Search bar with keyboard shortcut hint, plus session-aware user menu
- **Where**: `src/components/layout/TopNavigation.jsx`
- **Features**: Search input, notifications, and either Log in / Sign up links or
  the signed-in user's initial plus a sign-out button, driven by `useAuthStore`
- **Type**: Frontend-only (no actual search integration - just stores query)

## Architecture

```
User
  â†“
Browser (React SPA served as static files)
  â†“
React UI (Vite dev server or dist/)
  â†“
Zustand Stores (src/store/index.js, src/store/auth.js)
  â†“
API Layer (src/api/services/deezer.js, audiomack.js, audius.js, auth.js)
  â†“
Deezer API (via /deezer-api proxy) + Audius API + localStorage accounts
  â†“
Response â†’ Data Transformation â†’ UI
```

## State Management

**Global State**: Zustand store (`src/store/index.js`)
- Stores: `sidebarOpen`, `currentTrack`, `isPlaying`, `playlist`, `searchQuery`, `queue`, `queueIndex`, `shuffleEnabled`, `repeatMode`, `volume`, `isMuted`, `audioElement`
- Actions: `toggleSidebar`, `setCurrentTrack`, `togglePlay`, `setSearchQuery`, `addToPlaylist`, `setQueue`, `setQueueIndex`, `toggleShuffle`, `setRepeatMode`, `setVolume`, `toggleMute`, `playTrack`, `nextTrack`, `prevTrack`, `addToQueue`, `removeFromQueue`, `clearQueue`
- Persistence: In-memory only (no localStorage persistence for the store)

**Auth State**: Zustand store (`src/store/auth.js`)
- Stores: `user`, `error`, `loading`
- Actions: `login`, `signup`, `logout`, `clearError`
- Persistence: `musiiik_session` in localStorage, hydrated on load by `authService.getSession()`

**Local State**: React `useState` in individual components
- Examples: `SearchPage` (query, results, loading, error), `MusicPlayer` (currentTime, duration, isLoading)

**Server State**: None (no server-side rendering or data fetching library)

**LocalStorage**: Search history only (`musiiik_search_history` key)

## API System

### Deezer API

| Property | Value |
|----------|-------|
| **Base URL** | `VITE_DEEZER_BASE`, defaults to `/deezer-api` |
| **Authentication** | None (public API) |
| **Rate Limits** | Not explicitly documented; API has implicit limits |
| **Free-tier** | Short audio previews only (30 seconds) |
| **Endpoints Used** | `/search`, `/search/artist`, `/search/album`, `/track/{id}`, `/artist/{id}`, `/album/{id}`, `/genre`, `/chart/title` |

**Service File**: `src/api/services/deezer.js`

**CORS**: `api.deezer.com` sends no `Access-Control-Allow-Origin` header, so
browsers refuse direct calls. `vite.config.js` proxies `/deezer-api` to Deezer
during `npm run dev`, and the service calls that path by default. A static
deployment needs an equivalent proxy exposed through `VITE_DEEZER_BASE`;
otherwise every Deezer-backed feature fails in the browser.

The `apiService` object provides methods for all API interactions:
- `searchSongs(query, limit)` - Search tracks
- `searchArtists(query, limit)` - Search artists
- `searchAlbums(query, limit)` - Search albums
- `getTrack(trackId)` - Get track details
- `getTrackPreview(trackId)` - Get track preview info
- `getArtist(artistId)` - Get artist details
- `getArtistTopTracks(artistId)` - Get artist top tracks
- `getAlbum(albumId)` - Get album details
- `getAlbumTracks(albumId)` - Get album tracks
- `getArtworkUrl(coverId, size)` - Generate artwork URL
- `getChart(limit)` - Get chart
- `getGenres()` - Get genre list
- `getGenreRadio(genreId)` - Get genre radio
- `clearCache()` - Clear in-memory cache

**Caching**: In-memory Map with 5-minute TTL

**Error Handling**: Automatic retry on 429 (rate limit), timeout on 10s, server errors thrown as exceptions

## Music Player

### Audio Engine
Uses the HTML5 `<audio>` element (`src/components/layout/MusicPlayer.jsx`).

### Controls

| Control | Implementation |
|---------|---------------|
| **Play/Pause** | `audio.play()` / `audio.pause()` via Zustand `isPlaying` state |
| **Previous** | `prevTrack()` - moves to previous in queue |
| **Next** | `nextTrack()` - advances to next track |
| **Seek** | Click on progress bar â†’ calculates position from mouse â†’ sets `audio.currentTime` |
| **Volume** | Range input â†’ sets `audio.volume` and Zustand `volume` |
| **Mute** | Toggles `audio.muted` and Zustand `isMuted` |
| **Shuffle** | Toggles `shuffleEnabled` â†’ `nextTrack()` picks random index |
| **Repeat** | Toggles `repeatMode` (`none`/`repeat-all`/`repeat-one`) |

### State Persistence
Player state (currentTrack, queue, volume, etc.) persists in the Zustand store. Since Zustand is in-memory, state is lost on page refresh.

### Error Handling
- Broken audio: `onError` event triggers `nextTrack()`
- Loading audio: `isLoading` state shown with overlay
- End of track: `onEnded` triggers `nextTrack()` or repeats based on mode
- Network errors: `nextTrack()` called to skip
- `.player-loading-overlay` is `pointer-events: none`. It is decorative only; without
  this it covers the transport buttons and swallows every click while a stream
  buffers, which makes the player look frozen
- `isLoading` clears on `loadedmetadata`, but Audius streams can lag well behind
  `canplay`/`playing`, so both are wired up to clear it as soon as playback starts

## Authentication & Security

Login and signup screens are implemented, but they are **not real authentication**.

- `/login` and `/signup` are routed outside `AppLayout` (`src/App.jsx`), so they
  render without the sidebar and player
- `src/store/auth.js` is the Zustand store; `src/api/services/auth.js` holds the
  storage logic and the `validateEmail` / `validatePassword` validators
- Sessions live in `localStorage` under `musiiik_session` and accounts under
  `musiiik_accounts`
- Passwords are stored as a SHA-256 digest via `crypto.subtle.digest`, never in
  cleartext
- Sign-out clears the session and the top nav returns to Log in / Sign up links
- No protected routes, no server-side checks, no tokens

**Security Note**: Because everything lives in `localStorage`, anyone with
devtools can read or edit accounts and sessions, and a weak password is still
recoverable from its digest. Replace the bodies of `src/api/services/auth.js`
with real `fetch` calls before relying on this for anything real.

**Environment Note**: The `.env` file is listed in `.gitignore` and should not be committed. The `.env.example` file is tracked and contains no secrets.

## Database

**Does NOT exist**. There is no database in the current codebase. The application is entirely frontend-based using the external Deezer API for music data and localStorage for search history only.

## Installation

### Requirements
- Node.js 18+ (LTS recommended)
- npm 9+
- Git
- Any modern web browser (Chrome, Edge, Firefox, Safari)

### Steps
```bash
# Clone
git clone <repository-url>
cd MUSIIK

# Install dependencies
npm install

# Set up environment
cp .env.example .env

# Verify
npm run build
```

## Development Workflow

### Adding a New Page
1. Create `src/pages/YourPage.jsx`
2. Export as `export default function YourPage()`
3. Add route in `src/App.jsx` or `src/components/layout/AppLayout.jsx`
4. Add navigation item in `src/config/nav.js`

### Adding a New Component
1. Create file in `src/components/ui/YourComponent.jsx`
2. Export function with proper naming
3. Import and use in relevant page/layout

### Adding a New API Integration
1. Add method to `src/api/services/deezer.js`
2. Use `apiService.methodName()` in relevant component
3. Handle loading/error states in the component

### Editing the Player
- `src/components/layout/MusicPlayer.jsx` - Main player UI and logic
- `src/store/index.js` - Player state and actions
- `src/components/ui/Icon.jsx` - Player icons

### Adding New Icons
- Add to `src/components/ui/Icon.jsx` `icons` object
- Use `<Icon name="iconName" size={20} />` in components

## Testing

Two automated suites exist, plus the manual checklist below.

### `npm run test:auth`

`test/auth-service.test.mjs` runs in plain Node against `auth.js` with a
`localStorage` shim. Covers email and password validation, registration,
duplicate-email rejection, session shape, the absence of plaintext passwords in
localStorage, login success and both failure paths, and logout. No browser and no
dev server required.

### `npm run test:browser`

`test/browser-check.mjs` drives headless Chrome over the DevTools protocol using
Node 22's built-in `WebSocket`, with no test framework dependency. It requires:

1. the dev server already running on `ORIGIN` (default `http://localhost:5173`)
2. `CHROME_PATH` set to a Chrome or Edge executable
3. Chrome able to launch with `--no-sandbox` in this environment

It asserts both auth screens render outside the app shell, the field sets and
validation gating work, a full signup â†’ reload â†’ login â†’ logout round trip holds
the session and keeps passwords off disk, a wrong password is rejected in place,
every shell route renders, search returns results from **both** providers with
source badges, the source filter narrows to one provider, and no console errors
are emitted.

Note: connect to a **page** target's `webSocketDebuggerUrl`, not the
browser-level endpoint from `/json/version` â€” the latter rejects `Page.*`
commands.

### Manual Testing Checklist

- [ ] Dev server starts (`npm run dev`)
- [ ] Build succeeds (`npm run build`)
- [x] App loads in a browser (`npm run dev`)
- [ ] Sidebar navigation works
- [ ] Search bar accepts input
- [ ] Search results appear after typing
- [ ] Search suggestions show up
- [ ] Search history persists
- [ ] Clear history works
- [ ] Category filters work
- [ ] Source filters work (Audius / Every source / Deezer)
- [ ] Cards are badged with their source
- [ ] One provider failing still shows the other's results
- [ ] /login and /signup render without the app shell
- [ ] Signup validates every field and blocks an empty submit
- [ ] Signup creates a session with no plaintext password on disk
- [ ] Login rejects a wrong password without navigating
- [ ] Sign-out clears the session and restores the login links
- [ ] Artist results show in carousel
- [ ] Album results show in carousel
- [ ] Song results show in carousel
- [ ] Music player plays audio
- [ ] Music player pauses audio
- [ ] Next track works
- [ ] Previous track works
- [ ] Progress bar shows current position
- [ ] Duration displays correctly
- [ ] Volume control works
- [ ] Mute toggle works
- [ ] Shuffle works
- [ ] Repeat works
- [ ] Track completes and advances
- [ ] Like button works (adds to playlist)
- [ ] Toast notifications appear
- [ ] Sidebar collapses/expands
- [ ] Responsive on mobile

## Performance

### Implemented
- **Debounced search**: 350ms delay prevents excessive API calls
- **API caching**: In-memory cache with 5-minute TTL (Deezer and Audius)
- **Stale response guard**: the search effect cancels its own late responses via a
  cleanup flag instead of firing aborts, so a slow provider cannot overwrite a newer query
- **Parallel providers**: Deezer and Audius are queried concurrently in "Every source" mode
- **Tailwind CSS**: Purge unused styles
- **Vite**: Fast HMR and optimized builds
- **Skeleton loading**: Perceived performance during loading

### Not Implemented
- Code splitting / lazy loading
- Virtualized lists
- Image optimization
- Memoization (React.memo, useMemo)
- Service worker / offline caching
- Bundle analysis

### Known Issues
- No `React.memo` on components causing potential re-renders
- No memoization of search results
- MusicPlayer re-renders on every state change

## Responsiveness & Accessibility

### Tested
- Desktop browser resolution (1280x800)
- Sidebar collapse/expand
- Focus states via CSS `:focus-visible`
- Keyboard navigation (basic)
- Auth forms: labelled inputs, inline errors, `role="alert"` on the error banner
- Headless-Chrome assertions over `/login`, `/signup`, and the search page

### Needs Improvement
- ARIA labels on many interactive elements
- Screen reader support
- Color contrast verification
- Mobile responsive testing
- Reduced motion support

## Known Limitations

### Application
- No backend authentication: login and signup are localStorage emulation only
- No protected routes or server-side authorization
- No backend server
- No database
- No playlist management UI
- No listening history feature
- No analytics or statistics
- No recommendations algorithm
- No offline functionality
- No downloads/offline mode
- Settings page is a placeholder
- Browse page is a placeholder

### API
- Deezer free API provides only 30-second previews
- Deezer sends no CORS headers, so a static deploy needs its own proxy (`VITE_DEEZER_BASE`) or all Deezer features fail
- Audius streams full tracks via a CDN redirect, which can fail independently of the API
- API rate limits may cause errors
- Search results limited to 10 tracks and 5 artists/albums per provider

### Browser
- Requires a modern browser with ES module support
- No native file system access
- Audius read endpoints are called directly from the browser and are subject to CORS
- No media key support

### Security
- localStorage accounts are trivially editable, so "authentication" proves nothing
- SHA-256 digests are not salted and are reversible for weak passwords
- No input validation on API responses
- `.env` is gitignored; `.env.example` holds no secrets, and `VITE_*` values are public in the bundle

## Future Improvements

### High Priority
- [ ] Back the login/signup screens with a real auth API and drop localStorage emulation
- [ ] Ship a Deezer proxy for production, or switch the default provider to Audius
- [ ] Add proper playlist management (create/edit/delete)
- [ ] Implement listening history persistence
- [ ] Add proper search history UI on home page
- [ ] Implement track queue management UI

### Medium Priority
- [ ] Add genre browsing and filtering
- [ ] Implement artist detail pages
- [ ] Add album detail pages
- [ ] Implement user profiles
- [ ] Add equalizer controls
- [ ] Implement keyboard shortcuts
- [ ] Add web notifications API support

### Future
- [ ] Add backend server for user data
- [ ] Implement proper database for playlists/history
- [ ] Add collaborative playlists
- [ ] Implement social features (following, sharing)
- [ ] Add analytics dashboard
- [ ] Implement offline mode with caching
- [ ] Add premium subscription architecture
- [ ] Implement admin dashboard
- [ ] Add content management
- [ ] Add recommendation engine
