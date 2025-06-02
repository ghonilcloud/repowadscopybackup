const API_URL = '/api/analytics';

const analyticsService = {
    async getAnalyticsData() {
        const token = localStorage.getItem('token');
        const response = await fetch(API_URL, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Failed to fetch analytics data');
        }

        const { data } = await response.json();
        return data;
    }
};

export default analyticsService;