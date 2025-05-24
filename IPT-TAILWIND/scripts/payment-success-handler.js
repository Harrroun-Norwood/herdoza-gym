// payment-success-handler.js
// Handles updating membership data after successful payment

// Export payment success handler
export function handlePaymentSuccess(paymentData) {
  const userEmail = localStorage.getItem("userEmail");
  if (!userEmail) return;

  // Get or initialize membership data
  let membershipData = JSON.parse(
    localStorage.getItem(`membershipData_${userEmail}`) || "null"
  );
  const isRenewal = localStorage.getItem("membershipRenewal") === "true";

  if (!membershipData) {
    membershipData = {
      type: paymentData.type || "Gym Fitness",
      daysLeft: 0,
      nextPaymentDate: null,
      fee: 0,
      purchaseDate: null,
      originalDuration: 0,
      status: "pending",
      sessions: [],
    };
  }

  // Calculate expiration date and days left
  const startDate = new Date();
  const duration = paymentData.duration || 30; // Default to 30 days
  const expirationDate = new Date(startDate);
  expirationDate.setDate(expirationDate.getDate() + duration);

  // If renewing, add days to existing expiration
  if (isRenewal && membershipData.nextPaymentDate) {
    const currentExpiry = new Date(membershipData.nextPaymentDate);
    if (currentExpiry > startDate) {
      expirationDate.setDate(currentExpiry.getDate() + duration);
    }
  }

  // Update membership data
  membershipData.daysLeft = duration;
  membershipData.nextPaymentDate = expirationDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  membershipData.fee = paymentData.price || 0;
  membershipData.purchaseDate = startDate.toISOString();
  membershipData.originalDuration = duration;
  membershipData.type = paymentData.type || "Gym Fitness";
  membershipData.status = paymentData.paymentStatus;
  membershipData.membershipId = `mem_${Date.now()}`;

  // Save membership data
  localStorage.setItem(
    `membershipData_${userEmail}`,
    JSON.stringify(membershipData)
  );

  // Clear renewal flag if present
  localStorage.removeItem("membershipRenewal");

  // Save to registrations for admin approval
  const registrations = JSON.parse(
    localStorage.getItem("registrations") || "[]"
  );
  const userData = {
    id: Date.now().toString(),
    name: localStorage.getItem("userName"),
    email: userEmail,
    contact: localStorage.getItem("userContact"),
    type: membershipData.type,
    membershipDuration: `${duration} days`,
    membershipId: membershipData.membershipId,
    paymentMethod: paymentData.paymentMethod,
    paymentStatus: paymentData.paymentStatus,
    status: "pending",
    timestamp: new Date().toISOString(),
    fee: paymentData.price,
    selectedSessions: membershipData.sessions,
  };

  registrations.push(userData);
  localStorage.setItem("registrations", JSON.stringify(registrations));

  // Show toast notification
  const message =
    paymentData.paymentMethod === "Gcash"
      ? "Payment sent successfully! Please wait for admin verification."
      : "Booking confirmed! Please pay onsite before your schedule.";

  showToast(message);

  // Dispatch event to update UI
  window.dispatchEvent(
    new CustomEvent("membershipStatusUpdated", {
      detail: {
        email: userEmail,
        status: paymentData.paymentStatus,
      },
    })
  );
}

function showToast(message) {
  const toast = document.createElement("div");
  toast.className =
    "fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg";
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 3000);
}
