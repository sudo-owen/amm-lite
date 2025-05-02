import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { WalletService } from '../services/wallet.service';
import { CHAIN_ID, ChainIdType, CONTRACT_ADDRESSES } from '../services/address';
import { ListingBook } from '../../abi/ListingBook';
import { Pair721 } from '../../abi/Pair721';
import { Multicall } from '../../abi/Multicall';
import { encodeFunctionData, decodeFunctionResult } from 'viem';

// Define a type for the multicall calls
interface MulticallCall {
  target: `0x${string}`;
  callData: `0x${string}`;
}

// Define a type for the listing data
interface ListingData {
  pairAddress: string;
  nftIds: readonly bigint[];
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

  // Route parameters
  label: string | null = null;
  address: string | null = null;

  // Chain information
  chainId: ChainIdType = CHAIN_ID.YOMINET; // Default to YOMINET

  // Listings data
  erc721Listings = signal<string[]>([]);
  listingsData = signal<ListingData[]>([]);

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

      // Use token address of 0, start of 0, end of 0 as specified
      const tokenAddress = '0x0000000000000000000000000000000000000000' as `0x${string}`;
      const start = 0n;
      const end = 0n;

      console.log('Fetching ERC721 listings for:', {
        collection: collectionAddress,
        token: tokenAddress,
        start,
        end,
        listingBookAddress
      });

      // Call the get721Listings function on the ListingBook contract
      const listings = await publicClient.readContract({
        address: listingBookAddress,
        abi: ListingBook,
        functionName: 'get721Listings',
        args: [
          collectionAddress as `0x${string}`,
          tokenAddress,
          start,
          end
        ]
      }) as `0x${string}`[];

      console.log('ERC721 listings:', listings);

      // Update the listings signal
      this.erc721Listings.set(listings as unknown as string[]);

      // If we have listings, fetch the NFT IDs for each pair
      if (listings.length > 0) {
        await this.fetchNFTIdsForPairs(listings);
      }
    } catch (error) {
      console.error('Error fetching ERC721 listings:', error);
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

      // Prepare the calls for Multicall
      const calls: MulticallCall[] = pairAddresses.map(pairAddress => {
        // Encode the getAllIds function call
        const callData = encodeFunctionData({
          abi: Pair721,
          functionName: 'getAllIds'
        });

        return {
          target: pairAddress,
          callData
        };
      });

      console.log('Fetching NFT IDs for pairs:', {
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

      // Process the results
      const listingsWithIds: ListingData[] = pairAddresses.map((pairAddress, index) => {
        try {
          // Decode the result
          const decodedResult = decodeFunctionResult({
            abi: Pair721,
            functionName: 'getAllIds',
            data: returnData[index]
          });

          return {
            pairAddress: pairAddress,
            nftIds: decodedResult
          };
        } catch (error) {
          console.error(`Error decoding NFT IDs for pair ${pairAddress}:`, error);
          return {
            pairAddress: pairAddress,
            nftIds: []
          };
        }
      });

      console.log('Listings with NFT IDs:', listingsWithIds);

      // Update the listingsData signal
      this.listingsData.set(listingsWithIds);
    } catch (error) {
      console.error('Error fetching NFT IDs for pairs:', error);
    }
  }
}
