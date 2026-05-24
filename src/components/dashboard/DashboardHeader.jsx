import React from 'react';
import { Search, User } from 'lucide-react';
import logoAsset from '../../assets/logo.png';

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
          className="glass-btn glass-lavender" 
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
        <div className="avatar-circle" title="User Settings">
          <User size={18} />
        </div>
        {onSignOut && (
          <button 
            type="button" 
            className="glass-btn" 
            onClick={onSignOut}
            style={{ 
              marginLeft: '8px', 
              background: 'rgba(0,0,0,0.04)', 
              border: '1px solid rgba(0,0,0,0.08)',
              color: '#555'
            }}
          >
            Sign Out
          </button>
        )}
      </div>
    </header>
  );
}
