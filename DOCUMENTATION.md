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
- **What**: Real-time debounced search across songs, artists, albums
- **Where**: `src/components/pages/SearchPage.jsx`
- **Components**: `SearchPage`, `SearchSuggestions`, `SearchHistory`, `SearchFilters`
- **How it works**: User types → `useDebounce` hook delays 350ms → `apiService` searches Deezer API → results displayed with suggestions and history
- **Features**: Search suggestions, search history (localStorage), category filters, clear history
- **API**: `apiService.searchSongs()`, `apiService.searchArtists()`, `apiService.searchAlbums()`
- **Type**: Frontend-only
- **Limitations**: No playlists, genres, or podcast results; limited to 10 results per category

### Music Player
- **What**: Full-featured audio player
- **Where**: `src/components/layout/MusicPlayer.jsx`
- **Features**: Play, Pause, Previous, Next, Seek, Volume, Mute, Shuffle, Repeat, Progress bar, Duration, Queue, Album art
- **Audio Engine**: HTML5 `<audio>` element
- **State**: Zustand store (`currentTrack`, `isPlaying`, `queue`, `shuffleEnabled`, `repeatMode`, `volume`, `isMuted`)
- **Persistence**: Player state persists between page navigation (Zustand store)
- **Type**: Frontend-only (audio from Deezer previews)
- **Limitations**: Only short previews available from Deezer API; no streaming of full tracks

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
- **What**: Search bar with keyboard shortcut hint
- **Where**: `src/components/layout/TopNavigation.jsx`
- **Features**: Search input, user avatar, notifications
- **Type**: Frontend-only (no actual search integration - just stores query)

## Architecture

```
User
  ↓
Browser (React SPA served as static files)
  ↓
React UI (Vite dev server or dist/)
  ↓
Zustand Global Store (src/store/index.js)
  ↓
API Layer (src/api/services/deezer.js, audiomack.js, audius.js)
  ↓
Deezer API (https://api.deezer.com)
  ↓
Response → Data Transformation → UI
```

## State Management

**Global State**: Zustand store (`src/store/index.js`)
- Stores: `sidebarOpen`, `currentTrack`, `isPlaying`, `playlist`, `searchQuery`, `queue`, `queueIndex`, `shuffleEnabled`, `repeatMode`, `volume`, `isMuted`, `audioElement`
- Actions: `toggleSidebar`, `setCurrentTrack`, `togglePlay`, `setSearchQuery`, `addToPlaylist`, `setQueue`, `setQueueIndex`, `toggleShuffle`, `setRepeatMode`, `setVolume`, `toggleMute`, `playTrack`, `nextTrack`, `prevTrack`, `addToQueue`, `removeFromQueue`, `clearQueue`
- Persistence: In-memory only (no localStorage persistence for the store)

**Local State**: React `useState` in individual components
- Examples: `SearchPage` (query, results, loading, error), `MusicPlayer` (currentTime, duration, isLoading)

**Server State**: None (no server-side rendering or data fetching library)

**LocalStorage**: Search history only (`musiiik_search_history` key)

## API System

### Deezer API

| Property | Value |
|----------|-------|
| **Base URL** | `https://api.deezer.com` |
| **Authentication** | None (public API) |
| **Rate Limits** | Not explicitly documented; API has implicit limits |
| **Free-tier** | Short audio previews only (30 seconds) |
| **Endpoints Used** | `/search`, `/search/artist`, `/search/album`, `/track/{id}`, `/artist/{id}`, `/album/{id}`, `/genre`, `/chart/title` |

**Service File**: `src/api/services/deezer.js`

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
| **Seek** | Click on progress bar → calculates position from mouse → sets `audio.currentTime` |
| **Volume** | Range input → sets `audio.volume` and Zustand `volume` |
| **Mute** | Toggles `audio.muted` and Zustand `isMuted` |
| **Shuffle** | Toggles `shuffleEnabled` → `nextTrack()` picks random index |
| **Repeat** | Toggles `repeatMode` (`none`/`repeat-all`/`repeat-one`) |

### State Persistence
Player state (currentTrack, queue, volume, etc.) persists in the Zustand store. Since Zustand is in-memory, state is lost on page refresh.

### Error Handling
- Broken audio: `onError` event triggers `nextTrack()`
- Loading audio: `isLoading` state shown with overlay
- End of track: `onEnded` triggers `nextTrack()` or repeats based on mode
- Network errors: `nextTrack()` called to skip

## Authentication & Security

**NOT IMPLEMENTED**. There is no authentication system in the current codebase.

- No user registration, login, or logout
- No sessions or tokens
- No password hashing
- No protected routes
- The user avatar shows "U" placeholder text

**Security Note**: The `.env` file is listed in `.gitignore` and should not be committed. The `.env.example` file is tracked and contains no secrets.

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

**No automated tests exist.** There are no unit tests, integration tests, or end-to-end tests.

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
- **API caching**: In-memory cache with 5-minute TTL
- **Request cancellation**: AbortController cancels stale requests
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

### Needs Improvement
- ARIA labels on many interactive elements
- Screen reader support
- Color contrast verification
- Mobile responsive testing
- Reduced motion support

## Known Limitations

### Application
- No authentication system
- No user accounts or profiles
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
- No full track streaming
- API rate limits may cause errors
- Search results limited to 10 per category

### Browser
- Requires a modern browser with ES module support
- No native file system access
- Audius read endpoints are called directly from the browser and are subject to CORS
- No media key support

### Security
- No authentication = no authorization
- No input validation on API responses
- No CORS handling beyond what fetch provides
- `.env` file contains API base URL but no secrets

## Future Improvements

### High Priority
- [ ] Implement actual authentication (registration/login)
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
