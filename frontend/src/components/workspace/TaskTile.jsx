import React from 'react';
import { 
  CheckCircle2, 
  ChevronDown, 
  ChevronRight,
  CircleEllipsis,
  Clock,
  Loader2,
  ExternalLink,
  AlertCircle
} from 'lucide-react';

const TaskTile = ({ ticket, subtasks, isExpanded, onToggle }) => {
  const isParent = !ticket.parent_key;
  const hasSubtasks = subtasks && subtasks.length > 0;
  
  const statusColors = {
    'done': '#10b981',
    'in progress': 'var(--accent-specs)',
    'in review': '#8b5cf6',
    'to do': '#94a3b8'
  };

  const currentStatus = (ticket.status || 'To Do').toLowerCase();
  const statusColor = statusColors[currentStatus] || '#94a3b8';

  return (
    <div 
      className={`task-tile ${isParent ? 'parent' : 'subtask'} ${hasSubtasks && 'has-children'}`}
      onClick={() => isParent && hasSubtasks && onToggle(ticket.key)}
      style={{
          cursor: (isParent && hasSubtasks) ? 'pointer' : 'default',
          border: '1px solid var(--border)',
          background: isParent ? '#ffffff' : 'rgba(248, 250, 252, 0.6)',
          boxShadow: isParent ? '0 2px 8px rgba(0,0,0,0.02)' : 'none',
          transition: 'all 0.15s ease-out',
          position: 'relative',
          overflow: 'hidden'
      }}
      title={ticket.status || 'To Do'}
    >

      <div className="task-icon">
        {isParent ? (
          hasSubtasks ? (
            <div style={{color: isExpanded ? 'var(--accent-specs)' : 'var(--text-muted)'}}>
                {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </div>
          ) : (
            <div style={{color: statusColor}}>
              {(() => {
                if (ticket.issue_type === 'Bug') return <AlertCircle size={18} color="#ef4444" />;
                if (currentStatus === 'in progress') return <Loader2 size={18} className="animate-spin" />;
                if (currentStatus === 'in review') return <Clock size={18} />;
                if (currentStatus === 'done') return <CheckCircle2 size={18} />;
                return <CircleEllipsis size={18} strokeWidth={2.5} />;
              })()}
            </div>
          )
        ) : (
             ticket.issue_type === 'Bug' || ticket.summary.toLowerCase().startsWith('qa defect') ? (
                 <div className="subtask-dot" style={{background: '#ef4444', boxShadow: '0 0 0 4px rgba(239, 68, 68, 0.1)'}} />
             ) : (
                 <div className="subtask-dot" />
             )
        )}
      </div>

      <div style={{flex: 1, minWidth: 0}}>
        <div className="status-label" style={{marginBottom: 8}}>
          <div 
            onClick={(e) => {
              if (ticket.url) {
                e.stopPropagation();
                window.open(ticket.url, '_blank');
              }
            }}
            className="jira-link-badge"
            style={{ 
              cursor: ticket.url ? 'pointer' : 'default',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(59, 130, 246, 0.08)',
              color: 'var(--accent-specs)',
              padding: '2px 8px',
              borderRadius: '6px',
              fontSize: '0.65rem',
              fontWeight: 800,
              letterSpacing: '0.05em',
              transition: 'all 0.1s ease',
              border: '1px solid rgba(59, 130, 246, 0.1)'
            }}
          >
            {ticket.key}
            {ticket.url && <ExternalLink size={10} style={{opacity: 0.6}} />}
          </div>

          {isParent && hasSubtasks && (
            <span className="subtask-count" style={{
                background: isExpanded ? 'rgba(59, 130, 246, 0.1)' : 'rgba(0,0,0,0.03)',
                color: isExpanded ? 'var(--accent-specs)' : 'var(--text-muted)'
            }}>
                {subtasks.length} SUB-UNITS
            </span>
          )}
        </div>

        <div className="task-text" style={{
            fontSize: isParent ? '0.9rem' : '0.85rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            lineHeight: 1.4,
            wordBreak: 'break-word',
            overflowWrap: 'break-word'
        }}>
            {ticket.summary}
        </div>
      </div>

      <div className="hover-status-badge">
        {ticket.status || 'To Do'}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .jira-link-badge:hover {
            background: var(--accent-specs) !important;
            color: white !important;
            transform: translateY(-1px);
        }
        .task-tile.parent:hover {
            border-color: var(--accent-specs) !important;
            transform: translateY(-2px);
            box-shadow: 0 8px 16px rgba(0,0,0,0.05);
        }
        .task-tile.subtask:hover {
            background: white !important;
        }
      `}} />
    </div>
  );
};

export default TaskTile;
