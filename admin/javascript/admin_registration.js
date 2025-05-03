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

// Make showTab available globally for onclick handlers
window.showTab = showTab;

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
    const registrations = JSON.parse(
      localStorage.getItem("registrations") || "[]"
    );
    const registration = registrations.find((r) => r.id === registrationId);

    if (!registration) {
      throw new Error("Registration not found");
    }

    // Create new member entry
    const members = JSON.parse(localStorage.getItem("members") || "[]");
    const newMember = {
      id: Date.now().toString(),
      name: registration.name,
      email: registration.email,
      contact: registration.contact,
      type: registration.type,
      dateOfMembership: new Date().toISOString(),
      dateOfExpiration: calculateExpirationDate(
        registration.membershipDuration
      ),
      status: "active",
    };

    members.push(newMember);
    localStorage.setItem("members", JSON.stringify(members));

    // Remove from pending registrations
    const updatedRegistrations = registrations.filter(
      (r) => r.id !== registrationId
    );
    localStorage.setItem("registrations", JSON.stringify(updatedRegistrations));

    // Update dashboard stats
    const stats = JSON.parse(
      localStorage.getItem("stats") ||
        '{"newMembers":0,"pendingApproval":0,"activeMembers":0,"expiredMembers":0}'
    );
    stats.newMembers++;
    stats.activeMembers++;
    stats.pendingApproval = updatedRegistrations.filter(
      (r) => r.status === "pending"
    ).length;
    localStorage.setItem("stats", JSON.stringify(stats));

    showToast("Registration approved successfully", "success");
    loadRegistrations(); // Refresh the list
  } catch (error) {
    console.error("Error approving registration:", error);
    showToast("Failed to approve registration", "error");
  }
}

async function rejectRegistration(registrationId) {
  try {
    const registrations = JSON.parse(
      localStorage.getItem("registrations") || "[]"
    );

    // Remove registration completely
    const updatedRegistrations = registrations.filter(
      (r) => r.id !== registrationId
    );
    localStorage.setItem("registrations", JSON.stringify(updatedRegistrations));

    // Update dashboard stats
    const stats = JSON.parse(
      localStorage.getItem("stats") ||
        '{"newMembers":0,"pendingApproval":0,"activeMembers":0,"expiredMembers":0}'
    );
    stats.pendingApproval = updatedRegistrations.filter(
      (r) => r.status === "pending"
    ).length;
    localStorage.setItem("stats", JSON.stringify(stats));

    // Remove the registration card from UI immediately
    const registrationCard = document.querySelector(
      `[data-registration-id="${registrationId}"]`
    );
    if (registrationCard) {
      registrationCard.remove();
    }

    showToast("Registration rejected and removed successfully", "success");

    // Refresh the display
    const currentTab = document
      .querySelector(".tab-active")
      .id.replace("Tab", "");
    loadRegistrations(currentTab);
  } catch (error) {
    console.error("Error rejecting registration:", error);
    showToast("Failed to reject registration", "error");
  }
}

function calculateExpirationDate(duration) {
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
  const containerId = `${tab}RegistrationList`;
  const container = document.getElementById(containerId);

  if (!container) {
    console.error(`Container not found: ${containerId}`);
    return;
  }

  if (registrations.length === 0) {
    container.innerHTML =
      '<div class="text-center text-gray-500 py-4">No registrations found</div>';
    return;
  }

  container.innerHTML = registrations
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
          <p class="text-xs text-gray-400 mt-2">Registration Date: ${new Date(
            reg.timestamp
          ).toLocaleDateString()}</p>
        </div>
        <span class="px-3 py-1 text-xs rounded-full ${
          reg.status === "pending"
            ? "bg-yellow-100 text-yellow-800"
            : reg.status === "approved"
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800"
        }">
          ${reg.status.charAt(0).toUpperCase() + reg.status.slice(1)}
        </span>
      </div>
      
      ${
        reg.status === "pending"
          ? `
        <div class="flex gap-2 mt-4">
          <button onclick="approveRegistration('${reg.id}')"
            class="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm transition-colors">
            <i class="ri-check-line mr-1"></i> Approve
          </button>
          <button onclick="rejectRegistration('${reg.id}')"
            class="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm transition-colors">
            <i class="ri-close-line mr-1"></i> Reject
          </button>
        </div>
      `
          : ""
      }
    </div>
  `
    )
    .join("");
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
