import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

const CONTRACTS = {
  POLYGON_AMOY: '0x21c8ef1026Fc82eE4c32451DF2Fc5Aa4F86b2cdE',
  ARBITRUM_SEPOLIA: '0x1234567890123456789012345678901234567890',
  MORPH_TESTNET: '0x2345678901234567890123456789012345678901',
  BASE_SEPOLIA: '0x3456789012345678901234567890123456789012'
};

const ABI = [
  "function submitVote(string memory symbol, bool isBullish) external",
  "function getTokenSentiment(string memory symbol) external view returns (uint256 bullishVotes, uint256 bearishVotes, uint256 totalVotes, uint256 sentimentScore)",
  "function canUserVote(string memory symbol, address user) external view returns (bool)",
  "function getUserVoteStatus(string memory symbol, address user) external view returns (bool hasVoted, bool isBullish, uint256 timestamp)"
];

export function useSentiment(symbol, userAddress, selectedNetwork) {
  const [sentiment, setSentiment] = useState(null);
  const [userVoteStatus, setUserVoteStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentNetworkId, setCurrentNetworkId] = useState(null);

  const getContractAddress = useCallback(() => {
    if (!selectedNetwork?.name) return null;
    const networkKey = selectedNetwork.name.toUpperCase().replace(' ', '_');
    return CONTRACTS[networkKey] || null;
  }, [selectedNetwork]);

  const loadSentimentData = useCallback(async () => {
    if (!symbol || !selectedNetwork || !window.ethereum) return;

    const contractAddress = getContractAddress();
    if (!contractAddress) {
      setError('No contract address for selected network');
      setSentiment(null);
      setUserVoteStatus(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const network = await provider.getNetwork();
      const networkHex = '0x' + network.chainId.toString(16);
      
      // Check if we're on the correct network
      if (networkHex.toLowerCase() !== selectedNetwork.id.toLowerCase()) {
        setError('Please switch to the correct network');
        setSentiment(null);
        setUserVoteStatus(null);
        setIsLoading(false);
        return;
      }

      setCurrentNetworkId(networkHex);
      const contract = new ethers.Contract(contractAddress, ABI, provider);

      // Get sentiment data
      const [bullish, bearish, total, score] = await contract.getTokenSentiment(symbol);
      
      setSentiment({
        bullishVotes: bullish.toNumber(),
        bearishVotes: bearish.toNumber(),
        totalVotes: total.toNumber(),
        sentimentScore: score.toNumber()
      });

      // Get user's vote status if address available
      if (userAddress) {
        const [hasVoted, isBullish, timestamp] = await contract.getUserVoteStatus(symbol, userAddress);
        const canVote = await contract.canUserVote(symbol, userAddress);
        
        setUserVoteStatus({
          hasVoted,
          isBullish,
          timestamp: timestamp.toNumber(),
          canVote
        });
      }
    } catch (err) {
      setError(err.message);
      setSentiment(null);
      setUserVoteStatus(null);
      console.error('Error loading sentiment:', err);
    } finally {
      setIsLoading(false);
    }
  }, [symbol, userAddress, selectedNetwork, getContractAddress]);

  // Effect to handle network changes
  useEffect(() => {
    if (window.ethereum) {
      const handleChainChanged = () => {
        // Reset states when network changes
        setSentiment(null);
        setUserVoteStatus(null);
        setError(null);
        // Reload data for new network
        loadSentimentData();
      };

      window.ethereum.on('chainChanged', handleChainChanged);
      return () => {
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [loadSentimentData]);

  // Effect to load initial data and reload when dependencies change
  useEffect(() => {
    loadSentimentData();
  }, [loadSentimentData, selectedNetwork?.id]);

  const submitVote = async (isBullish) => {
    if (!symbol || !userAddress || !selectedNetwork || !window.ethereum) {
      setError('Missing required data for voting');
      return;
    }

    const contractAddress = getContractAddress();
    if (!contractAddress) {
      setError('No contract address for selected network');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const network = await provider.getNetwork();
      const networkHex = '0x' + network.chainId.toString(16);

      if (networkHex.toLowerCase() !== selectedNetwork.id.toLowerCase()) {
        setError('Please switch to the correct network');
        return;
      }

      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, ABI, signer);

      const tx = await contract.submitVote(symbol, isBullish);
      await tx.wait();

      // Reload sentiment data after successful vote
      await loadSentimentData();
    } catch (err) {
      setError(err.message);
      console.error('Error submitting vote:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sentiment,
    userVoteStatus,
    isLoading,
    error,
    submitVote,
    refreshData: loadSentimentData,
    currentNetworkId
  };
}