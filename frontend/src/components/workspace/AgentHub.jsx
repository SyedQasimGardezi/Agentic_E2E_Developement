import React from 'react';
import { 
  Layout, 
  Globe, 
  Terminal, 
  Loader2, 
  Box, 
  FileText 
} from 'lucide-react';
import TaskTile from './TaskTile';

const AgentHub = ({ tickets, expandedParents, onToggle }) => {

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

  return (
    <div className="agent-hub">
      {/* Column 1: Planning */}
      <div className="hub-column">
        <div className="hub-column-header">
          <span className="hub-column-title">
            <Layout size={20} color="var(--accent-pm)" />
            PLANNING
          </span>
          <div className="column-stats">
            {tickets.length} TOTAL TICKETS
          </div>
        </div>

        <div className="agent-card">
           <div className="task-stack" style={{maxHeight: 'calc(100vh - 300px)', overflowY: 'auto'}}>
              {tickets.length > 0 ? renderTickets() : (
                <div className="task-text" style={{textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)'}}>
                  <Box size={40} style={{opacity: 0.1, marginBottom: 16}} />
                  <div>No active tasks in system.</div>
                </div>
              )}
           </div>
        </div>
      </div>

      {/* Column 2: Browser */}
      <div className="hub-column">
        <div className="hub-column-header">
          <span className="hub-column-title">
            <Globe size={20} color="var(--accent-browser)" />
            BROWSER
          </span>
        </div>

        <div className="agent-card">
           <div style={{height: '220px', background: 'var(--bg-workspace)', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
             <Globe size={48} color="var(--text-muted)" style={{opacity: 0.2}} />
           </div>
           <div className="task-stack">
              <div className="task-tile" style={{borderColor: 'var(--accent-browser)', background: 'rgba(99, 102, 241, 0.02)'}}>
                <div className="task-icon"><Loader2 size={18} color="var(--accent-browser)" className="animate-spin" /></div>
                <div>
                  <div className="status-label" style={{color: 'var(--accent-browser)'}}>ACTIVE SESSION</div>
                  <div className="task-text">Monitoring workspace state for automated updates...</div>
                </div>
              </div>
           </div>
        </div>
      </div>

      {/* Column 3: Technical */}
      <div className="hub-column">
        <div className="hub-column-header">
          <span className="hub-column-title">
            <Terminal size={20} color="var(--accent-dev)" />
            TECHNICAL
          </span>
        </div>

        <div className="agent-card">
           <div className="task-stack">
              <div className="task-tile" style={{opacity: 0.5}}>
                <div className="task-icon"><FileText size={18} color="var(--text-muted)" /></div>
                <div>
                  <div className="status-label">POST-PROCESS</div>
                  <div className="task-text">Analysis agent idling...</div>
                </div>
              </div>
           </div>
           
           <div style={{marginTop: 'auto', background: 'var(--bg-main)', padding: '20px', borderRadius: '16px', border: '1px dashed var(--border)'}}>
              <div style={{fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em'}}>CONSOLE_CORE</div>
              <div style={{fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.6}}>
                $ uptime: 124m <br/>
                $ heartrate: 60bpm <br/>
                $ listening for triggers...
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AgentHub;
