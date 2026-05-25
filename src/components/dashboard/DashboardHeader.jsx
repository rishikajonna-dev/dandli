import React from 'react';
import { Search, User } from 'lucide-react';
import logoAsset from '../../assets/logo.webp';

export function DashboardHeader({ searchQuery, setSearchQuery, onConvertNotes, onNewMap, onSignOut }) {
  return (
    <header className="dashboard-header">
      <div className="header-left">
        <img src={logoAsset} alt="clasp" className="dashboard-logo-img" />
      </div>

      <div className="header-center">
        <div className="search-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="dashboard-search"
            placeholder="Search maps..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
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
        <button 
          type="button" 
          className="glass-btn glass-warm" 
          onClick={onConvertNotes}
        >
          Convert Notes
        </button>
        <button 
          type="button" 
          className="glass-btn glass-mint" 
          onClick={onNewMap}
        >
          Build from Scratch
        </button>
        <button type="button" className="avatar-circle" aria-label="User settings">
          <User size={18} />
        </button>
        {onSignOut && (
          <button 
            type="button" 
            className="glass-btn sign-out-btn" 
            onClick={onSignOut}
          >
            Sign Out
          </button>
        )}
      </div>
    </header>
  );
}
