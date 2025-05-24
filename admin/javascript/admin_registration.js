// ADMIN REGISTRATION
document.addEventListener("DOMContentLoaded", function () {
  // Load initial data
  loadRegistrations();

  // Setup auto-refresh
  setInterval(loadRegistrations, 5000); // Refresh every 5 seconds

  // Setup sidebar
  setupSidebar();

  // Update current date
  const dateElement = document.querySelector("header .text-gray-600");
  if (dateElement) {
    const now = new Date();
    const options = { month: "long", day: "numeric", year: "numeric" };
    dateElement.textContent = now.toLocaleDateString("en-US", options);
  }

  // Add click handlers for tabs
  document
    .getElementById("gymTab")
    .addEventListener("click", () => showTab("gym"));
  document
    .getElementById("mmaTab")
    .addEventListener("click", () => showTab("mma"));
  document
    .getElementById("danceTab")
    .addEventListener("click", () => showTab("dance"));
});

// Add to window object for onclick handlers
window.showTab = showTab;
window.approveRegistration = approveRegistration;
window.rejectRegistration = rejectRegistration;
window.approvePayment = approvePayment;
window.rejectPayment = rejectPayment;

function setupSidebar() {
  document.querySelectorAll(".sidebar-link").forEach((link) => {
    link.addEventListener("click", function () {
      document.querySelectorAll(".sidebar-link").forEach((l) => {
        l.classList.remove("active", "bg-primary", "bg-opacity-20");
        l.classList.add("text-gray-300");
      });
      this.classList.add("active", "bg-primary", "bg-opacity-20");
      this.classList.remove("text-gray-300");
    });
  });
}

function showTab(tabName) {
  // Update UI for tab switch
  document.querySelectorAll(".registration-content").forEach((content) => {
    content.classList.add("hidden");
  });
  document.querySelectorAll('[id$="Tab"]').forEach((tab) => {
    tab.classList.remove("tab-active");
  });

  document.getElementById(`${tabName}Content`).classList.remove("hidden");
  document.getElementById(`${tabName}Tab`).classList.add("tab-active");

  // Load registrations for selected tab
  loadRegistrations(tabName);
}

async function approveRegistration(registrationId) {
  try {
    // Get registration details
    const registrations = JSON.parse(localStorage.getItem("registrations") || "[]");
    const registration = registrations.find(r => r.id === registrationId);

    if (!registration) {
      throw new Error("Registration not found");
    }

    // Parse membership duration to get number of days
    const durationMatch = registration.membershipDuration.match(/(\d+)/);
    const months = durationMatch ? parseInt(durationMatch[1]) : 1;
    const days = months * 30; // Approximate days per month

    // Calculate expiration date
    const startDate = new Date();
    const expirationDate = new Date(startDate);
    expirationDate.setMonth(expirationDate.getMonth() + months);

    // Create new member entry
    const membershipId = 'mem_' + Date.now().toString();
    const newMember = {
      id: Date.now().toString(),
      name: registration.name,
      email: registration.email,
      contact: registration.contact,
      membershipType: registration.type,
      membershipDuration: registration.membershipDuration,
      dateOfMembership: startDate.toISOString(),
      dateOfExpiration: expirationDate.toISOString(),
      status: "active",
      paymentMethod: registration.paymentMethod,
      paymentStatus: "paid",
      membershipId: membershipId
    };

    // Add to members database
    const members = JSON.parse(localStorage.getItem("members") || "[]");
    members.push(newMember);
    localStorage.setItem("members", JSON.stringify(members));

    // Create membership data including selected sessions if any
    const membershipData = {
      daysLeft: days,
      nextPaymentDate: expirationDate.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
      }),
      fee: registration.fee || 0,
      purchaseDate: startDate.toISOString(),
      originalDuration: days,
      type: registration.type,
      status: "active",
      membershipId: membershipId,
      sessions: registration.selectedSessions || []
    };

    // Update user's localStorage data
    const userEmail = registration.email;
    
    // Store type preference
    localStorage.setItem(`userType_${userEmail}`, registration.type);
    
    // Store membership data for this user
    localStorage.setItem(`membershipData_${userEmail}`, JSON.stringify(membershipData));
    
    // Store selected session information based on membership type
    if (registration.selectedSessions) {
      switch (registration.type.toLowerCase()) {
        case "mma training":
        case "mma":
          localStorage.setItem(`mma25SessionUserBookings_${userEmail}`, 
            JSON.stringify(registration.selectedSessions));
          break;
        case "dance studio":
        case "dance":
          localStorage.setItem(`studioBookings_${userEmail}`, 
            JSON.stringify(registration.selectedSessions));
          break;
      }
    }

    // Store global membership data for reference
    const membersData = JSON.parse(localStorage.getItem("members-data") || "{}");
    membersData[registration.email] = membershipData;
    localStorage.setItem("members-data", JSON.stringify(membersData));

    // Remove from registrations
    const updatedRegistrations = registrations.filter(r => r.id !== registrationId);
    localStorage.setItem("registrations", JSON.stringify(updatedRegistrations));

    // Update stats
    updateStats();

    // Remove card from UI and show success message
    const card = document.querySelector(`[data-registration-id="${registrationId}"]`);
    if (card) {
      card.remove();
    }
    
    showToast("Registration approved successfully", "success");
    
    // Reload registrations to update the view
    await loadRegistrations(document.querySelector('.active-tab').id.replace('Tab', ''));

  } catch (error) {
    console.error("Error approving registration:", error);
    showToast(`Error: ${error.message || "Failed to approve registration"}`, "error");
  }
}

async function rejectRegistration(registrationId) {
  try {
    // Get current registrations
    const registrations = JSON.parse(
      localStorage.getItem("registrations") || "[]"
    );

    // Remove registration
    const updatedRegistrations = registrations.filter(
      (r) => r.id !== registrationId
    );
    localStorage.setItem("registrations", JSON.stringify(updatedRegistrations));

    // Update stats
    updateStats();

    // Remove card from UI
    const card = document.querySelector(
      `[data-registration-id="${registrationId}"]`
    );
    if (card) {
      card.remove();
    }

    showNotification("Registration rejected successfully");
  } catch (error) {
    console.error("Error rejecting registration:", error);
    showNotification("Error rejecting registration", "error");
  }
}

function calculateExpirationDate(duration) {
  const months = parseInt(duration);
  const expirationDate = new Date();
  expirationDate.setMonth(expirationDate.getMonth() + months);
  return expirationDate.toISOString();
}

function updateStats() {
  // Update dashboard stats
  const registrations = JSON.parse(
    localStorage.getItem("registrations") || "[]"
  );
  const members = JSON.parse(localStorage.getItem("members") || "[]");

  const stats = {
    newMembers: members.filter((m) => {
      const membershipDate = new Date(m.dateOfMembership);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return membershipDate >= thirtyDaysAgo;
    }).length,
    pendingApproval: registrations.filter((r) => r.status === "pending").length,
    activeMembers: members.filter((m) => m.status === "active").length,
    expiredMembers: members.filter((m) => m.status === "expired").length,
  };

  localStorage.setItem("stats", JSON.stringify(stats));
}

function showNotification(message, type = "success") {
  const notification = document.createElement("div");
  notification.className = `fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg ${
    type === "success"
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800"
  }`;
  notification.textContent = message;
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 3000);
}

async function loadRegistrations(tab = "gym") {
  try {
    const registrations = JSON.parse(
      localStorage.getItem("registrations") || "[]"
    );

    // Filter registrations based on tab
    const filteredRegistrations = registrations.filter((reg) => {
      if (tab === "gym") return reg.type.toLowerCase().includes("gym");
      if (tab === "mma") return reg.type.toLowerCase().includes("mma");
      if (tab === "dance")
        return (
          reg.type.toLowerCase().includes("dance") ||
          reg.type.toLowerCase().includes("studio")
        );
      return true;
    });

    displayRegistrations(filteredRegistrations, tab);
  } catch (error) {
    console.error("Error loading registrations:", error);
    showToast("Error loading registrations", "error");
  }
}

function displayRegistrations(registrations, tab) {
  const list = document.getElementById(`${tab}RegistrationList`);
  if (!list) {
    console.error(`Container not found: ${tab}RegistrationList`);
    return;
  }

  if (registrations.length === 0) {
    list.innerHTML =
      '<div class="text-center text-gray-500 py-4">No registrations found</div>';
    return;
  }

  list.innerHTML = registrations
    .map(
      (reg) => `
    <div class="bg-white p-6 rounded-lg shadow-md border-l-4 ${
      reg.status === "pending"
        ? "border-yellow-500"
        : reg.status === "approved"
        ? "border-green-500"
        : "border-red-500"
    } hover:shadow-lg transition-shadow" data-registration-id="${reg.id}">
      <div class="flex justify-between items-start mb-4">
        <div>
          <h4 class="text-lg font-semibold">${reg.name}</h4>
          <p class="text-sm text-gray-600 mt-1">${reg.type}</p>
          <p class="text-sm text-gray-500 mt-1">Email: ${reg.email}</p>
          <p class="text-sm text-gray-500">Contact: ${reg.contact}</p>
          <p class="text-sm text-gray-500">Payment Method: ${
            reg.paymentMethod
          }</p>
          <p class="text-xs text-gray-400 mt-2">Registration Date: ${new Date(
            reg.timestamp
          ).toLocaleDateString()}</p>
        </div>
        <div class="flex flex-col gap-2">
          <span class="px-3 py-1 text-xs rounded-full ${
            reg.status === "pending"
              ? "bg-yellow-100 text-yellow-800"
              : reg.status === "approved"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }">
            ${reg.status.charAt(0).toUpperCase() + reg.status.slice(1)}
          </span>
          <span class="px-3 py-1 text-xs rounded-full ${
            reg.paymentStatus === "pending" ||
            reg.paymentStatus === "pending_verification" ||
            reg.paymentStatus === "pending_payment"
              ? "bg-yellow-100 text-yellow-800"
              : reg.paymentStatus === "verified"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }">
            Payment: ${
              (reg.paymentStatus || "Pending").charAt(0).toUpperCase() +
              (reg.paymentStatus || "Pending").slice(1).replace("_", " ")
            }
          </span>
        </div>
      </div>
      
      ${
        reg.status === "pending"
          ? `
        <div class="flex gap-2 mt-4">
          ${
            reg.paymentMethod === "Gcash" ||
            reg.paymentStatus === "pending_verification"
              ? `
            <button onclick="approvePayment('${reg.id}')"
              class="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm transition-colors">
              <i class="ri-check-line mr-1"></i> Verify Payment
            </button>
            <button onclick="rejectPayment('${reg.id}')"
              class="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm transition-colors">
              <i class="ri-close-line mr-1"></i> Reject Payment
            </button>
            `
              : `
            <button onclick="approvePayment('${reg.id}')"
              class="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm transition-colors">
              <i class="ri-check-line mr-1"></i> Confirm Payment Received
            </button>
            <button onclick="rejectRegistration('${reg.id}')"
              class="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm transition-colors">
              <i class="ri-close-line mr-1"></i> Cancel Registration
            </button>
            `
          }
        </div>
      `
          : ""
      }
    </div>
  `
    )
    .join("");

  // Update payment status section
  const paymentStatus = document.getElementById("paymentStatus");
  const paymentActions = document.getElementById("paymentActions");

  // Hide payment actions section since we're now showing buttons inline
  if (paymentActions) {
    paymentActions.classList.add("hidden");
  }
}

function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `fixed top-4 left-1/2 transform -translate-x-1/2 z-50 p-4 rounded-md shadow-lg ${
    type === "success"
      ? "bg-green-500"
      : type === "error"
      ? "bg-red-500"
      : "bg-blue-500"
  } text-white max-w-md`;

  toast.innerHTML = `
    <div class="flex items-center space-x-2">
      <i class="ri-${
        type === "success"
          ? "checkbox-circle"
          : type === "error"
          ? "error-warning"
          : "information"
      }-line text-xl"></i>
      <div class="text-sm font-medium">${message}</div>
    </div>
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translate(-50%, -20px)";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

async function approvePayment(registrationId) {
  try {
    const registrations = JSON.parse(
      localStorage.getItem("registrations") || "[]"
    );
    const registration = registrations.find((r) => r.id === registrationId);

    if (!registration) {
      throw new Error("Registration not found");
    }

    registration.paymentStatus = "verified";
    localStorage.setItem("registrations", JSON.stringify(registrations));
    showToast("Payment approved successfully", "success");

    // After approving payment, automatically approve registration
    await approveRegistration(registrationId);
  } catch (error) {
    console.error("Error approving payment:", error);
    showToast("Failed to approve payment", "error");
  }
}

async function rejectPayment(registrationId) {
  try {
    const registrations = JSON.parse(
      localStorage.getItem("registrations") || "[]"
    );
    const registration = registrations.find((r) => r.id === registrationId);

    if (!registration) {
      throw new Error("Registration not found");
    }

    registration.paymentStatus = "rejected";
    localStorage.setItem("registrations", JSON.stringify(registrations));
    showToast("Payment rejected", "success");

    // After rejecting payment, automatically reject registration
    await rejectRegistration(registrationId);
  } catch (error) {
    console.error("Error rejecting payment:", error);
    showToast("Failed to reject payment", "error");
  }
}
