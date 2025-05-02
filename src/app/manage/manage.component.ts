import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { WalletService } from '../services/wallet.service';
import { CHAIN_ID, ChainIdType, CONTRACT_ADDRESSES } from '../services/address';
import { Pair721 } from '../../abi/Pair721';
import { ERC721 } from '../../abi/ERC721';
import { Multicall } from '../../abi/Multicall';
import { encodeFunctionData, decodeFunctionResult } from 'viem';

// Define a type for the multicall calls
interface MulticallCall {
  target: `0x${string}`;
  callData: `0x${string}`;
}

@Component({
  selector: 'app-manage',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manage.component.html',
  styleUrl: './manage.component.css'
})
export class ManageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  walletService = inject(WalletService);

  // Route parameters
  label: string | null = null;
  address: string | null = null;

  // Chain information
  chainId: ChainIdType = CHAIN_ID.YOMINET; // Default to YOMINET

  // NFT IDs data
  nftIds = signal<readonly bigint[]>([]);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');

  // Withdrawal state
  isWithdrawing = signal<boolean>(false);
  withdrawSuccess = signal<boolean>(false);
  withdrawError = signal<string>('');
  nftContractAddress = signal<string>('');

  // Get the current chain ID from the wallet service
  get currentChainId(): ChainIdType {
    const chain = this.walletService.getCurrentChain();
    if (!chain) return CHAIN_ID.YOMINET; // Default to YOMINET if no chain is available

    // Map the chain ID to our CHAIN_ID constants
    switch (chain.id) {
      case parseInt('0x18623A6A54F3F', 16): // Yominet chain ID
        return CHAIN_ID.YOMINET;
      case parseInt('0x4be439dcd8b3f', 16): // Zaar chain ID
        return CHAIN_ID.ZAAR;
      default:
        return CHAIN_ID.YOMINET; // Default to YOMINET for unknown chains
    }
  }

  ngOnInit(): void {
    // Subscribe to route params to get label and address
    this.route.paramMap.subscribe(params => {
      this.label = params.get('label');
      this.address = params.get('address');

      // Set the chain ID based on the label
      if (this.label) {
        this.setChainIdFromLabel(this.label);
      }
    });

    // If wallet is already connected, fetch the NFT IDs
    if (this.walletService.isConnected()) {
      this.walletService.fetchBalance();

      // If we have an address from the route, fetch the NFT IDs
      if (this.address) {
        this.fetchNFTIds(this.address);
      }
    }
  }

  /**
   * Set the chain ID based on the label
   */
  private setChainIdFromLabel(label: string): void {
    // Convert label to lowercase for case-insensitive comparison
    const labelLower = label.toLowerCase();

    if (labelLower === 'yominet') {
      this.chainId = CHAIN_ID.YOMINET;
    } else if (labelLower === 'zaar') {
      this.chainId = CHAIN_ID.ZAAR;
    } else {
      // Default to YOMINET if label is not recognized
      this.chainId = CHAIN_ID.YOMINET;
      console.warn(`Unrecognized chain label: ${label}, defaulting to YOMINET`);
    }
  }

  /**
   * Connect wallet using the wallet service
   */
  async connectWallet(): Promise<void> {
    await this.walletService.connectWallet();

    // If we have an address from the route, fetch the NFT IDs
    if (this.address) {
      await this.fetchNFTIds(this.address);
    }
  }

  /**
   * Disconnect wallet using the wallet service
   */
  async disconnectWallet(): Promise<void> {
    await this.walletService.disconnectWallet();
  }

  /**
   * Refresh wallet balance
   */
  async refreshBalance(): Promise<void> {
    await this.walletService.fetchBalance();
  }

  /**
   * Fetch NFT IDs for the pair address
   * @param pairAddress The address of the pair
   */
  async fetchNFTIds(pairAddress: string): Promise<void> {
    try {
      this.isLoading.set(true);
      this.errorMessage.set('');
      this.withdrawSuccess.set(false);
      this.withdrawError.set('');

      const publicClient = this.walletService.getPublicClient();
      if (!publicClient) {
        this.errorMessage.set('No public client available');
        this.isLoading.set(false);
        return;
      }

      // Get the Multicall contract address for the current chain
      const multicallAddress = CONTRACT_ADDRESSES[this.currentChainId].MULTICALL as `0x${string}`;

      console.log('Fetching NFT IDs for pair:', {
        pairAddress,
        multicallAddress
      });

      // Prepare the calls for Multicall to get getAllIds and nft address
      const calls: MulticallCall[] = [
        {
          target: pairAddress as `0x${string}`,
          callData: encodeFunctionData({
            abi: Pair721,
            functionName: 'getAllIds'
          })
        },
        {
          target: pairAddress as `0x${string}`,
          callData: encodeFunctionData({
            abi: Pair721,
            functionName: 'nft'
          })
        }
      ];

      // Execute the Multicall
      const result = await publicClient.readContract({
        address: multicallAddress,
        abi: Multicall,
        functionName: 'aggregate' as any,
        args: [calls as any]
      }) as unknown;

      // Extract the return data from the result
      const [, returnData] = result as [bigint, `0x${string}`[]];

      // Decode the getAllIds result
      const ids = decodeFunctionResult({
        abi: Pair721,
        functionName: 'getAllIds',
        data: returnData[0]
      });

      // Decode the nft address result
      const nftAddress = decodeFunctionResult({
        abi: Pair721,
        functionName: 'nft',
        data: returnData[1]
      });

      console.log('NFT IDs for pair:', ids);
      console.log('NFT contract address:', nftAddress);

      // Update the signals
      this.nftIds.set(ids);
      this.nftContractAddress.set(nftAddress as string);
    } catch (error) {
      console.error('Error fetching NFT IDs for pair:', error);
      this.errorMessage.set('Error fetching NFT IDs. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Withdraw all NFTs from the pair
   */
  async withdrawAllNFTs(): Promise<void> {
    if (!this.address || this.nftIds().length === 0) {
      this.withdrawError.set('No NFTs to withdraw');
      return;
    }

    try {
      this.isWithdrawing.set(true);
      this.withdrawSuccess.set(false);
      this.withdrawError.set('');

      const walletClient = this.walletService.getWalletClient();
      if (!walletClient) {
        this.withdrawError.set('No wallet client available');
        this.isWithdrawing.set(false);
        return;
      }

      const walletAddress = this.walletService.walletAddress();
      if (!walletAddress) {
        this.withdrawError.set('Wallet not connected');
        this.isWithdrawing.set(false);
        return;
      }

      console.log('Withdrawing all NFTs:', {
        pairAddress: this.address,
        nftAddress: this.nftContractAddress(),
        nftIds: this.nftIds(),
        walletAddress
      });

      // Call withdrawERC721 on the pair contract
      const hash = await walletClient.writeContract({
        address: this.address as `0x${string}`,
        abi: Pair721,
        functionName: 'withdrawERC721',
        args: [
          this.nftContractAddress() as `0x${string}`,
          [...this.nftIds()] // Convert readonly array to regular array
        ],
        chain: this.walletService.getCurrentChain(),
        account: walletAddress as `0x${string}`
      });

      console.log('Withdrawal transaction hash:', hash);

      // Wait for the transaction to be mined
      const publicClient = this.walletService.getPublicClient();
      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash });
      }

      // Set success state
      this.withdrawSuccess.set(true);

      // Refresh the NFT IDs after withdrawal
      await this.fetchNFTIds(this.address);
    } catch (error) {
      console.error('Error withdrawing NFTs:', error);
      this.withdrawError.set('Error withdrawing NFTs. Please try again.');
    } finally {
      this.isWithdrawing.set(false);
    }
  }

  /**
   * Get the current token symbol from the wallet service
   * @returns The token symbol for the current chain
   */
  getTokenSymbol(): string {
    const chain = this.walletService.getCurrentChain();
    if (!chain) return 'ETH'; // Default to ETH if no chain is available

    return chain.nativeCurrency.symbol;
  }
}
