import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';

export const DpadNavigationHandler: React.FC = () => {
  const { goBack, activeTab, setActiveTab } = useApp();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Support TV Remote D-Pad key codes or standard keyboard arrow keys
      const key = e.key;

      if (key === 'Escape' || key === 'Backspace' || key === 'GoBack' || e.keyCode === 10009 || e.keyCode === 461) {
        if (activeTab === 'player' || activeTab === 'busca') {
          e.preventDefault();
          goBack();
        }
      }

      // Quick tab switching via number keys on TV remote (1 to 6)
      if (key === '1') setActiveTab('inicio');
      if (key === '2') setActiveTab('tendencias');
      if (key === '3') setActiveTab('canais');
      if (key === '4') setActiveTab('shorts');
      if (key === '5') setActiveTab('favoritos');
      if (key === '6') setActiveTab('perfil');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, goBack, setActiveTab]);

  return null;
};
