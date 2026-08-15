import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { Toast } from './components/Toast';
import { DpadNavigationHandler } from './components/DpadNavigationHandler';

// Import Screens
import { HomeScreen } from './screens/HomeScreen';
import { TrendingScreen } from './screens/TrendingScreen';
import { SearchScreen } from './screens/SearchScreen';
import { ChannelsScreen } from './screens/ChannelsScreen';
import { ShortsScreen } from './screens/ShortsScreen';
import { FavoritesScreen } from './screens/FavoritesScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { PlayerScreen } from './screens/PlayerScreen';

const MainLayout: React.FC = () => {
  const { activeTab } = useApp();

  const renderScreen = () => {
    switch (activeTab) {
      case 'inicio':
        return <HomeScreen />;
      case 'tendencias':
        return <TrendingScreen />;
      case 'busca':
        return <SearchScreen />;
      case 'canais':
        return <ChannelsScreen />;
      case 'shorts':
        return <ShortsScreen />;
      case 'favoritos':
        return <FavoritesScreen />;
      case 'perfil':
        return <ProfileScreen />;
      case 'player':
        return <PlayerScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0d0d0d] text-white flex flex-col font-sans antialiased selection:bg-[#E50914] selection:text-white">
      <DpadNavigationHandler />
      <Toast />

      {/* Header (hidden in Shorts & Fullscreen Player) */}
      {activeTab !== 'shorts' && activeTab !== 'player' && <Header />}

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto">
        {renderScreen()}
      </main>

      {/* Fixed Bottom Navigation Bar */}
      <BottomNav />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

export default App;
