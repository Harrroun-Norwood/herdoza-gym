// User Storage Manager
// This class handles user data storage and management in localStorage

class UserStorageManager {
  static async cleanupUserData(preserveEmailData = false) {
    const userEmail = localStorage.getItem("userEmail");

    if (preserveEmailData && userEmail) {
      // Save email-specific data
      const emailSpecificData = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes(userEmail)) {
          emailSpecificData[key] = localStorage.getItem(key);
        }
      }

      // Clear general user data
      localStorage.removeItem("userToken");
      localStorage.removeItem("userName");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userStatus");
      localStorage.removeItem("userType");

      // Restore email-specific data
      for (const [key, value] of Object.entries(emailSpecificData)) {
        localStorage.setItem(key, value);
      }
    } else {
      // Clear all user data
      localStorage.removeItem("userToken");
      localStorage.removeItem("userName");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userStatus");
      localStorage.removeItem("userType");

      // Clear email-specific data if not preserving
      if (userEmail) {
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i);
          if (key && key.includes(userEmail)) {
            localStorage.removeItem(key);
          }
        }
      }
    }
  }
  static async initializeNewUser(userData) {
    if (!userData.email) {
      throw new Error("Email is required");
    }

    // Set basic user data
    localStorage.setItem("userToken", `user-session-${Date.now()}`);
    localStorage.setItem("userEmail", userData.email);
    localStorage.setItem(
      "userName",
      `${userData.firstName} ${userData.lastName}`
    );
    localStorage.setItem("userStatus", userData.status || "Active");
    localStorage.setItem("userType", userData.type || "Gym Fitness");

    // Initialize empty bookings for new user
    const emptyBookings = {
      mmaPerSession: [],
      mmaBulkSession: [],
      mmaZumba: [],
      zumba: [],
      studio: [],
      gym: [],
    };

    // Save empty bookings to storage
    Object.entries({
      mmaPerSessionBookings: emptyBookings.mmaPerSession,
      mma25SessionUserBookings: emptyBookings.mmaBulkSession,
      mmaZumbaBookings: emptyBookings.mmaZumba,
      zumbaBookings: emptyBookings.zumba,
      smallStudioBookings: emptyBookings.studio,
      largeStudioBookings: emptyBookings.studio,
      gymMembershipBookings: emptyBookings.gym,
    }).forEach(([key, value]) => {
      localStorage.setItem(`${key}_${userData.email}`, JSON.stringify(value));
    });

    // Create session data
    const userSessionData = {
      timestamp: Date.now(),
      expiresIn: 24 * 60 * 60 * 1000, // 24 hours
      type: userData.type || "Gym Fitness",
    };

    return { userSessionData };
  }

  static async getUserMembershipData(email) {
    if (!email) return null;

    try {
      const membershipData = localStorage.getItem(`membershipData_${email}`);
      return membershipData ? JSON.parse(membershipData) : null;
    } catch (error) {
      console.error("Error getting membership data:", error);
      return null;
    }
  }

  static async updateUserMembership(email, membershipData) {
    if (!email || !membershipData) {
      throw new Error("Email and membership data are required");
    }

    try {
      // Update user-specific membership data
      localStorage.setItem(
        `membershipData_${email}`,
        JSON.stringify(membershipData)
      );

      // Update members data if it exists
      const membersData = JSON.parse(
        localStorage.getItem("members-data") || "{}"
      );
      membersData[email] = membershipData;
      localStorage.setItem("members-data", JSON.stringify(membersData));

      // Update user status if this is the current user
      if (email === localStorage.getItem("userEmail")) {
        localStorage.setItem("userStatus", membershipData.status);
      }

      // Update members array if it exists
      const members = JSON.parse(localStorage.getItem("members") || "[]");
      const memberIndex = members.findIndex(
        (m) => m.email.toLowerCase() === email.toLowerCase()
      );
      if (memberIndex !== -1) {
        members[memberIndex] = {
          ...members[memberIndex],
          status: membershipData.status,
        };
        localStorage.setItem("members", JSON.stringify(members));
      }
    } catch (error) {
      console.error("Error updating membership data:", error);
      throw error;
    }
  }
}

export default UserStorageManager;
