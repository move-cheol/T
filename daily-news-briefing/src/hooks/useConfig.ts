import { useState, useEffect } from 'react';

export interface AppConfig {
  claudeApiKey: string;
  clientBrand: string;
  competitors: string; // Comma separated
  negativeKeywords: string; // Comma separated
}

const DEFAULT_CONFIG: AppConfig = {
  claudeApiKey: '',
  clientBrand: '',
  competitors: '',
  negativeKeywords: '논란,리콜,소송,불매,사고,공정위,하락'
};

export function useConfig() {
  const [config, setConfig] = useState<AppConfig | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('news_briefing_config');
    if (saved) {
      try {
        setConfig(JSON.parse(saved));
      } catch (e) {
        setConfig(DEFAULT_CONFIG);
      }
    } else {
      setConfig(DEFAULT_CONFIG);
    }
  }, []);

  const saveConfig = (newConfig: AppConfig) => {
    setConfig(newConfig);
    localStorage.setItem('news_briefing_config', JSON.stringify(newConfig));
  };

  return { config, saveConfig, isLoaded: config !== null };
}
