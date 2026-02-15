import React, { useState, useEffect } from 'react';
import { fetchTickets, sendChatMessage, createTicket, fetchAgentProgress } from './services/api';
import ChatSidebar from './components/chat/ChatSidebar';
import WorkspaceNav from './components/workspace/WorkspaceNav';
import AgentHub from './components/workspace/AgentHub';

const App = () => {
  const [messages, setMessages] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [progress, setProgress] = useState({ steps: [], logs: [], final_response: null });
  const [isLoading, setIsLoading] = useState(false);
  const [expandedParents, setExpandedParents] = useState(new Set());
  const [activeAgent, setActiveAgent] = useState('specs'); // 'specs' or 'dev'
  const [activeTicket, setActiveTicket] = useState(null); // ticket key
  const [activeBranch, setActiveBranch] = useState('main'); 
  const [pendingFinalResponse, setPendingFinalResponse] = useState(false);
  const [showApproval, setShowApproval] = useState(false);
  const [activeView, setActiveView] = useState('overview'); // 'overview' | 'browser'

  // Parse agent messages to detect approval request
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.role === 'agent' && (
        lastMsg.content.toLowerCase().includes("approve") || 
        lastMsg.content.toLowerCase().includes("browser tab")
    )) {
        setShowApproval(true);
    } else {
        setShowApproval(false);
    }
  }, [messages]);

  const handleApproval = () => {
    handleSendMessage("Approve");
    setShowApproval(false);
  };


  // Initial Data Load & Polling
  useEffect(() => {
    loadTickets();
    const interval = setInterval(loadTickets, 10000);
    return () => clearInterval(interval);
  }, []);

  // WebSocket for real-time progress
  useEffect(() => {
    // Initial fetch to get current state
    fetchAgentProgress(activeAgent).then(setProgress);

    const ws = new WebSocket(`ws://${window.location.hostname}:8000/ws`);
    
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'progress') {
        if (message.task_id === activeAgent) {
            setProgress(message.data);
            
            // Check if background task finished
            if (pendingFinalResponse && message.data.final_response) {
              handleAgentTaskComplete(message.data.final_response);
              setPendingFinalResponse(false);
            }
        }
      }
    };

    ws.onopen = () => console.log("Connected to Progress WebSocket");
    ws.onclose = () => console.log("Disconnected from Progress WebSocket");

    return () => ws.close();
  }, [activeAgent, pendingFinalResponse]);

  const loadTickets = async () => {
    const data = await fetchTickets();
    setTickets(data);
  };

  const handleAgentTaskComplete = (finalText) => {
    // Parse proposal JSON if present
    let proposalData = null;
    let textToReplace = '';

    const codeBlockMatch = finalText.match(/```json([\s\S]*?)```/);
    if (codeBlockMatch) {
      try {
        proposalData = JSON.parse(codeBlockMatch[1]);
        textToReplace = codeBlockMatch[0];
      } catch (e) {}
    }

    const cleanContent = finalText.replace(textToReplace, '').trim();

    setMessages(prev => [...prev, { 
      id: Date.now(), 
      role: 'agent', 
      content: cleanContent,
      proposal: proposalData 
    }]);
    
    setIsLoading(false);
    loadTickets();
    // One final progress fetch to get the "completed" ticks
    fetchAgentProgress(activeAgent).then(data => {
        setProgress(data);
        // If implementation is completed, show approval button (Dev only)
        if (activeAgent === 'dev') {
            const implStep = data.steps.find(s => s.label.toLowerCase().includes('implement'));
            if (implStep && implStep.status === 'completed') {
                setShowApprovalAction(true);
            }
        }
    });
  };

  const handleSendMessage = async (userText) => {
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', content: userText }]);
    setIsLoading(true);

    try {
      const metadata = {
          ticket_key: activeTicket,
          branch: activeBranch
      };
      const data = await sendChatMessage(userText, activeAgent, metadata);
      
      if (activeAgent === 'dev' || activeAgent === 'qa') {
          // Dev/QA agent returns immediately while background task runs
          setPendingFinalResponse(true);
          setMessages(prev => [...prev, { 
            id: Date.now() + 1, 
            role: 'agent', 
            content: data.response 
          }]);
      } else {
          // Specs Agent is synchronous
          handleAgentTaskComplete(data.response);
      }
    } catch (err) {
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'error', content: 'Connection failed.' }]);
      setIsLoading(false);
    }
  };

  const handleApproveProposal = async (msgId, draft) => {
    try {
      const newTicket = await createTicket(draft);
      
      // Update message to remove proposal and show success
      setMessages(prev => prev.map(msg => 
        msg.id === msgId 
          ? { ...msg, proposal: null, content: msg.content + `\n\n✅ Ticket ${newTicket.key || newTicket.ticket_key} successfully created.` } 
          : msg
      ));
      
      loadTickets();
    } catch (err) {
      console.error("Failed to approve ticket", err);
    }
  };

  const handleCancelProposal = (msgId) => {
    setMessages(prev => prev.map(msg => 
      msg.id === msgId ? { ...msg, proposal: null, content: msg.content + "\n\n❌ Proposal discarded." } : msg
    ));
  };

  const toggleParent = (key) => {
    const newSet = new Set(expandedParents);
    if (newSet.has(key)) newSet.delete(key);
    else newSet.add(key);
    setExpandedParents(newSet);
  };

  return (
    <div className="app-wrapper">
      <ChatSidebar 
        messages={messages}
        isLoading={isLoading}
        onSendMessage={handleSendMessage}
        tickets={tickets}
        onApproveProposal={handleApproveProposal}
        onCancelProposal={handleCancelProposal}
        activeAgent={activeAgent}
        setActiveAgent={setActiveAgent}
        activeTicket={activeTicket}
        setActiveTicket={setActiveTicket}
        activeBranch={activeBranch}
        setActiveBranch={setActiveBranch}
        showApprovalAction={showApproval}
        onApprovePush={handleApproval}
      />

      <main className="workspace-canvas">
        <WorkspaceNav activeView={activeView} setActiveView={setActiveView} />
        <AgentHub 
          tickets={tickets}
          progress={progress}
          expandedParents={expandedParents}
          onToggle={toggleParent}
          activeAgent={activeAgent}
          activeView={activeView}
        />
      </main>
    </div>
  );
};

export default App;
