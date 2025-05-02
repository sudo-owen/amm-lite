import { Injectable, signal } from '@angular/core';
import init from '@web3-onboard/core';
import injectedModule from '@web3-onboard/injected-wallets';
import { Observable, of } from 'rxjs';
import { createPublicClient, createWalletClient, http, formatEther, PublicClient, WalletClient, Chain, custom } from 'viem';

@Injectable({
  providedIn: 'root'
})
export class WalletService {
  private web3Onboard: ReturnType<typeof init>;
  private injected = injectedModule();

  public walletAddress = signal<string | null>(null);
  public isConnected = signal<boolean>(false);
  public balance = signal<string>('0');

  constructor() {
    this.web3Onboard = init({
      wallets: [this.injected],
      chains: [
        {
          id: '0x18623A6A54F3F',
          token: 'ETH',
          label: 'Yominet',
          rpcUrl: 'https://jsonrpc-yominet-1.anvil.asia-southeast.initia.xyz/'
        },
        {
          id: '0x4be439dcd8b3f',
          token: 'Init',
          label: 'Zaar',
          rpcUrl: 'https://jsonrpc-zaar-mainnet-1.anvil.asia-southeast.initia.xyz/'
        }
      ],
      accountCenter: {
        desktop: {
          enabled: false,
        },
        mobile: {
          enabled: false,
        }
      },
      connect: {
        autoConnectLastWallet: true,
      },
      theme: 'dark'
    });
  }

  async connectWallet(): Promise<boolean> {
    try {
      const wallets = await this.web3Onboard.connectWallet();

      if (wallets[0]) {
        const { accounts } = wallets[0];
        this.walletAddress.set(accounts[0].address);
        this.isConnected.set(true);

        // Fetch the balance after connecting
        await this.fetchBalance();

        return true;
      }

      return false;
    } catch (error) {
      console.error('Error connecting wallet:', error);
      return false;
    }
  }

  async disconnectWallet(): Promise<void> {
    const [primaryWallet] = this.web3Onboard.state.get().wallets;
    if (primaryWallet) {
      await this.web3Onboard.disconnectWallet({ label: primaryWallet.label });
      this.walletAddress.set(null);
      this.isConnected.set(false);
    }
  }

  getConnectedWallet(): Observable<string | null> {
    return of(this.walletAddress());
  }

  /**
   * Get the current chain configuration
   * @returns The chain configuration object or null if not available
   */
  private getCurrentChainConfig() {
    const state = this.web3Onboard.state.get();
    const [wallet] = state.wallets;
    if (!wallet) return null;

    const { chains } = wallet;
    const chainId = chains[0].id;

    return this.web3Onboard.state.get().chains.find(c => c.id === chainId);
  }

  /**
   * Get the current chain as a viem Chain object
   * @returns A viem Chain object or null if not available
   */
  getCurrentChain(): Chain | null {
    const chainConfig = this.getCurrentChainConfig();
    if (!chainConfig) return null;

    return {
      id: parseInt(chainConfig.id, 16),
      name: chainConfig.label || 'Unknown Chain',
      nativeCurrency: {
        name: chainConfig.token || 'ETH',
        symbol: chainConfig.token || 'ETH',
        decimals: 18
      },
      rpcUrls: {
        default: {
          http: [chainConfig.rpcUrl || ''],
        },
      },
    };
  }

  /**
   * Get a viem public client for the current chain
   * @returns A viem PublicClient or null if not available
   */
  getPublicClient(): PublicClient | null {
    const chain = this.getCurrentChain();
    if (!chain) return null;

    return createPublicClient({
      chain,
      transport: http(),
    });
  }

  /**
   * Get a viem wallet client for the current chain
   * @returns A viem WalletClient or null if not available
   */
  getWalletClient(): WalletClient | null {
    const chain = this.getCurrentChain();
    if (!chain || !this.walletAddress()) return null;

    const state = this.web3Onboard.state.get();
    const [wallet] = state.wallets;
    if (!wallet) return null;

    // Get the provider from web3-onboard
    const provider = wallet.provider;
    if (!provider) return null;

    return createWalletClient({
      account: this.walletAddress() as `0x${string}`,
      chain,
      transport: custom(provider)
    });
  }

  async fetchBalance(): Promise<void> {
    if (!this.walletAddress()) return;

    try {
      const publicClient = this.getPublicClient();
      if (!publicClient) return;

      // Get the balance
      const balanceWei = await publicClient.getBalance({
        address: this.walletAddress() as `0x${string}`
      });

      // Format the balance with 18 decimals
      const formattedBalance = formatEther(balanceWei);

      // Update the balance signal
      this.balance.set(formattedBalance);
    } catch (error) {
      console.error('Error fetching balance:', error);
      this.balance.set('0');
    }
  }
}
