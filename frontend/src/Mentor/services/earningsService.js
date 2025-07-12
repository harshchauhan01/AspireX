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
  requestWithdrawal: async (amount, bankDetails = '', paymentMethod = 'bank_transfer') => {
    try {
      const response = await API.post('mentor/withdrawals/', { 
        amount, 
        bank_details: bankDetails,
        payment_method: paymentMethod
      });
      return response.data;
    } catch (error) {
      console.error('Error requesting withdrawal:', error);
      throw error;
    }
  },

  // Get withdrawal history
  getWithdrawals: async () => {
    try {
      const response = await API.get('mentor/withdrawals/');
      return response.data;
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
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