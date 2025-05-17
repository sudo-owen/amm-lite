import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { WalletService } from '../services/wallet.service';
import { NFTService, TransactionStatus } from '../services/nft.service';
import { CHAIN_ID, ChainIdType, CONTRACT_ADDRESSES } from '../services/address';
import { Pair721 } from '../../abi/Pair721';
import { Multicall } from '../../abi/Multicall';
import { ERC721 } from '../../abi/ERC721';
import { encodeFunctionData, decodeFunctionResult, formatEther } from 'viem';

// Define a type for the multicall calls
interface MulticallCall {
  target: `0x${string}`;
  callData: `0x${string}`;
}

// Define a type for NFT attributes
interface NFTAttribute {
  trait_type: string;
  value: string | number;
}

// Define a type for NFT metadata
interface NFTMetadata {
  name: string;
  image: string;
  attributes: NFTAttribute[];
}

// Define a type for the NFT data with price and metadata
interface NFTData {
  id: bigint;
  price: bigint;
  isBuying?: boolean;
  metadata?: NFTMetadata;
  isLoadingMetadata?: boolean;
  metadataError?: string;
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
  nftService = inject(NFTService);

  // Route parameters
  label: string | null = null;
  address: string | null = null;

  // Chain information
  chainId: ChainIdType = CHAIN_ID.YOMINET; // Default to YOMINET

  // NFT IDs data
  nftIds = signal<readonly bigint[]>([]);
  nftDataList = signal<NFTData[]>([]);
  selectedNftId = signal<bigint | null>(null);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');

  // Withdrawal state
  isWithdrawing = signal<boolean>(false);
  withdrawSuccess = signal<boolean>(false);
  withdrawError = signal<string>('');
  nftContractAddress = signal<string>('');
  isPoolOwner = signal<boolean>(false);

  // Buy state
  nftPrice = signal<bigint>(0n);
  isBuying = signal<boolean>(false);
  buySuccess = signal<boolean>(false);
  buyError = signal<string>('');

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

      // Prepare the calls for Multicall to get getAllIds, nft address, owner, and price quote
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
        },
        {
          target: pairAddress as `0x${string}`,
          callData: encodeFunctionData({
            abi: Pair721,
            functionName: 'getBuyNFTQuote',
            args: [0n, 1n] // id=0, quantity=1
          })
        },
        {
          target: pairAddress as `0x${string}`,
          callData: encodeFunctionData({
            abi: Pair721,
            functionName: 'owner'
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

      // Decode the getBuyNFTQuote result
      const quoteResult = decodeFunctionResult({
        abi: Pair721,
        functionName: 'getBuyNFTQuote',
        data: returnData[2]
      }) as [number, bigint, bigint, bigint, bigint, bigint]; // [error, newSpotPrice, newDelta, inputAmount, protocolFee, royaltyAmount]

      // Decode the owner result
      const ownerAddress = decodeFunctionResult({
        abi: Pair721,
        functionName: 'owner',
        data: returnData[3]
      }) as string;

      // Extract the inputAmount (index 3 in the result array)
      const inputAmount = quoteResult[3];

      console.log('NFT IDs for pair:', ids);
      console.log('NFT contract address:', nftAddress);
      console.log('Buy NFT price quote:', inputAmount);
      console.log('Pool owner address:', ownerAddress);

      // Check if the current wallet address is the pool owner
      const walletAddress = this.walletService.walletAddress()!;
      const isOwner = walletAddress.toLowerCase() === ownerAddress.toLowerCase();

      // Update the signals
      this.nftIds.set(ids);
      this.nftContractAddress.set(nftAddress as string);
      this.nftPrice.set(inputAmount);
      this.isPoolOwner.set(isOwner);

      // Set the selected NFT ID to the first ID if available
      if (ids.length > 0) {
        this.selectedNftId.set(ids[0]);
      } else {
        this.selectedNftId.set(null);
      }

      // Create NFT data list with initial data
      const nftDataList = ids.map(id => ({
        id,
        price: inputAmount,
        isLoadingMetadata: false,
        metadata: undefined,
        metadataError: undefined
      }));

      this.nftDataList.set(nftDataList);

      // Fetch metadata for all NFTs
      if (ids.length > 0) {
        await this.fetchNFTMetadata(nftAddress as string, nftDataList);
      }
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

  /**
   * Format a bigint price to a human-readable string with limited decimal places
   * @param price The price as a bigint
   * @returns Formatted price string
   */
  formatPrice(price: bigint): string {
    try {
      // Convert the bigint to a string with 18 decimal places (ETH format)
      const ethPrice = formatEther(price);

      // Parse the string to a number and limit to 6 decimal places
      const numPrice = parseFloat(ethPrice);

      // Format the number based on its size
      if (numPrice < 0.000001 && numPrice > 0) {
        // For very small numbers, use scientific notation
        return numPrice.toExponential(2);
      } else if (numPrice < 0.001) {
        // For small numbers, show more decimal places
        return numPrice.toFixed(6);
      } else if (numPrice < 1) {
        // For medium numbers, show fewer decimal places
        return numPrice.toFixed(4);
      } else {
        // For larger numbers, show even fewer decimal places
        return numPrice.toFixed(2);
      }
    } catch (error) {
      console.error('Error formatting price:', error);
      return '0.00';
    }
  }

  /**
   * Buy an NFT from the pair
   * @param nftId Optional NFT ID to buy. If not provided, uses the selected NFT ID.
   */
  async buyNFT(nftId?: bigint): Promise<void> {
    if (!this.address || this.nftIds().length === 0) {
      this.buyError.set('No NFTs available to buy');
      return;
    }

    // Use the provided NFT ID or the selected one
    const selectedId = nftId || this.selectedNftId();
    if (selectedId === null) {
      this.buyError.set('No NFT ID selected to buy');
      return;
    }

    // Set the selected NFT ID to track which one is being purchased
    this.selectedNftId.set(selectedId);

    try {
      this.isBuying.set(true);
      this.buySuccess.set(false);
      this.buyError.set('');

      // Subscribe to transaction events
      const statusSubscription = this.nftService.transactionStatus$.subscribe(status => {
        console.log('Transaction status:', status);
      });

      // Call the NFT service to buy the NFT
      const result = await this.nftService.buyNFT({
        pairAddress: this.address,
        nftIds: [selectedId],
        price: this.nftPrice()
      });

      // Unsubscribe from the status updates
      statusSubscription.unsubscribe();

      // If the transaction was successful, refresh the NFT IDs
      if (result.status === TransactionStatus.SUCCESS && this.address) {
        this.buySuccess.set(true);
        await this.fetchNFTIds(this.address);
      }
    } catch (error) {
      console.error('Error buying NFT:', error);
      this.buyError.set('Error buying NFT. Please try again.');
    } finally {
      this.isBuying.set(false);

      // Reset the transaction status in the service
      this.nftService.resetTransactionStatus();
    }
  }

  /**
   * Fetch metadata for all NFTs in the pool
   * @param nftAddress The NFT contract address
   * @param nftDataList The list of NFT data objects
   */
  async fetchNFTMetadata(nftAddress: string, nftDataList: NFTData[]): Promise<void> {
    try {
      console.log('Fetching metadata for NFTs:', {
        nftAddress,
        nftCount: nftDataList.length
      });

      // Process NFTs sequentially to avoid rate limiting
      for (let i = 0; i < nftDataList.length; i++) {
        const nftData = nftDataList[i];

        // Update loading state
        nftData.isLoadingMetadata = true;
        this.nftDataList.update(currentList => {
          const newList = [...currentList];
          newList[i] = { ...nftData };
          return newList;
        });

        try {
          // Fetch tokenURI for this NFT
          const metadata = await this.fetchTokenURI(nftAddress, nftData.id);

          // Update the NFT data with metadata
          nftData.metadata = metadata;
          nftData.isLoadingMetadata = false;

          this.nftDataList.update(currentList => {
            const newList = [...currentList];
            newList[i] = { ...nftData };
            return newList;
          });

          console.log(`Fetched metadata for NFT ID ${nftData.id}:`, metadata);
        } catch (error) {
          console.error(`Error fetching metadata for NFT ID ${nftData.id}:`, error);

          // Update error state
          nftData.isLoadingMetadata = false;
          nftData.metadataError = 'Failed to load metadata';

          this.nftDataList.update(currentList => {
            const newList = [...currentList];
            newList[i] = { ...nftData };
            return newList;
          });
        }

        // Add a small delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error('Error fetching NFT metadata:', error);
    }
  }

  /**
   * Fetch tokenURI for a single NFT
   * @param nftAddress The NFT contract address
   * @param tokenId The token ID
   * @returns The parsed metadata
   */
  async fetchTokenURI(nftAddress: string, tokenId: bigint): Promise<NFTMetadata> {
    const publicClient = this.walletService.getPublicClient();
    if (!publicClient) {
      throw new Error('No public client available');
    }

    // Call tokenURI on the NFT contract
    const tokenURI = await publicClient.readContract({
      address: nftAddress as `0x${string}`,
      abi: ERC721,
      functionName: 'tokenURI',
      args: [tokenId]
    }) as string;

    // Parse the metadata
    return this.parseBase64Metadata(tokenURI);
  }

  /**
   * Parse base64 encoded metadata from tokenURI
   * @param tokenURI The token URI string
   * @returns Parsed metadata object
   */
  private parseBase64Metadata(tokenURI: string): NFTMetadata {
    try {
      // Check if this is base64 encoded data
      if (tokenURI.startsWith('data:application/json;base64,')) {
        // Extract the base64 encoded part
        const base64Data = tokenURI.replace('data:application/json;base64,', '');

        // Decode the base64 data
        const jsonString = atob(base64Data);

        // Parse the JSON
        return JSON.parse(jsonString);
      }
      // If it's a URL, we would need to fetch it, but for now we'll return a placeholder
      else {
        console.log('Non-base64 tokenURI detected:', tokenURI);
        return {
          name: `Token #${tokenURI}`,
          image: '',
          attributes: []
        };
      }
    } catch (error) {
      console.error('Error parsing metadata:', error);
      return {
        name: 'Error parsing metadata',
        image: '',
        attributes: []
      };
    }
  }
}
