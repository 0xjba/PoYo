// frontend/src/components/Header.jsx
import React from 'react';
import { MoonIcon, SunIcon } from 'lucide-react';

const Header = ({ darkMode, toggleDarkMode }) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <div className="flex gap-6 md:gap-10">
          <div className="flex items-center space-x-2">
            <img src="/logo.svg" alt="logo" className="h-8 w-8" />
          </div>
        </div>
        
        <div className="flex flex-1 items-center justify-end space-x-4">
          <button
            onClick={toggleDarkMode}
            className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {darkMode ? 
              <SunIcon className="h-5 w-5" /> : 
              <MoonIcon className="h-5 w-5" />
            }
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;