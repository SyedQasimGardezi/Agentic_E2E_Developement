import React, { useState, useEffect } from 'react';
import { Github, Figma, Plus, Link2 } from 'lucide-react';
import GitConnectionModal from './GitConnectionModal';
import { fetchGithubStatus } from '../../services/api';

const ConnectionIndicator = ({ icon: Icon, connected, label, onClick }) => {
  return (
    <div 
        onClick={onClick}
        style={{
            display: 'flex', 
            alignItems: 'center', 
            gap: 8, 
            padding: '6px 12px', 
            borderRadius: 20, 
            background: connected ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${connected ? '#bbf7d0' : '#fecaca'}`,
            cursor: 'pointer',
            transition: 'all 0.2s'
        }}
    >
        <div style={{position: 'relative'}}>
            <Icon size={16} color={connected ? '#16a34a' : '#ef4444'} />
            <div style={{
                position: 'absolute', 
                top: -2, 
                right: -2, 
                width: 8, 
                height: 8, 
                borderRadius: '50%', 
                background: connected ? '#22c55e' : '#ef4444',
                border: '1.5px solid white'
            }} />
        </div>
        <span style={{fontSize: '0.75rem', fontWeight: 700, color: connected ? '#166534' : '#991b1b'}}>
            {label}
        </span>
    </div>
  );
};

const ConnectionsBar = () => {
  const [gitConnected, setGitConnected] = useState(false);
  const [isGitModalOpen, setIsGitModalOpen] = useState(false);

  useEffect(() => {
    // Check initial status
    fetchGithubStatus().then(status => {
         setGitConnected(status.connected);
    });
  }, []);

  return (
    <>
        <div style={{display: 'flex', gap: 12, borderLeft: '1px solid var(--border)', paddingLeft: 16, marginLeft: 16}}>
            <ConnectionIndicator 
                icon={Github} 
                connected={gitConnected} 
                label={gitConnected ? "REPO LINKED" : "NO REPO"} 
                onClick={() => setIsGitModalOpen(true)}
            />
            
            <ConnectionIndicator 
                icon={Figma} 
                connected={false} 
                label="NO DESIGN" 
                onClick={() => alert("Figma integration coming soon!")}
            />
        </div>

        {isGitModalOpen && (
            <GitConnectionModal 
                isOpen={isGitModalOpen} 
                onClose={() => setIsGitModalOpen(false)}
                onConnected={(status) => {
                    setGitConnected(status);
                    // Don't close immediately so user sees success state? 
                    // Or maybe close after delay. For now let user close manually.
                }}
            />
        )}
    </>
  );
};

export default ConnectionsBar;
