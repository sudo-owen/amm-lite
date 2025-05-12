import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { WalletService } from '../services/wallet.service';
import { NFTService, TransactionStatus } from '../services/nft.service';
import { CHAIN_ID, ChainIdType, CONTRACT_ADDRESSES } from '../services/address';
import { ListingBook } from '../../abi/ListingBook';
import { Pair721 } from '../../abi/Pair721';
import { Multicall } from '../../abi/Multicall';
import { ERC721 } from '../../abi/ERC721';
import { encodeFunctionData, decodeFunctionResult, formatEther } from 'viem';

// Define a type for the multicall calls
interface MulticallCall {
  target: `0x${string}`;
  callData: `0x${string}`;
}

// Define a type for the listing data
interface ListingData {
  pairAddress: string;
  nftIds: readonly bigint[];
  price: bigint; // Price to buy an NFT (inputAmount from getBuyNFTQuote)
  isBuying?: boolean; // Flag to track if a buy transaction is in progress
}

@Component({
  selector: 'app-browse',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './browse.component.html',
  styleUrl: './browse.component.css'
})
export class BrowseComponent implements OnInit {
  private route = inject(ActivatedRoute);
  walletService = inject(WalletService);
  nftService = inject(NFTService);

  // Route parameters
  label: string | null = null;
  address: string | null = null;

  // Chain information
  chainId: ChainIdType = CHAIN_ID.YOMINET; // Default to YOMINET

  // Listings data
  erc721Listings = signal<string[]>([]);
  listingsData = signal<ListingData[]>([]);

  // Token metadata
  tokenName = signal<string>('');
  tokenSymbol = signal<string>('');

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

    // If wallet is already connected, fetch the balance and listings
    if (this.walletService.isConnected()) {
      this.walletService.fetchBalance();

      // If we have an address from the route, fetch the ERC721 listings
      if (this.address) {
        this.fetchERC721Listings(this.address);
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

    // If we have an address from the route, fetch the ERC721 listings
    if (this.address) {
      await this.fetchERC721Listings(this.address);
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
   * Fetch all ERC721 listings using the ListingBook contract
   * @param collectionAddress The address of the ERC721 collection
   */
  async fetchERC721Listings(collectionAddress: string): Promise<void> {
    try {
      const publicClient = this.walletService.getPublicClient();
      if (!publicClient) {
        console.error('No public client available');
        return;
      }

      // Get the ListingBook contract address for the current chain
      const listingBookAddress = CONTRACT_ADDRESSES[this.currentChainId].LISTING_BOOK as `0x${string}`;
      // Get the Multicall contract address for the current chain
      const multicallAddress = CONTRACT_ADDRESSES[this.currentChainId].MULTICALL as `0x${string}`;

      // Use token address of 0, start of 0, end of 0 as specified
      const tokenAddress = '0x0000000000000000000000000000000000000000' as `0x${string}`;
      const start = 0n;
      const end = 0n;

      console.log('Fetching ERC721 listings and metadata for:', {
        collection: collectionAddress,
        token: tokenAddress,
        start,
        end,
        listingBookAddress,
        multicallAddress
      });

      // Prepare the calls for Multicall to get name, symbol, and listings
      const calls: MulticallCall[] = [
        // Get token name
        {
          target: collectionAddress as `0x${string}`,
          callData: encodeFunctionData({
            abi: ERC721,
            functionName: 'name'
          })
        },
        // Get token symbol
        {
          target: collectionAddress as `0x${string}`,
          callData: encodeFunctionData({
            abi: ERC721,
            functionName: 'symbol'
          })
        },
        // Get listings
        {
          target: listingBookAddress,
          callData: encodeFunctionData({
            abi: ListingBook,
            functionName: 'get721Listings',
            args: [
              collectionAddress as `0x${string}`,
              tokenAddress,
              start,
              end
            ]
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

      // Decode the name and symbol
      const name = decodeFunctionResult({
        abi: ERC721,
        functionName: 'name',
        data: returnData[0]
      }) as string;

      const symbol = decodeFunctionResult({
        abi: ERC721,
        functionName: 'symbol',
        data: returnData[1]
      }) as string;

      // Decode the listings
      const listings = decodeFunctionResult({
        abi: ListingBook,
        functionName: 'get721Listings',
        data: returnData[2]
      }) as `0x${string}`[];

      console.log('Token metadata:', { name, symbol });
      console.log('ERC721 listings:', listings);

      // Update the token metadata signals
      this.tokenName.set(name);
      this.tokenSymbol.set(symbol);

      // Update the listings signal
      this.erc721Listings.set(listings as unknown as string[]);

      // If we have listings, fetch the NFT IDs for each pair
      if (listings.length > 0) {
        await this.fetchNFTIdsForPairs(listings);
      }
    } catch (error) {
      console.error('Error fetching ERC721 listings and metadata:', error);
      // Set default values in case of error
      this.tokenName.set('Unknown Collection');
      this.tokenSymbol.set('???');
    }
  }

  /**
   * Fetch NFT IDs for each pair using a multicall
   * @param pairAddresses Array of pair addresses
   */
  async fetchNFTIdsForPairs(pairAddresses: `0x${string}`[]): Promise<void> {
    try {
      const publicClient = this.walletService.getPublicClient();
      if (!publicClient) {
        console.error('No public client available');
        return;
      }

      // Get the Multicall contract address for the current chain
      const multicallAddress = CONTRACT_ADDRESSES[this.currentChainId].MULTICALL as `0x${string}`;

      // Prepare the calls for Multicall - for each pair, we need to get both getAllIds and getBuyNFTQuote
      const calls: MulticallCall[] = [];

      // For each pair, add two calls: one for getAllIds and one for getBuyNFTQuote
      pairAddresses.forEach(pairAddress => {
        // Add call for getAllIds
        calls.push({
          target: pairAddress,
          callData: encodeFunctionData({
            abi: Pair721,
            functionName: 'getAllIds'
          })
        });

        // Add call for getBuyNFTQuote with id=0 and quantity=1
        calls.push({
          target: pairAddress,
          callData: encodeFunctionData({
            abi: Pair721,
            functionName: 'getBuyNFTQuote',
            args: [0n, 1n] // id=0, quantity=1
          })
        });
      });

      console.log('Fetching NFT IDs and quotes for pairs:', {
        pairAddresses,
        multicallAddress,
        callsCount: calls.length
      });

      // Execute the Multicall
      const result = await publicClient.readContract({
        address: multicallAddress,
        abi: Multicall,
        functionName: 'aggregate' as any,
        args: [calls as any]
      }) as unknown;

      // Extract the return data from the result
      const [, returnData] = result as [bigint, `0x${string}`[]];

      // Process the results - for each pair, we have two results (getAllIds and getBuyNFTQuote)
      const listingsWithIds: ListingData[] = pairAddresses.map((pairAddress, index) => {
        try {
          // Calculate the indices for this pair's data in the returnData array
          const idsIndex = index * 2; // getAllIds result
          const quoteIndex = index * 2 + 1; // getBuyNFTQuote result

          // Decode the getAllIds result
          const nftIds = decodeFunctionResult({
            abi: Pair721,
            functionName: 'getAllIds',
            data: returnData[idsIndex]
          });

          // Decode the getBuyNFTQuote result
          const quoteResult = decodeFunctionResult({
            abi: Pair721,
            functionName: 'getBuyNFTQuote',
            data: returnData[quoteIndex]
          }) as [number, bigint, bigint, bigint, bigint, bigint]; // [error, newSpotPrice, newDelta, inputAmount, protocolFee, royaltyAmount]

          // Extract the inputAmount (index 3 in the result array)
          const inputAmount = quoteResult[3];

          return {
            pairAddress: pairAddress,
            nftIds: nftIds,
            price: inputAmount,
            isBuying: false
          };
        } catch (error) {
          console.error(`Error decoding data for pair ${pairAddress}:`, error);
          return {
            pairAddress: pairAddress,
            nftIds: [],
            price: 0n,
            isBuying: false
          };
        }
      });

      console.log('Listings with NFT IDs and prices:', listingsWithIds);

      // Update the listingsData signal
      this.listingsData.set(listingsWithIds);
    } catch (error) {
      console.error('Error fetching NFT IDs and quotes for pairs:', error);
    }
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
   * Get the current token symbol from the wallet service
   * @returns The token symbol for the current chain
   */
  getTokenSymbol(): string {
    const chain = this.walletService.getCurrentChain();
    if (!chain) return 'ETH'; // Default to ETH if no chain is available

    return chain.nativeCurrency.symbol;
  }

  /**
   * Buy the first NFT from a listing
   * @param listing The listing data containing the pair address, NFT IDs, and price
   */
  async buyNFT(listing: ListingData): Promise<void> {
    try {
      // Check if there are any NFTs available
      if (!listing.nftIds.length) {
        console.error('No NFTs available in this listing');
        return;
      }

      // Set the listing as in buying state
      const updatedListings = this.listingsData().map(l =>
        l.pairAddress === listing.pairAddress ? { ...l, isBuying: true } : l
      );
      this.listingsData.set(updatedListings);

      // Subscribe to transaction events
      const statusSubscription = this.nftService.transactionStatus$.subscribe(status => {
        console.log('Transaction status:', status);
      });

      // Call the NFT service to buy the NFT
      const result = await this.nftService.buyNFT({
        pairAddress: listing.pairAddress,
        nftIds: listing.nftIds,
        price: listing.price
      });

      // Unsubscribe from the status updates
      statusSubscription.unsubscribe();

      // If the transaction was successful, refresh the listings
      if (result.status === TransactionStatus.SUCCESS && this.address) {
        await this.fetchERC721Listings(this.address);
      }
    } catch (error) {
      console.error('Error buying NFT:', error);
    } finally {
      // Reset the buying state regardless of success or failure
      const updatedListings = this.listingsData().map(l =>
        l.pairAddress === listing.pairAddress ? { ...l, isBuying: false } : l
      );
      this.listingsData.set(updatedListings);

      // Reset the transaction status in the service
      this.nftService.resetTransactionStatus();
    }
  }
}
