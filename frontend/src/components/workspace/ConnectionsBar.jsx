import React, { useState, useEffect } from 'react';
import { Github, Figma, Plus, Link2 } from 'lucide-react';
import GitConnectionModal from './GitConnectionModal';
import { fetchGithubStatus } from '../../services/api';

const ConnectionIndicator = ({ icon: Icon, connected, label, onClick }) => {
  return (
    <div 
        onClick={onClick}
        className="connection-indicator-btn"
        style={{
            display: 'flex', 
            alignItems: 'center', 
            gap: 10, 
            padding: '8px 16px', 
            borderRadius: 24, 
            background: connected ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.05)',
            border: `1px solid ${connected ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.1)'}`,
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden'
        }}
    >
        <div style={{position: 'relative', display: 'flex', alignItems: 'center'}}>
            <Icon size={16} color={connected ? '#10b981' : '#f87171'} strokeWidth={connected ? 2.5 : 2} />
            <div className={connected ? "connected-pulse" : ""} style={{
                position: 'absolute', 
                top: -3, 
                right: -3, 
                width: 7, 
                height: 7, 
                borderRadius: '50%', 
                background: connected ? '#10b981' : '#ef4444',
                border: '1.5px solid white'
            }} />
        </div>
        <span style={{
            fontSize: '0.75rem', 
            fontWeight: 800, 
            color: connected ? '#065f46' : '#991b1b',
            letterSpacing: '0.01em',
            textTransform: 'uppercase'
        }}>
            {label}
        </span>
        
        <style dangerouslySetInnerHTML={{ __html: `
            .connection-indicator-btn:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                border-color: ${connected ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.3)'};
                background: ${connected ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.08)'};
            }
            .connection-indicator-btn:active {
                transform: translateY(0);
            }
        `}} />
    </div>
  );
};

const ConnectionsBar = () => {
  const [gitConnected, setGitConnected] = useState(false);
  const [repoName, setRepoName] = useState(null);
  const [isGitModalOpen, setIsGitModalOpen] = useState(false);

  useEffect(() => {
    // Check initial status
    fetchGithubStatus().then(status => {
         setGitConnected(status.connected);
         setRepoName(status.repo_name);
    });
  }, []);

  return (
    <>
        <div style={{display: 'flex', gap: 12, borderLeft: '1px solid var(--border)', paddingLeft: 16, marginLeft: 16}}>
            <ConnectionIndicator 
                icon={Github} 
                connected={gitConnected} 
                label={gitConnected ? (repoName?.split('/')[1] || "REPO LINKED") : "LINK GITHUB"} 
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
                isConnected={gitConnected}
                connectedRepoName={repoName}
                onClose={() => setIsGitModalOpen(false)}
                onConnected={(data) => {
                    if (data) {
                        setGitConnected(true);
                        setRepoName(data.repo_name);
                    } else {
                        setGitConnected(false);
                        setRepoName(null);
                    }
                }}
            />
        )}
    </>
  );
};

export default ConnectionsBar;
