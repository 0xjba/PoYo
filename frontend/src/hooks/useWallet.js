import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

export const NETWORKS = {
  POLYGON_AMOY: {
    id: '0x13882',
    name: 'Polygon Amoy',
    chainName: 'Polygon Amoy Testnet',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18
    },
    rpcUrls: ['https://rpc-amoy.polygon.technology/'],
    blockExplorerUrls: ['https://amoy.polygonscan.com/']
  },
  ARBITRUM_SEPOLIA: {
    id: '0x66eee',
    name: 'Arbitrum Sepolia',
    chainName: 'Arbitrum Sepolia',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: ['https://arbitrum-sepolia.blockpi.network/v1/rpc/public'],
    blockExplorerUrls: ['https://sepolia.arbiscan.io']
  },
  MORPH_TESTNET: {
    id: '0xafa',
    name: 'Morph Testnet',
    chainName: 'Morph Testnet',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: ['https://rpc-quicknode-holesky.morphl2.io'],
    blockExplorerUrls: ['https://explorer-holesky.morphl2.io']
  },
  BASE_SEPOLIA: {
    id: '0x14a34',
    name: 'Base Sepolia',
    chainName: 'Base Sepolia',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: ['https://sepolia.base.org'],
    blockExplorerUrls: ['https://sepolia.basescan.org/']
  }
};

export const useWallet = () => {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [selectedNetwork, setSelectedNetwork] = useState(NETWORKS.POLYGON_AMOY);

  const switchNetwork = async (network) => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: network.id }],
      });
      setSelectedNetwork(network);
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: network.id,
              chainName: network.chainName,
              nativeCurrency: network.nativeCurrency,
              rpcUrls: network.rpcUrls,
              blockExplorerUrls: network.blockExplorerUrls
            }],
          });
          setSelectedNetwork(network);
        } catch (addError) {
          setError(`Failed to add ${network.name} network`);
          console.error(addError);
        }
      } else {
        setError(`Failed to switch to ${network.name} network`);
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
      
      await provider.send('eth_requestAccounts', []);
      
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      setAccount(address);
      setError(null);

      const network = await provider.getNetwork();
      const currentChainId = '0x' + network.chainId.toString(16);
      setChainId(currentChainId);

      if (currentChainId !== selectedNetwork.id) {
        await switchNetwork(selectedNetwork);
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
          const accounts = await provider.listAccounts();
          
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            const network = await provider.getNetwork();
            const currentChainId = '0x' + network.chainId.toString(16);
            setChainId(currentChainId);
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

    const handleChainChanged = (newChainId) => {
      setChainId(newChainId);
      const network = Object.values(NETWORKS).find(n => n.id.toLowerCase() === newChainId.toLowerCase());
      if (network) {
        setSelectedNetwork(network);
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
    selectedNetwork,
    networks: NETWORKS,
    connectWallet, 
    disconnectWallet,
    switchNetwork,
    isConnected: !!account
  };
};