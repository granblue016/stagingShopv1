import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import tailwindcss from '@tailwindcss/vite';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import istanbul from 'vite-plugin-istanbul';

export default defineConfig({
  plugins: [
    TanStackRouterVite(),
    react(),
    tsconfigPaths(),
    tailwindcss(),
    // Only enable Istanbul coverage when VITE_COVERAGE=true
    ...(process.env.VITE_COVERAGE === 'true' ? [istanbul({
      cypress: true,
      include: ["src/**/*.{js,jsx,ts,tsx}"],
      exclude: ["node_modules", "test", "**/*.test.{js,jsx,ts,tsx}", "**/*.spec.{js,jsx,ts,tsx}"],
      extension: [".js", ".jsx", ".ts", ".tsx"],
      forceBuildInstrument: true,
    })] : []),
  ],
  server: {
    host: '0.0.0.0',
    port: 8080,
    strictPort: true,
  },
});
