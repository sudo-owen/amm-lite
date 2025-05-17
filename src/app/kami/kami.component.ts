import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { WalletService } from '../services/wallet.service';
import { CHAIN_ID, ChainIdType, CONTRACT_ADDRESSES } from '../services/address';
import { ERC721 } from '../../abi/ERC721';

@Component({
  selector: 'app-kami',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './kami.component.html',
  styleUrl: './kami.component.css'
})
export class KamiComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  walletService = inject(WalletService);

  // Route parameters
  id: string | null = null;

  // State signals
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');
  isWrongNetwork = signal<boolean>(false);

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
    // Subscribe to route params to get the ID
    this.route.paramMap.subscribe(params => {
      this.id = params.get('id');
      
      // If wallet is already connected, check the network and process the ID
      if (this.walletService.isConnected()) {
        this.checkNetworkAndProcessId();
      }
    });
  }

  /**
   * Check if the user is on the correct network and process the ID
   */
  private async checkNetworkAndProcessId(): Promise<void> {
    // Check if we're on YOMINET
    if (this.currentChainId !== CHAIN_ID.YOMINET) {
      this.isWrongNetwork.set(true);
      this.errorMessage.set('Please connect to the YOMINET network to view this KAMI NFT.');
      return;
    }

    // Reset the wrong network flag
    this.isWrongNetwork.set(false);

    // If we have an ID, process it
    if (this.id) {
      await this.processKamiId(this.id);
    }
  }

  /**
   * Process the KAMI ID by calling ownerOf and redirecting if it's a pool
   */
  private async processKamiId(id: string): Promise<void> {
    try {
      this.isLoading.set(true);
      this.errorMessage.set('');

      // Get the public client
      const publicClient = this.walletService.getPublicClient();
      if (!publicClient) {
        throw new Error('No public client available');
      }

      // Get the KAMI contract address
      const kamiAddress = CONTRACT_ADDRESSES[CHAIN_ID.YOMINET].KAMI;
      if (!kamiAddress) {
        throw new Error('KAMI contract address not found');
      }

      console.log(`Calling ownerOf(${id}) on KAMI contract at ${kamiAddress}`);

      // Call ownerOf on the KAMI contract
      const owner = await publicClient.readContract({
        address: kamiAddress as `0x${string}`,
        abi: ERC721,
        functionName: 'ownerOf',
        args: [BigInt(id)]
      }) as `0x${string}`;

      console.log(`Owner of KAMI #${id} is ${owner}`);

      // Redirect to the manage route with the pool address
      this.router.navigate(['/manage', 'yominet', owner]);
    } catch (error) {
      console.error('Error processing KAMI ID:', error);
      this.errorMessage.set(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Connect wallet using the wallet service
   */
  async connectWallet(): Promise<void> {
    const connected = await this.walletService.connectWallet();
    if (connected) {
      await this.checkNetworkAndProcessId();
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
}
