const API_URL = '/api/tickets';

const ticketService = {
    async getTicketsByUser() {
        const token = localStorage.getItem('token');
        const response = await fetch(API_URL, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch tickets');
        }

        const data = await response.json();
        return data.tickets;
    },

    async getTicketById(ticketId) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/${ticketId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch ticket');
        }

        if (!data.ticket) {
            throw new Error('Ticket not found');
        }

        return data.ticket;
    },

    async submitSurvey(ticketId, { rating, feedback }) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/${ticketId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                rating,
                ratingFeedback: feedback
            })
        });

        if (!response.ok) {
            throw new Error('Failed to submit survey');
        }

        const data = await response.json();
        return data.ticket;
    },

    async getAllTickets() {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/all`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch tickets');
        }

        const data = await response.json();
        return data.tickets;
    },

    async updateTicketStatus(ticketId, status) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/${ticketId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        });

        if (!response.ok) {
            throw new Error('Failed to update ticket status');
        }

        const data = await response.json();
        return data.ticket;
    },

    async updateTicketPriority(ticketId, priority) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/${ticketId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ priority })
        });

        if (!response.ok) {
            throw new Error('Failed to update ticket priority');
        }

        const data = await response.json();
        return data.ticket;
    },

    async assignTicket(ticketId, handlerId) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/${ticketId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ handlerId })
        });

        if (!response.ok) {
            throw new Error('Failed to assign ticket');
        }

        const data = await response.json();
        return data.ticket;
    },

    async updateTicket(ticketId, updateData) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/${ticketId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Failed to update ticket');
        }

        const data = await response.json();
        return data.ticket;
    }
};

export default ticketService;