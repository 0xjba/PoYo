import { useState, useEffect } from 'react';
import { Sun, Moon, Sparkles, Wallet, LogOut, ChevronDown } from 'lucide-react';
import AnalysisList from './components/AnalysisList';
import ConnectWallet from './components/ConnectWallet';
import { useWallet } from './hooks/useWallet';

const App = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [isNetworkMenuOpen, setIsNetworkMenuOpen] = useState(false);
  const { 
    account, 
    disconnectWallet, 
    chainId, 
    selectedNetwork,
    networks,
    switchNetwork
  } = useWallet();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  if (!account) {
    return <ConnectWallet />;
  }

  const handleDisconnect = (e) => {
    e.preventDefault();
    disconnectWallet();
  };

  const handleNetworkSwitch = async (network) => {
    await switchNetwork(network);
    setIsNetworkMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20 animate-gradient">
      <div className="flex flex-col min-h-screen">
        <header className="sticky top-0 z-50">
          <nav className="mx-4 my-4">
            <div className="glassmorphic rounded-2xl px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-bold text-gray-800 dark:text-white text-lg">
                    PoYo
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <button
                      onClick={() => setIsNetworkMenuOpen(!isNetworkMenuOpen)}
                      className="flex items-center space-x-2 px-3 py-1.5 rounded-xl glassmorphic hover:bg-white/10 transition-colors"
                    >
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedNetwork.name}
                      </span>
                      <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </button>
                    
                    {isNetworkMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 rounded-xl glassmorphic shadow-lg">
                        <div className="py-1">
                          {Object.values(networks).map((network) => (
                            <button
                              key={network.id}
                              onClick={() => handleNetworkSwitch(network)}
                              className={`w-full text-left px-4 py-2 text-sm ${
                                network.id === selectedNetwork.id
                                  ? 'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50'
                              }`}
                            >
                              {network.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl glassmorphic">
                    <Wallet className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {account.slice(0, 6)}...{account.slice(-4)}
                    </span>
                    <button
                      onClick={handleDisconnect}
                      className="ml-2 p-1 hover:bg-white/10 rounded-lg transition-colors"
                      aria-label="Disconnect wallet"
                    >
                      <LogOut className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className="p-2 rounded-xl hover:bg-white/10 transition-colors"
                    aria-label="Toggle dark mode"
                  >
                    {darkMode ? (
                      <Sun className="h-5 w-5 text-gray-100" />
                    ) : (
                      <Moon className="h-5 w-5 text-gray-800" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </nav>
        </header>

        <main className="flex-1 container mx-auto px-4 py-6 max-w-3xl">
          <AnalysisList />
        </main>

        <footer className="text-center py-6 text-sm text-gray-600 dark:text-gray-400">
          <p>Data updates every 30 seconds</p>
        </footer>
      </div>
    </div>
  );
}

export default App;