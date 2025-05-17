// API utility for centralized endpoint management
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Socket.io server URL
export const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5001';

// API endpoints
export const API_ENDPOINTS = {
  auth: `${API_BASE_URL}/auth`,
  login: `${API_BASE_URL}/auth/login`,
  register: `${API_BASE_URL}/auth/register`,
  services: `${API_BASE_URL}/services`,
  favorites: `${API_BASE_URL}/favorites`,
  bookings: `${API_BASE_URL}/bookings`,
  categories: `${API_BASE_URL}/categories`,
  profile: `${API_BASE_URL}/users/profile`,
  reviews: `${API_BASE_URL}/reviews`,
  userReviews: `${API_BASE_URL}/users/me/reviews`,
  notifications: `${API_BASE_URL}/notifications`,
  providers: `${API_BASE_URL}/providers`,
  subscriptions: `${API_BASE_URL}/subscriptions`,
  paymentMethods: `${API_BASE_URL}/payment-methods`,
  loyalty: `${API_BASE_URL}/loyalty`,
  serviceReviews: (serviceId) => `${API_BASE_URL}/services/${serviceId}/reviews`,
};

// Auth endpoints
export const AUTH_ENDPOINTS = {
  SOCIAL_LOGIN: `${API_BASE_URL}/auth/social-login`,
  REQUEST_OTP: `${API_BASE_URL}/auth/otp/request`,
  VERIFY_OTP: `${API_BASE_URL}/auth/otp/verify`,
  FORGOT_PASSWORD: `${API_BASE_URL}/auth/password/forgot`,
  RESET_PASSWORD: `${API_BASE_URL}/auth/password/reset`,
  VERIFY_EMAIL: `${API_BASE_URL}/auth/verify-email`,
};

// Service endpoints
export const SERVICE_ENDPOINTS = {
  LIST: `${API_BASE_URL}/services`,
  DETAIL: (id) => `${API_BASE_URL}/services/${id}`,
  CREATE: `${API_BASE_URL}/services`,
  UPDATE: (id) => `${API_BASE_URL}/services/${id}`,
  DELETE: (id) => `${API_BASE_URL}/services/${id}`,
};

// Favorites endpoints
export const FAVORITES_ENDPOINTS = {
  LIST: `${API_BASE_URL}/favorites`,
  ADD: `${API_BASE_URL}/favorites`,
  REMOVE: (serviceId) => `${API_BASE_URL}/favorites/${serviceId}`,
};

// Booking endpoints
export const BOOKING_ENDPOINTS = {
  CREATE: `${API_BASE_URL}/bookings`,
  LIST_MY: `${API_BASE_URL}/bookings/me`,
  DETAIL: (id) => `${API_BASE_URL}/bookings/${id}`,
  UPDATE_STATUS: (id) => `${API_BASE_URL}/bookings/${id}/status`,
  ADD_RATING: (id) => `${API_BASE_URL}/bookings/${id}/rating`,
};

// Payment endpoints
export const PAYMENT_ENDPOINTS = {
  PROCESS: `${API_BASE_URL}/payments/process`,
  LIST_MY: `${API_BASE_URL}/payments/me`,
  DETAIL: (id) => `${API_BASE_URL}/payments/${id}`,
  REFUND: `${API_BASE_URL}/payments/refund`,
};

// Chat endpoints
export const CHAT_ENDPOINTS = {
  LIST_MY: `${API_BASE_URL}/chats/me`,
  DETAIL: (id) => `${API_BASE_URL}/chats/${id}`,
  CREATE: `${API_BASE_URL}/chats`,
  ADD_MESSAGE: (chatId) => `${API_BASE_URL}/chats/${chatId}/messages`,
  MARK_READ: (chatId) => `${API_BASE_URL}/chats/${chatId}/read`,
};

// User endpoints
export const USER_ENDPOINTS = {
  SEARCH: (term) => `${API_BASE_URL}/users/search?term=${term}`,
};

// Provider endpoints
export const PROVIDER_ENDPOINTS = {
  PROFILE: `${API_BASE_URL}/providers/profile`,
  SERVICES: `${API_BASE_URL}/providers/services`,
  BOOKINGS: `${API_BASE_URL}/providers/bookings`,
  METRICS: `${API_BASE_URL}/providers/metrics`,
  AVAILABILITY: `${API_BASE_URL}/providers/availability`,
  INSIGHTS: `${API_BASE_URL}/providers/insights`,
  UPDATE_BOOKING_STATUS: (bookingId) => `${API_BASE_URL}/providers/bookings/${bookingId}/status`,
  RESPOND_TO_REVIEW: (reviewId) => `${API_BASE_URL}/reviews/${reviewId}/respond`,
};

// Review endpoints
export const REVIEW_ENDPOINTS = {
  LIST: `${API_BASE_URL}/reviews`,
  SERVICE_REVIEWS: (serviceId) => `${API_BASE_URL}/services/${serviceId}/reviews`,
  USER_REVIEWS: `${API_BASE_URL}/users/me/reviews`,
  CREATE: `${API_BASE_URL}/reviews`,
  UPDATE: (reviewId) => `${API_BASE_URL}/reviews/${reviewId}`,
  DELETE: (reviewId) => `${API_BASE_URL}/reviews/${reviewId}`,
  RESPOND: (reviewId) => `${API_BASE_URL}/reviews/${reviewId}/respond`,
};

export default {
  AUTH_ENDPOINTS,
  SERVICE_ENDPOINTS,
  FAVORITES_ENDPOINTS,
  BOOKING_ENDPOINTS,
  PAYMENT_ENDPOINTS,
  CHAT_ENDPOINTS,
  USER_ENDPOINTS,
  PROVIDER_ENDPOINTS,
  REVIEW_ENDPOINTS,
  API_ENDPOINTS,
  SOCKET_URL,
};
