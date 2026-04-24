// hooks/useWallet.ts
"use client";

import { useState, useEffect, useCallback } from "react";

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, handler: (...args: unknown[]) => void) => void;
      removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
    };
  }
}

interface WalletState {
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}

interface UseWalletReturn extends WalletState {
  connect: () => Promise<string | null>;
  disconnect: () => void;
  switchChain: (chainId: number) => Promise<void>;
}

const SUPPORTED_CHAINS: Record<number, string> = {
  1: "Ethereum",
  42161: "Arbitrum One",
  8453: "Base",
  43114: "Avalanche",
  130: "Unichain",
};

export function useWallet(): UseWalletReturn {
  const [state, setState] = useState<WalletState>({
    address: null,
    chainId: null,
    isConnected: false,
    isConnecting: false,
    error: null,
  });

  // Re-hydrate from MetaMask on mount (if already connected)
  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) return;

    window.ethereum
      .request({ method: "eth_accounts" })
      .then((accounts: unknown) => {
        if (!Array.isArray(accounts)) return;
        if (accounts.length > 0) {
          setState((s) => ({
            ...s,
            address: accounts[0],
            isConnected: true,
          }));
        }
      })
      .catch(() => {});

    window.ethereum
      .request({ method: "eth_chainId" })
      .then((chainId: unknown) => {
        if (typeof chainId === "string") setState((s) => ({ ...s, chainId: parseInt(chainId, 16) }));
      })
      .catch(() => {});

    const onAccountsChanged = (...args: unknown[]) => {
      const accounts = Array.isArray(args[0]) ? (args[0] as string[]) : [];
      setState((s) => ({
        ...s,
        address: accounts[0] ?? null,
        isConnected: accounts.length > 0,
      }));
    };

    const onChainChanged = (...args: unknown[]) => {
      const chainId = typeof args[0] === "string" ? args[0] : "";
      if (chainId) setState((s) => ({ ...s, chainId: parseInt(chainId, 16) }));
    };

    window.ethereum.on("accountsChanged", onAccountsChanged);
    window.ethereum.on("chainChanged", onChainChanged);

    return () => {
      window.ethereum?.removeListener("accountsChanged", onAccountsChanged);
      window.ethereum?.removeListener("chainChanged", onChainChanged);
    };
  }, []);

  const connect = useCallback(async (): Promise<string | null> => {
    if (!window.ethereum) {
      setState((s) => ({
        ...s,
        error: "MetaMask is not installed. Visit metamask.io to install it.",
      }));
      return null;
    }

    setState((s) => ({ ...s, isConnecting: true, error: null }));

    try {
      const accounts = (await window.ethereum.request({
        method: "eth_requestAccounts",
      })) as string[];

      const chainIdHex = (await window.ethereum.request({
        method: "eth_chainId",
      })) as string;
      const chainId = parseInt(chainIdHex, 16);

      if (!SUPPORTED_CHAINS[chainId]) {
        setState((s) => ({
          ...s,
          isConnecting: false,
          error: `Unsupported network. Please switch to Ethereum, Arbitrum, Base, Avalanche, or Unichain.`,
        }));
        return null;
      }

      const address = accounts[0];
      setState({
        address,
        chainId,
        isConnected: true,
        isConnecting: false,
        error: null,
      });

      return address;
    } catch (err: any) {
      setState((s) => ({
        ...s,
        isConnecting: false,
        error: err.code === 4001 ? null : err.message, // 4001 = user rejected
      }));
      return null;
    }
  }, []);

  const disconnect = useCallback(() => {
    setState({
      address: null,
      chainId: null,
      isConnected: false,
      isConnecting: false,
      error: null,
    });
  }, []);

  const switchChain = useCallback(async (chainId: number) => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
    } catch (err: any) {
      setState((s) => ({ ...s, error: `Failed to switch chain: ${err.message}` }));
    }
  }, []);

  return { ...state, connect, disconnect, switchChain };
}

