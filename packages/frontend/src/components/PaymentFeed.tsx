import { CheckCircle, AlertCircle, Loader, Clock } from 'lucide-react';
import { PaymentEvent, PaymentStatus } from '../types';
import { formatDistanceToNow } from 'date-fns';

interface PaymentFeedProps {
  events: PaymentEvent[];
}

const statusConfig = {
  [PaymentStatus.PENDING]: {
    icon: Clock,
    color: 'text-slate-400',
    bg: 'bg-slate-700',
    label: 'Pending'
  },
  [PaymentStatus.RETRYING]: {
    icon: Loader,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    label: 'Retrying'
  },
  [PaymentStatus.SUBMITTED]: {
    icon: Loader,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    label: 'Submitted'
  },
  [PaymentStatus.CONFIRMED]: {
    icon: CheckCircle,
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    label: 'Confirmed'
  },
  [PaymentStatus.FAILED]: {
    icon: AlertCircle,
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    label: 'Failed'
  },
  [PaymentStatus.REFUNDED]: {
    icon: AlertCircle,
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    label: 'Refunded'
  }
};

export default function PaymentFeed({ events }: PaymentFeedProps) {
  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700">
      <div className="p-6 border-b border-slate-700">
        <h2 className="text-xl font-bold text-white">Live Payment Stream</h2>
        <p className="text-sm text-slate-400 mt-1">Real-time payment events with retry tracking</p>
      </div>
      
      <div className="divide-y divide-slate-700 max-h-[600px] overflow-y-auto">
        {events.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No payment events yet</p>
            <p className="text-sm mt-1">Waiting for transactions...</p>
          </div>
        ) : (
          events.map((event) => {
            const config = statusConfig[event.status];
            const Icon = config.icon;

            return (
              <div
                key={`${event.paymentId}-${event.timestamp}`}
                className="p-4 hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {/* Status Icon */}
                  <div className={`p-2 rounded-lg ${config.bg}`}>
                    <Icon className={`w-5 h-5 ${config.color} ${event.status === PaymentStatus.RETRYING ? 'animate-spin' : ''}`} />
                  </div>

                  {/* Payment Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-mono text-slate-300">
                        {event.paymentId.slice(0, 8)}...
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${config.bg} ${config.color}`}>
                        {config.label}
                      </span>
                      {event.attempts && event.attempts > 1 && (
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-yellow-500/10 text-yellow-400">
                          Retry {event.attempts}/3
                        </span>
                      )}
                    </div>
                    
                    {event.amount && (
                      <p className="text-sm text-slate-400">
                        {event.amount.toFixed(2)} STX → {event.recipient?.slice(0, 10)}...
                      </p>
                    )}

                    {event.error && (
                      <p className="text-sm text-red-400 mt-1">
                        ⚠️ {event.error}
                      </p>
                    )}

                    {event.status === PaymentStatus.CONFIRMED && event.recoveredRevenue && (
                      <p className="text-sm text-green-400 mt-1">
                        ✅ Recovered {event.recoveredRevenue.toFixed(2)} STX
                      </p>
                    )}
                  </div>

                  {/* Timestamp */}
                  <div className="text-right">
                    <p className="text-xs text-slate-500">
                      {formatDistanceToNow(event.timestamp, { addSuffix: true })}
                    </p>
                    {event.processingTime && (
                      <p className="text-xs text-slate-500 mt-1">
                        {(event.processingTime / 1000).toFixed(1)}s
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
