
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import ChatArea from './components/ChatArea';
import VisionForge from './components/VisionForge';
import LiveVoice from './components/LiveVoice';
import VisualDictionary from './components/VisualDictionary';
import Cinemax from './components/Cinemax';
import DevStudio from './components/DevStudio';
import { AppMode } from './types';

const App: React.FC = () => {
  const [activeMode, setActiveMode] = useState<AppMode>(AppMode.Chat);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [searchEnabled, setSearchEnabled] = useState(true);
  const [voiceName, setVoiceName] = useState('Zephyr');

  // Rejim o'zgarganda sahifa yuqorisiga o'tish
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeMode]);

  const renderContent = () => {
    switch (activeMode) {
      case AppMode.Chat:
        return <ChatArea searchEnabled={searchEnabled} isDarkMode={isDarkMode} />;
      case AppMode.ImageGen:
        return <VisionForge isDarkMode={isDarkMode} />;
      case AppMode.Cinema:
        return <Cinemax isDarkMode={isDarkMode} />;
      case AppMode.Voice:
        return <LiveVoice voiceName={voiceName} isDarkMode={isDarkMode} />;
      case AppMode.Studio:
        return <DevStudio isDarkMode={isDarkMode} />;
      case AppMode.VisualDict:
        return <VisualDictionary isDarkMode={isDarkMode} />;
      default:
        return <ChatArea searchEnabled={searchEnabled} isDarkMode={isDarkMode} />;
    }
  };

  return (
    <Layout 
      activeMode={activeMode} 
      onModeChange={setActiveMode}
      isDarkMode={isDarkMode}
      setIsDarkMode={setIsDarkMode}
      searchEnabled={searchEnabled}
      setSearchEnabled={setSearchEnabled}
      voiceName={voiceName}
      setVoiceName={setVoiceName}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
