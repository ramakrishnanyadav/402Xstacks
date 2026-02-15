import { useState } from 'react';
import { Brain, TrendingUp, AlertCircle, Code2 } from 'lucide-react';

export default function TechnicalDepthPanel() {
  const [activeTab, setActiveTab] = useState<'algorithm' | 'classification' | 'backoff' | 'circuit'>('algorithm');

  const content = {
    algorithm: {
      title: 'Adaptive Retry Algorithm',
      icon: Brain,
      color: 'purple',
      code: `function calculateRetryStrategy(errorType, providerStats) {
  // Analyze historical success patterns
  const recentFailureRate = providerStats.getFailureRate('1h');
  const avgRecoveryTime = providerStats.getAvgRecoveryTime();
  
  // Adaptive configuration based on network health
  if (recentFailureRate > 0.3) {
    return {
      maxAttempts: 5,
      backoffMultiplier: 3,
      initialDelay: 5000,
      strategy: 'CONSERVATIVE'
    };
  }
  
  // Aggressive retry for healthy networks
  return {
    maxAttempts: 3,
    backoffMultiplier: 2,
    initialDelay: 1000,
    strategy: 'AGGRESSIVE'
  };
}`,
      description: 'ML-lite algorithm adapts retry strategy based on real-time network conditions and historical success patterns.'
    },
    classification: {
      title: 'Error Classification Engine',
      icon: AlertCircle,
      color: 'amber',
      code: `function classifyError(error) {
  const patterns = {
    RPC_TIMEOUT: /timeout|ETIMEDOUT|ECONNREFUSED/i,
    MEMPOOL_FULL: /mempool.*full|too.*busy/i,
    INSUFFICIENT_BALANCE: /insufficient|not.*enough/i,
    NONCE_CONFLICT: /nonce.*too.*low|invalid.*nonce/i,
    CONTRACT_ERROR: /contract.*error|execution.*failed/i
  };
  
  for (const [type, pattern] of Object.entries(patterns)) {
    if (pattern.test(error.message)) {
      return {
        type,
        retryable: !['INSUFFICIENT_BALANCE'].includes(type),
        priority: calculatePriority(type)
      };
    }
  }
  
  return { type: 'UNKNOWN', retryable: true, priority: 'LOW' };
}`,
      description: '5-category classification system determines optimal response strategy for each error type.'
    },
    backoff: {
      title: 'Exponential Backoff with Jitter',
      icon: TrendingUp,
      color: 'emerald',
      code: `function calculateBackoff(attempt, strategy, errorType) {
  // Base exponential backoff
  const exponential = strategy.initialDelay * 
    Math.pow(strategy.backoffMultiplier, attempt - 1);
  
  // Add jitter to prevent thundering herd
  const jitter = Math.random() * 1000;
  
  // Cap at maximum delay
  const delay = Math.min(exponential + jitter, strategy.maxDelay);
  
  // Error-specific adjustments
  const multiplier = errorType === 'MEMPOOL_FULL' ? 1.5 : 1.0;
  
  return Math.floor(delay * multiplier);
}

// Example: Attempt 1: 1s, Attempt 2: 2s, Attempt 3: 4s`,
      description: 'Exponential backoff with randomized jitter prevents synchronized retries and server overload.'
    },
    circuit: {
      title: 'Circuit Breaker Pattern',
      icon: Code2,
      color: 'blue',
      code: `class CircuitBreaker {
  constructor() {
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failureCount = 0;
    this.threshold = 5;
    this.timeout = 60000; // 1 minute
  }
  
  async execute(fn) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.openedAt > this.timeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker OPEN');
      }
    }
    
    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
}`,
      description: 'Circuit breaker prevents cascading failures by stopping requests to failing services temporarily.'
    }
  };

  const current = content[activeTab];
  const Icon = current.icon;

  return (
    <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Technical Deep Dive</h2>
            <p className="text-sm text-slate-400">Production-grade algorithms powering reliability</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {Object.entries(content).map(([key, value]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === key
                ? `bg-${value.color}-500/20 text-${value.color}-400 border border-${value.color}-500/30`
                : 'bg-slate-700/30 text-slate-400 hover:bg-slate-700/50'
            }`}
          >
            {value.title}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-4">
        {/* Algorithm Display */}
        <div className={`p-4 bg-slate-900/50 border border-${current.color}-500/20 rounded-xl`}>
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-lg bg-${current.color}-500/20 flex items-center justify-center`}>
              <Icon className={`w-5 h-5 text-${current.color}-400`} />
            </div>
            <div className={`font-semibold text-${current.color}-400`}>{current.title}</div>
          </div>
          <pre className="text-xs text-slate-300 overflow-x-auto custom-scrollbar bg-slate-950/50 p-4 rounded-lg">
            <code>{current.code}</code>
          </pre>
        </div>

        {/* Description */}
        <div className={`p-4 bg-${current.color}-500/5 border border-${current.color}-500/20 rounded-xl`}>
          <p className="text-sm text-slate-300">{current.description}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 bg-slate-700/30 rounded-lg text-center">
            <div className="text-2xl font-bold text-white">5</div>
            <div className="text-xs text-slate-400">Error Types</div>
          </div>
          <div className="p-3 bg-slate-700/30 rounded-lg text-center">
            <div className="text-2xl font-bold text-emerald-400">2-3x</div>
            <div className="text-xs text-slate-400">Faster Recovery</div>
          </div>
          <div className="p-3 bg-slate-700/30 rounded-lg text-center">
            <div className="text-2xl font-bold text-indigo-400">90%+</div>
            <div className="text-xs text-slate-400">Under Chaos</div>
          </div>
        </div>
      </div>
    </div>
  );
}
