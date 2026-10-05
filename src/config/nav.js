export const navSections = [
  {
    title: 'HOME',
    items: [
      { id: 'home', label: 'Home', icon: 'home', path: '/' },
      { id: 'search', label: 'Search', icon: 'search', path: '/search' },
      { id: 'trending', label: 'Trending', icon: 'shuffle', path: '/trending' },
    ],
  },
  {
    title: 'YOUR MUSIC',
    items: [
      { id: 'playlists', label: 'Playlists', icon: 'playlist', path: '/playlists' },
      { id: 'albums', label: 'Albums', icon: 'music', path: '/albums' },
      { id: 'artists', label: 'Artists', icon: 'user', path: '/artists' },
      { id: 'downloads', label: 'Downloads', icon: 'download', path: '/downloads' },
    ],
  },
]

export const librarySections = [
  { id: 'liked', label: 'Liked Songs', icon: 'heart', path: '/liked' },
  { id: 'playlists', label: 'Playlists', icon: 'playlist', path: '/playlists' },
  { id: 'albums', label: 'Albums', icon: 'music', path: '/albums' },
  { id: 'artists', label: 'Artists', icon: 'user', path: '/artists' },
  { id: 'downloads', label: 'Downloads', icon: 'download', path: '/downloads' },
]
