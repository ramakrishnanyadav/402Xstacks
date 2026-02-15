import { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, RefreshCw, ExternalLink } from 'lucide-react';
import { PaymentEvent, PaymentStatus } from '../types';
import { formatDistanceToNow } from 'date-fns';

interface EnhancedPaymentFeedProps {
  events: PaymentEvent[];
}

export default function EnhancedPaymentFeed({ events }: EnhancedPaymentFeedProps) {
  const [filter, setFilter] = useState<'all' | PaymentStatus>('all');
  const [animatingIds, setAnimatingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Animate new events
    if (events.length > 0) {
      const latestId = events[0].paymentId;
      setAnimatingIds(prev => new Set([...prev, latestId]));
      
      setTimeout(() => {
        setAnimatingIds(prev => {
          const next = new Set(prev);
          next.delete(latestId);
          return next;
        });
      }, 1000);
    }
  }, [events]);

  const filteredEvents = filter === 'all' 
    ? events 
    : events.filter(e => e.status === filter);

  const getStatusConfig = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.CONFIRMED:
        return {
          icon: CheckCircle,
          color: 'text-emerald-400',
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/30',
          label: 'Confirmed',
          dot: 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]',
        };
      case PaymentStatus.FAILED:
        return {
          icon: XCircle,
          color: 'text-rose-400',
          bg: 'bg-rose-500/10',
          border: 'border-rose-500/30',
          label: 'Failed',
          dot: 'bg-rose-400 shadow-[0_0_10px_rgba(251,113,133,0.5)]',
        };
      case PaymentStatus.RETRYING:
        return {
          icon: RefreshCw,
          color: 'text-amber-400',
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/30',
          label: 'Retrying',
          dot: 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)] animate-pulse',
        };
      default:
        return {
          icon: Clock,
          color: 'text-blue-400',
          bg: 'bg-blue-500/10',
          border: 'border-blue-500/30',
          label: 'Pending',
          dot: 'bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.5)] animate-pulse',
        };
    }
  };

  const filterButtons = [
    { value: 'all', label: 'All', count: events.length },
    { value: PaymentStatus.CONFIRMED, label: 'Confirmed', count: events.filter(e => e.status === PaymentStatus.CONFIRMED).length },
    { value: PaymentStatus.RETRYING, label: 'Retrying', count: events.filter(e => e.status === PaymentStatus.RETRYING).length },
    { value: PaymentStatus.FAILED, label: 'Failed', count: events.filter(e => e.status === PaymentStatus.FAILED).length },
  ];

  return (
    <div className="premium-card p-6 animate-slide-up" style={{ animationDelay: '400ms' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Live Payment Feed</h2>
          <p className="text-slate-400 text-sm">Real-time payment processing activity</p>
        </div>
        
        {/* Filter Pills */}
        <div className="flex gap-2">
          {filterButtons.map(btn => (
            <button
              key={btn.value}
              onClick={() => setFilter(btn.value as any)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all interactive-hover ${
                filter === btn.value
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30'
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 border border-slate-600/50'
              }`}
            >
              {btn.label}
              <span className="ml-2 px-2 py-0.5 rounded-full bg-white/10 text-xs">
                {btn.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Feed List */}
      <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800/50 flex items-center justify-center">
              <Clock className="w-8 h-8 text-slate-600" />
            </div>
            <p className="text-slate-400 font-medium">No payments found</p>
            <p className="text-slate-500 text-sm mt-1">Payments will appear here in real-time</p>
          </div>
        ) : (
          filteredEvents.map((event, idx) => {
            const config = getStatusConfig(event.status);
            const StatusIcon = config.icon;
            const isAnimating = animatingIds.has(event.paymentId);

            return (
              <div
                key={event.paymentId}
                className={`group relative bg-slate-800/30 border ${config.border} rounded-xl p-4 hover:bg-slate-800/50 transition-all duration-300 ${
                  isAnimating ? 'animate-scale-in shadow-glow-md' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Status Indicator */}
                  <div className={`flex-shrink-0 w-12 h-12 rounded-xl ${config.bg} border ${config.border} flex items-center justify-center transition-transform group-hover:scale-110`}>
                    <StatusIcon className={`w-6 h-6 ${config.color} ${event.status === PaymentStatus.RETRYING ? 'animate-spin' : ''}`} />
                  </div>

                  {/* Payment Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-mono text-white font-semibold">
                        {event.paymentId.slice(0, 8)}...{event.paymentId.slice(-6)}
                      </span>
                      <div className={`w-2 h-2 rounded-full ${config.dot}`} />
                      <span className={`text-xs font-semibold ${config.color} px-2 py-1 rounded-full ${config.bg}`}>
                        {config.label}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      <span className="font-semibold text-indigo-400">
                        {event.amount} STX
                      </span>
                      {event.attempts > 0 && (
                        <span className="text-amber-400">
                          Attempt {event.attempts}
                        </span>
                      )}
                      <span className="text-slate-500">
                        {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                      </span>
                    </div>

                    {/* Transaction Hash */}
                    {event.txHash && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs text-slate-500">TX:</span>
                        <a
                          href={`https://explorer.stacks.co/txid/${event.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 group/link"
                        >
                          {event.txHash.slice(0, 12)}...{event.txHash.slice(-8)}
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                        </a>
                      </div>
                    )}

                    {/* Error Message */}
                    {event.error && (
                      <p className="mt-2 text-xs text-rose-400 bg-rose-500/10 px-2 py-1 rounded">
                        {event.error}
                      </p>
                    )}
                  </div>

                  {/* Amount Badge */}
                  <div className="flex-shrink-0 text-right">
                    <div className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border border-indigo-500/20">
                      <div className="text-2xl font-bold text-white">
                        {event.amount}
                      </div>
                      <div className="text-xs text-slate-400 font-medium">STX</div>
                    </div>
                  </div>
                </div>

                {/* Hover Effect Line */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
