import API from '../../BackendConn/api';

export const earningsService = {
  // Get earnings data with statistics
  getEarnings: async (timeFilter = 'all') => {
    try {
      const response = await API.get(`mentor/earnings/?time_filter=${timeFilter}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching earnings:', error);
      throw error;
    }
  },

  // Request withdrawal
  requestWithdrawal: async (amount) => {
    try {
      const response = await API.post('mentor/earnings/withdraw/', { amount });
      return response.data;
    } catch (error) {
      console.error('Error requesting withdrawal:', error);
      throw error;
    }
  },

  // Export earnings data
  exportEarnings: async (timeFilter = 'all') => {
    try {
      const response = await API.get(`mentor/earnings/export/?time_filter=${timeFilter}`);
      return response.data;
    } catch (error) {
      console.error('Error exporting earnings:', error);
      throw error;
    }
  },

  // Get paginated earnings
  getEarningsPage: async (page = 1, timeFilter = 'all') => {
    try {
      const response = await API.get(`mentor/earnings/?time_filter=${timeFilter}&page=${page}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching earnings page:', error);
      throw error;
    }
  }
}; 