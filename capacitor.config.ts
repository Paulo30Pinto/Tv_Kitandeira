interface CapacitorConfig {
  appId: string;
  appName: string;
  webDir: string;
  server?: { androidScheme?: string };
  plugins?: Record<string, any>;
}

const config: CapacitorConfig = {
  appId: 'ao.angoflix.app',
  appName: 'Angoflix',
  webDir: 'dist',
  server: { androidScheme: 'https' },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0d0d0d',
    },
  },
};

export default config;

