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
  Zap,
  Activity,
  Shield,
  Command,
  Monitor,
  Database,
  Code
} from 'lucide-react';

const App = () => {
  const [currentUrl, setCurrentUrl] = useState('https://www.camel-ai.org');
  const [activeStep, setActiveStep] = useState(2);

  const logs = [
    {
      id: 1,
      time: '19:24:02',
      type: 'PLAN',
      tag: 'RESEARCH',
      content: 'Decomposing objective: "Find top 5 CAMEL-AI use cases". Identifying target domains...',
    },
    {
      id: 2,
      time: '19:25:11',
      type: 'ACTION',
      tag: 'NAVIGATE',
      content: 'Initiating secure session at camel-ai.org/docs/examples...',
      tool: 'browser_toolkit'
    },
    {
      id: 3,
      time: '19:25:45',
      type: 'THOUGHT',
      tag: 'ANALYZE',
      content: 'Extracting semantic nodes from landing page. Found multi-agent orchestration pattern.',
      execution: 'const nodes = document.querySelectorAll(".feature-card"); return Array.from(nodes).map(n => n.innerText);'
    },
    {
      id: 4,
      time: '19:26:01',
      type: 'RESULT',
      tag: 'ENTITY',
      content: 'Identified Use Case 1: Automated Software Development. Proceeding to Case 2...',
    }
  ];

  return (
    <div className="app-wrapper">
      {/* Navigation Rail */}
      <nav className="nav-rail">
        <div className="logo-icon"><Zap size={20} fill="white" /></div>
        <div className="rail-item active"><Monitor size={22} /></div>
        <div className="rail-item"><Activity size={22} /></div>
        <div className="rail-item"><Database size={22} /></div>
        <div className="rail-item"><Shield size={22} /></div>
        <div style={{marginTop: 'auto'}} className="rail-item"><Settings size={22} /></div>
      </nav>

      <div className="dashboard-grid">
        {/* Header */}
        <header className="dashboard-header">
          <div className="brand">
            <span className="brand-name">CAMEL <span style={{color: 'var(--accent-primary)'}}>OPERATOR v1.0</span></span>
          </div>
          <div style={{display: 'flex', gap: '20px', alignItems: 'center'}}>
             <div style={{textAlign: 'right'}}>
                <div style={{fontSize: '0.65rem', color: 'var(--text-dim)', letterSpacing: '1px'}}>TOKEN USAGE</div>
                <div style={{fontSize: '0.9rem', color: 'var(--accent-neon)', fontWeight: 600}}>1,244 / 128k</div>
             </div>
             <div style={{width: '40px', height: '40px', borderRadius: '50%', background: 'var(--glass-bg)', display: 'flex', alignItems: 'center', justifyCenter: 'center', border: '1px solid var(--glass-border)'}}>
                <User size={18} />
             </div>
          </div>
        </header>

        {/* Browser Panel */}
        <section className="viewport-panel">
          <div className="browser-toolbar">
            <div style={{display: 'flex', gap: 10}}>
              <button className="rail-item" style={{width: 32, height: 32}}><ArrowLeft size={16}/></button>
              <button className="rail-item" style={{width: 32, height: 32}}><ArrowRight size={16}/></button>
              <button className="rail-item" style={{width: 32, height: 32}}><RotateCw size={16}/></button>
            </div>
            <div className="url-bar">
              <Globe size={14} color="var(--accent-primary)" />
              <span className="url-text">{currentUrl}</span>
            </div>
            <div className="rail-item" style={{width: 32, height: 32}}><Lock size={16}/></div>
          </div>

          <div className="viewport-content">
            {/* Dynamic Content Simulation */}
            <div style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', padding: '60px', pointerEvents: 'none'}}>
               <div className="fade-in" style={{width: '40%', height: '40px', background: '#f1f3f5', borderRadius: '8px', marginBottom: '32px'}} />
               <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px'}}>
                  {[1,2,3].map(i => (
                    <div key={i} className="fade-in" style={{height: '240px', background: '#fff', borderRadius: '16px', border: '1px solid #e1e4e8', padding: '24px', animationDelay: `${i * 0.15}s`}}>
                      <div style={{width: '40px', height: '4px', background: 'var(--accent-primary)', borderRadius: '2px', marginBottom: '16px'}} />
                      <div style={{width: '90%', height: '20px', background: '#f1f3f5', borderRadius: '4px', marginBottom: '12px'}} />
                      <div style={{width: '100%', height: '12px', background: '#f8f9fa', borderRadius: '4px', marginBottom: '8px'}} />
                      <div style={{width: '70%', height: '12px', background: '#f8f9fa', borderRadius: '4px'}} />
                    </div>
                  ))}
               </div>
            </div>

            <div className="agent-overlay">
              <div className="status-dot" />
              <span style={{fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)'}}>
                Agent "Sigma" scanning methodology section...
              </span>
            </div>
          </div>
        </section>

        {/* Command Side Panel */}
        <section className="command-center">
          <div className="control-panel">
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <span className="panel-title">Thought Stream</span>
              <Command size={14} color="var(--text-dim)" />
            </div>

            <div className="thought-stream">
              {logs.map(log => (
                <div key={log.id} className="thought-card fade-in">
                  <div className="thought-meta">
                    <span>{log.time} · {log.tag}</span>
                    <span style={{fontWeight: 700, color: 'var(--accent-primary)'}}>{log.type}</span>
                  </div>
                  <div className="thought-text">{log.content}</div>
                  
                  {log.tool && (
                    <div className="tool-badge">
                      <Bot size={12} />
                      {log.tool}
                    </div>
                  )}

                  {log.execution && (
                    <div className="terminal-box">
                      <div style={{display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, opacity: 0.7}}>
                        <Code size={12} />
                        Execution Script
                      </div>
                      {log.execution}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{marginTop: 'auto', padding: '16px', borderRadius: '12px', background: 'rgba(0, 255, 136, 0.05)', border: '1px solid rgba(0, 255, 136, 0.1)'}}>
               <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
                  <div className="status-dot" style={{width: 8, height: 8}}></div>
                  <div style={{fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-neon)'}}>SYSTEM READY</div>
               </div>
               <div style={{fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: 4}}>
                  Awaiting next objective from supervisor...
               </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

// Simple lock icon substitute for demo
const Lock = ({size}) => <Shield size={size} />;

export default App;
