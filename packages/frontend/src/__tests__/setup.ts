import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock WebSocket
global.WebSocket = class WebSocket {
  constructor(public url: string) {}
  send() {}
  close() {}
  addEventListener() {}
  removeEventListener() {}
} as any;
