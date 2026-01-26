import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'google-form-proxy',
      configureServer(server) {
        const env = loadEnv(server.config.mode, process.cwd(), '');
        const googleScriptUrl = env.APPS_SCRIPT_URL;

        console.log('--- Google Form Proxy Plugin Initialized ---');
        console.log('Proxy Target:', googleScriptUrl ? 'Detected in .env' : 'MISSING');

        server.middlewares.use(async (req, res, next) => {
          const urlPath = req.url.split('?')[0];

          if (urlPath === '/api/google-form-proxy') {
            console.log(`[Proxy] Match: ${req.method} ${urlPath}`);

            if (req.method === 'OPTIONS') {
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
              res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
              res.statusCode = 200;
              res.end();
              return;
            }

            if (req.method === 'POST') {
              let body = '';
              req.on('data', chunk => { body += chunk.toString(); });
              req.on('end', async () => {
                try {
                  const payload = JSON.parse(body);
                  const { default: axios } = await import('axios');
                  const response = await axios.post(googleScriptUrl, payload);

                  res.setHeader('Content-Type', 'application/json');
                  res.setHeader('Access-Control-Allow-Origin', '*');
                  res.statusCode = 200;
                  res.end(JSON.stringify(response.data));
                } catch (error) {
                  const status = error.response?.status || 500;
                  console.error(`[Proxy] Downstream Error (${status}):`, error.message);

                  if (error.response?.data) {
                    console.error('[Proxy] Google Response Data:', error.response.data);
                  }

                  res.statusCode = status;
                  res.setHeader('Content-Type', 'application/json');
                  res.setHeader('Access-Control-Allow-Origin', '*');
                  res.end(JSON.stringify({
                    error: 'Proxy Error',
                    status: status,
                    details: error.message,
                    googleResponse: error.response?.data || null
                  }));
                }
              });
              return;
            }
          }
          next();
        });
      }
    }
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
