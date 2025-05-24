// Membership management script
import MembershipStatusManager from "./membership-status-manager.js";

document.addEventListener("DOMContentLoaded", function () {
  // Get DOM elements
  const daysLeftElement = document.getElementById("days-left");
  const nextPaymentElement = document.getElementById("next-payment-date");
  const membershipFeeElement = document.getElementById("membership-fee");
  const renewButton = document.getElementById("renew-membership");

  // Function to update the UI with membership information
  function updateMembershipUI() {
    const userEmail = localStorage.getItem("userEmail");
    if (!userEmail) return;

    // Get membership data
    let membershipData =
      MembershipStatusManager.getUserMembershipData(userEmail);
    if (!membershipData) {
      // Try to get from local storage
      const storedData = localStorage.getItem(`membershipData_${userEmail}`);
      if (storedData) {
        membershipData = JSON.parse(storedData);
      }
    }
    if (!membershipData) return;

    // Update days left
    if (daysLeftElement) {
      const daysLeft = membershipData.daysLeft || 0;
      daysLeftElement.textContent = daysLeft;

      // Add warning class if days are low
      if (daysLeft <= 7 && daysLeft > 0) {
        daysLeftElement.classList.add("text-red-600");
      } else {
        daysLeftElement.classList.remove("text-red-600");
      }
    }

    // Update next payment date
    if (nextPaymentElement) {
      nextPaymentElement.textContent =
        membershipData.nextPaymentDate || "No active membership";
    }

    // Update fee display
    if (membershipFeeElement) {
      const fee = parseFloat(membershipData.fee) || 0;
      membershipFeeElement.textContent = `PHP ${fee.toFixed(2)}`;
    }

    // Update sessions if applicable
    if (membershipData.sessions && membershipData.sessions.length > 0) {
      const sessionsElement = document.getElementById("booked-sessions");
      if (sessionsElement) {
        sessionsElement.innerHTML = membershipData.sessions
          .map(
            (session) => `
          <div class="session-item p-2 border-b">
            <div class="text-sm text-gray-600">📅 ${
              session.date || session.startDate
            }</div>
            <div class="text-sm text-gray-600">⏰ ${session.time}</div>
          </div>
        `
          )
          .join("");
      }
    }
  }

  // Handle renew button click
  if (renewButton) {
    renewButton.addEventListener("click", function () {
      const userEmail = localStorage.getItem("userEmail");
      if (!userEmail) return;

      const daysLeft = MembershipStatusManager.calculateDaysLeft(
        MembershipStatusManager.getMember(userEmail)?.dateOfExpiration
      );

      let confirmMessage = "Are you sure you want to renew your membership?";

      if (daysLeft > 0) {
        confirmMessage = `You still have ${daysLeft} days left on your current membership. Do you want to proceed to the membership selection page anyway?`;
      }

      if (confirm(confirmMessage)) {
        // Save renewal state
        localStorage.setItem("membershipRenewal", "true");

        // Get current membership type and redirect accordingly
        const membershipData =
          MembershipStatusManager.getUserMembershipData(userEmail);
        const membershipType = membershipData?.type?.toLowerCase() || "gym";

        let redirectPage;
        switch (true) {
          case membershipType.includes("mma"):
            redirectPage = "mixed-martial-arts.html";
            break;
          case membershipType.includes("dance"):
          case membershipType.includes("studio"):
            redirectPage = "dance-studio.html";
            break;
          default:
            redirectPage = "gym-fitness.html";
        }

        window.location.href = redirectPage;
      }
    });
  }

  // Initialize UI
  updateMembershipUI();

  // Listen for membership status updates
  window.addEventListener("membershipStatusUpdated", function (e) {
    if (e.detail.email === localStorage.getItem("userEmail")) {
      updateMembershipUI();
    }
  });

  // Listen for storage changes
  window.addEventListener("storage", function (e) {
    if (
      e.key &&
      (e.key.includes("membershipData") ||
        e.key === "members" ||
        e.key.includes("members-data") ||
        e.key === "userEmail" ||
        e.key === "userStatus")
    ) {
      updateMembershipUI();
    }
  });
});
