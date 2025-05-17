import axios from 'axios';

// Configure axios defaults
axios.defaults.headers.post['Content-Type'] = 'application/json';

// Add a request interceptor to attach auth token
axios.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    // If token exists, add to headers
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      console.log('Session expired or unauthorized. Redirecting to login...');
      // Optional: could redirect to login or show notification
    }
    
    // Pass the error to the component for handling
    return Promise.reject(error);
  }
);

export default axios;
