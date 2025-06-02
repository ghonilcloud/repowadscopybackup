const API_URL = '/api/chats';

const chatService = {
    async getMessages(ticketId) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/${ticketId}/messages`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Failed to fetch messages');
        }

        const data = await response.json();
        return data.messages;
    },

    async sendMessage(ticketId, message) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/${ticketId}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message })
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Failed to send message');
        }

        return await response.json(); // The server returns the chat message directly
    }
};

export default chatService;