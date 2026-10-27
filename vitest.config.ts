import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: [
      'packages/**/*.test.ts',
      'apps/desktop/src/shared/**/*.test.ts',
      'apps/desktop/src/renderer/src/lib/**/*.test.ts'
    ],
    environment: 'node',
    reporters: ['default']
  }
})
