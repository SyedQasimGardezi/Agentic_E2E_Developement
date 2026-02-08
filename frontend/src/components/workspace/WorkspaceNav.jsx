import React from 'react';
import { Layout, Folder, Zap, Plus } from 'lucide-react';
import ConnectionsBar from './ConnectionsBar';

const WorkspaceNav = () => {
  return (
    <nav className="top-nav-bar">
      <div className="nav-pill-group">
        <div className="nav-pill active"><Layout size={16}/> Workspace</div>
        <div className="nav-pill"><Folder size={16}/> Agent Hub</div>
        <div className="nav-pill"><Zap size={16}/> Triggers</div>
      </div>
      <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
        <ConnectionsBar />
        
        <div style={{width: 1, height: 24, background: 'var(--border)'}} />

        <div style={{display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)'}}>
          <div style={{width: 8, height: 8, background: '#10b981', borderRadius: '50%'}} />
          SYSTEM ONLINE
        </div>
        <button style={{background: '#000', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 10, fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 8}}>
          <Plus size={18}/> NEW RUN
        </button>
      </div>
    </nav>
  );
};

export default WorkspaceNav;
