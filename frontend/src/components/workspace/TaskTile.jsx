import React from 'react';
import { 
  CheckCircle2, 
  ChevronDown, 
  ChevronRight 
} from 'lucide-react';

const TaskTile = ({ ticket, subtasks, isExpanded, onToggle }) => {
  const isParent = !ticket.parent_key;
  const hasMethod = subtasks && subtasks.length > 0;

  return (
    <div 
      className={`task-tile ${isParent ? 'parent' : 'subtask'} ${hasMethod && 'has-children'}`}
      onClick={() => isParent && hasMethod && onToggle(ticket.key)}
      style={{cursor: (isParent && hasMethod) ? 'pointer' : 'default'}}
    >
      <div className="task-icon">
        {isParent ? (
          hasMethod ? (
            isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />
          ) : (
            <CheckCircle2 size={18} color="var(--accent-dev)" />
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
      </div>
    </div>
  );
};

export default TaskTile;
