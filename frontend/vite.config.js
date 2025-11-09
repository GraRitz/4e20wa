import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development';

  return {
    base: '/',             // importante per la build su Render
    plugins: [react()],
    ...(isDev && {
      server: {
        port: 5173,
        host: true,            // per accesso LAN in dev
        allowedHosts: [
          process.env.VITE_TUNNEL_HOST || 'kind-buses-send.loca.lt', 
        ],
      },
    }),
  };
});
