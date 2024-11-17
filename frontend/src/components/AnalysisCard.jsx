// frontend/src/components/AnalysisCard.jsx
import React from 'react';

const AnalysisCard = ({ analysis }) => {
  const {
    name,
    market_data,
    ai_analysis,
    timestamp
  } = analysis;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">{name}</h2>
        <span className="text-sm text-gray-500">
          {new Date(timestamp).toLocaleString()}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Price:</span>
            <span className="font-medium">
              ${market_data.current_price.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">24h Change:</span>
            <span className={`font-medium ${
              market_data.price_change_24h >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {market_data.price_change_24h.toFixed(2)}%
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Market Cap:</span>
            <span className="font-medium">
              ${(market_data.market_cap / 1e9).toFixed(2)}B
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Rank:</span>
            <span className="font-medium">#{market_data.market_cap_rank}</span>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">AI Analysis</h3>
        <div className="prose max-w-none">
          {ai_analysis.split('\n').map((paragraph, index) => (
            paragraph.trim() && (
              <p key={index} className="text-gray-600 mb-2">
                {paragraph}
              </p>
            )
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalysisCard;