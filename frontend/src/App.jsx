import React, { useState, useEffect } from 'react';
import { fetchTickets, sendChatMessage, createTicket } from './services/api';
import ChatSidebar from './components/chat/ChatSidebar';
import WorkspaceNav from './components/workspace/WorkspaceNav';
import AgentHub from './components/workspace/AgentHub';

const App = () => {
  const [messages, setMessages] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedParents, setExpandedParents] = useState(new Set());

  // Initial Data Load & Polling
  useEffect(() => {
    loadTickets();
    const interval = setInterval(loadTickets, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadTickets = async () => {
    const data = await fetchTickets();
    setTickets(data);
  };

  const handleSendMessage = async (userText) => {
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', content: userText }]);
    setIsLoading(true);

    try {
      const data = await sendChatMessage(userText);
      
      // Parse proposal JSON if present
      let proposalData = null;
      let textToReplace = '';

      // 1. Try to find markdown code block first
      const codeBlockMatch = data.response.match(/```json([\s\S]*?)```/);
      if (codeBlockMatch) {
        try {
          proposalData = JSON.parse(codeBlockMatch[1]);
          textToReplace = codeBlockMatch[0];
        } catch (e) {
          console.error("Failed to parse JSON from code block", e);
        }
      }

      // 2. Fallback to raw JSON regex if no valid code block found
      if (!proposalData) {
        const jsonMatch = data.response.match(/\{[\s\S]*"type"\s*:\s*"PROPOSAL"[\s\S]*\}/);
        if (jsonMatch) {
           try {
             proposalData = JSON.parse(jsonMatch[0]);
             textToReplace = jsonMatch[0];
           } catch (e) {
             console.error("Failed to parse proposal JSON", e);
           }
        }
      }

      // Clean the response text by removing the JSON block
      const cleanContent = data.response.replace(textToReplace, '').trim();

      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        role: 'agent', 
        content: cleanContent,
        proposal: proposalData 
      }]);
      
      // Refresh tickets in case agent did immediate actions
      loadTickets();
      setTimeout(loadTickets, 2000); // Delayed refetch for indexing
    } catch (err) {
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'error', content: 'Connection failed.' }]);
    } finally {
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
      />

      <main className="workspace-canvas">
        <WorkspaceNav />
        <AgentHub 
          tickets={tickets}
          expandedParents={expandedParents}
          onToggle={toggleParent}
        />
      </main>
    </div>
  );
};

export default App;
