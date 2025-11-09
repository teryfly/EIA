import { defineConfig } from 'vitest/config';
import path from 'path';

/**
 * Note:
 * - We keep a broad include that covers all test roots.
 * - When running with `--dir`, Vitest internally scopes to that directory,
 *   but it still intersects with include globs. To ensure --dir works, we add
 *   generic patterns for any __tests__ under the working dir.
 */
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: [
      '**/__tests__/**/*.test.ts',
      '**/*.test.ts'
    ],
    exclude: ['node_modules', 'dist'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: 'coverage'
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@/shared': path.resolve(__dirname, 'src/shared'),
      '@/prisma': path.resolve(__dirname, 'prisma')
    }
  }
});