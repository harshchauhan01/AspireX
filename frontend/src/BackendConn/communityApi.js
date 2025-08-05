import { API_BASE_URL } from './api.js';

// Helper function to get the appropriate token
const getAuthToken = () => {
  const mentorToken = localStorage.getItem('Mentortoken');
  const studentToken = localStorage.getItem('token');
  return mentorToken || studentToken;
};

// Helper function to determine user role
const getUserRole = () => {
  const mentorToken = localStorage.getItem('Mentortoken');
  if (mentorToken) return 'mentor';
  const studentToken = localStorage.getItem('token');
  if (studentToken) return 'student';
  return null;
};

// Helper function to make authenticated requests
const makeAuthenticatedRequest = async (url, options = {}) => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`,
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${url}`, config);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  // Handle 204 No Content responses (like DELETE requests)
  if (response.status === 204) {
    return { message: 'Success' };
  }

  return response.json();
};

// Community Feed API functions
export const communityApi = {
  // Get all posts (last 10 days)
  getPosts: async () => {
    return makeAuthenticatedRequest('/community/posts/');
  },

  // Get user's own posts
  getMyPosts: async () => {
    return makeAuthenticatedRequest('/community/my-posts/');
  },

  // Create a new post
  createPost: async (text) => {
    return makeAuthenticatedRequest('/community/posts/', {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  },

  // Delete a post
  deletePost: async (postId) => {
    return makeAuthenticatedRequest(`/community/delete-post/${postId}/`, {
      method: 'DELETE',
    });
  },

  // Like/unlike a post
  toggleLike: async (postId) => {
    return makeAuthenticatedRequest('/community/like/', {
      method: 'POST',
      body: JSON.stringify({ post_id: postId }),
    });
  },

  // Add a comment to a post
  addComment: async (postId, text) => {
    return makeAuthenticatedRequest('/community/comment/', {
      method: 'POST',
      body: JSON.stringify({ post_id: postId, text }),
    });
  },

  // Get comments for a post
  getComments: async (postId) => {
    return makeAuthenticatedRequest(`/community/comments/${postId}/`);
  },

  // Get user profile data (name, role, profile_photo)
  getCurrentUserProfile: async () => {
    const role = getUserRole();
    if (!role) throw new Error('No authentication token found');
    let url = '';
    if (role === 'mentor') url = '/mentor/profile/';
    else if (role === 'student') url = '/student/profile/';
    else throw new Error('Unknown user role');
    const data = await makeAuthenticatedRequest(url);
    if (role === 'mentor') {
      return {
        name: data.name,
        role: 'mentor',
        profile_photo: data.details?.profile_photo || null,
      };
    } else {
      return {
        name: data.name,
        role: 'student',
        profile_photo: data.details?.profile_photo || null,
      };
    }
  },

  // Increment view count for a post
  incrementView: async (postId) => {
    const response = await fetch(`${API_BASE_URL}/community/posts/${postId}/view/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error('Failed to increment view');
    const data = await response.json();
    return data.views;
  },
};

export default communityApi; 