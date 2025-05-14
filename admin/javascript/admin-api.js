import config from "./config.js";

/**
 * Admin API functions
 * This file contains functions to communicate with the backend API for admin operations
 */

// Base API URL - change this to your backend server URL when deployed
const API_URL = config.apiUrl;
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000;

// Cache configuration
const CACHE = {
  dashboardStats: { data: null, timestamp: 0 },
  pendingRegistrations: { data: null, timestamp: 0 },
  scheduleData: { data: null, timestamp: 0 },
  members: { data: null, timestamp: 0 },
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Enhanced error handling with retry mechanism
async function fetchWithRetry(url, options, retries = MAX_RETRIES) {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      if (response.status === 401) {
        window.location.href = "admin_login_interface.html";
        return null;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
}

/**
 * Admin login function
 * @param {Object} credentials - Email and password for login
 * @returns {Promise<Object>} - Response with token and user info
 */
async function adminLogin(credentials) {
  try {
    const response = await fetch(`${API_URL}/auth/admin/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Login failed");
    }

    const data = await response.json();

    // Store the token in localStorage
    if (data.token) {
      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("adminName", data.user?.name || "Admin User");
      localStorage.setItem("adminEmail", data.user?.email || "");
    }

    return data;
  } catch (error) {
    console.error("Admin login error:", error);
    throw error;
  }
}

/**
 * Verify OTP during admin login
 * @param {Object} data - Email and OTP code
 * @returns {Promise<Object>} - Response with verification result
 */
async function verifyAdminOTP(data) {
  try {
    const response = await fetch(`${API_URL}/auth/admin/verify-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "OTP verification failed");
    }

    return await response.json();
  } catch (error) {
    console.error("OTP verification error:", error);
    throw error;
  }
}

/**
 * Admin logout function
 * @returns {Promise<Object>} - Response indicating logout success
 */
async function adminLogout() {
  try {
    // Clear local storage even if the logout API call fails
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminName");
    localStorage.removeItem("adminEmail");

    // Attempt to call the logout endpoint
    const response = await fetch(`${API_URL}/auth/admin/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAdminToken()}`,
      },
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.warn("Logout API error:", errorData.message);
    }

    return { success: true };
  } catch (error) {
    console.error("Logout error:", error);
    // Still consider logout successful even if API call fails
    return { success: true };
  }
}

// Get admin token with better error handling
function getAdminToken() {
  const token = localStorage.getItem("adminToken");
  if (!token) {
    console.warn("No admin token found");
    window.location.href = "./admin_login_interface.html";
    return null;
  }
  return token;
}

// Enhanced admin login check
function isAdminLoggedIn() {
  if (!localStorage.getItem("adminLoggedIn")) {
    window.location.href = "./admin_login_interface.html";
    return false;
  }
  return true;
}

// Mock data for demo/presentation mode
const demoData = {
  stats: {
    newMembers: 15,
    pendingApproval: 8,
    activeMembers: 156,
    expiredMembers: 12,
  },
  registrations: [
    {
      id: 1,
      name: "John Alvarez",
      type: "Gym Fitness",
      paymentMethod: "GCash",
      status: "pending",
      timestamp: new Date("2025-04-27T10:30:00"),
      contact: "09123456789",
      membershipDuration: "1 Month",
    },
    {
      id: 2,
      name: "Maria Santos",
      type: "MMA Training",
      paymentMethod: "Cash(Onsite)",
      status: "pending",
      timestamp: new Date("2025-04-27T14:15:00"),
      contact: "09187654321",
      membershipDuration: "3 Months",
    },
    {
      id: 3,
      name: "David Rodriguez",
      type: "Dance Studio",
      paymentMethod: "GCash",
      status: "pending",
      timestamp: new Date("2025-04-28T09:45:00"),
      contact: "09198765432",
      membershipDuration: "1 Month",
    },
    {
      id: 4,
      name: "Sarah Garcia",
      type: "Gym Fitness",
      paymentMethod: "Bank Transfer",
      status: "pending",
      timestamp: new Date("2025-04-28T11:20:00"),
      contact: "09165432187",
      membershipDuration: "6 Months",
    },
    {
      id: 5,
      name: "Michael Torres",
      type: "MMA Training",
      paymentMethod: "GCash",
      status: "pending",
      timestamp: new Date("2025-04-28T13:00:00"),
      contact: "09145678923",
      membershipDuration: "3 Months",
    },
  ],
  members: [
    {
      id: 1,
      name: "Ana Martinez",
      contact: "09123456789",
      membershipStart: "2025-01-15",
      membershipEnd: "2025-07-15",
      type: "Gym Fitness",
      status: "active",
    },
    {
      id: 2,
      name: "Carlos Reyes",
      contact: "09187654321",
      membershipStart: "2025-02-01",
      membershipEnd: "2025-05-01",
      type: "MMA Training",
      status: "active",
    },
    {
      id: 3,
      name: "Isabella Santos",
      contact: "09198765432",
      membershipStart: "2025-03-10",
      membershipEnd: "2025-04-10",
      type: "Dance Studio",
      status: "expired",
    },
    {
      id: 4,
      name: "Lucas Garcia",
      contact: "09165432187",
      membershipStart: "2025-04-01",
      membershipEnd: "2025-10-01",
      type: "Gym Fitness",
      status: "active",
    },
    {
      id: 5,
      name: "Sofia Torres",
      contact: "09145678923",
      membershipStart: "2025-04-15",
      membershipEnd: "2025-07-15",
      type: "MMA Training",
      status: "active",
    },
  ],
};

/**
 * Get dashboard statistics with caching
 */
async function getDashboardStats() {
  // For presentation, always return demo data
  return demoData.stats;
}

/**
 * Get pending registrations with caching
 */
async function getPendingRegistrations() {
  // For presentation, return demo registrations
  return demoData.registrations;
}

/**
 * Get today's schedule with caching
 */
async function getTodaySchedule() {
  // Check cache first
  const now = Date.now();
  if (
    CACHE.scheduleData.data &&
    now - CACHE.scheduleData.timestamp < CACHE_DURATION
  ) {
    return CACHE.scheduleData.data;
  }

  if (!isAdminLoggedIn()) return null;

  try {
    const data = await fetchWithRetry(`${API_URL}/admin/todays-schedule`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAdminToken()}`,
      },
      credentials: "include",
    });

    if (data) {
      CACHE.scheduleData = { data, timestamp: now };
    }
    return data;
  } catch (error) {
    console.error("Error fetching schedule:", error);
    throw error;
  }
}

/**
 * Get monthly schedule with caching
 */
async function getMonthlySchedule() {
  const now = Date.now();
  if (
    CACHE.scheduleData.data &&
    now - CACHE.scheduleData.timestamp < CACHE_DURATION
  ) {
    return CACHE.scheduleData.data;
  }

  if (!isAdminLoggedIn()) return null;

  try {
    const data = await fetchWithRetry(`${API_URL}/admin/monthly-schedule`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAdminToken()}`,
      },
      credentials: "include",
    });

    if (data) {
      CACHE.scheduleData = { data, timestamp: now };
    }
    return data;
  } catch (error) {
    console.error("Error fetching monthly schedule:", error);
    throw error;
  }
}

/**
 * Update registration status
 */
async function updateRegistrationStatus(registrationId, status) {
  // For presentation, simulate API call
  return {
    success: true,
    message: `Registration ${
      status === "approved" ? "approved" : "rejected"
    } successfully`,
  };
}

/**
 * Get members with caching
 */
async function getMembers() {
  // For presentation, return mock member data
  return [
    {
      id: 1,
      name: "John Alvarez",
      email: "john.alvarez@example.com",
      contact: "0917 860 1822",
      dateOfMembership: "April 6, 2025",
      dateOfExpiration: "May 6, 2025",
      status: "active",
      membershipType: "Gym Fitness",
    },
    {
      id: 2,
      name: "Maria Santos",
      email: "maria.santos@example.com",
      contact: "0918-234-5678",
      dateOfMembership: "April 6, 2025",
      dateOfExpiration: "May 6, 2025",
      status: "active",
      membershipType: "MMA Training",
    },
    {
      id: 3,
      name: "Robert Lim",
      email: "robert.lim@example.com",
      contact: "0929-345-6789",
      dateOfMembership: "March 6, 2025",
      dateOfExpiration: "April 6, 2025",
      status: "expired",
      membershipType: "Dance Studio",
    },
  ];
}

// Clear all caches
function clearCaches() {
  CACHE.dashboardStats = { data: null, timestamp: 0 };
  CACHE.pendingRegistrations = { data: null, timestamp: 0 };
  CACHE.scheduleData = { data: null, timestamp: 0 };
}

function generateUniqueId() {
  return Date.now().toString() + Math.random().toString(36).substring(2);
}

// Admin API with localStorage implementation
const adminApi = {
  // Initialize default data if not exists
  init() {
    if (!localStorage.getItem("members")) {
      localStorage.setItem("members", JSON.stringify([]));
    }
    if (!localStorage.getItem("registrations")) {
      localStorage.setItem("registrations", JSON.stringify([]));
    }
    if (!localStorage.getItem("stats")) {
      localStorage.setItem(
        "stats",
        JSON.stringify({
          newMembers: 0,
          pendingApproval: 0,
          activeMembers: 0,
          expiredMembers: 0,
        })
      );
    }
  },

  // Get dashboard stats
  getDashboardStats() {
    return JSON.parse(
      localStorage.getItem("stats") ||
        '{"newMembers":0,"pendingApproval":0,"activeMembers":0,"expiredMembers":0}'
    );
  },

  // Update dashboard stats
  updateStats() {
    const members = this.getMembers();
    const registrations = this.getPendingRegistrations();

    const stats = {
      newMembers: members.filter((m) => {
        const membershipDate = new Date(m.dateOfMembership);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return membershipDate >= thirtyDaysAgo;
      }).length,
      pendingApproval: registrations.filter((r) => r.status === "pending")
        .length,
      activeMembers: members.filter((m) => m.status === "active").length,
      expiredMembers: members.filter((m) => m.status === "expired").length,
    };

    localStorage.setItem("stats", JSON.stringify(stats));
    return stats;
  },

  // Get all members
  getMembers() {
    return JSON.parse(localStorage.getItem("members") || "[]");
  },

  // Add new member
  addMember(memberData) {
    const members = this.getMembers();
    const newMember = {
      id: Date.now().toString(),
      ...memberData,
      dateOfMembership: new Date().toISOString(),
      status: "active",
    };
    members.push(newMember);
    localStorage.setItem("members", JSON.stringify(members));
    this.updateStats();
    return newMember;
  },

  // Get pending registrations
  getPendingRegistrations() {
    return JSON.parse(localStorage.getItem("registrations") || "[]");
  },

  // Add new registration
  addRegistration(registrationData) {
    const registrations = this.getPendingRegistrations();
    const newRegistration = {
      id: generateUniqueId(),
      ...registrationData,
      status: "pending",
      timestamp: new Date().toISOString(),
      paymentStatus:
        registrationData.paymentMethod === "Gcash"
          ? "pending_verification"
          : "pending_payment",
    };
    registrations.push(newRegistration);
    localStorage.setItem("registrations", JSON.stringify(registrations));
    this.updateStats();
    return newRegistration;
  },

  // Update registration status
  updateRegistrationStatus(registrationId, status) {
    const registrations = this.getPendingRegistrations();
    const registration = registrations.find((r) => r.id === registrationId);

    if (!registration) {
      throw new Error("Registration not found");
    }

    // If approving, add to members
    if (status === "approved") {
      this.addMember({
        name: registration.name,
        email: registration.email || "",
        contact: registration.contact,
        membershipDuration: registration.membershipDuration,
        type: registration.type,
        dateOfMembership: new Date().toISOString(),
        dateOfExpiration: this.calculateExpirationDate(
          registration.membershipDuration
        ),
        paymentStatus: "paid",
        paymentMethod: registration.paymentMethod,
      });

      // Remove from registrations
      const updatedRegistrations = registrations.filter(
        (r) => r.id !== registrationId
      );
      localStorage.setItem(
        "registrations",
        JSON.stringify(updatedRegistrations)
      );
    } else {
      // Just update status for rejected
      registration.status = status;
      localStorage.setItem("registrations", JSON.stringify(registrations));
    }

    this.updateStats();
    return { success: true, message: `Registration ${status} successfully` };
  },

  // Update registration payment status
  updatePaymentStatus(registrationId, paymentStatus) {
    const registrations = this.getPendingRegistrations();
    const registration = registrations.find((r) => r.id === registrationId);

    if (!registration) {
      throw new Error("Registration not found");
    }

    registration.paymentStatus = paymentStatus;
    localStorage.setItem("registrations", JSON.stringify(registrations));
    this.updateStats();

    return { success: true, message: `Payment ${paymentStatus}` };
  },

  // Calculate expiration date based on membership duration
  calculateExpirationDate(duration) {
    const today = new Date();
    switch (duration.toLowerCase()) {
      case "1 month":
        today.setMonth(today.getMonth() + 1);
        break;
      case "3 months":
        today.setMonth(today.getMonth() + 3);
        break;
      case "6 months":
        today.setMonth(today.getMonth() + 6);
        break;
      case "1 year":
        today.setFullYear(today.getFullYear() + 1);
        break;
      default:
        today.setMonth(today.getMonth() + 1); // Default to 1 month
    }
    return today.toISOString();
  },

  // Mock data for testing
  loadMockData() {
    // Mock registrations
    const mockRegistrations = [
      {
        id: "1",
        name: "John Doe",
        type: "Gym Fitness",
        paymentMethod: "GCash",
        status: "pending",
        contact: "09123456789",
        membershipDuration: "1 Month",
        timestamp: new Date().toISOString(),
      },
      {
        id: "2",
        name: "Jane Smith",
        type: "MMA Training",
        paymentMethod: "Cash",
        status: "pending",
        contact: "09187654321",
        membershipDuration: "3 Months",
        timestamp: new Date().toISOString(),
      },
    ];

    // Mock members
    const mockMembers = [
      {
        id: "101",
        name: "Mike Johnson",
        email: "mike@example.com",
        contact: "09198765432",
        type: "Gym Fitness",
        dateOfMembership: new Date().toISOString(),
        dateOfExpiration: this.calculateExpirationDate("1 Month"),
        status: "active",
      },
      {
        id: "102",
        name: "Sarah Wilson",
        email: "sarah@example.com",
        contact: "09167890123",
        type: "Dance Studio",
        dateOfMembership: new Date().toISOString(),
        dateOfExpiration: this.calculateExpirationDate("3 Months"),
        status: "active",
      },
    ];

    localStorage.setItem("registrations", JSON.stringify(mockRegistrations));
    localStorage.setItem("members", JSON.stringify(mockMembers));
    this.updateStats();
  },
};

// Initialize the API
adminApi.init();

// Add to window object for global access
window.adminApi = adminApi;

// Load mock data if no data exists
if (
  !localStorage.getItem("members") ||
  JSON.parse(localStorage.getItem("members")).length === 0
) {
  adminApi.loadMockData();
}

export default adminApi;
