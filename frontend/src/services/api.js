const API_BASE = 'http://localhost:8000';

export const fetchAgentProgress = async (taskId = 'dev') => {
    try {
        const res = await fetch(`${API_BASE}/agent/progress?task_id=${taskId}`);
        if (!res.ok) return { steps: [], logs: [] };
        return await res.json();
    } catch (err) {
        console.error("Failed to fetch agent progress", err);
        return { steps: [], logs: [] };
    }
};

export const fetchTickets = async () => {
  try {
    const res = await fetch(`${API_BASE}/jira/tickets`);
    return await res.json();
  } catch (err) {
    console.error("Failed to fetch tickets", err);
    return [];
  }
};

export const sendChatMessage = async (userText, agentType = 'specs', metadata = null) => {
  try {
    const res = await fetch(`${API_BASE}/agent/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
          message: userText,
          agent_type: agentType,
          metadata: metadata
      })
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

export const fetchGithubStatus = async () => {
    try {
        const res = await fetch(`${API_BASE}/github/status`);
        return await res.json();
    } catch (err) {
        console.error("Failed to fetch github status", err);
        return { connected: false };
    }
};

export const connectGithubRepo = async (repoName, token) => {
    try {
        const res = await fetch(`${API_BASE}/github/connect`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ repo_name: repoName, access_token: token })
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || "Failed to connect");
        }
        return await res.json();
    } catch (err) {
        console.error("Failed to connect repo", err);
        throw err;
    }
};

export const fetchGithubDetails = async () => {
    try {
        const res = await fetch(`${API_BASE}/github/details`);
        if (!res.ok) return null;
        return await res.json();
    } catch (err) {
        console.error("Failed to fetch github details", err);
        return null;
    }
};

export const fetchGithubRepos = async () => {
    try {
        const res = await fetch(`${API_BASE}/github/repos`);
        if (!res.ok) return [];
        return await res.json();
    } catch (err) {
        console.error("Failed to fetch github repos", err);
        return [];
    }
};

export const fetchGithubBranches = async () => {
    try {
        const res = await fetch(`${API_BASE}/github/branches`);
        if (!res.ok) return [];
        return await res.json();
    } catch (err) {
        console.error("Failed to fetch github branches", err);
        return [];
    }
};

export const createGithubRepo = async (name, description, isPrivate) => {
    try {
        const res = await fetch(`${API_BASE}/github/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, description, private: isPrivate })
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || "Failed to create repo");
        }
        return await res.json();
    } catch (err) {
        console.error("Failed to create github repo", err);
        throw err;
    }
};
