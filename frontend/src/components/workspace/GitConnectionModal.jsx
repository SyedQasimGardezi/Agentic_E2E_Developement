import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Github, Loader2, X, Check, AlertCircle } from 'lucide-react';
import { connectGithubRepo, fetchGithubStatus, fetchGithubDetails, fetchGithubRepos } from '../../services/api';

const GitConnectionModal = ({ isOpen, onClose, onConnected }) => {
  const [repoName, setRepoName] = useState('SyedQasimGardezi/Test-Repo');
  const [token, setToken] = useState(import.meta.env.VITE_GITHUB_TOKEN || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [details, setDetails] = useState(null);
  const [userRepos, setUserRepos] = useState([]);
  const [repoFilter, setRepoFilter] = useState('');

  // Load details when modal opens if already connected
  useEffect(() => {
    if (isOpen) {
        checkStatus();
        loadUserRepos();
    }
  }, [isOpen]);

  const loadUserRepos = async () => {
    const repos = await fetchGithubRepos();
    setUserRepos(repos);
  };

  const checkStatus = async () => {
      const status = await fetchGithubStatus();
      if (status.connected) {
          const det = await fetchGithubDetails();
          setDetails(det);
          setRepoName(det.repo_name);
      }
  };

  const handleConnect = async (selectedRepo = null) => {
    const targetRepo = (typeof selectedRepo === 'string' ? selectedRepo : null) || repoName;
    if (!targetRepo) return;

    setIsLoading(true);
    setError('');
    try {
      const res = await connectGithubRepo(targetRepo, token || undefined);
      if (res.success) {
        setDetails(res);
        onConnected && onConnected(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const filteredRepos = userRepos.filter(r => 
    r.full_name.toLowerCase().includes(repoFilter.toLowerCase())
  );

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: '500px', height: '600px'}}>
        <div className="modal-header">
           <div className="modal-title">
             <Github size={20} />
             GitHub Connection
           </div>
           <button onClick={onClose} style={{border: 'none', background: 'none', cursor: 'pointer'}}>
             <X size={20} color="var(--text-muted)" />
           </button>
        </div>

        <div className="modal-body" style={{overflowY: 'auto'}}>
            {details ? (
                <div style={{display: 'flex', flexDirection: 'column', gap: 16, textAlign: 'center', padding: '20px 0'}}>
                    <div style={{width: 60, height: 60, background: '#f0fdf4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto'}}>
                        <Check size={32} color="var(--accent-dev)" />
                    </div>
                    <div>
                        <div style={{fontSize: '1.1rem', fontWeight: 700}}>{details.repo_name}</div>
                        <div style={{color: 'var(--text-muted)', fontSize: '0.9rem'}}>Connected Successfully</div>
                    </div>
                    <div style={{display: 'flex', justifyContent: 'center', gap: 20, marginTop: 10, borderTop: '1px solid var(--border)', paddingTop: 20}}>
                        <div style={{textAlign: 'center'}}>
                            <div style={{fontWeight: 700, fontSize: '1.2rem'}}>{details.open_issues}</div>
                            <div style={{fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase'}}>Issues</div>
                        </div>
                        <div style={{textAlign: 'center'}}>
                            <div style={{fontWeight: 700, fontSize: '1.2rem'}}>{details.stars}</div>
                            <div style={{fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase'}}>Stars</div>
                        </div>
                         <div style={{textAlign: 'center'}}>
                            <div style={{fontWeight: 700, fontSize: '1.2rem'}}>{details.forks}</div>
                            <div style={{fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase'}}>Forks</div>
                        </div>
                    </div>
                    <div style={{textAlign: 'left', marginTop: 10}}>
                        <label className="proposal-label">Repository Language</label>
                        <div style={{fontSize: '0.9rem', color: 'var(--text-secondary)'}}>{details.language || 'Multiple'}</div>
                    </div>
                </div>
            ) : (
                <>
                    <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
                        <label className="proposal-label">Personal Access Token (Required for repo list)</label>
                        <input 
                            className="proposal-input" 
                            type="password"
                            placeholder="ghp_..."
                            value={token}
                            onChange={e => setToken(e.target.value)}
                        />
                    </div>

                    <div style={{height: 1, background: 'var(--border)', margin: '10px 0'}} />

                    <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
                        <label className="proposal-label">Select Repsitoy</label>
                        <input 
                            className="proposal-input" 
                            placeholder="Search your repos..."
                            value={repoFilter}
                            onChange={e => { setRepoFilter(e.target.value); setRepoName(e.target.value); }}
                        />
                        
                        <div style={{
                            maxHeight: '200px', 
                            overflowY: 'auto', 
                            border: '1px solid var(--border)', 
                            borderRadius: 8,
                            display: userRepos.length > 0 ? 'block' : 'none'
                        }}>
                            {filteredRepos.map(repo => (
                                <div 
                                    key={repo.full_name}
                                    onClick={() => handleConnect(repo.full_name)}
                                    style={{
                                        padding: '10px 12px',
                                        fontSize: '0.8rem',
                                        cursor: 'pointer',
                                        borderBottom: '1px solid var(--border)',
                                        background: repoName === repo.full_name ? '#f8fafc' : 'transparent',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}
                                >
                                    <span style={{fontWeight: 500}}>{repo.full_name}</span>
                                    {repo.private && <span style={{fontSize: '0.6rem', padding: '2px 6px', background: '#fee2e2', borderRadius: 4, color: '#991b1b'}}>Private</span>}
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {error && (
                        <div style={{background: '#fef2f2', color: '#ef4444', padding: '10px', borderRadius: 8, fontSize: '0.8rem', display: 'flex', gap: 8, alignItems: 'center'}}>
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}
                </>
            )}
        </div>

        <div className="modal-footer">
            {details ? (
                <button 
                  className="proposal-btn" 
                  style={{background: 'var(--border)', color: 'var(--text-primary)', borderRadius: 8, fontWeight: 600}}
                  onClick={() => { setDetails(null); setRepoName(''); }} 
                >
                  Disconnect
                </button>
            ) : (
                <button 
                  className="proposal-btn approve" 
                  style={{background: 'var(--text-primary)', color: 'white', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center'}}
                  onClick={handleConnect}
                  disabled={isLoading}
                >
                   {isLoading ? <Loader2 className="animate-spin" size={16} /> : <Github size={16} />}
                   Connect Repository
                </button>
            )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default GitConnectionModal;
