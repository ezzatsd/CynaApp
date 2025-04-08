/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // Exécuter ce script AVANT de configurer l'environnement de test
  setupFiles: ['<rootDir>/src/tests/dotenv-config.ts'], 
  // Exécuter ce script APRES la configuration de l'environnement (pour le nettoyage BDD)
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts'],
  // Dossier où se trouvent les tests
  roots: ['<rootDir>/src/tests'], 
  // Extensions de fichiers que Jest doit traiter
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  // Transformer les fichiers TypeScript avec ts-jest
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json', // Utiliser la config TS du projet
      },
    ],
  },
  // Pattern pour trouver les fichiers de test
  testMatch: [
    '**/tests/**/*.test.(ts|js)', // Cherche les fichiers .test.ts ou .test.js dans src/tests
    '**/?(*.)+(spec|test).(ts|js)', // Pattern standard de Jest
  ],
  // Ignorer node_modules sauf si nécessaire
  transformIgnorePatterns: ['/node_modules/'],
  // Configuration pour la couverture de code (optionnel)
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/tests/**',
    '!src/config/**', // Exclure la config
    '!src/app.ts', // Exclure le fichier principal de l'app
    '!src/server.ts', // Exclure le point d'entrée du serveur
    '!src/**/index.ts', // Exclure les fichiers index d'export
  ],
  coverageReporters: ['text', 'lcov'], // Rapports de couverture
  // Augmenter le timeout si les tests d'intégration sont lents
  testTimeout: 30000, // 30 secondes
}; 