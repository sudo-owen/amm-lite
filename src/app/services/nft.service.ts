import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';
import { WalletService } from './wallet.service';
import { Pair721 } from '../../abi/Pair721';
import { PublicClient, WalletClient, Hash } from 'viem';

// Transaction status enum
export enum TransactionStatus {
  IDLE = 'idle',
  PENDING = 'pending',
  SUCCESS = 'success',
  ERROR = 'error'
}

// NFT transaction parameters interface
export interface NFTTransactionParams {
  pairAddress: string;
  nftIds: readonly bigint[];
  price: bigint;
}

// Transaction result interface
export interface TransactionResult {
  status: TransactionStatus;
  hash?: Hash;
  error?: Error;
  pairAddress?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NFTService {
  // Transaction status subjects
  private transactionStatus = new BehaviorSubject<TransactionStatus>(TransactionStatus.IDLE);
  private transactionStarted = new Subject<NFTTransactionParams>();
  private transactionPending = new Subject<Hash>();
  private transactionSuccess = new Subject<Hash>();
  private transactionError = new Subject<Error>();
  private transactionComplete = new Subject<TransactionResult>();

  // Current transaction data
  private currentTransaction: NFTTransactionParams | null = null;

  constructor(private walletService: WalletService) {}

  // Observable streams
  public transactionStatus$ = this.transactionStatus.asObservable();
  public transactionStarted$ = this.transactionStarted.asObservable();
  public transactionPending$ = this.transactionPending.asObservable();
  public transactionSuccess$ = this.transactionSuccess.asObservable();
  public transactionError$ = this.transactionError.asObservable();
  public transactionComplete$ = this.transactionComplete.asObservable();

  /**
   * Buy an NFT from a listing
   * @param params The NFT transaction parameters
   * @returns A promise that resolves when the transaction is complete
   */
  async buyNFT(params: NFTTransactionParams): Promise<TransactionResult> {
    try {
      // Reset transaction status
      this.transactionStatus.next(TransactionStatus.PENDING);
      this.currentTransaction = params;
      
      // Emit transaction started event
      this.transactionStarted.next(params);

      // Check if there are any NFTs available
      if (!params.nftIds.length) {
        const error = new Error('No NFTs available in this listing');
        this.handleTransactionError(error);
        return { status: TransactionStatus.ERROR, error, pairAddress: params.pairAddress };
      }

      // Get the wallet client
      const walletClient = this.walletService.getWalletClient();
      if (!walletClient) {
        const error = new Error('No wallet client available');
        this.handleTransactionError(error);
        return { status: TransactionStatus.ERROR, error, pairAddress: params.pairAddress };
      }

      // Get the wallet address
      const walletAddress = this.walletService.walletAddress();
      if (!walletAddress) {
        const error = new Error('No wallet address available');
        this.handleTransactionError(error);
        return { status: TransactionStatus.ERROR, error, pairAddress: params.pairAddress };
      }

      // Call swapTokenForSpecificNFTs on the pair contract
      const hash = await this.executeTransaction(
        walletClient,
        params.pairAddress,
        params.nftIds[0],
        params.price,
        walletAddress
      );

      // Emit transaction pending event
      this.transactionPending.next(hash);

      // Wait for the transaction to be mined
      const publicClient = this.walletService.getPublicClient();
      if (publicClient) {
        await this.waitForTransaction(publicClient, hash);
      }

      // Update wallet balance
      await this.walletService.fetchBalance();

      // Emit transaction success event
      this.transactionSuccess.next(hash);
      
      // Emit transaction complete event
      const result = { 
        status: TransactionStatus.SUCCESS, 
        hash, 
        pairAddress: params.pairAddress 
      };
      this.transactionComplete.next(result);
      this.transactionStatus.next(TransactionStatus.SUCCESS);
      
      return result;
    } catch (error) {
      this.handleTransactionError(error as Error);
      return { 
        status: TransactionStatus.ERROR, 
        error: error as Error, 
        pairAddress: params.pairAddress 
      };
    }
  }

  /**
   * Execute the NFT purchase transaction
   * @param walletClient The wallet client
   * @param pairAddress The pair address
   * @param nftId The NFT ID to purchase
   * @param price The price to pay
   * @param walletAddress The wallet address
   * @returns The transaction hash
   */
  private async executeTransaction(
    walletClient: WalletClient,
    pairAddress: string,
    nftId: bigint,
    price: bigint,
    walletAddress: string
  ): Promise<Hash> {
    return await walletClient.writeContract({
      address: pairAddress as `0x${string}`,
      abi: Pair721,
      functionName: 'swapTokenForSpecificNFTs',
      args: [
        [nftId], // Array with the NFT ID
        price, // maxExpectedTokenInput (the price)
        walletAddress as `0x${string}`, // nftRecipient (the caller)
        false, // isRouter
        '0x0000000000000000000000000000000000000000' as `0x${string}` // routerCaller
      ],
      value: price, // Send the price as the transaction value
      chain: this.walletService.getCurrentChain(),
      account: walletAddress as `0x${string}`
    });
  }

  /**
   * Wait for a transaction to be mined
   * @param publicClient The public client
   * @param hash The transaction hash
   */
  private async waitForTransaction(publicClient: PublicClient, hash: Hash): Promise<void> {
    await publicClient.waitForTransactionReceipt({ hash });
  }

  /**
   * Handle transaction errors
   * @param error The error object
   */
  private handleTransactionError(error: Error): void {
    console.error('Error in NFT transaction:', error);
    this.transactionError.next(error);
    this.transactionComplete.next({
      status: TransactionStatus.ERROR,
      error,
      pairAddress: this.currentTransaction?.pairAddress
    });
    this.transactionStatus.next(TransactionStatus.ERROR);
  }

  /**
   * Reset the transaction status
   */
  public resetTransactionStatus(): void {
    this.transactionStatus.next(TransactionStatus.IDLE);
    this.currentTransaction = null;
  }
}
