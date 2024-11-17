import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const POLYGON_AMOY = {
  chainId: '0x13882', // 80002 in hex
  chainName: 'Polygon Amoy Testnet',
  nativeCurrency: {
    name: 'MATIC',
    symbol: 'MATIC',
    decimals: 18
  },
  rpcUrls: ['https://rpc-amoy.polygon.technology/'],
  blockExplorerUrls: ['https://amoy.polygonscan.com/']
};

export const useWallet = () => {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chainId, setChainId] = useState(null);

  const switchToPolygonAmoy = async () => {
    if (!window.ethereum) return;

    try {
      // Try to switch to Polygon Amoy
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: POLYGON_AMOY.chainId }],
      });
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [POLYGON_AMOY],
          });
        } catch (addError) {
          setError('Failed to add Polygon Amoy network');
          console.error(addError);
        }
      } else {
        setError('Failed to switch to Polygon Amoy network');
        console.error(switchError);
      }
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      setError('Please install MetaMask to use this app');
      return;
    }

    try {
      setLoading(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      
      // Request accounts
      await provider.send('eth_requestAccounts', []);
      
      // Get signer and address
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      setAccount(address);
      setError(null);

      // Get current chain ID
      const network = await provider.getNetwork();
      const currentChainId = '0x' + network.chainId.toString(16);
      setChainId(currentChainId);

      // Switch to Polygon Amoy if not already on it
      if (currentChainId !== POLYGON_AMOY.chainId) {
        await switchToPolygonAmoy();
      }
    } catch (err) {
      setError('Failed to connect wallet');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setChainId(null);
    localStorage.removeItem('walletConnected');
  };

  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          
          // Get accounts
          const accounts = await provider.listAccounts();
          
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            
            // Check if we're on the correct network
            const network = await provider.getNetwork();
            const currentChainId = '0x' + network.chainId.toString(16);
            setChainId(currentChainId);

            if (currentChainId !== POLYGON_AMOY.chainId) {
              await switchToPolygonAmoy();
            }
          }
        } catch (err) {
          console.error('Connection check error:', err);
        }
      }
      setLoading(false);
    };

    checkConnection();

    const handleAccountsChanged = (accounts) => {
      if (accounts.length > 0) {
        setAccount(accounts[0]);
      } else {
        setAccount(null);
        localStorage.removeItem('walletConnected');
      }
    };

    const handleChainChanged = async (newChainId) => {
      setChainId(newChainId);
      if (newChainId !== POLYGON_AMOY.chainId) {
        await switchToPolygonAmoy();
      }
    };

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  return { 
    account, 
    loading, 
    error, 
    chainId,
    connectWallet, 
    disconnectWallet,
    switchToPolygonAmoy,
    isConnected: !!account
  };
};