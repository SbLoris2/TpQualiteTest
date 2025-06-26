// Configuration de base pour les tests
process.env.NODE_ENV = 'test';
process.env.PORT = '0';

// Timeout global
jest.setTimeout(10000);