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

  // Initial Data Load & Polling
  useEffect(() => {
    loadTickets();
    const interval = setInterval(loadTickets, 10000);
    return () => clearInterval(interval);
  }, []);

  // Progress Polling
  useEffect(() => {
    const interval = setInterval(async () => {
        const data = await fetchAgentProgress();
        setProgress(data);

        // Check if background task finished
        if (pendingFinalResponse && data.final_response) {
            handleAgentTaskComplete(data.final_response);
            setPendingFinalResponse(false);
        }
    }, 2000);
    return () => clearInterval(interval);
  }, [pendingFinalResponse]);

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
      
      if (activeAgent === 'dev') {
          // Dev agent returns immediately while background task runs
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
      />

      <main className="workspace-canvas">
        <WorkspaceNav />
        <AgentHub 
          tickets={tickets}
          progress={progress}
          expandedParents={expandedParents}
          onToggle={toggleParent}
        />
      </main>
    </div>
  );
};

export default App;
