import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { ShieldCheck, X, FileEdit, Check, Trash2 } from 'lucide-react';

const ProposalCard = ({ data, onApprove, onCancel }) => {
  const [isReviewing, setIsReviewing] = useState(false);
  const [draft, setDraft] = useState(data);

  return (
    <>
      <div 
        className="proposal-card trigger"
        onClick={() => setIsReviewing(true)}
      >
        <div className="proposal-header">
           <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
             <div style={{background: 'rgba(255,255,255,0.2)', padding: 6, borderRadius: 6}}>
               <ShieldCheck size={16} color="white" />
             </div>
             <div style={{display: 'flex', flexDirection: 'column'}}>
                <span style={{fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.05em'}}>TICKET PROPOSAL</span>
                <span style={{fontSize: '0.65rem', opacity: 0.8, fontWeight: 500}}>Ready for review</span>
             </div>
           </div>
           
           <button style={{
               background: 'white', 
               color: 'var(--accent-pm)', 
               border: 'none', 
               padding: '6px 14px', 
               borderRadius: 20,
               fontSize: '0.7rem',
               fontWeight: 700,
               cursor: 'pointer',
               boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
           }}>
             REVIEW
           </button>
        </div>
      </div>

      {isReviewing && createPortal(
        <div className="modal-overlay" onClick={() => setIsReviewing(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
               <div className="modal-title" style={{color: 'var(--text-primary)'}}>
                 <FileEdit size={18} color="var(--accent-pm)" />
                 Review Ticket Proposal
               </div>
               <button 
                 onClick={() => setIsReviewing(false)} 
                 style={{background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center'}}
               >
                 <X size={20} color="var(--text-muted)" />
               </button>
            </div>

            <div className="modal-body">
                <div style={{display: 'flex', flexDirection: 'column', gap: 6}}>
                  <label style={{fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase'}}>Summary</label>
                  <input 
                    style={{
                        padding: '10px 12px', 
                        borderRadius: 8, 
                        border: '1px solid var(--border)', 
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        outline: 'none',
                        width: '100%'
                    }}
                    value={draft.summary} 
                    onChange={e => setDraft({...draft, summary: e.target.value})}
                    autoFocus
                  />
                </div>
                
                <div style={{display: 'flex', flexDirection: 'column', gap: 6}}>
                  <label style={{fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase'}}>Description</label>
                  <textarea 
                    style={{
                        padding: '12px', 
                        borderRadius: 8, 
                        border: '1px solid var(--border)', 
                        fontSize: '0.85rem',
                        minHeight: '140px',
                        resize: 'vertical', 
                        fontFamily: 'monospace',
                        lineHeight: 1.5,
                        outline: 'none',
                        width: '100%'
                    }}
                    value={draft.description} 
                    onChange={e => setDraft({...draft, description: e.target.value})}
                  />
                </div>

                <div style={{display: 'flex', gap: 16, marginTop: 4}}>
                  <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 6}}>
                    <label style={{fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase'}}>Issue Type</label>
                    <div style={{
                        background: 'var(--bg-main)', 
                        padding: '10px', 
                        borderRadius: 8, 
                        border: '1px solid var(--border)',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: 'var(--text-primary)'
                    }}>
                        {draft.issue_type}
                    </div>
                  </div>
                  <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 6}}>
                     <label style={{fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase'}}>Parent Ticket</label>
                     <div style={{
                        background: 'var(--bg-main)', 
                        padding: '10px', 
                        borderRadius: 8, 
                        border: '1px solid var(--border)',
                        fontSize: '0.85rem',
                        color: draft.parent_key ? 'var(--text-primary)' : 'var(--text-muted)'
                    }}>
                        {draft.parent_key || 'None'}
                    </div>
                  </div>
                </div>
            </div>

            <div className="modal-footer">
               <button 
                 className="proposal-btn cancel" 
                 style={{
                     flex: '0 0 auto', 
                     padding: '10px 20px', 
                     borderRadius: 8, 
                     border: '1px solid #fee2e2', 
                     background: '#fff',
                     color: '#ef4444',
                     display: 'flex',
                     alignItems: 'center',
                     gap: 6
                 }}
                 onClick={onCancel}
               >
                 <Trash2 size={16} /> Discard
               </button>
               <button 
                 className="proposal-btn approve" 
                 style={{
                     flex: '0 0 auto', 
                     padding: '10px 24px', 
                     borderRadius: 8, 
                     background: 'var(--accent-dev)', 
                     color: 'white', 
                     fontWeight: 700,
                     border: 'none',
                     display: 'flex',
                     alignItems: 'center',
                     gap: 8,
                     boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
                 }}
                 onClick={() => onApprove(draft)}
               >
                 <Check size={18} /> CONFIRM & CREATE
               </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default ProposalCard;
