import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.ts'],
    exclude: ['tests/e2e/**', 'node_modules/**', 'dist/**', 'coverage/**'],
    coverage: {
      include: ['src/utils/validateInput.ts'],
      reporter: ['text', 'lcov'],
    },
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
});
