const API_BASE = 'http://localhost:8000';

export const fetchTickets = async () => {
  try {
    const res = await fetch(`${API_BASE}/jira/tickets`);
    return await res.json();
  } catch (err) {
    console.error("Failed to fetch tickets", err);
    return [];
  }
};

export const sendChatMessage = async (userText) => {
  try {
    const res = await fetch(`${API_BASE}/agent/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userText })
    });
    return await res.json();
  } catch (err) {
    console.error("Chat failed", err);
    throw err;
  }
};

export const createTicket = async (ticketData) => {
  try {
    const res = await fetch(`${API_BASE}/jira/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ticketData)
    });
    return await res.json();
  } catch (err) {
    console.error("Failed to create ticket", err);
    throw err;
  }
};
