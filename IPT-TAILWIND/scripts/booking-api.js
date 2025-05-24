import config from "./config.js";

/**
 * Booking API Service
 * This file provides functions for booking operations and connects the user frontend
 * with the admin panel via localStorage or API calls.
 */

// Base API URL
const API_URL = "http://localhost:3000/api";

/**
 * Create a new booking
 * @param {Object} bookingData - The booking data object
 * @returns {Promise<Object>} - The created booking
 */
async function createBooking(bookingData) {
  try {
    const userToken = localStorage.getItem("userToken");
    const userId = localStorage.getItem("userId");

    if (!userId) {
      throw new Error("No user ID found");
    }

    // Add standard fields and handle payment status
    const standardizedBooking = handlePayment({
      ...bookingData,
      id: `booking_${Date.now()}`,
      userId,
      timestamp: new Date().toISOString(),
    });

    // Try API first
    if (userToken) {
      try {
        const response = await fetch(`${API_URL}/booking/book-session`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify(standardizedBooking),
        });

        if (response.ok) {
          const data = await response.json();
          // Store in localStorage for redundancy
          storeBookingInLocalStorage(data.booking);
          return data.booking;
        }
      } catch (apiError) {
        console.log("API not available, using localStorage");
      }
    }

    // Always store in localStorage whether API call succeeds or not
    storeBookingInLocalStorage(standardizedBooking);
    return standardizedBooking;
  } catch (error) {
    console.error("Error creating booking:", error);
    throw error;
  }
}

/**
 * Standardize payment handling
 * @param {Object} bookingData - The booking data object
 * @returns {Object} - The booking data with standardized payment status
 */
function handlePayment(bookingData) {
  const paymentMethod = bookingData.paymentMethod;

  // Initial payment status based on method
  let paymentStatus = "pending";
  let status = "pending";

  if (paymentMethod === "Gcash") {
    paymentStatus = "pending_verification";
    status = "pending_verification";
  } else if (paymentMethod === "Onsite") {
    paymentStatus = "pending_payment";
    status = "pending";
  }

  return {
    ...bookingData,
    paymentStatus,
    status,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Get all bookings for the current user
 * @returns {Promise<Object>} - Object containing grouped bookings by type
 */
async function getUserBookings() {
  try {
    const userToken = localStorage.getItem("userToken");
    const userId = localStorage.getItem("userId");

    if (!userId) {
      console.error("No user ID found");
      return getEmptyBookings();
    }

    // Try API first
    if (userToken) {
      try {
        const response = await fetch(`${API_URL}/booking/bookings`, {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          return data.bookings;
        }
      } catch (apiError) {
        console.log("API not available, using localStorage");
      }
    }

    // Fallback to localStorage
    const now = new Date();
    const filterValid = (booking) => {
      // For bulk sessions, check end date
      if (booking.endDate) {
        const endDate = new Date(booking.endDate);
        return endDate >= now && booking.userId === userId;
      }
      // For single sessions
      const bookingDate = new Date(booking.date || booking.startDate);
      return bookingDate >= now && booking.userId === userId;
    };

    // Get all bookings from localStorage
    const bookings = {
      mmaPerSession: JSON.parse(
        localStorage.getItem("mmaPerSessionBookings") || "[]"
      ).filter(filterValid),
      mmaBulkSession: JSON.parse(
        localStorage.getItem("mma25SessionUserBookings") || "[]"
      ).filter(filterValid),
      mmaZumba: JSON.parse(
        localStorage.getItem("mmaZumbaBookings") || "[]"
      ).filter(filterValid),
      zumba: JSON.parse(localStorage.getItem("zumbaBookings") || "[]").filter(
        filterValid
      ),
      studio: [
        ...JSON.parse(localStorage.getItem("smallStudioBookings") || "[]"),
        ...JSON.parse(localStorage.getItem("largeStudioBookings") || "[]"),
      ].filter(filterValid),
      gym: JSON.parse(
        localStorage.getItem("gymMembershipBookings") || "[]"
      ).filter(filterValid),
    };

    return bookings;
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    return getEmptyBookings();
  }
}

/**
 * Return empty booking object structure
 */
function getEmptyBookings() {
  return {
    mmaPerSession: [],
    mmaBulkSession: [],
    mmaZumba: [],
    zumba: [],
    studio: [],
    gym: [],
  };
}

/**
 * Store booking in localStorage for admin panel integration
 * @param {Object} booking - The booking object
 */
function storeBookingInLocalStorage(booking) {
  try {
    if (!booking.sessionType) {
      console.error("No session type provided for booking");
      return;
    }

    const storageKey = getStorageKeyForSessionType(booking.sessionType);
    if (!storageKey) {
      console.error("Unknown session type:", booking.sessionType);
      return;
    }

    // Get existing bookings
    const bookings = JSON.parse(localStorage.getItem(storageKey) || "[]");

    // Add new booking, ensuring no duplicates by ID
    const bookingIndex = bookings.findIndex((b) => b.id === booking.id);
    if (bookingIndex >= 0) {
      bookings[bookingIndex] = booking; // Update existing
    } else {
      bookings.push(booking); // Add new
    }

    // Save back to localStorage
    localStorage.setItem(storageKey, JSON.stringify(bookings));

    // Update admin bookings as well
    const adminBookings = JSON.parse(
      localStorage.getItem("adminBookingsData") || "[]"
    );
    const adminBookingIndex = adminBookings.findIndex(
      (b) => b.id === booking.id
    );
    if (adminBookingIndex >= 0) {
      adminBookings[adminBookingIndex] = booking;
    } else {
      adminBookings.push(booking);
    }
    localStorage.setItem("adminBookingsData", JSON.stringify(adminBookings));
  } catch (error) {
    console.error("Error storing booking in localStorage:", error);
    throw error;
  }
}

/**
 * Get localStorage key for booking based on its type
 * @param {Object} booking - The booking object
 * @returns {string} - localStorage key
 */
function getStorageKeyForSessionType(sessionType) {
  const keyMap = {
    mmaPerSession: "mmaPerSessionBookings",
    mmaBulkSession: "mma25SessionUserBookings",
    mmaZumba: "mmaZumbaBookings",
    zumba: "zumbaBookings",
    smallStudio: "smallStudioBookings",
    largeStudio: "largeStudioBookings",
    gym: "gymMembershipBookings",
  };
  return keyMap[sessionType];
}

/**
 * Cancel a booking by ID
 * @param {string} bookingId - The ID of the booking to cancel
 * @returns {Promise<boolean>} - True if successful
 */
async function cancelBooking(bookingId) {
  try {
    // Try API first
    const userToken = localStorage.getItem("userToken");
    if (userToken) {
      try {
        const response = await fetch(`${API_URL}/booking/${bookingId}/cancel`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        });

        if (response.ok) {
          removeBookingFromLocalStorage(bookingId);
          return true;
        }
      } catch (apiError) {
        console.log("API not available, using localStorage");
      }
    }

    // Fallback to localStorage only
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
  // Remove from admin bookings
  const adminBookings = JSON.parse(
    localStorage.getItem("adminBookingsData") || "[]"
  );
  const updatedAdminBookings = adminBookings.filter(
    (booking) => booking.id !== bookingId
  );
  localStorage.setItem(
    "adminBookingsData",
    JSON.stringify(updatedAdminBookings)
  );

  // Find booking in all possible storage locations
  const storageKeys = [
    "mmaPerSessionBookings",
    "mma25SessionUserBookings",
    "mmaZumbaBookings",
    "zumbaBookings",
    "smallStudioBookings",
    "largeStudioBookings",
    "gymMembershipBookings",
  ];

  // Remove from each storage location
  storageKeys.forEach((key) => {
    const bookings = JSON.parse(localStorage.getItem(key) || "[]");
    const updatedBookings = bookings.filter(
      (booking) => booking.id !== bookingId
    );
    localStorage.setItem(key, JSON.stringify(updatedBookings));
  });
}

/**
 * Get a booking by ID
 * @param {string} bookingId - The ID of the booking to retrieve
 * @returns {Promise<Object|null>} - The booking object or null if not found
 */
async function getBookingById(bookingId) {
  try {
    const userToken = localStorage.getItem("userToken");

    // Try API first
    if (userToken) {
      try {
        const response = await fetch(`${API_URL}/booking/${bookingId}`, {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          return data.booking || null;
        }
      } catch (apiError) {
        console.log("API not available, using localStorage");
      }
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
  handlePayment,
  getUserBookings,
  cancelBooking,
  getEmptyBookings,
  getBookingById,
  getStorageKeyForSessionType,
  storeBookingInLocalStorage,
};
