// Jest setup file for global test configuration

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.STACKS_NETWORK = 'testnet';
process.env.REDIS_HOST = 'localhost';
process.env.REDIS_PORT = '6379';
process.env.DEMO_MODE = 'true';
process.env.API_KEY_SECRET = 'test-secret-key';

// Suppress console logs during tests (optional)
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
