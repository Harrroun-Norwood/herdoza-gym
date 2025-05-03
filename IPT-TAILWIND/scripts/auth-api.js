/**
 * API functions for authentication
 * This file contains functions to communicate with the backend API for authentication
 */

// Authentication API client for interacting with backend
// This abstracts away the API calls for user authentication

// Base API URL
const API_URL = "http://localhost:3000/api";

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Promise} - Response from the API
 */
async function registerUser(userData) {
  try {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Registration failed");
    }

    return data;
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
}

/**
 * Login a user
 * @param {Object} credentials - Login credentials (email and password)
 * @returns {Promise} - Response from the API
 */
async function loginUser(credentials) {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    return data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

/**
 * Get the current logged-in user
 * @returns {Promise} - User data or null if not logged in
 */
async function getCurrentUser() {
  try {
    const response = await fetch(`${API_URL}/auth/user`, {
      credentials: "include",
    });

    if (!response.ok) {
      if (response.status === 401) {
        return null;
      }
      throw new Error("Error getting current user");
    }

    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error("Get current user error:", error);
    return null;
  }
}

/**
 * Logout the current user
 * @returns {Promise} - Response from the API
 */
async function logoutUser() {
  try {
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Logout failed");
    }

    return data;
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
}

/**
 * Request a password reset email for a user
 * @param {string} email - The email of the user requesting a password reset
 * @returns {Promise} - Response from the API
 */
async function requestPasswordReset(email) {
  try {
    const response = await fetch(`${API_URL}/auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Password reset request failed");
    }

    return data;
  } catch (error) {
    console.error("Password reset request error:", error);
    throw error;
  }
}

/**
 * Reset user password with token
 * @param {Object} resetData - Password reset data including token and new password
 * @returns {Promise} - Response from the API
 */
async function resetPassword(resetData) {
  try {
    const response = await fetch(`${API_URL}/auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(resetData),
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Password reset failed");
    }

    return data;
  } catch (error) {
    console.error("Password reset error:", error);
    throw error;
  }
}

/**
 * Update user's membership information
 * @param {Object} membershipData - Membership data to update (type, duration, fee, hasTrainer)
 * @returns {Promise} - Response from the API
 */
async function updateMembership(membershipData) {
  try {
    const response = await fetch(`${API_URL}/user/update-membership`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(membershipData),
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Membership update failed");
    }

    return data;
  } catch (error) {
    console.error("Membership update error:", error);
    throw error;
  }
}

// Make auth functions available globally
window.authApi = {
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser,
  requestPasswordReset,
  resetPassword,
  updateMembership,
};
