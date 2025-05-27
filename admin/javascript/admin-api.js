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
    newMembers: 5,
    pendingApproval: 8,
    activeMembers: 65,
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
  try {
    // Check cache first
    if (
      CACHE.dashboardStats.data &&
      Date.now() - CACHE.dashboardStats.timestamp < CACHE_DURATION
    ) {
      return CACHE.dashboardStats.data;
    }

    // For presentation, use demo data with proper error handling
    const stats = demoData.stats;

    // Update cache
    CACHE.dashboardStats = {
      data: stats,
      timestamp: Date.now(),
    };

    return stats;
  } catch (error) {
    console.error("Error getting dashboard stats:", error);
    throw new Error("Failed to get dashboard statistics");
  }
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

// Simple Admin API using localStorage
const adminApi = {
  baseUrl: API_URL,

  init() {
    // Load mock data if no data exists
    if (
      !localStorage.getItem("members") ||
      JSON.parse(localStorage.getItem("members")).length === 0
    ) {
      this.loadMockData();
    }

    this.initializeDemoData();
  },

  loadMockData() {
    // Add some initial mock data
    const mockMembers = [
      {
        id: "1",
        name: "John Alvarez",
        email: "john.alvarez@example.com",
        contact: "0917 860 1822",
        dateOfMembership: "2025-04-06",
        dateOfExpiration: "2025-05-06",
        status: "active",
        membershipType: "Gym Fitness",
        membershipDuration: "1",
        paymentMethod: "Cash",
        paymentStatus: "paid",
      },
      {
        id: "2",
        name: "Maria Santos",
        email: "maria.santos@example.com",
        contact: "0918-234-5678",
        dateOfMembership: "2025-04-06",
        dateOfExpiration: "2025-05-06",
        status: "active",
        membershipType: "MMA Training",
        membershipDuration: "1",
        paymentMethod: "GCash",
        paymentStatus: "paid",
      },
    ];
    localStorage.setItem("members", JSON.stringify(mockMembers));
  },
  getDashboardStats() {
    const registrations = this.getRegistrations();
    const members = this.getMembers();
    const now = new Date();

    return {
      newMembers: members.filter((m) => {
        const joinDate = new Date(m.dateJoined);
        return (
          joinDate.getMonth() === now.getMonth() &&
          joinDate.getFullYear() === now.getFullYear()
        );
      }).length,
      pendingApproval: registrations.filter((r) => r.status === "pending")
        .length,
      activeMembers: members.filter((m) => m.status === "active").length,
      expiredMembers: members.filter((m) => m.status === "expired").length,
    };
  },

  getRegistrations() {
    const registrations = JSON.parse(
      localStorage.getItem("registrations") || "[]"
    );
    return registrations.filter(
      (reg) => reg && typeof reg === "object" && reg.id && reg.name
    );
  },

  addRegistration(registrationData) {
    const registrations = this.getRegistrations();
    const newRegistration = {
      id: Date.now().toString(),
      ...registrationData,
      status: "pending",
      date: new Date().toISOString(),
    };
    registrations.push(newRegistration);
    localStorage.setItem("registrations", JSON.stringify(registrations));
    return newRegistration;
  },

  getRegistrationsByType(type) {
    const registrations = this.getRegistrations();
    return registrations.filter(
      (reg) => reg.membershipType.toLowerCase() === type.toLowerCase()
    );
  },
  handleRegistration(registrationId, action) {
    const registrations = this.getRegistrations();
    const registrationIndex = registrations.findIndex(
      (r) => r.id === registrationId
    );

    if (registrationIndex === -1) {
      throw new Error("Registration not found");
    }

    const registration = registrations[registrationIndex];

    if (action === "approve") {
      const members = this.getMembers();

      // Check for existing member with same email
      if (
        members.some(
          (m) => m.email.toLowerCase() === registration.email.toLowerCase()
        )
      ) {
        throw new Error("A member with this email already exists");
      }

      // Create new member with proper data structure
      const now = new Date();
      const newMember = {
        id: Date.now().toString(),
        name: registration.name,
        email: registration.email.toLowerCase(),
        contact: registration.contact || "",
        membershipType: registration.membershipType || "gym",
        membershipDuration: registration.membershipDuration || "1",
        dateOfMembership: now.toISOString(),
        dateOfExpiration: this.calculateExpirationDate(
          registration.membershipDuration || "1"
        ),
        status: "active",
        paymentMethod: registration.paymentMethod || "Cash",
        paymentStatus: "paid",
      };

      // Add to members and sync storage
      members.push(newMember);
      localStorage.setItem("members", JSON.stringify(members));

      // Sync with other storage
      this.syncMemberData(newMember);
    }

    // Remove from registrations
    registrations.splice(registrationIndex, 1);
    localStorage.setItem("registrations", JSON.stringify(registrations));
    return true;
  },

  // Initialize demo data
  initializeDemoData() {
    // Demo registrations for different types
    const demoRegistrations = [
      {
        id: "1",
        name: "John Smith",
        email: "john.smith@example.com",
        contact: "0917-123-4567",
        membershipType: "gym",
        date: "2025-05-25T08:00:00",
        status: "pending",
      },
      {
        id: "2",
        name: "Maria Garcia",
        email: "maria.garcia@example.com",
        contact: "0918-234-5678",
        membershipType: "mma",
        date: "2025-05-26T10:30:00",
        status: "pending",
      },
      {
        id: "3",
        name: "Sarah Lee",
        email: "sarah.lee@example.com",
        contact: "0919-345-6789",
        membershipType: "dance",
        date: "2025-05-27T14:15:00",
        status: "pending",
      },
    ];

    // Demo members
    const demoMembers = [
      {
        id: "101",
        name: "David Wilson",
        email: "david.wilson@example.com",
        contact: "0915-111-2222",
        membershipType: "gym",
        dateOfMembership: "2025-04-27T00:00:00",
        dateOfExpiration: "2025-05-27T00:00:00",
        status: "active",
      },
      {
        id: "102",
        name: "Emma Davis",
        email: "emma.davis@example.com",
        contact: "0916-333-4444",
        membershipType: "mma",
        dateOfMembership: "2025-03-15T00:00:00",
        dateOfExpiration: "2025-06-15T00:00:00",
        status: "active",
      },
      {
        id: "103",
        name: "Michael Brown",
        email: "michael.brown@example.com",
        contact: "0917-555-6666",
        membershipType: "dance",
        dateOfMembership: "2025-02-01T00:00:00",
        dateOfExpiration: "2025-05-01T00:00:00",
        status: "expired",
      },
    ];

    // Only initialize if data doesn't exist
    if (!localStorage.getItem("registrations")) {
      localStorage.setItem("registrations", JSON.stringify(demoRegistrations));
    }
    if (!localStorage.getItem("members")) {
      localStorage.setItem("members", JSON.stringify(demoMembers));
    }
  },

  // Get all members
  getMembers() {
    const members = JSON.parse(localStorage.getItem("members") || "[]");
    return members.filter((member) => {
      // Filter out invalid member entries
      return member && typeof member === "object" && member.id && member.name;
    });
  },

  // Add new member
  addMember(memberData) {
    const members = this.getMembers();

    // Validate required fields
    if (!memberData.name || !memberData.email || !memberData.contact) {
      throw new Error(
        "Please fill in all required fields: name, email, and contact"
      );
    }

    // Check for duplicate email (case-insensitive comparison)
    if (
      members.some(
        (m) => m.email.toLowerCase() === memberData.email.toLowerCase()
      )
    ) {
      throw new Error("A member with this email already exists");
    }

    const now = new Date();
    // Ensure consistent data structure
    const newMember = {
      id: Date.now().toString(),
      name: memberData.name.trim(),
      email: memberData.email.trim().toLowerCase(),
      contact: memberData.contact.trim(),
      membershipType: memberData.membershipType || "Gym Fitness",
      membershipDuration: memberData.membershipDuration || "1",
      dateOfMembership: now.toISOString(),
      dateOfExpiration: this.calculateExpirationDate(
        memberData.membershipDuration || "1"
      ),
      status: "active",
      paymentMethod: memberData.paymentMethod || "Cash",
      paymentStatus: "paid",
    };

    // Synchronize with other storage
    this.syncMemberData(newMember);

    members.push(newMember);
    localStorage.setItem("members", JSON.stringify(members));
    return newMember;
  },

  // Sync member data across storage
  syncMemberData(member) {
    if (!member || !member.email) return;

    // Update membershipData store
    const membershipData = {
      daysLeft: this.calculateDaysLeft(member.dateOfExpiration),
      nextPaymentDate: member.dateOfExpiration,
      type: member.membershipType,
      status: member.status,
    };
    localStorage.setItem(
      `membershipData_${member.email}`,
      JSON.stringify(membershipData)
    );

    // Update members-data store
    const membersData = JSON.parse(
      localStorage.getItem("members-data") || "{}"
    );
    membersData[member.email] = membershipData;
    localStorage.setItem("members-data", JSON.stringify(membersData));
  },

  // Calculate days left until expiration
  calculateDaysLeft(expirationDate) {
    const now = new Date();
    const expDate = new Date(expirationDate);
    const diffTime = expDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  },

  // Renew membership
  renewMembership(memberId, duration) {
    const members = this.getMembers();
    const memberIndex = members.findIndex((m) => m.id === memberId);

    if (memberIndex !== -1) {
      const currentExpiration = new Date(members[memberIndex].dateOfExpiration);
      const newExpiration = new Date(
        currentExpiration.getTime() + duration * 30 * 24 * 60 * 60 * 1000
      );

      members[memberIndex] = {
        ...members[memberIndex],
        dateOfExpiration: newExpiration.toISOString(),
        status: "active",
        lastRenewal: new Date().toISOString(),
      };

      localStorage.setItem("members", JSON.stringify(members));
      return members[memberIndex];
    }
    return null;
  },

  // Cancel membership
  cancelMembership(memberId) {
    const members = this.getMembers();
    const memberIndex = members.findIndex((m) => m.id === memberId);

    if (memberIndex !== -1) {
      members[memberIndex].status = "expired";
      members[memberIndex].dateOfExpiration = new Date().toISOString();
      localStorage.setItem("members", JSON.stringify(members));
      return members[memberIndex];
    }
    return null;
  },

  // Update member contact
  updateMemberContact(memberId, contact) {
    const members = this.getMembers();
    const memberIndex = members.findIndex((m) => m.id === memberId);

    if (memberIndex !== -1) {
      members[memberIndex].contact = contact;
      localStorage.setItem("members", JSON.stringify(members));
      return members[memberIndex];
    }
    return null;
  },

  // Remove member
  removeMember(memberId) {
    const members = this.getMembers();
    const memberIndex = members.findIndex((m) => m.id === memberId);

    if (memberIndex !== -1) {
      members.splice(memberIndex, 1);
      localStorage.setItem("members", JSON.stringify(members));
      return true;
    }
    return false;
  },

  // Calculate expiration date
  calculateExpirationDate(months) {
    const expirationDate = new Date();
    expirationDate.setMonth(expirationDate.getMonth() + parseInt(months));
    return expirationDate.toISOString();
  },
};

// Initialize the API and add to window object
window.adminApi = adminApi;
adminApi.init();

export default adminApi;
