import {
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  stringAsciiCV,
  bufferCV,
  uintCV,
  principalCV,
  callReadOnlyFunction,
  cvToJSON,
  TxBroadcastResult
} from '@stacks/transactions';
import { StacksTestnet, StacksMainnet } from '@stacks/network';
import { logger } from '../utils/logger';

/**
 * Blockchain client for interacting with Stacks
 */
export class BlockchainClient {
  private network: StacksTestnet | StacksMainnet;
  private contractAddress: string;
  private contractName: string;

  constructor() {
    const isTestnet = process.env.STACKS_NETWORK === 'testnet';
    this.network = isTestnet ? new StacksTestnet() : new StacksMainnet();
    
    this.contractAddress = process.env.CONTRACT_ADDRESS || '';
    this.contractName = process.env.CONTRACT_NAME || 'x402-nexus-escrow';

    logger.info(`[BlockchainClient] Initialized on ${isTestnet ? 'testnet' : 'mainnet'}`);
  }

  /**
   * Create escrow payment on-chain
   */
  async createEscrowPayment(
    paymentId: Buffer,
    recipient: string,
    amount: number,
    metadata: string,
    senderKey: string
  ): Promise<TxBroadcastResult> {
    try {
      const txOptions = {
        contractAddress: this.contractAddress,
        contractName: this.contractName,
        functionName: 'create-payment',
        functionArgs: [
          bufferCV(paymentId),
          principalCV(recipient),
          uintCV(amount),
          stringAsciiCV(metadata)
        ],
        senderKey,
        validateWithAbi: false,
        network: this.network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow
      };

      const transaction = await makeContractCall(txOptions);
      const result = await broadcastTransaction(transaction, this.network);

      logger.info(`[BlockchainClient] Created escrow payment:`, result);
      return result;

    } catch (error: any) {
      logger.error(`[BlockchainClient] Error creating escrow payment:`, error);
      throw error;
    }
  }

  /**
   * Claim payment (merchant side)
   */
  async claimPayment(
    paymentId: Buffer,
    recipientKey: string
  ): Promise<TxBroadcastResult> {
    try {
      const txOptions = {
        contractAddress: this.contractAddress,
        contractName: this.contractName,
        functionName: 'claim-payment',
        functionArgs: [bufferCV(paymentId)],
        senderKey: recipientKey,
        validateWithAbi: false,
        network: this.network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow
      };

      const transaction = await makeContractCall(txOptions);
      const result = await broadcastTransaction(transaction, this.network);

      logger.info(`[BlockchainClient] Claimed payment:`, result);
      return result;

    } catch (error: any) {
      logger.error(`[BlockchainClient] Error claiming payment:`, error);
      throw error;
    }
  }

  /**
   * Refund expired payment
   */
  async refundExpired(
    paymentId: Buffer,
    senderKey: string
  ): Promise<TxBroadcastResult> {
    try {
      const txOptions = {
        contractAddress: this.contractAddress,
        contractName: this.contractName,
        functionName: 'refund-expired',
        functionArgs: [bufferCV(paymentId)],
        senderKey,
        validateWithAbi: false,
        network: this.network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow
      };

      const transaction = await makeContractCall(txOptions);
      const result = await broadcastTransaction(transaction, this.network);

      logger.info(`[BlockchainClient] Refunded expired payment:`, result);
      return result;

    } catch (error: any) {
      logger.error(`[BlockchainClient] Error refunding payment:`, error);
      throw error;
    }
  }

  /**
   * Get payment details from contract (read-only)
   */
  async getPayment(paymentId: Buffer): Promise<any> {
    try {
      const result = await callReadOnlyFunction({
        contractAddress: this.contractAddress,
        contractName: this.contractName,
        functionName: 'get-payment',
        functionArgs: [bufferCV(paymentId)],
        network: this.network,
        senderAddress: this.contractAddress
      });

      return cvToJSON(result);

    } catch (error: any) {
      logger.error(`[BlockchainClient] Error getting payment:`, error);
      throw error;
    }
  }

  /**
   * Get payment status from contract (read-only)
   */
  async getPaymentStatus(paymentId: Buffer): Promise<any> {
    try {
      const result = await callReadOnlyFunction({
        contractAddress: this.contractAddress,
        contractName: this.contractName,
        functionName: 'get-payment-status',
        functionArgs: [bufferCV(paymentId)],
        network: this.network,
        senderAddress: this.contractAddress
      });

      return cvToJSON(result);

    } catch (error: any) {
      logger.error(`[BlockchainClient] Error getting payment status:`, error);
      throw error;
    }
  }

  /**
   * Get contract statistics (read-only)
   */
  async getContractStats(): Promise<any> {
    try {
      const result = await callReadOnlyFunction({
        contractAddress: this.contractAddress,
        contractName: this.contractName,
        functionName: 'get-stats',
        functionArgs: [],
        network: this.network,
        senderAddress: this.contractAddress
      });

      return cvToJSON(result);

    } catch (error: any) {
      logger.error(`[BlockchainClient] Error getting stats:`, error);
      throw error;
    }
  }

  /**
   * Check if payment can be refunded (read-only)
   */
  async canRefund(paymentId: Buffer): Promise<boolean> {
    try {
      const result = await callReadOnlyFunction({
        contractAddress: this.contractAddress,
        contractName: this.contractName,
        functionName: 'can-refund',
        functionArgs: [bufferCV(paymentId)],
        network: this.network,
        senderAddress: this.contractAddress
      });

      const json = cvToJSON(result);
      return json.value === true;

    } catch (error: any) {
      logger.error(`[BlockchainClient] Error checking refund status:`, error);
      return false;
    }
  }

  /**
   * Get network info
   */
  getNetworkInfo() {
    return {
      network: this.network instanceof StacksTestnet ? 'testnet' : 'mainnet',
      contractAddress: this.contractAddress,
      contractName: this.contractName
    };
  }
}
