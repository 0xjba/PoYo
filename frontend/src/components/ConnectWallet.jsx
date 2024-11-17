import { Wallet, Loader2 } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';

const ConnectWallet = () => {
  const { account, loading, error, connectWallet } = useWallet();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20 animate-gradient">
        <div className="glassmorphic rounded-2xl p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-500" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Initializing wallet...</p>
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20 animate-gradient">
        <div className="glassmorphic rounded-2xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Wallet className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Connect Your Wallet
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Connect your MetaMask wallet to access real-time crypto analytics
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              This app runs on the Polygon Amoy Testnet. The network will be automatically added to your wallet if needed.
            </p>
            
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 text-red-500 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={connectWallet}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold hover:opacity-90 transition-opacity"
            >
              Connect MetaMask
            </button>

            <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
              <a 
                href="https://faucet.polygon.technology/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                Get testnet MATIC from the Polygon Faucet →
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default ConnectWallet;