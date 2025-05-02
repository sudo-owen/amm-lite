import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WalletService } from '../services/wallet.service';
import { ERC721 } from '../../abi/ERC721';
import { ERC20 } from '../../abi/ERC20';
import { CHAIN_ID, CONTRACT_ADDRESSES, ChainIdType } from '../services/address';
import { FactoryABI } from '../../abi/Factory';
import { Multicall } from '../../abi/Multicall';
import { formatUnits, encodeFunctionData, decodeFunctionResult } from 'viem';

// Define the type for Multicall calls
type MulticallCall = {
  target: `0x${string}`;
  callData: `0x${string}`;
};

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

  // Current chain ID
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

      // Get the Pair Factory address from our constants for the current chain
      const pairFactoryAddress = CONTRACT_ADDRESSES[this.currentChainId].PAIR_FACTORY_V2_HOOKS;

      // Get the Multicall contract address for the current chain
      const multicallAddress = CONTRACT_ADDRESSES[this.currentChainId].MULTICALL as `0x${string}`;

      // Prepare the call for Multicall
      const isApprovedCallData = encodeFunctionData({
        abi: ERC721,
        functionName: 'isApprovedForAll',
        args: [walletAddress as `0x${string}`, pairFactoryAddress as `0x${string}`]
      });

      // Create the calls array for Multicall
      const calls: MulticallCall[] = [
        {
          target: this.nftContractAddress as `0x${string}`,
          callData: isApprovedCallData
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

      // Decode the result
      const isApproved = decodeFunctionResult({
        abi: ERC721,
        functionName: 'isApprovedForAll',
        data: returnData[0]
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

    // Get the Pair Factory address from our constants for the current chain
    const pairFactoryAddress = CONTRACT_ADDRESSES[this.currentChainId].PAIR_FACTORY_V2_HOOKS;

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

      // Get the Multicall contract address for the current chain
      const multicallAddress = CONTRACT_ADDRESSES[this.currentChainId].MULTICALL as `0x${string}`;

      // Prepare the calls for Multicall
      const nameCallData = encodeFunctionData({
        abi: ERC721,
        functionName: 'name'
      });

      const symbolCallData = encodeFunctionData({
        abi: ERC721,
        functionName: 'symbol'
      });

      const balanceOfCallData = encodeFunctionData({
        abi: ERC721,
        functionName: 'balanceOf',
        args: [walletAddress as `0x${string}`]
      });

      // Create the calls array for Multicall
      const calls: MulticallCall[] = [
        {
          target: this.nftContractAddress as `0x${string}`,
          callData: nameCallData
        },
        {
          target: this.nftContractAddress as `0x${string}`,
          callData: symbolCallData
        },
        {
          target: this.nftContractAddress as `0x${string}`,
          callData: balanceOfCallData
        }
      ];

      // Execute the Multicall
      // First cast to unknown, then to the expected return type to avoid TypeScript errors
      const result = await publicClient.readContract({
        address: multicallAddress,
        abi: Multicall,
        functionName: 'aggregate' as any,
        args: [calls as any]
      }) as unknown;

      // Extract the return data from the result
      const [, returnData] = result as [bigint, `0x${string}`[]];

      // Decode the results
      const name = decodeFunctionResult({
        abi: ERC721,
        functionName: 'name',
        data: returnData[0]
      });
      this.nftName.set(name as string);

      const symbol = decodeFunctionResult({
        abi: ERC721,
        functionName: 'symbol',
        data: returnData[1]
      });
      this.nftSymbol.set(symbol as string);

      const balance = decodeFunctionResult({
        abi: ERC721,
        functionName: 'balanceOf',
        data: returnData[2]
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

      // Get the Multicall contract address for the current chain
      const multicallAddress = CONTRACT_ADDRESSES[this.currentChainId].MULTICALL as `0x${string}`;

      // Prepare the calls for Multicall
      const nameCallData = encodeFunctionData({
        abi: ERC20,
        functionName: 'name'
      });

      const symbolCallData = encodeFunctionData({
        abi: ERC20,
        functionName: 'symbol'
      });

      const decimalsCallData = encodeFunctionData({
        abi: ERC20,
        functionName: 'decimals'
      });

      const balanceOfCallData = encodeFunctionData({
        abi: ERC20,
        functionName: 'balanceOf',
        args: [walletAddress as `0x${string}`]
      });

      // Create the calls array for Multicall
      const calls: MulticallCall[] = [
        {
          target: this.tokenContractAddress as `0x${string}`,
          callData: nameCallData
        },
        {
          target: this.tokenContractAddress as `0x${string}`,
          callData: symbolCallData
        },
        {
          target: this.tokenContractAddress as `0x${string}`,
          callData: decimalsCallData
        },
        {
          target: this.tokenContractAddress as `0x${string}`,
          callData: balanceOfCallData
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

      // Decode the results
      const name = decodeFunctionResult({
        abi: ERC20,
        functionName: 'name',
        data: returnData[0]
      });
      this.tokenName.set(name as string);

      const symbol = decodeFunctionResult({
        abi: ERC20,
        functionName: 'symbol',
        data: returnData[1]
      });
      this.tokenSymbol.set(symbol as string);

      const decimals = decodeFunctionResult({
        abi: ERC20,
        functionName: 'decimals',
        data: returnData[2]
      });
      this.tokenDecimals.set(Number(decimals));

      const balance = decodeFunctionResult({
        abi: ERC20,
        functionName: 'balanceOf',
        data: returnData[3]
      });
      this.tokenBalance.set(formatUnits(balance as bigint, Number(decimals)));

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

      // Get the Pair Factory address from our constants for the current chain
      const pairFactoryAddress = CONTRACT_ADDRESSES[this.currentChainId].PAIR_FACTORY_V2_HOOKS;

      // Get the Multicall contract address for the current chain
      const multicallAddress = CONTRACT_ADDRESSES[this.currentChainId].MULTICALL as `0x${string}`;

      // Prepare the call for Multicall
      const allowanceCallData = encodeFunctionData({
        abi: ERC20,
        functionName: 'allowance',
        args: [walletAddress as `0x${string}`, pairFactoryAddress as `0x${string}`]
      });

      // Create the calls array for Multicall
      const calls: MulticallCall[] = [
        {
          target: this.tokenContractAddress as `0x${string}`,
          callData: allowanceCallData
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

      // Decode the result
      const allowance = decodeFunctionResult({
        abi: ERC20,
        functionName: 'allowance',
        data: returnData[0]
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

    // Get the Pair Factory address from our constants for the current chain
    const pairFactoryAddress = CONTRACT_ADDRESSES[this.currentChainId].PAIR_FACTORY_V2_HOOKS;

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
    const pairFactoryAddress = CONTRACT_ADDRESSES[this.currentChainId].PAIR_FACTORY_V2_HOOKS;
    if (this.tokenContractAddress == '') {
      await walletClient.writeContract({
        address: pairFactoryAddress as `0x${string}`,
        abi: FactoryABI,
        functionName: 'createPairERC721ETH',
        args: [
          this.nftContractAddress as `0x${string}`,
          CONTRACT_ADDRESSES[this.currentChainId].LINEAR_CURVE_V2 as `0x${string}`,
          walletAddress as `0x${string}`,
          1, // PoolType: TOKEN/NFT/TRADE
          0n, // Delta
          0n, // Fee
          BigInt(this.startingPrice) * BigInt(1e18), // Spot price times decimals scalar
          '0x0000000000000000000000000000000000000000' as `0x${string}`, // Property checker
          this.nftIds.split(',').map(id => BigInt(id.trim())), // Initial NFT IDs
          CONTRACT_ADDRESSES[this.currentChainId].LISTING_BOOK as `0x${string}`, // Hook address
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
        args: [
          {
            token: this.tokenContractAddress as `0x${string}`,
            nft: this.nftContractAddress as `0x${string}`,
            bondingCurve: CONTRACT_ADDRESSES[this.currentChainId].LINEAR_CURVE_V2 as `0x${string}`,
            assetRecipient: walletAddress as `0x${string}`,
            poolType: 1, // PoolType: TOKEN/NFT/TRADE
            delta: 0n, // Delta
            fee: 0n, // Fee
            spotPrice: BigInt(this.startingPrice) * BigInt(1e18), // Spot price times decimals scalar
            propertyChecker: '0x0000000000000000000000000000000000000000' as `0x${string}`, // Property checker
            initialNFTIDs: this.nftIds.split(',').map(id => BigInt(id.trim())), // Initial NFT IDs
            initialTokenBalance: 0n, // Initial token balance
            hookAddress: CONTRACT_ADDRESSES[this.currentChainId].LISTING_BOOK as `0x${string}`, // Hook address
            referralAddress: '0x0000000000000000000000000000000000000000' as `0x${string}`, // Referral address
          }
        ],
        chain: this.walletService.getCurrentChain(),
        account: walletAddress as `0x${string}`
      });
    }
  }
}
