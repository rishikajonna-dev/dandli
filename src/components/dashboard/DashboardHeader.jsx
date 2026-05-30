import React, { useEffect } from 'react';
import { Search, User } from 'lucide-react';
import logoAsset from '../../assets/logo.webp';

export function DashboardHeader({ searchQuery, setSearchQuery, onSignOut }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.querySelector('.dashboard-search')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  return (
    <header className="dashboard-header">
      <div className="header-left">
        <img src={logoAsset} alt="Clasp" className="dashboard-logo-img" />
      </div>

      <div className="header-center">
        <div className="search-wrapper">
          <Search size={15} className="search-icon" />
          <input
            type="text"
            className="dashboard-search"
            placeholder="Search thoughts, maps, ideas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span className="search-kbd">⌘ K</span>
          {searchQuery && (
            <button
              type="button"
              className="search-clear"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              &times;
            </button>
          )}
        </div>
      </div>

      <div className="header-right">
        {onSignOut && (
          <button type="button" className="sign-out-btn" onClick={onSignOut}>
            Sign out
          </button>
        )}
      </div>
    </header>
  );
}