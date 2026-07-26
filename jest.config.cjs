/** Configuración de Jest para el frontend (ts-jest + jsdom + RTL). */
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test-utils/setup.ts'],
  moduleNameMapper: {
    // Evita `import.meta.env` (Vite) en Jest sustituyendo el módulo de config.
    'configuration/env$': '<rootDir>/src/test-utils/env-mock.ts',
  },
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      { tsconfig: '<rootDir>/tsconfig.spec.json' },
    ],
  },
  testMatch: ['<rootDir>/src/**/*.spec.{ts,tsx}'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.spec.{ts,tsx}',
    '!src/main.tsx',
    '!src/App.tsx',
    '!src/vite-env.d.ts',
    '!src/test-utils/**',
    '!src/infrastructure/configuration/env.ts',
    '!src/presentation/layouts/**',
    '!src/presentation/routes/**',
    '!src/presentation/store/store.ts',
  ],
  coverageDirectory: 'coverage',
};
