import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,                  // accetta connessioni LAN
    allowedHosts: [
      'kind-buses-send.loca.lt', // 👈 qui metti l’URL generato dal tunnel
    ],
  },
});
