import React from 'react';
import { 
  CheckCircle2, 
  ChevronDown, 
  ChevronRight,
  CircleEllipsis,
  Clock,
  Loader2 
} from 'lucide-react';

const TaskTile = ({ ticket, subtasks, isExpanded, onToggle }) => {
  const isParent = !ticket.parent_key;
  const hasMethod = subtasks && subtasks.length > 0;

  return (
    <div 
      className={`task-tile ${isParent ? 'parent' : 'subtask'} ${hasMethod && 'has-children'}`}
      onClick={() => isParent && hasMethod && onToggle(ticket.key)}
      style={{cursor: (isParent && hasMethod) ? 'pointer' : 'default'}}
      title={ticket.status || 'To Do'}
    >
      <div className="task-icon">
        {isParent ? (
          hasMethod ? (
            isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />
          ) : (
            (() => {
              const s = (ticket.status || '').toLowerCase();
              if (s === 'in progress') return <Loader2 size={18} color="var(--accent-specs)" className="animate-spin" />;
              if (s === 'in review') return <Clock size={18} color="#8b5cf6" />; // Purple
              if (s === 'done') return <CheckCircle2 size={18} color="var(--accent-dev)" />;
              return <CircleEllipsis size={18} color="#94a3b8" strokeWidth={2.5} />; // CircleEllipsis for To Do (Pending)
            })()
          )
        ) : (
          <div className="subtask-dot" />
        )}
      </div>
      <div style={{flex: 1}}>
        <div className="status-label">
          {ticket.key}
          {isParent && hasMethod && (
            <span className="subtask-count">{subtasks.length} SUB-UNITS</span>
          )}
        </div>
        <div className="task-text">{ticket.summary}</div>
        <div className="hover-status-badge">
          {ticket.status || 'To Do'}
        </div>
      </div>
    </div>
  );
};

export default TaskTile;
