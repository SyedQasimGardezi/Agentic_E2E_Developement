import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Maximize2, 
  Command, 
  Zap, 
  Cpu, 
  Send, 
  Loader2 
} from 'lucide-react';
import MessageBubble from './MessageBubble';

const ChatSidebar = ({ messages, isLoading, onSendMessage, tickets, onApproveProposal, onCancelProposal }) => {
  const [input, setInput] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');
  const messagesEndRef = useRef(null);

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
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input);
    setInput('');
    setShowMentions(false);
  };

  return (
    <aside className="sidebar-panel">
      <header className="sidebar-header">
        <span style={{display: 'flex', alignItems: 'center', gap: 12}}>
          <Box size={22} color="var(--accent-browser)" fill="var(--accent-browser)" style={{opacity: 0.15}} />
          PROJECT CORE
        </span>
        <div style={{display: 'flex', gap: 8}}>
          <Maximize2 size={16} color="var(--text-muted)" />
        </div>
      </header>
      
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
            placeholder="Assign a new objective to the core..."
            value={input}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <div style={{display: 'flex', gap: 14, color: 'var(--text-muted)'}}>
              <Zap size={18} cursor="pointer" />
              <Cpu size={18} cursor="pointer" />
              <Command size={18} cursor="pointer" />
            </div>
            <button 
              type="submit" 
              style={{background: 'var(--text-primary)', color: 'white', border: 'none', borderRadius: 8, padding: '6px 14px', fontWeight: 600, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 6}}
            >
              EXECUTE <Send size={14} />
            </button>
          </div>
        </form>
      </div>
    </aside>
  );
};

export default ChatSidebar;
