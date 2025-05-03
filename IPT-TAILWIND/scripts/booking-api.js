import config from "./config.js";

/**
 * Booking API Service
 * This file provides functions for booking operations and connects the user frontend
 * with the admin panel via localStorage or API calls.
 */

// Base API URL
const API_URL = config.apiUrl;

/**
 * Create a new booking
 * @param {Object} bookingData - The booking data object
 * @returns {Promise<Object>} - The created booking
 */
async function createBooking(bookingData) {
  try {
    // Add timestamp and generate unique ID
    const booking = {
      ...bookingData,
      id: generateUniqueId(),
      timestamp: new Date().toISOString(),
      status: "pending",
    };

    // Store both booking and registration
    storeBookingInLocalStorage(booking);
    storeRegistrationInLocalStorage(booking);

    return booking;
  } catch (error) {
    console.error("Error creating booking:", error);
    throw error;
  }
}

/**
 * Get all bookings for the current user
 * @returns {Promise<Array>} - Array of user bookings
 */
async function getUserBookings() {
  const userToken = localStorage.getItem("userToken");
  const userId =
    localStorage.getItem("userId") || getUserIdFromToken(userToken);

  if (!userId) {
    console.error("No user ID found");
    return [];
  }

  try {
    // Try to fetch from API
    try {
      const response = await fetch(`${API_URL}/booking/user`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.bookings || [];
      }
    } catch (apiError) {
      console.log("API not available, using localStorage");
    }

    // Fallback to localStorage
    const allBookings = JSON.parse(
      localStorage.getItem("adminBookingsData") || "[]"
    );
    return allBookings.filter((booking) => booking.userId === userId);
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    return [];
  }
}

/**
 * Store booking in localStorage for admin panel integration
 * @param {Object} booking - The booking object
 */
function storeBookingInLocalStorage(booking) {
  // Get existing bookings
  const bookings = JSON.parse(
    localStorage.getItem("adminBookingsData") || "[]"
  );

  // Add new booking
  bookings.push(booking);

  // Save back to localStorage
  localStorage.setItem("adminBookingsData", JSON.stringify(bookings));
}

/**
 * Store registration in localStorage for admin tracking
 * @param {Object} booking - The booking object
 */
function storeRegistrationInLocalStorage(booking) {
  const registrations = JSON.parse(
    localStorage.getItem("registrations") || "[]"
  );

  // Format registration data
  const registration = {
    id: booking.id,
    name: localStorage.getItem("userName") || "Guest User",
    email: localStorage.getItem("userEmail") || "",
    contact: localStorage.getItem("userContact") || "",
    type: booking.sessionType || "Gym Fitness",
    paymentMethod: booking.paymentMethod,
    membershipDuration: booking.duration || "1 Month",
    timestamp: booking.timestamp,
    status: "pending",
  };

  registrations.push(registration);
  localStorage.setItem("registrations", JSON.stringify(registrations));
}

/**
 * Generate a unique ID for the booking
 * @returns {string} - A unique ID string
 */
function generateUniqueId() {
  return (
    "booking-" + Date.now() + "-" + Math.random().toString(36).substring(2, 9)
  );
}

/**
 * Extract user ID from JWT token (simple implementation)
 * @param {string} token - The JWT token
 * @returns {string|null} - The extracted user ID or null
 */
function getUserIdFromToken(token) {
  if (!token) return null;

  try {
    // JWT tokens have 3 parts: header.payload.signature
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    // Decode the payload (middle part)
    const payload = JSON.parse(atob(parts[1]));
    return payload.userId || payload.sub || null;
  } catch (error) {
    console.error("Error parsing token:", error);
    return null;
  }
}

/**
 * Cancel a booking by ID
 * @param {string} bookingId - The ID of the booking to cancel
 * @returns {Promise<boolean>} - True if successful, false otherwise
 */
async function cancelBooking(bookingId) {
  try {
    // Try API first
    try {
      const response = await fetch(`${API_URL}/booking/${bookingId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
      });

      if (response.ok) {
        // Also update localStorage
        removeBookingFromLocalStorage(bookingId);
        return true;
      }
    } catch (apiError) {
      console.log("API not available, using localStorage only");
    }

    // Fallback to localStorage
    removeBookingFromLocalStorage(bookingId);
    return true;
  } catch (error) {
    console.error("Error canceling booking:", error);
    return false;
  }
}

/**
 * Remove a booking from localStorage
 * @param {string} bookingId - The ID of the booking to remove
 */
function removeBookingFromLocalStorage(bookingId) {
  const bookings = JSON.parse(
    localStorage.getItem("adminBookingsData") || "[]"
  );
  const updatedBookings = bookings.filter(
    (booking) => booking.id !== bookingId
  );
  localStorage.setItem("adminBookingsData", JSON.stringify(updatedBookings));
}

/**
 * Get a booking by ID
 * @param {string} bookingId - The ID of the booking to retrieve
 * @returns {Promise<Object|null>} - The booking object or null if not found
 */
async function getBookingById(bookingId) {
  try {
    // Try API first
    try {
      const response = await fetch(`${API_URL}/booking/${bookingId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.booking || null;
      }
    } catch (apiError) {
      console.log("API not available, using localStorage");
    }

    // Fallback to localStorage
    const bookings = JSON.parse(
      localStorage.getItem("adminBookingsData") || "[]"
    );
    return bookings.find((booking) => booking.id === bookingId) || null;
  } catch (error) {
    console.error("Error fetching booking:", error);
    return null;
  }
}

// Export functions for use in other scripts
window.bookingApi = {
  createBooking,
  getUserBookings,
  cancelBooking,
  getBookingById,
};
