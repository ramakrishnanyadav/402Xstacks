import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import ProfessionalHero from './components/ProfessionalHero';
import UltimateDashboard from './components/UltimateDashboard';
import EnhancedComparison from './components/EnhancedComparison';
import EnhancedX402Demo from './components/EnhancedX402Demo';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PaymentEvent, Metrics, PaymentStatus } from './types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function App() {
  const [showHero, setShowHero] = useState(true);
  const [activeView, setActiveView] = useState<'dashboard' | 'comparison' | 'x402demo'>('dashboard');
  const [, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [events, setEvents] = useState<PaymentEvent[]>([]);
  const [metrics, setMetrics] = useState<Metrics>({
    successRate: 0,
    avgProcessingTime: 0,
    revenueRecovered: 0,
    totalPayments: 0,
    activePayments: 0,
    failedPayments: 0,
    totalSubmitted: 0,
    totalConfirmed: 0,
    totalFailed: 0
  });

  useEffect(() => {
    console.log('🔌 Attempting to connect to WebSocket at:', API_URL);
    
    // Connect to WebSocket
    const newSocket = io(API_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10
    });
    
    newSocket.on('connect', () => {
      console.log('✅ Connected to WebSocket!', newSocket.id);
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected from WebSocket');
      setConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('🔥 WebSocket connection error:', error);
    });

    // Listen for payment events
    newSocket.on('payment:created', (data: PaymentEvent) => {
      console.log('Payment created:', data);
      setEvents(prev => [{ ...data, status: PaymentStatus.PENDING }, ...prev].slice(0, 50));
    });

    newSocket.on('payment:retrying', (data: PaymentEvent) => {
      console.log('Payment retrying:', data);
      setEvents(prev => 
        prev.map(event => 
          event.paymentId === data.paymentId 
            ? { ...event, status: PaymentStatus.RETRYING, attempts: data.attempts }
            : event
        )
      );
    });

    newSocket.on('payment:confirmed', (data: PaymentEvent) => {
      console.log('Payment confirmed:', data);
      setEvents(prev => 
        prev.map(event => 
          event.paymentId === data.paymentId 
            ? { ...event, status: PaymentStatus.CONFIRMED, txHash: data.txHash }
            : event
        )
      );
      fetchMetrics();
    });

    newSocket.on('payment:failed', (data: PaymentEvent) => {
      console.log('Payment failed:', data);
      setEvents(prev => 
        prev.map(event => 
          event.paymentId === data.paymentId 
            ? { ...event, status: PaymentStatus.FAILED, error: data.error }
            : event
        )
      );
      fetchMetrics();
    });

    setSocket(newSocket);

    // Fetch initial metrics
    fetchMetrics();

    return () => {
      newSocket.close();
    };
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await fetch(`${API_URL}/api/metrics`);
      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };

  if (showHero) {
    return <ProfessionalHero onEnter={() => setShowHero(false)} />;
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Navigation */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 px-6 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/50">
                <span className="text-white font-bold text-lg">X</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">x402-Nexus</h1>
                <p className="text-xs text-slate-400">Payment Reliability Layer</p>
              </div>
            </div>

            <nav className="flex gap-2">
              <button 
                onClick={() => setActiveView('dashboard')} 
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeView === 'dashboard' 
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30' 
                    : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 border border-slate-600/50'
                }`}
              >
                Dashboard
              </button>
              <button 
                onClick={() => setActiveView('comparison')} 
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeView === 'comparison' 
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30' 
                    : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 border border-slate-600/50'
                }`}
              >
                Comparison
              </button>
              <button 
                onClick={() => setActiveView('x402demo')} 
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeView === 'x402demo' 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30' 
                    : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 border border-slate-600/50'
                }`}
              >
                🔒 x402 Protocol
              </button>
            </nav>
          </div>

          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
            connected 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400 animate-pulse'
          }`}>
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400' : 'bg-rose-400'} animate-pulse`} />
            <span className="text-xs font-medium">{connected ? 'Live Connection' : 'Connecting...'}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div>
        <ErrorBoundary>
          {activeView === 'dashboard' && (
            <UltimateDashboard 
              connected={connected}
              events={events}
              metrics={metrics}
            />
          )}
          {activeView === 'comparison' && <EnhancedComparison />}
          {activeView === 'x402demo' && <EnhancedX402Demo />}
        </ErrorBoundary>
      </div>
    </div>
  );
}

export default App;
