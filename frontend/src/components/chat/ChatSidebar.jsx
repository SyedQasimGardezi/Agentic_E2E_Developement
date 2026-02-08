import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Maximize2, 
  Command, 
  Zap, 
  Cpu, 
  Send, 
  Loader2,
  Code2,
  Users,
  Briefcase,
  GitBranch
} from 'lucide-react';
import { fetchGithubBranches } from '../../services/api';
import MessageBubble from './MessageBubble';

const ChatSidebar = ({ 
    messages, 
    isLoading, 
    onSendMessage, 
    tickets, 
    onApproveProposal, 
    onCancelProposal,
    activeAgent,
    setActiveAgent,
    activeTicket,
    setActiveTicket,
    activeBranch,
    setActiveBranch
}) => {
  const [input, setInput] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');
  const [branches, setBranches] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (activeAgent === 'dev') {
        fetchGithubBranches().then(setBranches);
    }
  }, [activeAgent]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    const selectionStart = e.target.selectionStart;
    setInput(value);

    // Get text up to cursor and find the last word
    const textUpToCursor = value.substring(0, selectionStart);
    const words = textUpToCursor.split(/\s/);
    const lastWord = words[words.length - 1];

    if (lastWord.startsWith('@')) {
      setShowMentions(true);
      setMentionFilter(lastWord.slice(1).toLowerCase());
    } else {
      setShowMentions(false);
    }
  };

  const insertMention = (key) => {
    const parts = input.split(' ');
    parts.pop();
    setInput(parts.length > 0 ? parts.join(' ') + ` @${key} ` : `@${key} `);
    setShowMentions(false);
    // Auto-set the active ticket context if switched to dev
    if (activeAgent === 'dev') {
        setActiveTicket(key);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input);
    setInput('');
    setShowMentions(false);
  };
   
  const AgentSelector = () => (
      <div style={{display: 'flex', gap: 4, background: 'var(--bg-main)', padding: 4, borderRadius: 8, marginBottom: 12, border: '1px solid var(--border)'}}>
        <div 
            onClick={() => { setActiveAgent('specs'); setActiveTicket(null); }}
            style={{
                flex: 1, 
                padding: '6px 12px', 
                borderRadius: 6, 
                fontSize: '0.75rem', 
                fontWeight: 700, 
                cursor: 'pointer',
                background: activeAgent === 'specs' ? 'white' : 'transparent',
                color: activeAgent === 'specs' ? 'var(--accent-specs)' : 'var(--text-muted)',
                boxShadow: activeAgent === 'specs' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                transition: 'all 0.2s'
            }}
        >
            <Briefcase size={14} /> SPECS AGENT
        </div>
        <div 
            onClick={() => setActiveAgent('dev')}
            style={{
                flex: 1, 
                padding: '6px 12px', 
                borderRadius: 6, 
                fontSize: '0.75rem', 
                fontWeight: 700, 
                cursor: 'pointer',
                background: activeAgent === 'dev' ? 'white' : 'transparent',
                color: activeAgent === 'dev' ? 'var(--accent-dev)' : 'var(--text-muted)',
                boxShadow: activeAgent === 'dev' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                transition: 'all 0.2s'
            }}
        >
            <Code2 size={14} /> DEVELOPER
        </div>
      </div>
  );

  return (
    <aside className="sidebar-panel">
      <header className="sidebar-header">
        <span style={{display: 'flex', alignItems: 'center', gap: 12}}>
          <Box size={22} color="var(--accent-browser)" fill="var(--accent-browser)" style={{opacity: 0.15}} />
          PROJECT SPECS
        </span>
        <div style={{display: 'flex', gap: 8}}>
          <Maximize2 size={16} color="var(--text-muted)" />
        </div>
      </header>
      
      <div style={{padding: '0 12px'}}>
        <AgentSelector />
        {activeAgent === 'dev' && (
            <div style={{display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12}}>
                <div style={{
                    background: activeTicket ? '#f0fdf4' : '#fef2f2', 
                    border: `1px solid ${activeTicket ? '#bbf7d0' : '#fecaca'}`,
                    borderRadius: 6,
                    padding: '8px 12px',
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <span style={{fontWeight: 600, color: activeTicket ? '#15803d' : '#991b1b'}}>
                        {activeTicket ? `CONTEXT: ${activeTicket}` : '⚠️ SELECT TICKET'}
                    </span>
                    {activeTicket && (
                        <button onClick={() => setActiveTicket(null)} style={{background:'none', border:'none', cursor:'pointer'}}>
                            <Users size={12} color="#15803d"/>
                        </button>
                    )}
                </div>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    background: 'var(--bg-main)',
                    border: '1px solid var(--border)',
                    borderRadius: 6,
                    padding: '4px 8px'
                }}>
                    <GitBranch size={14} color="var(--text-muted)" />
                    <select 
                        value={activeBranch || 'main'} 
                        onChange={(e) => setActiveBranch(e.target.value)}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: 'var(--text-secondary)',
                            flex: 1,
                            outline: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        {branches.length > 0 ? branches.map(b => (
                            <option key={b} value={b}>{b}</option>
                        )) : <option value="main">main</option>}
                    </select>
                </div>
            </div>
        )}
      </div>
      
      <div className="chat-scroll">
        {messages.length > 0 ? messages.map(msg => (
          <MessageBubble 
            key={msg.id} 
            msg={msg} 
            onApprove={onApproveProposal}
            onCancel={onCancelProposal}
          />
        )) : (
          <div style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.3, textAlign: 'center', padding: '0 20px'}}>
            <Command size={48} style={{marginBottom: 16}} />
            <div style={{fontSize: '0.9rem', fontWeight: 600}}>PROJECT SYSTEM INITIALIZED</div>
            <div style={{fontSize: '0.75rem', marginTop: 8}}>Assign a new objective via the console below.</div>
          </div>
        )}
        {isLoading && (
          <div className="msg-bubble agent" style={{display: 'flex', alignItems: 'center', gap: 10}}>
            <Loader2 size={16} className="animate-spin" />
            Analyzing request...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-footer">
        <form onSubmit={handleSubmit} className="input-container">
          {showMentions && (
            <div className="mention-list">
              {tickets
                .filter(t => (t.key?.toLowerCase().includes(mentionFilter) || t.summary?.toLowerCase().includes(mentionFilter)))
                .map(t => (
                  <div key={t.key} className="mention-item" onClick={() => insertMention(t.key)}>
                    <span className="mention-key">{t.key}</span>
                    <span className="mention-summary">{t.summary}</span>
                  </div>
                ))}
              {tickets.filter(t => (t.key?.toLowerCase().includes(mentionFilter) || t.summary?.toLowerCase().includes(mentionFilter))).length === 0 && (
                <div className="mention-item" style={{color: 'var(--text-muted)', fontSize: '0.8rem'}}>No tickets match "{mentionFilter}"</div>
              )}
            </div>
          )}
          <textarea 
            className="input-field"
            placeholder="Assign a new objective to the specs..."
            value={input}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8}}>
            <div style={{display: 'flex', gap: 20, color: 'var(--text-muted)'}}>
              <Zap size={18} cursor="pointer" style={{transition: 'color 0.2s'}} onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'} onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'} />
              <Cpu size={18} cursor="pointer" style={{transition: 'color 0.2s'}} onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'} onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'} />
              <Command size={18} cursor="pointer" style={{transition: 'color 0.2s'}} onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'} onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'} />
            </div>
            <button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              style={{
                background: isLoading || !input.trim() ? 'var(--bg-secondary)' : 'var(--text-primary)', 
                color: 'white', 
                border: 'none', 
                borderRadius: 8, 
                padding: '8px 16px', 
                fontWeight: 600, 
                fontSize: '0.8rem', 
                display: 'flex', 
                alignItems: 'center', 
                gap: 8,
                cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
                opacity: isLoading || !input.trim() ? 0.5 : 1
              }}
            >
              EXECUTE <Send size={14} style={{marginLeft: 2}} />
            </button>
          </div>
        </form>
      </div>
    </aside>
  );
};

export default ChatSidebar;
