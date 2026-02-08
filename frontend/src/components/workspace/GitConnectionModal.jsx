import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Github, Loader2, X, Check, AlertCircle, Search, Shield, Globe, ChevronRight, Plus, Rocket, Info } from 'lucide-react';
import { connectGithubRepo, fetchGithubDetails, fetchGithubRepos, createGithubRepo } from '../../services/api';

const GitConnectionModal = ({ isOpen, onClose, onConnected, isConnected, connectedRepoName }) => {
  const [activeTab, setActiveTab] = useState('connect'); // 'connect' or 'create'
  const [repoName, setRepoName] = useState(connectedRepoName || '');
  const [token, setToken] = useState(import.meta.env.VITE_GITHUB_TOKEN || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  
  // Create New Repo States
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  // Initialize details instantly if we know we are connected
  const [details, setDetails] = useState(isConnected ? { repo_name: connectedRepoName, isPlaceholder: true } : null);
  
  const [userRepos, setUserRepos] = useState([]);
  const [repoFilter, setRepoFilter] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const scrollRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
        if (isConnected) {
            loadConnectedDetails();
        }
        loadUserRepos();
    }
  }, [isOpen]);

  // Reset selection index when filter changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [repoFilter]);

  const loadUserRepos = async () => {
    try {
        const repos = await fetchGithubRepos();
        setUserRepos(repos);
    } catch (e) {
        console.error("Failed to load repos", e);
    }
  };

  const loadConnectedDetails = async () => {
      try {
          const det = await fetchGithubDetails();
          if (det) {
              setDetails(det);
              setRepoName(det.repo_name);
          }
      } catch (e) {
          console.error("Failed to load repo details", e);
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
        setIsSuccess(true);
        onConnected && onConnected(res);
        setTimeout(() => onClose(), 2000);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
      if (!newName) {
          setError("Repository name is required");
          return;
      }
      setIsLoading(true);
      setError('');
      try {
          const res = await createGithubRepo(newName, newDesc, isPrivate);
          if (res.repo_name) {
              setDetails(res);
              setIsSuccess(true);
              onConnected && onConnected(res);
              setTimeout(() => onClose(), 2000);
          }
      } catch (err) {
          setError(err.message);
      } finally {
          setIsLoading(false);
      }
  };

  const filteredRepos = userRepos.filter(r => 
    r.full_name.toLowerCase().includes(repoFilter.toLowerCase())
  );

  const handleKeyDown = (e) => {
    if (activeTab !== 'connect' || filteredRepos.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filteredRepos.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredRepos.length) % filteredRepos.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleConnect(filteredRepos[selectedIndex].full_name);
    }
  };

  useEffect(() => {
    if (scrollRef.current && activeTab === 'connect') {
        const activeItem = scrollRef.current.children[selectedIndex];
        if (activeItem) {
            activeItem.scrollIntoView({ block: 'nearest' });
        }
    }
  }, [selectedIndex, activeTab]);

  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay" onClick={onClose} style={{backdropFilter: 'blur(8px)', background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <div 
        className="modal-content glass-panel modal-content-animate" 
        onClick={e => e.stopPropagation()} 
        style={{
            maxWidth: '540px', 
            height: '680px', 
            borderRadius: '32px', 
            background: 'rgba(255, 255, 255, 0.92)',
            border: '1px solid rgba(255, 255, 255, 0.6)',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 30px 60px rgba(0,0,0,0.12)'
        }}
      >
        <div className="modal-header" style={{background: 'transparent', borderBottom: '1px solid rgba(0,0,0,0.05)', padding: '24px 32px'}}>
           <div className="modal-title" style={{gap: 12}}>
             <div style={{background: '#000', color: '#fff', padding: 8, borderRadius: 10, display: 'flex'}}>
                <Github size={20} />
             </div>
             <div style={{display: 'flex', flexDirection: 'column'}}>
                <span style={{fontSize: '1rem', fontWeight: 800}}>GitHub Workspace</span>
                <span style={{fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500}}>Manage your repository environment</span>
             </div>
           </div>
           <button onClick={onClose} style={{border: 'none', background: 'rgba(0,0,0,0.05)', cursor: 'pointer', padding: 8, borderRadius: '50%', display: 'flex', transition: 'all 0.2s'}}>
             <X size={18} color="var(--text-muted)" />
           </button>
        </div>

        {!details && !isSuccess && (
            <div style={{display: 'flex', padding: '0 32px', marginTop: 16}}>
                <div style={{display: 'flex', background: 'rgba(0,0,0,0.04)', padding: 4, borderRadius: 14, width: '100%'}}>
                    <button 
                        onClick={() => setActiveTab('connect')}
                        style={{
                            flex: 1, padding: '10px', borderRadius: 10, border: 'none', cursor: 'pointer',
                            fontSize: '0.8rem', fontWeight: 700, transition: 'all 0.2s',
                            background: activeTab === 'connect' ? 'white' : 'transparent',
                            color: activeTab === 'connect' ? 'black' : 'var(--text-muted)',
                            boxShadow: activeTab === 'connect' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none'
                        }}
                    >
                        Link Existing
                    </button>
                    <button 
                        onClick={() => setActiveTab('create')}
                        style={{
                            flex: 1, padding: '10px', borderRadius: 10, border: 'none', cursor: 'pointer',
                            fontSize: '0.8rem', fontWeight: 700, transition: 'all 0.2s',
                            background: activeTab === 'create' ? 'white' : 'transparent',
                            color: activeTab === 'create' ? 'black' : 'var(--text-muted)',
                            boxShadow: activeTab === 'create' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none'
                        }}
                    >
                        Create New
                    </button>
                </div>
            </div>
        )}

        <div className="modal-body" style={{overflowY: 'auto', padding: '24px 32px 32px 32px'}}>
            {isSuccess ? (
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 24, animation: 'modalContentShow 0.4s ease'}}>
                    <div className="connected-pulse" style={{width: 80, height: 80, background: '#f0fdf4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #bbf7d0'}}>
                        <Check size={40} color="#16a34a" strokeWidth={3} />
                    </div>
                    <div style={{textAlign: 'center'}}>
                        <h3 style={{fontSize: '1.4rem', fontWeight: 800, margin: '0 0 8px 0'}}>Great Success!</h3>
                        <p style={{color: 'var(--text-muted)', fontSize: '0.9rem'}}>Repository <span style={{color: 'var(--text-primary)', fontWeight: 700}}>{details?.repo_name}</span> is ready.</p>
                    </div>
                </div>
            ) : details ? (
                <div style={{display: 'flex', flexDirection: 'column', gap: 24}}>
                    <div style={{background: '#f8fafc', padding: 24, borderRadius: 24, border: '1px solid #e2e8f0', textAlign: 'center'}}>
                         <div style={{fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800, marginBottom: 8}}>Linked Project</div>
                         <div style={{fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)'}}>{details.repo_name}</div>
                    </div>

                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12}}>
                        {[
                            { label: 'Issues', value: details.open_issues },
                            { label: 'Stars', value: details.stars },
                            { label: 'Forks', value: details.forks }
                        ].map(stat => (
                            <div key={stat.label} style={{background: 'white', padding: 16, borderRadius: 20, border: '1px solid #f1f5f9', textAlign: 'center'}}>
                                <div style={{fontWeight: 800, fontSize: '1.1rem'}}>
                                    {details.isPlaceholder ? "..." : (stat.value || 0)}
                                </div>
                                <div style={{fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700}}>{stat.label}</div>
                            </div>
                        ))}
                    </div>

                    <div style={{marginTop: 8}}>
                        {details.isPlaceholder ? (
                             <div style={{height: 48, background: '#f8fafc', borderRadius: 16}} />
                        ) : (
                            <div style={{display: 'flex', alignItems: 'center', gap: 12, background: '#fffbeb', padding: '16px', borderRadius: 16, border: '1px solid #fef3c7'}}>
                                <Globe size={18} color="#d97706" />
                                <div style={{fontSize: '0.85rem', color: '#92400e', fontWeight: 600}}>
                                    Active Language: <span style={{fontWeight: 800}}>{details.language || 'Multiple'}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : activeTab === 'connect' ? (
                <div style={{display: 'flex', flexDirection: 'column', gap: 24, animation: 'modalContentShow 0.3s ease'}}>
                    <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
                         <div style={{display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)'}}>
                            <Search size={14} />
                            <label style={{fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase'}}>Dynamic Selection</label>
                        </div>
                        <div style={{position: 'relative'}}>
                            <input 
                                className="proposal-input" 
                                placeholder="Search repositories..."
                                value={repoFilter}
                                onKeyDown={handleKeyDown}
                                onChange={e => { setRepoFilter(e.target.value); setRepoName(e.target.value); }}
                                style={{borderRadius: 16, padding: '14px 18px 14px 48px', background: '#fff', border: '1px solid #e2e8f0', width: '100%', boxSizing: 'border-box', fontSize: '0.9rem'}}
                            />
                            <Search size={18} style={{position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', opacity: 0.3}} />
                        </div>
                        
                        <div ref={scrollRef} style={{maxHeight: '240px', overflowY: 'auto', background: '#fff', border: '1px solid #f1f5f9', borderRadius: 20, padding: 8, display: userRepos.length > 0 ? 'block' : 'none'}}>
                            {filteredRepos.map((repo, idx) => (
                                <div 
                                    key={repo.full_name}
                                    className="repo-item"
                                    onClick={() => handleConnect(repo.full_name)}
                                    onMouseEnter={() => setSelectedIndex(idx)}
                                    style={{
                                        padding: '12px 16px', fontSize: '0.85rem', cursor: 'pointer', borderRadius: '12px',
                                        background: selectedIndex === idx ? 'rgba(0,0,0,0.04)' : 'transparent',
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        fontWeight: selectedIndex === idx ? 700 : 500,
                                        color: selectedIndex === idx ? 'black' : 'inherit'
                                    }}
                                >
                                    <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                                        {repo.private ? <Shield size={14} opacity={0.5}/> : <Globe size={14} opacity={0.5}/>}
                                        {repo.full_name}
                                    </div>
                                    {selectedIndex === idx && <ChevronRight size={14} />}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div style={{display: 'flex', flexDirection: 'column', gap: 20, animation: 'modalContentShow 0.3s ease'}}>
                    <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
                        <label style={{fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)'}}>Repository Name</label>
                        <input 
                            className="proposal-input"
                            placeholder="my-awesome-project"
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                            style={{borderRadius: 16, padding: '14px 18px', background: '#fff', border: '1px solid #e2e8f0', width: '100%', boxSizing: 'border-box'}}
                        />
                    </div>

                    <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
                         <label style={{fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)'}}>Description (Optional)</label>
                        <textarea 
                            className="proposal-input"
                            placeholder="What is this repository for?"
                            value={newDesc}
                            onChange={e => setNewDesc(e.target.value)}
                            style={{borderRadius: 16, padding: '14px 18px', background: '#fff', border: '1px solid #e2e8f0', width: '100%', boxSizing: 'border-box', height: '100px', resize: 'none'}}
                        />
                    </div>

                    <div 
                        onClick={() => setIsPrivate(!isPrivate)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 12, padding: '16px', borderRadius: 16, border: '1px solid #e2e8f0', 
                            cursor: 'pointer', background: isPrivate ? '#fffafb' : 'white', transition: 'all 0.2s'
                        }}
                    >
                        <div style={{width: 40, height: 40, borderRadius: 10, background: isPrivate ? '#fee2e2' : '#f0f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                            {isPrivate ? <Shield size={20} color="#ef4444" /> : <Globe size={20} color="#0ea5e9" />}
                        </div>
                        <div style={{flex: 1}}>
                            <div style={{fontSize: '0.85rem', fontWeight: 700}}>{isPrivate ? "Private Repository" : "Public Repository"}</div>
                            <div style={{fontSize: '0.7rem', color: 'var(--text-muted)'}}>{isPrivate ? "Only you and collaborators can see this" : "Anyone on the internet can see this"}</div>
                        </div>
                        <div style={{width: 20, height: 20, borderRadius: '50%', border: '2px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                            {isPrivate && <div style={{width: 10, height: 10, borderRadius: '50%', background: '#ef4444'}} />}
                        </div>
                    </div>
                </div>
            )}
            
            {error && (
                <div style={{background: '#fff1f2', color: '#e11d48', padding: '12px 16px', borderRadius: 16, fontSize: '0.8rem', display: 'flex', gap: 10, alignItems: 'center', border: '1px solid #fecdd3', marginTop: 20}}>
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}
        </div>

        <div className="modal-footer" style={{background: 'transparent', borderTop: '1px solid rgba(0,0,0,0.05)', padding: '24px 32px'}}>
            {isSuccess ? (
                <div style={{height: 48}} /> // Spacer during success animation
            ) : details ? (
                <div style={{display: 'flex', gap: 12, width: '100%'}}>
                    <button 
                        className="proposal-btn" 
                        style={{
                            flex: 1,
                            background: '#f1f5f9', 
                            color: 'var(--text-primary)', 
                            borderRadius: 16, 
                            fontWeight: 700, 
                            border: '1px solid #e2e8f0',
                            padding: '14px 24px',
                            cursor: 'pointer',
                            fontSize: '0.9rem'
                        }}
                        onClick={onClose}
                    >
                        Keep Connected
                    </button>
                    <button 
                        className="proposal-btn" 
                        style={{
                            background: '#fff1f2', 
                            color: '#e11d48', 
                            borderRadius: 16, 
                            fontWeight: 700, 
                            border: '1px solid #fecdd3',
                            padding: '14px 24px',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            transition: 'all 0.2s'
                        }}
                        onClick={() => { 
                            setDetails(null); 
                            setRepoName(''); 
                            onConnected && onConnected(null);
                        }} 
                    >
                        Disconnect
                    </button>
                </div>
            ) : (
                <button 
                  className="proposal-btn approve" 
                  style={{
                      background: '#000', color: 'white', borderRadius: 18, display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center',
                      padding: '16px 28px', fontWeight: 700, width: '100%', cursor: 'pointer', border: 'none', transition: 'all 0.2s',
                      opacity: isLoading ? 0.7 : 1, boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                  }}
                  onClick={activeTab === 'connect' ? () => handleConnect() : handleCreate}
                  disabled={isLoading}
                >
                   {isLoading ? (
                       <><Loader2 className="animate-spin" size={18} /> {activeTab === 'connect' ? 'Loading...' : 'Creating...'}</>
                   ) : (
                       <>{activeTab === 'connect' ? <Github size={18} /> : <Rocket size={18} />} {activeTab === 'connect' ? 'Connect Project' : 'Bootstrap Repository'}</>
                   )}
                </button>
            )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default GitConnectionModal;
