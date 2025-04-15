import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WalletService } from '../services/wallet.service';
import { ERC721 } from '../../abi/ERC721';
import { ERC20 } from '../../abi/ERC20';
import { CHAIN_ID, CONTRACT_ADDRESSES } from '../services/address';
import { FactoryABI } from '../../abi/Factory';
import { formatUnits } from 'viem';

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

  // ERC721 NFT state
  nftName = signal<string>('');
  nftSymbol = signal<string>('');
  nftBalance = signal<number>(0);
  isCheckingNFT = signal<boolean>(false);

  // ERC20 token state
  tokenName = signal<string>('');
  tokenSymbol = signal<string>('');
  tokenDecimals = signal<number>(18);
  tokenBalance = signal<string>('0');
  tokenAllowance = signal<string>('0');
  tokenAllowanceRaw = signal<bigint>(0n);
  isTokenApproved = signal<boolean>(false);
  isCheckingToken = signal<boolean>(false);

  /**
   * Format a number in scientific notation
   */
  formatScientific(num: bigint): string {
    if (num === 0n) return '0';

    // Convert to string and then to number for formatting
    const numStr = num.toString();
    const numFloat = parseFloat(numStr);

    // Format in scientific notation
    return numFloat.toExponential(2);
  }

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

      // If using an ERC20 token, check if it's approved
      if (this.tokenContractAddress) {
        await this.checkERC20Approval();

        if (!this.isTokenApproved()) {
          // If not approved, we need to request approval
          await this.setERC20Approval();
        }
      }

      // If we're approved, proceed with creating the listing
      if (this.isApproved() && (!this.tokenContractAddress || this.isTokenApproved())) {
        // Log the form values
        console.log('Creating listing with:', {
          nftContractAddress: this.nftContractAddress,
          nftIds: this.nftIds.split(',').map(id => id.trim()),
          tokenContractAddress: this.tokenContractAddress || 'Native Token',
          startingPrice: this.startingPrice
        });

        // Create the pool
        await this.createPool();
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

  /**
   * Check NFT collection details when the NFT contract address changes
   */
  async checkNFTDetails(): Promise<void> {
    if (!this.nftContractAddress) {
      // Reset NFT details if no contract address is provided
      this.nftName.set('');
      this.nftSymbol.set('');
      this.nftBalance.set(0);
      return;
    }

    this.isCheckingNFT.set(true);
    this.errorMessage.set('');

    try {
      const publicClient = this.walletService.getPublicClient();
      if (!publicClient) {
        throw new Error('No public client available');
      }

      const walletAddress = this.walletService.walletAddress();
      if (!walletAddress) {
        throw new Error('Wallet not connected');
      }

      // Get NFT collection name
      const name = await publicClient.readContract({
        address: this.nftContractAddress as `0x${string}`,
        abi: ERC721,
        functionName: 'name'
      });
      this.nftName.set(name as string);

      // Get NFT collection symbol
      const symbol = await publicClient.readContract({
        address: this.nftContractAddress as `0x${string}`,
        abi: ERC721,
        functionName: 'symbol'
      });
      this.nftSymbol.set(symbol as string);

      // Get user's NFT balance
      const balance = await publicClient.readContract({
        address: this.nftContractAddress as `0x${string}`,
        abi: ERC721,
        functionName: 'balanceOf',
        args: [walletAddress as `0x${string}`]
      });
      this.nftBalance.set(Number(balance));

      // Check NFT approval status
      await this.checkNFTApproval();
    } catch (error) {
      console.error('Error checking NFT details:', error);
      this.errorMessage.set(`Error checking NFT details: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      this.isCheckingNFT.set(false);
    }
  }

  /**
   * Check ERC20 token details when the token address changes
   */
  async checkERC20Details(): Promise<void> {
    if (!this.tokenContractAddress) {
      // Reset token details if no token address is provided
      this.tokenName.set('');
      this.tokenSymbol.set('');
      this.tokenDecimals.set(18);
      this.tokenBalance.set('0');
      this.tokenAllowance.set('0');
      this.isTokenApproved.set(false);
      return;
    }

    this.isCheckingToken.set(true);
    this.errorMessage.set('');

    try {
      const publicClient = this.walletService.getPublicClient();
      if (!publicClient) {
        throw new Error('No public client available');
      }

      const walletAddress = this.walletService.walletAddress();
      if (!walletAddress) {
        throw new Error('Wallet not connected');
      }

      // Get token name
      const name = await publicClient.readContract({
        address: this.tokenContractAddress as `0x${string}`,
        abi: ERC20,
        functionName: 'name'
      });
      this.tokenName.set(name as string);

      // Get token symbol
      const symbol = await publicClient.readContract({
        address: this.tokenContractAddress as `0x${string}`,
        abi: ERC20,
        functionName: 'symbol'
      });
      this.tokenSymbol.set(symbol as string);

      // Get token decimals
      const decimals = await publicClient.readContract({
        address: this.tokenContractAddress as `0x${string}`,
        abi: ERC20,
        functionName: 'decimals'
      });
      this.tokenDecimals.set(Number(decimals));

      // Get user's token balance
      const balance = await publicClient.readContract({
        address: this.tokenContractAddress as `0x${string}`,
        abi: ERC20,
        functionName: 'balanceOf',
        args: [walletAddress as `0x${string}`]
      });
      this.tokenBalance.set(formatUnits(balance as bigint, this.tokenDecimals()));

      // Check token approval
      await this.checkERC20Approval();
    } catch (error) {
      console.error('Error checking ERC20 details:', error);
      this.errorMessage.set(`Error checking token details: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      this.isCheckingToken.set(false);
    }
  }

  /**
   * Check if the ERC20 token is approved for the Pair Factory
   */
  async checkERC20Approval(): Promise<void> {
    if (!this.tokenContractAddress) return;

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

      // Call allowance on the ERC20 contract
      const allowance = await publicClient.readContract({
        address: this.tokenContractAddress as `0x${string}`,
        abi: ERC20,
        functionName: 'allowance',
        args: [walletAddress as `0x${string}`, pairFactoryAddress as `0x${string}`]
      });

      // Store the raw allowance value
      const allowanceBigInt = allowance as bigint;
      this.tokenAllowanceRaw.set(allowanceBigInt);

      // Format the allowance for display
      this.tokenAllowance.set(formatUnits(allowanceBigInt, this.tokenDecimals()));

      // Consider approved if allowance is greater than 0
      // In a real app, you might want to check if it's greater than the amount needed
      this.isTokenApproved.set(allowanceBigInt > 0n);
    } catch (error) {
      console.error('Error checking ERC20 approval:', error);
      throw new Error(`Failed to check token approval: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Request approval for the ERC20 token
   */
  async setERC20Approval(): Promise<void> {
    if (!this.tokenContractAddress) return;

    const walletClient = this.walletService.getWalletClient();
    if (!walletClient) {
      throw new Error('No wallet client available');
    }

    const walletAddress = this.walletService.walletAddress();
    if (!walletAddress) {
      throw new Error('Wallet not connected');
    }

    // Get the Pair Factory address from our constants
    const pairFactoryAddress = CONTRACT_ADDRESSES[CHAIN_ID.KAMI_TEST].PAIR_FACTORY_V2_HOOKS;

    // Call approve on the ERC20 contract with a very large number (max uint256)
    const maxUint256 = 2n ** 256n - 1n;

    await walletClient.writeContract({
      address: this.tokenContractAddress as `0x${string}`,
      abi: ERC20,
      functionName: 'approve',
      args: [pairFactoryAddress as `0x${string}`, maxUint256],
      chain: this.walletService.getCurrentChain(),
      account: walletAddress as `0x${string}`
    });

    // After approval, check the allowance again
    await this.checkERC20Approval();
  }

  private async createPool(): Promise<void> {
    const walletClient = this.walletService.getWalletClient();
    if (!walletClient) {
      throw new Error('No wallet client available');
    }
    const walletAddress = this.walletService.walletAddress();
    const pairFactoryAddress = CONTRACT_ADDRESSES[CHAIN_ID.KAMI_TEST].PAIR_FACTORY_V2_HOOKS;
    if (this.tokenContractAddress == '') {
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
    else {
      await walletClient.writeContract({
        address: pairFactoryAddress as `0x${string}`,
        abi: FactoryABI,
        functionName: 'createPairERC721ERC20',
        /*
        struct CreateERC721ERC20PairParams {
          ERC20 token;
          IERC721 nft;
          ICurve bondingCurve;
          address payable assetRecipient;
          LSSVMPair.PoolType poolType;
          uint128 delta;
          uint96 fee;
          uint128 spotPrice;
          address propertyChecker;
          uint256[] initialNFTIDs;
          uint256 initialTokenBalance;
          address hookAddress;
          address referralAddress;
        }
        */
        args: [
          {
            token: this.tokenContractAddress as `0x${string}`,
            nft: this.nftContractAddress as `0x${string}`,
            bondingCurve: CONTRACT_ADDRESSES[CHAIN_ID.KAMI_TEST].LINEAR_CURVE_V2 as `0x${string}`,
            assetRecipient: walletAddress as `0x${string}`,
            poolType: 1, // PoolType: TOKEN/NFT/TRADE
            delta: 0n, // Delta
            fee: 0n, // Fee
            spotPrice: BigInt(this.startingPrice), // Spot price
            propertyChecker: '0x0000000000000000000000000000000000000000' as `0x${string}`, // Property checker
            initialNFTIDs: this.nftIds.split(',').map(id => BigInt(id.trim())), // Initial NFT IDs
            initialTokenBalance: 0n, // Initial token balance
            hookAddress: CONTRACT_ADDRESSES[CHAIN_ID.KAMI_TEST].LISTING_BOOK as `0x${string}`, // Hook address
            referralAddress: '0x0000000000000000000000000000000000000000' as `0x${string}`, // Referral address
          }
        ],
        chain: this.walletService.getCurrentChain(),
        account: walletAddress as `0x${string}`
      });
    }
  }
}
