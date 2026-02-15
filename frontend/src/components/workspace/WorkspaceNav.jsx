import React from 'react';
import { Layout, Folder, Zap, Plus } from 'lucide-react';
import ConnectionsBar from './ConnectionsBar';

const WorkspaceNav = ({ activeView, setActiveView }) => {
  return (
    <nav className="top-nav-bar">
      <div className="nav-pill-group">
        <div 
            className={`nav-pill ${activeView === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveView('overview')}
        >
            <Layout size={16}/> Overview
        </div>
        <div 
            className={`nav-pill ${activeView === 'browser' ? 'active' : ''}`}
            onClick={() => setActiveView('browser')}
        >
            <Folder size={16}/> Browser
        </div>
      </div>
      <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
        <ConnectionsBar />
        
        <div style={{width: 1, height: 24, background: 'var(--border)'}} />

        <div style={{display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)'}}>
          <div style={{width: 8, height: 8, background: '#10b981', borderRadius: '50%'}} />
          SYSTEM ONLINE
        </div>
      </div>
    </nav>
  );
};

export default WorkspaceNav;
