// src/components/SentimentWidget.jsx
import { useState } from 'react';
import { ArrowUpCircle, ArrowDownCircle, Timer, AlertCircle } from 'lucide-react';
import { useSentiment } from '../hooks/useSentiment';
import { useWallet } from '../hooks/useWallet';

const SentimentWidget = ({ symbol }) => {
  const { account } = useWallet();
  const { sentiment, userVoteStatus, isLoading, error, submitVote } = useSentiment(symbol, account);
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async (isBullish) => {
    try {
      setIsVoting(true);
      await submitVote(isBullish);
    } finally {
      setIsVoting(false);
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center p-4 bg-red-50 rounded-lg">
        <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
        <span className="text-sm text-red-600">Failed to load sentiment data</span>
      </div>
    );
  }

  const getTimeLeft = (timestamp) => {
    const nextVoteTime = timestamp + 24 * 60 * 60; // 24 hours in seconds
    const now = Math.floor(Date.now() / 1000);
    const diff = nextVoteTime - now;
    
    if (diff <= 0) return null;
    
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
      {/* Sentiment Score */}
      {sentiment && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">Community Sentiment</span>
            <span className="text-sm text-gray-500">{sentiment.totalVotes} votes</span>
          </div>
          <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={`absolute left-0 top-0 h-full transition-all duration-500 ${
                sentiment.sentimentScore > 60 ? 'bg-green-500' :
                sentiment.sentimentScore > 40 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${sentiment.sentimentScore}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-gray-500">Bearish</span>
            <span className="text-xs text-gray-500">Bullish</span>
          </div>
        </div>
      )}

      {/* Voting Buttons */}
      {!account ? (
        <div className="text-sm text-center text-gray-500">
          Connect wallet to vote
        </div>
      ) : userVoteStatus && !userVoteStatus.canVote ? (
        <div className="flex items-center justify-center text-sm text-gray-500">
          <Timer className="w-4 h-4 mr-1.5" />
          <span>Can vote again in {getTimeLeft(userVoteStatus.timestamp)}</span>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={() => handleVote(true)}
            disabled={isVoting}
            className={`flex-1 flex items-center justify-center px-4 py-2 rounded-lg border transition-colors ${
              userVoteStatus?.hasVoted && userVoteStatus?.isBullish
                ? 'bg-green-500 text-white border-green-500'
                : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            <ArrowUpCircle className={`w-4 h-4 mr-1.5 ${
              userVoteStatus?.hasVoted && userVoteStatus?.isBullish
                ? 'text-white'
                : 'text-green-500'
            }`} />
            Bullish
          </button>
          <button
            onClick={() => handleVote(false)}
            disabled={isVoting}
            className={`flex-1 flex items-center justify-center px-4 py-2 rounded-lg border transition-colors ${
              userVoteStatus?.hasVoted && !userVoteStatus?.isBullish
                ? 'bg-red-500 text-white border-red-500'
                : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            <ArrowDownCircle className={`w-4 h-4 mr-1.5 ${
              userVoteStatus?.hasVoted && !userVoteStatus?.isBullish
                ? 'text-white'
                : 'text-red-500'
            }`} />
            Bearish
          </button>
        </div>
      )}

      {/* Vote Counts */}
      {sentiment && (
        <div className="flex justify-center gap-4 mt-4 text-sm">
          <div className="text-green-600">
            <span className="font-medium">{sentiment.bullishVotes}</span> Bullish
          </div>
          <div className="text-red-600">
            <span className="font-medium">{sentiment.bearishVotes}</span> Bearish
          </div>
        </div>
      )}
    </div>
  );
};

export default SentimentWidget;