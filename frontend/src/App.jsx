import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Search, 
  ArrowLeft, 
  ArrowRight, 
  RotateCw, 
  Terminal, 
  Cpu, 
  Layers, 
  Settings,
  Bot,
  User,
  ExternalLink,
  ChevronRight,
  Code,
  Layout
} from 'lucide-react';

const App = () => {
  const [url, setUrl] = useState('https://www.camel-ai.org');
  const [status, setStatus] = useState('Analyzing page layout...');
  
  const thoughts = [
    {
      id: 1,
      type: 'Plan',
      title: 'Initialize Research Task',
      content: 'I need to find information about CAMEL-AI multi-agent systems and their latest research papers.',
      active: false
    },
    {
      id: 2,
      type: 'Action',
      title: 'Navigate & Search',
      content: 'Navigating to Google and searching for "CAMEL-AI research papers 2024"',
      code: 'browser.navigate("https://google.com").search("CAMEL-AI research papers 2024")',
      active: false
    },
    {
      id: 3,
      type: 'Thought',
      title: 'Interpret Results',
      content: 'I see 5 relevant papers. The first one "CAMEL: Communicative Agents for \"Mind\" Exploration" seems most fundamental. I will now navigate to its direct project page.',
      active: true
    },
    {
      id: 4,
      type: 'Action',
      title: 'Extract Content',
      content: 'Extracting key technical details from the paper abstract and methodology section.',
      code: 'page.query_selector(".abstract").get_text()',
      active: false
    }
  ];

  return (
    <div className="app-container">
      {/* Title Bar */}
      <header className="title-bar">
        <div className="title-logo">
          <Bot size={20} />
          CAMEL BROWSER
        </div>
        <div className="browser-tabs">
          <div className="tab active">
            <Globe size={14} />
            CAMEL-AI | Multi-Agent
          </div>
          <div className="tab">
            <Layout size={14} />
            New Tab
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-section">
          <div className="section-title">Active Agents</div>
          <div className="agent-item">
            <div className="agent-avatar" style={{color: '#ff7b72', background: 'rgba(255,123,114,0.1)'}}>R</div>
            <div>
              <div style={{fontSize: '0.9rem', fontWeight: 600}}>Researcher</div>
              <div style={{fontSize: '0.75rem', color: 'var(--text-secondary)'}}>Scanning DOM...</div>
            </div>
          </div>
          <div className="agent-item">
            <div className="agent-avatar" style={{color: '#79c0ff', background: 'rgba(121,192,255,0.1)'}}>P</div>
            <div>
              <div style={{fontSize: '0.9rem', fontWeight: 600}}>Planner</div>
              <div style={{fontSize: '0.75rem', color: 'var(--text-secondary)'}}>Idle</div>
            </div>
          </div>
        </div>

        <div className="sidebar-section">
          <div className="section-title">Toolsets</div>
          <div className="agent-item">
            <Terminal size={18} color="var(--text-secondary)" />
            <div style={{fontSize: '0.9rem'}}>Browser Toolkit</div>
          </div>
          <div className="agent-item">
            <Cpu size={18} color="var(--text-secondary)" />
            <div style={{fontSize: '0.9rem'}}>LLM Processor</div>
          </div>
        </div>

        <div style={{marginTop: 'auto'}}>
          <div className="agent-item">
            <Settings size={18} color="var(--text-secondary)" />
            <div style={{fontSize: '0.9rem'}}>Environment Settings</div>
          </div>
        </div>
      </aside>

      {/* Browser Main Area */}
      <main className="main-content">
        <div className="address-bar">
          <div className="nav-buttons">
            <button className="nav-btn"><ArrowLeft size={16} /></button>
            <button className="nav-btn"><ArrowRight size={16} /></button>
            <button className="nav-btn"><RotateCw size={16} /></button>
          </div>
          <input 
            className="url-input" 
            value={url} 
            onChange={(e) => setUrl(e.target.value)}
          />
          <button className="nav-btn"><Settings size={16} /></button>
        </div>

        <div className="viewport">
          <iframe 
            src="about:blank" 
            style={{width: '100%', height: '100%', border: 'none', background: '#f8f9fa'}}
            title="viewport"
          />
          <div className="overlay-status">
            <div style={{width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)'}} />
            Agent active: {status}
          </div>
          
          {/* Simulated Web Content Overlay to make it look premium */}
          <div style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', padding: '40px'}}>
             <div style={{width: '60%', height: '20px', background: '#e1e4e8', borderRadius: '4px', marginBottom: '12px'}} />
             <div style={{width: '90%', height: '15px', background: '#f1f3f5', borderRadius: '4px', marginBottom: '8px'}} />
             <div style={{width: '85%', height: '150px', background: '#f8f9fa', borderRadius: '12px', border: '1px dashed #dee2e6', display: 'flex', alignItems: 'center', justifyCenter: 'center', marginBottom: '20px'}}>
                <span style={{color: '#adb5bd', fontSize: '0.8rem'}}>CAMEL-AI Framework Visualization</span>
             </div>
             <div style={{display: 'flex', gap: '10px'}}>
                <div style={{width: '100px', height: '30px', background: 'var(--accent)', borderRadius: '6px'}} />
                <div style={{width: '100px', height: '30px', background: '#e1e4e8', borderRadius: '6px'}} />
             </div>
          </div>
        </div>
      </main>

      {/* Agent Thought Panel */}
      <aside className="thought-panel">
        <div className="thought-header">
          <div style={{display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: '0.9rem'}}>
            <Terminal size={16} />
            AGENT LOGS
          </div>
          <div style={{fontSize: '0.7rem', color: 'var(--accent)', background: 'var(--accent-glow)', padding: '2px 8px', borderRadius: '4px'}}>
            LIVE
          </div>
        </div>

        <div className="thought-scroll">
          {thoughts.map(tp => (
            <div key={tp.id} className={`thought-step ${tp.active ? 'active' : ''}`}>
              <div className="step-label">{tp.type}</div>
              <div className="step-title">{tp.title}</div>
              <div className="thought-bubble">
                {tp.content}
                {tp.code && (
                  <div className="action-card">
                    <div className="action-header">
                      <Code size={12} />
                      Execution Code
                    </div>
                    <div className="action-code">{tp.code}</div>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div className="thought-step active">
             <div className="step-label">Current Task</div>
             <div className="step-title">Extracting Entities...</div>
             <div style={{display: 'flex', gap: 4, marginTop: 8}}>
                {[1,2,3].map(i => (
                  <div key={i} style={{
                    width: 6, 
                    height: 6, 
                    borderRadius: '50%', 
                    background: 'var(--accent)',
                    animation: `pulse 1.5s infinite ${i * 0.2}s`
                  }} />
                ))}
             </div>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default App;
