// Membership management script
document.addEventListener("DOMContentLoaded", function () {
  // Get DOM elements
  const daysLeftElement = document.getElementById("days-left");
  const nextPaymentElement = document.getElementById("next-payment-date");
  const membershipFeeElement = document.getElementById("membership-fee");
  const renewButton = document.getElementById("renew-membership");

  // Function to update the UI with membership information
  function updateMembershipUI() {
    // Get membership data from localStorage
    const membershipData = getMembershipData();

    // Update days left
    daysLeftElement.textContent = membershipData.daysLeft || "0";

    // Update next payment date
    nextPaymentElement.textContent =
      membershipData.nextPaymentDate || "No active membership";

    // Update fee
    membershipFeeElement.textContent = `PHP ${(membershipData.fee || 0).toFixed(
      2
    )}`;
  }

  // Function to get membership data from localStorage
  function getMembershipData() {
    const membershipData = localStorage.getItem("membershipData");

    if (membershipData) {
      return JSON.parse(membershipData);
    } else {
      // Return null values for new users
      return {
        daysLeft: 0,
        nextPaymentDate: null,
        fee: 0,
        purchaseDate: null,
        originalDuration: 0,
      };
    }
  }

  // Function to update membership data
  function updateMembershipData(days, fee) {
    // Calculate next payment date
    const purchaseDate = new Date();
    const nextPaymentDate = new Date(purchaseDate);
    nextPaymentDate.setDate(nextPaymentDate.getDate() + days);

    // Format date for display
    const formattedDate = nextPaymentDate.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    // Create membership data object
    const membershipData = {
      daysLeft: days,
      nextPaymentDate: formattedDate,
      fee: fee,
      purchaseDate: purchaseDate.toISOString(),
      originalDuration: days,
    };

    // Save to localStorage
    localStorage.setItem("membershipData", JSON.stringify(membershipData));

    return membershipData;
  }

  // Function to simulate day countdown (for demonstration)
  // In a real app, this would be calculated based on the current date vs purchase date
  function simulateDayCount() {
    const membershipData = getMembershipData();

    if (membershipData) {
      // Calculate days passed since purchase
      const purchaseDate = new Date(membershipData.purchaseDate);
      const currentDate = new Date();

      // Calculate days difference
      const daysPassed = Math.floor(
        (currentDate - purchaseDate) / (1000 * 60 * 60 * 24)
      );

      // Calculate days left (min 0)
      let daysLeft = Math.max(0, membershipData.originalDuration - daysPassed);

      // Update days left in storage
      membershipData.daysLeft = daysLeft;
      localStorage.setItem("membershipData", JSON.stringify(membershipData));

      // Update UI
      daysLeftElement.textContent = daysLeft;
    }
  }

  // Handle renew button click with confirmation prompt
  if (renewButton) {
    renewButton.addEventListener("click", function () {
      // Get current membership data
      const membershipData = getMembershipData();
      const daysLeft = membershipData ? membershipData.daysLeft : 0;

      let confirmMessage = "Are you sure you want to renew your membership?";

      // If user still has days left, inform them
      if (daysLeft > 0) {
        confirmMessage = `You still have ${daysLeft} days left on your current membership. Do you want to proceed to the membership selection page anyway?`;
      }

      // Show confirmation dialog
      if (confirm(confirmMessage)) {
        // Save renewal state to indicate user is renewing, not extending
        localStorage.setItem("membershipRenewal", "true");

        // Redirect to gym-fitness.html to select a new membership
        window.location.href = "gym-fitness.html";
      }
    });
  }

  // Initialize UI
  updateMembershipUI();

  // Simulate day count
  simulateDayCount();

  // Expose functions to window for access from other scripts
  window.membershipManager = {
    updateMembershipData: updateMembershipData,
    getMembershipData: getMembershipData,
  };
});
