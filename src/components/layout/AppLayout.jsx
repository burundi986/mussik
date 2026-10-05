import { Routes, Route } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopNavigation } from './TopNavigation'
import { MusicPlayer } from './MusicPlayer'
import { useStore } from '../../store'
import Home from '../../pages/Home'
import Browse from '../../pages/Browse'
import Library from '../../pages/Library'
import Settings from '../../pages/Settings'
import { SearchPage } from '../pages/SearchPage'

export default function AppLayout() {
  const { sidebarOpen } = useStore()

  return (
    <div className="app-shell">
      <Sidebar />
      <div className={`app-main ${sidebarOpen ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
        <TopNavigation />
        <main className="content-area">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/library" element={<Library />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/trending" element={<Browse />} />
            <Route path="/playlists" element={<Library />} />
            <Route path="/albums" element={<Library />} />
            <Route path="/artists" element={<Library />} />
            <Route path="/downloads" element={<Library />} />
            <Route path="/liked" element={<Library />} />
          </Routes>
        </main>
        <MusicPlayer />
      </div>
    </div>
  )
}
