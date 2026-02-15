"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.X402Nexus = exports.PaymentStatus = void 0;
const axios_1 = __importDefault(require("axios"));
// Types
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "PENDING";
    PaymentStatus["RETRYING"] = "RETRYING";
    PaymentStatus["SUBMITTED"] = "SUBMITTED";
    PaymentStatus["CONFIRMED"] = "CONFIRMED";
    PaymentStatus["FAILED"] = "FAILED";
    PaymentStatus["REFUNDED"] = "REFUNDED";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
/**
 * x402-Nexus SDK
 * Non-custodial payment reliability layer for Stacks
 */
class X402Nexus {
    apiClient;
    config;
    statusCallbacks = [];
    constructor(config) {
        this.config = {
            apiUrl: 'https://api.x402-nexus.xyz',
            network: 'testnet',
            ...config
        };
        this.apiClient = axios_1.default.create({
            baseURL: this.config.apiUrl,
            headers: {
                'X-API-Key': this.config.apiKey,
                'X-Sender-Key': this.config.senderKey,
                'Content-Type': 'application/json'
            }
        });
    }
    /**
     * Process payment with automatic retry and verification
     */
    async processPayment(request) {
        try {
            const response = await this.apiClient.post('/api/payments', request);
            return response.data;
        }
        catch (error) {
            throw this.handleError(error);
        }
    }
    /**
     * Get payment status
     */
    async getPaymentStatus(paymentId) {
        try {
            const response = await this.apiClient.get(`/api/payments/${paymentId}`);
            return response.data;
        }
        catch (error) {
            throw this.handleError(error);
        }
    }
    /**
     * Register callback for payment status updates
     */
    onPaymentStatus(callback) {
        this.statusCallbacks.push(callback);
    }
    /**
     * Process payment with polling for status updates
     */
    async processPaymentWithPolling(request, pollingInterval = 2000, maxPolls = 30) {
        const result = await this.processPayment(request);
        if (result.status === PaymentStatus.CONFIRMED || result.status === PaymentStatus.FAILED) {
            return result;
        }
        // Poll for updates
        let polls = 0;
        while (polls < maxPolls) {
            await this.sleep(pollingInterval);
            const status = await this.getPaymentStatus(result.paymentId);
            // Notify callbacks
            this.statusCallbacks.forEach(cb => cb({
                paymentId: result.paymentId,
                status: status.status,
                data: status
            }));
            if (status.status === PaymentStatus.CONFIRMED || status.status === PaymentStatus.FAILED) {
                return status;
            }
            polls++;
        }
        throw new Error('Payment status polling timeout');
    }
    /**
     * Get network metrics
     */
    async getMetrics() {
        try {
            const response = await this.apiClient.get('/api/metrics');
            return response.data;
        }
        catch (error) {
            throw this.handleError(error);
        }
    }
    /**
     * Health check
     */
    async healthCheck() {
        try {
            const response = await this.apiClient.get('/api/health');
            return response.data;
        }
        catch (error) {
            throw this.handleError(error);
        }
    }
    /**
     * Access x402 protocol protected resource
     * Automatically handles 402 Payment Required responses
     */
    async accessProtectedResource(resource) {
        try {
            // First, try to access the resource
            const response = await this.makeRequest(resource);
            return response.data;
        }
        catch (error) {
            // Check if this is a 402 Payment Required response
            if (error.response?.status === 402) {
                const challenge = error.response.data.paymentChallenge;
                logger.info('[X402 SDK] 402 Payment Required received');
                logger.info('[X402 SDK] Payment challenge:', challenge);
                // Submit payment for the challenged resource
                const payment = await this.processPaymentWithPolling({
                    amount: challenge.amountSTX,
                    recipient: challenge.recipient,
                    metadata: `x402 payment for ${challenge.resource}`
                });
                if (!payment.success || payment.status !== PaymentStatus.CONFIRMED) {
                    throw new Error('Payment failed - cannot access resource');
                }
                logger.info('[X402 SDK] Payment confirmed, retrying resource access...');
                // Retry the request with payment proof
                const retryResponse = await this.makeRequest(resource, {
                    'X-Payment-Proof': payment.txHash,
                    'X-Payment-ID': payment.paymentId,
                    'X-Payment-Nonce': challenge.nonce
                });
                return retryResponse.data;
            }
            throw this.handleError(error);
        }
    }
    /**
     * Make HTTP request (helper method)
     */
    async makeRequest(resource, additionalHeaders) {
        const method = resource.method || 'GET';
        const headers = { ...resource.headers, ...additionalHeaders };
        return await (0, axios_1.default)({
            method,
            url: resource.url,
            headers,
            data: resource.body
        });
    }
    /**
     * Access premium AI inference endpoint (x402 protected)
     */
    async accessAIInference(prompt, model = 'llama-3') {
        return await this.accessProtectedResource({
            url: `${this.config.apiUrl}/api/x402/premium/ai-inference`,
            method: 'POST',
            body: { prompt, model }
        });
    }
    /**
     * Access premium market data endpoint (x402 protected)
     */
    async accessMarketData(symbol) {
        return await this.accessProtectedResource({
            url: `${this.config.apiUrl}/api/x402/premium/market-data/${symbol}`
        });
    }
    /**
     * Access premium content (x402 protected)
     */
    async accessPremiumContent(articleId) {
        return await this.accessProtectedResource({
            url: `${this.config.apiUrl}/api/x402/content/premium-article/${articleId}`
        });
    }
    /**
     * Purchase API credits (x402 protected)
     */
    async purchaseAPICredits(credits = 100) {
        return await this.accessProtectedResource({
            url: `${this.config.apiUrl}/api/x402/credits/purchase`,
            method: 'POST',
            body: { credits }
        });
    }
    /**
     * Handle API errors
     */
    handleError(error) {
        if (error.response) {
            const message = error.response.data?.error || error.response.data?.message || 'API error';
            return new Error(`x402-Nexus API Error: ${message}`);
        }
        else if (error.request) {
            return new Error('x402-Nexus API: No response received');
        }
        else {
            return new Error(`x402-Nexus SDK Error: ${error.message}`);
        }
    }
    /**
     * Sleep utility
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
exports.X402Nexus = X402Nexus;
// Export types
__exportStar(require("@stacks/transactions"), exports);
//# sourceMappingURL=index.js.map