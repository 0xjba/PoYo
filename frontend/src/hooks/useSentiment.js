import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const CONTRACTS = {
  POLYGON_AMOY: '0x21c8ef1026Fc82eE4c32451DF2Fc5Aa4F86b2cdE',
  ARBITRUM_SEPOLIA: '0x21c8ef1026Fc82eE4c32451DF2Fc5Aa4F86b2cdE', 
  MORPH_TESTNET: '0x21c8ef1026Fc82eE4c32451DF2Fc5Aa4F86b2cdE',
  BASE_SEPOLIA: '0x3456789012345678901234567890123456789012' // Replace with actual address
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const getContractAddress = () => {
    const networkKey = Object.keys(CONTRACTS).find(
      key => key === selectedNetwork?.name?.toUpperCase()?.replace(' ', '_')
    );
    return networkKey ? CONTRACTS[networkKey] : null;
  };

  useEffect(() => {
    const loadSentimentData = async () => {
      try {
        const contractAddress = getContractAddress();
        if (!contractAddress) {
          throw new Error('No contract address for selected network');
        }

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(contractAddress, ABI, provider);

        const [bullish, bearish, total, score] = await contract.getTokenSentiment(symbol);
        setSentiment({
          bullishVotes: bullish.toNumber(),
          bearishVotes: bearish.toNumber(),
          totalVotes: total.toNumber(),
          sentimentScore: score.toNumber()
        });

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
        console.error('Error loading sentiment:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (symbol && selectedNetwork) {
      loadSentimentData();
    }
  }, [symbol, userAddress, selectedNetwork]);

  const submitVote = async (isBullish) => {
    try {
      const contractAddress = getContractAddress();
      if (!contractAddress) {
        throw new Error('No contract address for selected network');
      }

      setIsLoading(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, ABI, signer);

      const tx = await contract.submitVote(symbol, isBullish);
      await tx.wait();

      const [bullish, bearish, total, score] = await contract.getTokenSentiment(symbol);
      setSentiment({
        bullishVotes: bullish.toNumber(),
        bearishVotes: bearish.toNumber(),
        totalVotes: total.toNumber(),
        sentimentScore: score.toNumber()
      });

      const [hasVoted, votedBullish, timestamp] = await contract.getUserVoteStatus(symbol, userAddress);
      const canVote = await contract.canUserVote(symbol, userAddress);
      
      setUserVoteStatus({
        hasVoted,
        isBullish: votedBullish,
        timestamp: timestamp.toNumber(),
        canVote
      });

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
    submitVote
  };
}