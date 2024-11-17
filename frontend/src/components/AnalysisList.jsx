import { useState } from 'react';
import { Clock, TrendingUp, TrendingDown, BarChart3, ChevronDown, ChevronUp, Activity, ArrowUpCircle, ArrowDownCircle, Loader2 } from 'lucide-react';
import { useAnalyses } from '../hooks/useAnalyses';
import { useSentiment } from '../hooks/useSentiment';
import { useWallet } from '../hooks/useWallet';

const SentimentSection = ({ symbol }) => {
  const { account } = useWallet();
  const { sentiment, userVoteStatus, isLoading, submitVote } = useSentiment(symbol, account);
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async (isBullish) => {
    try {
      setIsVoting(true);
      await submitVote(isBullish);
    } finally {
      setIsVoting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Sentiment Meter */}
      {sentiment && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Market Sentiment</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">{sentiment.totalVotes} votes</span>
          </div>
          <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className={`absolute left-0 h-full transition-all duration-500 ${
                sentiment.sentimentScore > 60 ? 'bg-green-500' :
                sentiment.sentimentScore > 40 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${sentiment.sentimentScore}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <div>Bearish ({sentiment.bearishVotes})</div>
            <div>Bullish ({sentiment.bullishVotes})</div>
          </div>
        </div>
      )}

      {/* Vote Buttons */}
      {!account ? (
        <div className="text-sm text-center text-gray-500 dark:text-gray-400">
          Connect wallet to vote
        </div>
      ) : userVoteStatus && !userVoteStatus.canVote ? (
        <div className="text-sm text-center text-gray-500 dark:text-gray-400">
          Wait 24h before voting again
        </div>
      ) : (
        <div className="flex gap-3">
          <button
            onClick={() => handleVote(true)}
            disabled={isVoting}
            className={`flex-1 flex items-center justify-center px-4 py-2 rounded-xl transition-all ${
              userVoteStatus?.hasVoted && userVoteStatus?.isBullish
                ? 'bg-green-500 text-white'
                : 'glassmorphic hover:scale-[1.02]'
            }`}
          >
            <ArrowUpCircle className={`h-4 w-4 mr-1.5 ${
              userVoteStatus?.hasVoted && userVoteStatus?.isBullish
                ? 'text-white'
                : 'text-green-500'
            }`} />
            <span className={userVoteStatus?.hasVoted && userVoteStatus?.isBullish ? 'text-white' : ''}>
              Bullish
            </span>
          </button>
          <button
            onClick={() => handleVote(false)}
            disabled={isVoting}
            className={`flex-1 flex items-center justify-center px-4 py-2 rounded-xl transition-all ${
              userVoteStatus?.hasVoted && !userVoteStatus?.isBullish
                ? 'bg-red-500 text-white'
                : 'glassmorphic hover:scale-[1.02]'
            }`}
          >
            <ArrowDownCircle className={`h-4 w-4 mr-1.5 ${
              userVoteStatus?.hasVoted && !userVoteStatus?.isBullish
                ? 'text-white'
                : 'text-red-500'
            }`} />
            <span className={userVoteStatus?.hasVoted && !userVoteStatus?.isBullish ? 'text-white' : ''}>
              Bearish
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

const CryptoCard = ({ analysis, expanded, onToggle }) => {
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatNumber = (num) => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return `$${num.toLocaleString()}`;
  };

  return (
    <div className={`glassmorphic rounded-2xl transition-all duration-300 ${
      expanded ? 'scale-[1.02]' : 'hover:scale-[1.01]'
    }`}>
      <div 
        className="p-6 cursor-pointer select-none"
        onClick={onToggle}
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
              {analysis.name}
            </h3>
            <div className="flex items-center mt-2 text-gray-600 dark:text-gray-400">
              <Clock className="h-4 w-4 mr-1.5" />
              <span className="text-sm">{formatTime(analysis.timestamp)}</span>
            </div>
          </div>
          <div className={`flex items-center px-3 py-1.5 rounded-lg ${
            analysis.market_data.price_change_24h >= 0 
              ? 'bg-green-500/10 text-green-500'
              : 'bg-red-500/10 text-red-500'
          }`}>
            {analysis.market_data.price_change_24h >= 0 ? (
              <TrendingUp className="h-4 w-4 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 mr-1" />
            )}
            <span className="font-semibold">
              {Math.abs(analysis.market_data.price_change_24h).toFixed(2)}%
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-4">
          <div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              ${Number(analysis.market_data.current_price).toLocaleString()}
            </div>
            <div className="flex items-center mt-2 text-gray-600 dark:text-gray-400">
              <BarChart3 className="h-4 w-4 mr-1.5" />
              <span className="text-sm">Rank #{analysis.market_data.market_cap_rank}</span>
            </div>
          </div>
          <div className="flex flex-col items-end justify-center">
            <Activity className="h-5 w-5 text-gray-400 mb-2" />
            <div className="text-sm text-gray-600 dark:text-gray-400">24h Volume</div>
            <div className="font-semibold text-gray-900 dark:text-white">
              {formatNumber(analysis.market_data.volume_24h)}
            </div>
          </div>
        </div>

        <div className="flex justify-center text-gray-400">
          {expanded ? (
            <ChevronUp className="h-6 w-6" />
          ) : (
            <ChevronDown className="h-6 w-6" />
          )}
        </div>
      </div>

      {expanded && (
        <div className="px-6 pb-6 border-t border-gray-200 dark:border-gray-700/30">
          <div className="mt-6 space-y-6">
          <SentimentSection symbol={analysis.symbol} />
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="text-sm text-gray-600 dark:text-gray-400">Market Cap</div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatNumber(analysis.market_data.market_cap)}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-gray-600 dark:text-gray-400">24h High</div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  ${analysis.market_data.high_24h?.toLocaleString() || 'N/A'}
                </div>
              </div>
            </div>

            {analysis.ai_analysis && (
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
                  AI Analysis
                </h4>
                <div className="space-y-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                  {analysis.ai_analysis.split('\n').map((paragraph, index) => (
                    paragraph.trim() && (
                      <p key={index}>{paragraph}</p>
                    )
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const AnalysisList = () => {
  const [expandedId, setExpandedId] = useState(null);
  const { analyses, loading, error } = useAnalyses();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="glassmorphic rounded-full p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glassmorphic rounded-xl p-6 text-center">
        <div className="text-red-500 font-medium">Failed to load analyses</div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Please try again later
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {analyses.map((analysis) => (
        <CryptoCard
          key={`${analysis.coin_id}-${analysis.timestamp}`}
          analysis={analysis}
          expanded={expandedId === analysis.coin_id}
          onToggle={() => setExpandedId(
            expandedId === analysis.coin_id ? null : analysis.coin_id
          )}
        />
      ))}
    </div>
  );
};

export default AnalysisList;