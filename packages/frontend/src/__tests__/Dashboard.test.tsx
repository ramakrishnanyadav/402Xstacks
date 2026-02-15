import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Dashboard from '../components/Dashboard';
import { PaymentEvent, Metrics, PaymentStatus } from '../types';

describe('Dashboard', () => {
  const mockMetrics: Metrics = {
    successRate: 96.5,
    avgProcessingTime: 4200,
    revenueRecovered: 2.47,
    totalPayments: 1000,
    activePayments: 5,
    failedPayments: 35,
    totalSubmitted: 1000,
    totalConfirmed: 965,
    totalFailed: 35
  };

  const mockEvents: PaymentEvent[] = [
    {
      paymentId: 'test-1',
      status: PaymentStatus.CONFIRMED,
      amount: 0.05,
      timestamp: Date.now(),
      attempts: 1
    }
  ];

  it('should render dashboard title', () => {
    render(
      <Dashboard
        connected={true}
        events={mockEvents}
        metrics={mockMetrics}
        onRefreshMetrics={() => {}}
      />
    );

    expect(screen.getByText('x402-Nexus Dashboard')).toBeDefined();
  });

  it('should show connected status when connected', () => {
    render(
      <Dashboard
        connected={true}
        events={mockEvents}
        metrics={mockMetrics}
        onRefreshMetrics={() => {}}
      />
    );

    expect(screen.getByText('Connected')).toBeDefined();
  });

  it('should show disconnected status when not connected', () => {
    render(
      <Dashboard
        connected={false}
        events={mockEvents}
        metrics={mockMetrics}
        onRefreshMetrics={() => {}}
      />
    );

    expect(screen.getByText('Disconnected')).toBeDefined();
  });

  it('should display metrics correctly', () => {
    render(
      <Dashboard
        connected={true}
        events={mockEvents}
        metrics={mockMetrics}
        onRefreshMetrics={() => {}}
      />
    );

    // Check if metrics are displayed
    expect(screen.getByText('96.5%')).toBeDefined(); // Success rate
    expect(screen.getByText('2.47 STX')).toBeDefined(); // Revenue recovered
  });
});
