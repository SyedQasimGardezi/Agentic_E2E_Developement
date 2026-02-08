import React, { useState, useEffect } from 'react';
import { 
  Layout, 
  Terminal, 
  Loader2, 
  Box, 
  FileText,
  Code2,
  SquareCode,
  Activity,
  GitBranch,
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import TaskTile from './TaskTile';
const AgentHub = ({ tickets, progress, expandedParents, onToggle }) => {
  const logEndRef = React.useRef(null);

  // Auto-scroll logs to bottom
  useEffect(() => {
    if (logEndRef.current) {
        logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [progress.logs]);

  const renderTickets = () => {
    const parents = tickets.filter(t => !t.parent_key);
    const children = tickets.filter(t => t.parent_key);

    return parents.map(parent => {
      const subtasks = children.filter(c => c.parent_key === parent.key);
      const isExpanded = expandedParents.has(parent.key);

      return (
        <React.Fragment key={parent.key}>
          <TaskTile 
            ticket={parent} 
            subtasks={subtasks}
            isExpanded={isExpanded}
            onToggle={onToggle}
          />
          
          {isExpanded && subtasks.map(child => (
            <TaskTile 
              key={child.key}
              ticket={child}
              subtasks={[]}
              isExpanded={false}
              onToggle={() => {}}
            />
          ))}
        </React.Fragment>
      );
    });
  };

  const ChecklistItem = ({ step }) => {
    const getIcon = () => {
        if (step.status === 'completed') return <CheckCircle2 size={16} color="#10b981" />;
        if (step.status === 'active') return <Loader2 size={16} color="var(--accent-dev)" className="animate-spin" />;
        if (step.status === 'failed') return <AlertCircle size={16} color="#ef4444" />;
        return <Circle size={16} color="var(--border)" />;
    };

    return (
        <div style={{
            display: 'flex', 
            alignItems: 'center', 
            gap: 12, 
            padding: '10px 12px', 
            borderRadius: 8,
            background: step.status === 'active' ? 'rgba(56, 189, 248, 0.05)' : 'transparent',
            border: step.status === 'active' ? '1px solid rgba(56, 189, 248, 0.2)' : '1px solid transparent',
            marginBottom: 4,
            transition: 'all 0.3s'
        }}>
            {getIcon()}
            <div style={{flex: 1}}>
                <div style={{
                    fontSize: '0.8rem', 
                    fontWeight: 600, 
                    color: step.status === 'pending' ? 'var(--text-muted)' : 'var(--text-primary)',
                    textDecoration: step.status === 'completed' ? 'line-through' : 'none',
                    opacity: step.status === 'completed' ? 0.6 : 1,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                }}>
                    {step.label}
                </div>
                {step.details && step.status === 'active' && (
                    <div style={{fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{step.details}</div>
                )}
            </div>
            {step.status === 'active' && <div style={{fontSize: '0.65rem', fontWeight: 700, color: 'var(--accent-dev)', marginLeft: 8}}>RUNNING</div>}
        </div>
    );
  };

  return (
    <div className="agent-hub">
      {/* Column 1: Planning */}
      <div className="hub-column">
        <div className="hub-column-header">
          <span className="hub-column-title">
            <Layout size={20} color="var(--accent-specs)" />
            PLANNING
          </span>
          <div className="column-stats">
            {tickets.length} TICKETS
          </div>
        </div>

        <div className="agent-card" style={{height: 'calc(100vh - 200px)', padding: '20px'}}>
           <div className="task-stack" style={{height: '100%', overflowY: 'auto', paddingRight: 4}}>
              {tickets.length > 0 ? renderTickets() : (
                <div className="task-text" style={{textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)'}}>
                  <Box size={40} style={{opacity: 0.1, marginBottom: 16}} />
                  <div>System ready.</div>
                </div>
              )}
           </div>
        </div>
      </div>

      {/* Column 2: Developer Implementation */}
      <div className="hub-column">
        <div className="hub-column-header">
          <span className="hub-column-title">
            <Code2 size={20} color="var(--accent-dev)" />
            IMPLEMENTATION
          </span>
        </div>

        <div className="agent-card" style={{height: 'calc(100vh - 200px)', padding: '20px'}}>
            <div className="task-stack" style={{height: '100%', overflowY: 'auto', paddingRight: 4}}>
                <div style={{display: 'flex', flexDirection: 'column', gap: 0}}>
                    {progress.steps.length > 0 ? progress.steps.map(step => (
                        <ChecklistItem key={step.id} step={step} />
                    )) : (
                        <div style={{textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)'}}>
                            <Clock size={32} style={{opacity: 0.1, marginBottom: 16}} />
                            <div style={{fontSize: '0.8rem'}}>Awaiting start command...</div>
                        </div>
                    )}
                </div>

                {progress.steps.some(s => s.status === 'active') && (
                    <div style={{
                        marginTop: 'auto', 
                        padding: '12px', 
                        background: 'var(--bg-workspace)', 
                        borderRadius: 12, 
                        border: '1px solid var(--border)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        position: 'sticky',
                        bottom: 0,
                        zIndex: 10
                    }}>
                        <Loader2 size={16} color="var(--accent-dev)" className="animate-spin" />
                        <span style={{fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)'}}>Agent is coding...</span>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* Column 3: Sandbox Console */}
      <div className="hub-column">
        <div className="hub-column-header">
          <span className="hub-column-title">
            <Terminal size={20} color="var(--text-primary)" />
            SANDBOX LOGS
          </span>
          <div style={{display: 'flex', alignItems: 'center', gap: 6}}>
             <div style={{width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981'}}></div>
             <span style={{fontSize: '0.6rem', fontWeight: 800, color: '#10b981'}}>STREAMING</span>
          </div>
        </div>

        <div className="agent-card" style={{height: 'calc(100vh - 200px)', background: '#0f172a', padding: 0, overflow: 'hidden'}}>
           <div className="task-stack" style={{height: 'calc(100% - 40px)', padding: '16px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '0.75rem', lineHeight: 1.6}}>
              {progress.logs.length > 0 ? progress.logs.map((log, idx) => (
                  <div key={idx} style={{
                      color: log.includes('[FAILED]') || log.includes('ERROR:') ? '#ef4444' : log.includes('[COMPLETED]') || log.includes('Output:') ? '#10b981' : '#94a3b8',
                      borderLeft: `2px solid ${log.includes('[FAILED]') || log.includes('ERROR:') ? '#ef4444' : log.includes('[COMPLETED]') || log.includes('Output:') ? '#10b981' : '#334155'}`,
                      paddingLeft: 12,
                      marginBottom: 8,
                      wordBreak: 'break-all'
                  }}>
                    <span style={{opacity: 0.5, marginRight: 8}}>{'>'}</span>
                    {log}
                  </div>
              )) : (
                  <div style={{color: '#475569', textAlign: 'center', marginTop: 100}}>
                    No execution data yet.
                  </div>
              )}
              <div ref={logEndRef} />
           </div>
           
           <div style={{
               height: '40px',
               background: 'rgba(0,0,0,0.5)', 
               padding: '0 16px', 
               borderTop: '1px solid rgba(255,255,255,0.05)',
               display: 'flex',
               justifyContent: 'space-between',
               alignItems: 'center'
           }}>
              <div style={{fontSize: '0.65rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase'}}>Kernel Status</div>
              <div style={{fontSize: '0.65rem', fontFamily: 'monospace', color: '#10b981'}}>IDLE_LISTENING</div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AgentHub;
