import config from "./config.js";

/**
 * API Client for Herdoza Fitness Center
 * This file provides functions to communicate with the backend
 */

// API Client Configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

// Base API URL
const API_URL = "http://localhost:3000/api";

// Simple function to handle fetch requests with error handling
async function fetchAPI(endpoint, options = {}) {
  try {
    // Add default headers
    options.headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    // Add auth token if available
    const token = localStorage.getItem("userToken");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: "include",
    });

    // Handle unauthenticated responses
    if (response.status === 401) {
      // Redirect to login page if unauthorized
      window.location.href = "/login.html";
      return null;
    }

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    // Parse JSON if the response has content
    if (response.status !== 204) {
      return await response.json();
    }

    return true;
  } catch (error) {
    console.error("API Request failed:", error);
    throw error;
  }
}

// User API Functions
const userApi = {
  // Authentication
  login: (email, password) => {
    return fetchAPI("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  register: (userData) => {
    return fetchAPI("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  // Booking functions
  bookSession: (bookingData) => {
    return fetchAPI("/user/book-session", {
      method: "POST",
      body: JSON.stringify(bookingData),
    });
  },

  getUserBookings: () => {
    return fetchAPI("/user/bookings");
  },

  // Membership functions
  getUserMembership: () => {
    return fetchAPI("/user/membership");
  },

  updateMembership: (membershipData) => {
    return fetchAPI("/user/membership", {
      method: "POST",
      body: JSON.stringify(membershipData),
    });
  },

  // Get all announcements/events
  getAnnouncements: () => {
    return fetchAPI("/announcements");
  },
};

// Export the API client to window object so it can be used globally
window.api = {
  user: userApi,
};
