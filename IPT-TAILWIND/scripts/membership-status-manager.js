// Membership Status Manager
// This module handles synchronization of membership status across the application

const MembershipStatusManager = {
  // Get current member from database
  getMember(email) {
    const members = JSON.parse(localStorage.getItem("members") || "[]");
    return members.find((m) => m.email === email);
  },

  // Get user-specific membership data
  getUserMembershipData(email) {
    const userSpecificData = localStorage.getItem(`membershipData_${email}`);
    if (!userSpecificData) return null;
    try {
      return JSON.parse(userSpecificData);
    } catch (error) {
      console.error("Error parsing membership data:", error);
      return null;
    }
  },

  // Synchronize membership status
  synchronizeStatus(email) {
    if (!email) return;

    // Get member from database
    const member = this.getMember(email);

    // Get user's membership data
    const membershipData = this.getUserMembershipData(email);

    // If neither exists, nothing to sync
    if (!member && !membershipData) return;

    // Determine the correct status by checking expiration and current status
    let currentStatus = "pending";
    let expirationDate = null;

    if (member) {
      expirationDate = new Date(member.dateOfExpiration);
      if (expirationDate < new Date()) {
        currentStatus = "expired";
      } else {
        currentStatus = member.status;
      }
    } else if (membershipData) {
      currentStatus = membershipData.status;
      if (membershipData.nextPaymentDate) {
        expirationDate = new Date(membershipData.nextPaymentDate);
        if (expirationDate < new Date()) {
          currentStatus = "expired";
        }
      }
    }

    // Update member database
    if (member) {
      const members = JSON.parse(localStorage.getItem("members") || "[]");
      const memberIndex = members.findIndex((m) => m.email === email);
      if (memberIndex !== -1) {
        members[memberIndex].status = currentStatus;
        if (expirationDate) {
          members[memberIndex].dateOfExpiration = expirationDate.toISOString();
        }
        localStorage.setItem("members", JSON.stringify(members));
      }
    }

    // Update user membership data
    if (membershipData) {
      membershipData.status = currentStatus;
      localStorage.setItem(
        `membershipData_${email}`,
        JSON.stringify(membershipData)
      );
    }

    // Update global user status
    if (email === localStorage.getItem("userEmail")) {
      localStorage.setItem("userStatus", currentStatus);
    }

    // Update global membership data
    const membersData = JSON.parse(
      localStorage.getItem("members-data") || "{}"
    );
    if (membersData[email]) {
      membersData[email].status = currentStatus;
      localStorage.setItem("members-data", JSON.stringify(membersData));
    }

    // Dispatch event to notify other components
    window.dispatchEvent(
      new CustomEvent("membershipStatusUpdated", {
        detail: { email, status: currentStatus },
      })
    );
  },

  // Calculate days left in membership
  calculateDaysLeft(expirationDate) {
    if (!expirationDate) return 0;
    const expiry = new Date(expirationDate);
    const now = new Date();
    // Set hours to midnight for accurate day calculation
    expiry.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  },
  // Update membership days
  updateMembershipDays(email) {
    const member = this.getMember(email);
    let membershipData = this.getUserMembershipData(email);

    // If we have no data at all, return 0
    if (!member && !membershipData) return 0;

    // Calculate days left based on either member expiration or membershipData next payment date
    const expirationDate =
      member?.dateOfExpiration ||
      (membershipData?.nextPaymentDate &&
        new Date(membershipData.nextPaymentDate));
    const daysLeft = this.calculateDaysLeft(expirationDate);

    // If we have membership data, update it with the new days count
    if (membershipData) {
      membershipData.daysLeft = daysLeft;
      localStorage.setItem(
        `membershipData_${email}`,
        JSON.stringify(membershipData)
      );
    }

    // If we don't have membership data but have member data, create new membership data
    if (!membershipData && member) {
      membershipData = {
        daysLeft: daysLeft,
        nextPaymentDate: member.dateOfExpiration,
        type: member.membershipType,
        status: member.status,
      };
      localStorage.setItem(
        `membershipData_${email}`,
        JSON.stringify(membershipData)
      );
    }

    return daysLeft;
  },

  // Initialize watchers for membership status
  initStatusWatchers() {
    // Check status every hour
    setInterval(() => {
      const userEmail = localStorage.getItem("userEmail");
      if (userEmail) {
        this.synchronizeStatus(userEmail);
        this.updateMembershipDays(userEmail);
      }
    }, 60 * 60 * 1000); // Every hour

    // Watch for storage changes
    window.addEventListener("storage", (e) => {
      if (
        e.key &&
        (e.key.includes("membershipData") ||
          e.key === "members" ||
          e.key.includes("members-data"))
      ) {
        const userEmail = localStorage.getItem("userEmail");
        if (userEmail) {
          this.synchronizeStatus(userEmail);
          this.updateMembershipDays(userEmail);
        }
      }
    });
  },
};

export default MembershipStatusManager;
