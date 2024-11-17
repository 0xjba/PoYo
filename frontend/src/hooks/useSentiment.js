// src/hooks/useSentiment.js
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const CONTRACT_ADDRESS = '0x21c8ef1026Fc82eE4c32451DF2Fc5Aa4F86b2cdE';
const ABI = [
  "function submitVote(string memory symbol, bool isBullish) external",
  "function getTokenSentiment(string memory symbol) external view returns (uint256 bullishVotes, uint256 bearishVotes, uint256 totalVotes, uint256 sentimentScore)",
  "function canUserVote(string memory symbol, address user) external view returns (bool)",
  "function getUserVoteStatus(string memory symbol, address user) external view returns (bool hasVoted, bool isBullish, uint256 timestamp)"
];

export function useSentiment(symbol, userAddress) {
  const [sentiment, setSentiment] = useState(null);
  const [userVoteStatus, setUserVoteStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadSentimentData = async () => {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

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
        console.error('Error loading sentiment:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (symbol) {
      loadSentimentData();
    }
  }, [symbol, userAddress]);

  const submitVote = async (isBullish) => {
    try {
      setIsLoading(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

      const tx = await contract.submitVote(symbol, isBullish);
      await tx.wait();

      // Refresh data after vote
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