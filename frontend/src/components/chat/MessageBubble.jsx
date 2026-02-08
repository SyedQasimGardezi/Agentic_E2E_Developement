import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ProposalCard from './ProposalCard';

const MessageBubble = ({ msg, onApprove, onCancel }) => {
  const isAgent = msg.role === 'agent';
  
  // Custom renderer for mentions
  const renderMentions = (text) => {
    // Replace @MENTION with a special markdown link
    return text.replace(/(@[\w-]+)/g, '[$1](mention://$1)');
  };

  const components = {
    a: ({ node, ...props }) => {
      if (props.href && props.href.startsWith('mention://')) {
        const mentionText = props.href.replace('mention://', '');
        return <span className="mention-badge">{mentionText}</span>;
      }
      return <a {...props} target="_blank" rel="noopener noreferrer" style={{color: 'var(--accent-specs)', textDecoration: 'underline'}} />;
    },
    p: ({node, ...props}) => <div style={{marginBottom: '0.5em'}} {...props} />,
    ul: ({node, ...props}) => <ul style={{marginLeft: '1.2em', marginBottom: '0.5em'}} {...props} />,
    ol: ({node, ...props}) => <ol style={{marginLeft: '1.2em', marginBottom: '0.5em'}} {...props} />,
    li: ({node, ...props}) => <li style={{marginBottom: '0.2em'}} {...props} />,
    code: ({node, inline, className, children, ...props}) => {
      return !inline ? (
        <div style={{background: '#1e293b', color: '#e2e8f0', padding: '12px', borderRadius: '8px', overflowX: 'auto', margin: '0.5em 0', fontSize: '0.85em'}}>
          <code className={className} {...props}>
            {children}
          </code>
        </div>
      ) : (
        <code className={className} style={{background: 'rgba(0,0,0,0.06)', padding: '2px 4px', borderRadius: '4px', fontSize: '0.9em', fontFamily: 'monospace'}} {...props}>
          {children}
        </code>
      );
    }
  };

  const processedContent = renderMentions(msg.content || '');

  return (
    <div className={`msg-bubble ${msg.role}`}>
      {isAgent && (
        <div style={{fontSize: '0.65rem', fontWeight: 800, color: 'var(--accent-specs)', marginBottom: 8, letterSpacing: '0.05em'}}>
          SYSTEM TRACE // EXECUTED
        </div>
      )}
      
      <div className="markdown-content">
        <ReactMarkdown 
          children={processedContent} 
          remarkPlugins={[remarkGfm]}
          components={components}
        />
      </div>

      {msg.proposal && (
        <ProposalCard 
          data={msg.proposal} 
          onApprove={(draft) => onApprove(msg.id, draft)}
          onCancel={() => onCancel(msg.id)}
        />
      )}
    </div>
  );
};

export default MessageBubble;
