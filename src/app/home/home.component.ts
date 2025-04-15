import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WalletService } from '../services/wallet.service';
import { ERC721 } from '../../abi/ERC721';
import { CHAIN_ID, CONTRACT_ADDRESSES } from '../services/address';
import { FactoryABI } from '../../abi/Factory';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  walletService = inject(WalletService);

  // Form properties
  nftContractAddress: string = '';
  nftIds: string = ''; // Comma-separated list of IDs
  tokenContractAddress: string = ''; // Default to empty for native token
  startingPrice: string = '';

  // UI state
  isApproved = signal<boolean>(false);
  isCheckingApproval = signal<boolean>(false);
  errorMessage = signal<string>('');

  async connectWallet(): Promise<void> {
    await this.walletService.connectWallet();
  }

  async disconnectWallet(): Promise<void> {
    await this.walletService.disconnectWallet();
  }

  async refreshBalance(): Promise<void> {
    await this.walletService.fetchBalance();
  }

  async createListing(): Promise<void> {
    try {
      // Check if the NFT contract is approved for the Pair Factory
      await this.checkNFTApproval();

      if (!this.isApproved()) {
        // If not approved, we need to request approval
        await this.setNFTApproval();
      }

      // If we're approved, proceed with creating the listing
      if (this.isApproved()) {
        // For now, just log the form values
        console.log('Creating listing with:', {
          nftContractAddress: this.nftContractAddress,
          nftIds: this.nftIds.split(',').map(id => id.trim()),
          tokenContractAddress: this.tokenContractAddress || 'Native Token',
          startingPrice: this.startingPrice
        });
      }
    } catch (error) {
      console.error('Error creating listing:', error);
      this.errorMessage.set(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Check if the NFT contract is approved for the Pair Factory
   */
  private async checkNFTApproval(): Promise<void> {
    this.isCheckingApproval.set(true);
    this.isApproved.set(false);

    try {
      const publicClient = this.walletService.getPublicClient();
      if (!publicClient) {
        throw new Error('No public client available');
      }

      const walletAddress = this.walletService.walletAddress();
      if (!walletAddress) {
        throw new Error('Wallet not connected');
      }

      // Get the Pair Factory address from our constants
      const pairFactoryAddress = CONTRACT_ADDRESSES[CHAIN_ID.KAMI_TEST].PAIR_FACTORY_V2_HOOKS;

      // Call isApprovedForAll on the NFT contract
      const isApproved = await publicClient.readContract({
        address: this.nftContractAddress as `0x${string}`,
        abi: ERC721,
        functionName: 'isApprovedForAll',
        args: [walletAddress as `0x${string}`, pairFactoryAddress as `0x${string}`]
      });

      this.isApproved.set(!!isApproved);
    } catch (error) {
      console.error('Error checking NFT approval:', error);
      throw new Error(`Failed to check NFT approval: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      this.isCheckingApproval.set(false);
    }
  }

  /**
   * Request approval for the NFT contract
   */
  private async setNFTApproval(): Promise<void> {
    // Use the wallet service and viem to call setApprovalForAll on the NFT contract
    const walletClient = this.walletService.getWalletClient();
    if (!walletClient) {
      throw new Error('No wallet client available');
    }

    const walletAddress = this.walletService.walletAddress();

    // Get the Pair Factory address from our constants
    const pairFactoryAddress = CONTRACT_ADDRESSES[CHAIN_ID.KAMI_TEST].PAIR_FACTORY_V2_HOOKS;

    // Call setApprovalForAll on the NFT contract
    // Get the current chain
    const chain = this.walletService.getCurrentChain();

    await walletClient.writeContract({
      address: this.nftContractAddress as `0x${string}`,
      abi: ERC721,
      functionName: 'setApprovalForAll',
      args: [pairFactoryAddress as `0x${string}`, true],
      chain,
      account: walletAddress as `0x${string}`
    });
  }

  private async createPool(): Promise<void> {
    const walletClient = this.walletService.getWalletClient();
    if (!walletClient) {
      throw new Error('No wallet client available');
    }

    const walletAddress = this.walletService.walletAddress();
    const pairFactoryAddress = CONTRACT_ADDRESSES[CHAIN_ID.KAMI_TEST].PAIR_FACTORY_V2_HOOKS;


    // Use the wallet service and viem to call createListing on the Pair Factory
    await walletClient.writeContract({
      address: pairFactoryAddress as `0x${string}`,
      abi: FactoryABI,
      functionName: 'createPairERC721ETH',
      /*
      IERC721 _nft,
        ICurve _bondingCurve,
        address payable _assetRecipient,
        LSSVMPair.PoolType _poolType,
        uint128 _delta,
        uint96 _fee,
        uint128 _spotPrice,
        address _propertyChecker,
        uint256[] calldata _initialNFTIDs,
        address _hookAddress,
        address _referralAddress
      */
      args: [
        this.nftContractAddress as `0x${string}`,
        CONTRACT_ADDRESSES[CHAIN_ID.KAMI_TEST].LINEAR_CURVE_V2 as `0x${string}`,
        walletAddress as `0x${string}`,
        1, // PoolType: TOKEN/NFT/TRADE
        0n, // Delta
        0n, // Fee
        BigInt(this.startingPrice), // Spot price
        '0x0000000000000000000000000000000000000000' as `0x${string}`, // Property checker
        this.nftIds.split(',').map(id => BigInt(id.trim())), // Initial NFT IDs
        CONTRACT_ADDRESSES[CHAIN_ID.KAMI_TEST].LISTING_BOOK as `0x${string}`, // Hook address
        '0x0000000000000000000000000000000000000000' as `0x${string}`, // Referral address
      ],
      chain: this.walletService.getCurrentChain(),
      account: walletAddress as `0x${string}`
    });
  }
}
