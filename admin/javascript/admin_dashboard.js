// Admin Dashboard
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache
const MAX_RETRIES = 3;
const statsCache = { data: null, timestamp: 0 };

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, options, retries = MAX_RETRIES) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) {
        return await response.json();
      }
      throw new Error(`API request failed with status: ${response.status}`);
    } catch (error) {
      if (i === retries - 1) throw error;
      // Exponential backoff: 1s, 2s, 4s, etc.
      await delay(Math.pow(2, i) * 1000);
    }
  }
}

// Load elements
const loadingElements = {
  stats: document.querySelectorAll(".stats-card"),
  registrations: document.getElementById("registrationsList"),
};

document.addEventListener("DOMContentLoaded", function () {
  // Initial load
  updateDashboardStats();
  displayRecentRegistrations();

  // Set up real-time updates
  setInterval(() => {
    updateDashboardStats();
    displayRecentRegistrations();
  }, 2000); // Update every 2 seconds

  // Add click handlers to stats cards
  setupStatsCardClickHandlers();
});

async function initializeDashboard() {
  try {
    // Show loading states
    showLoadingStates();

    // Get stats and registrations from localStorage
    const stats = window.adminApi.getDashboardStats();
    const registrations = window.adminApi.getPendingRegistrations();

    // Update UI with data
    updateDashboardWithStats(stats);
    displayRegistrations(registrations);

    // Update timestamp
    updateLastUpdated();
  } catch (error) {
    console.error("Error initializing dashboard:", error);
    showNotification("Error loading dashboard data", true);
  }
}

function showLoadingStates() {
  // Show loading state for stats cards
  document.querySelectorAll(".stats-card p.text-3xl").forEach((card) => {
    card.innerHTML =
      '<div class="animate-pulse bg-gray-200 h-8 w-24 rounded"></div>';
  });

  // Show loading state for registrations
  const registrationsList = document.getElementById("registrationsList");
  if (registrationsList) {
    registrationsList.innerHTML = `
      <div class="animate-pulse space-y-4">
        ${Array(3)
          .fill(0)
          .map(
            () => `
          <div class="bg-white p-4 rounded-lg shadow">
            <div class="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
            <div class="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        `
          )
          .join("")}
      </div>
    `;
  }
}

function updateDashboardWithStats(stats) {
  const statsCards = document.querySelectorAll(".stats-card p.text-3xl");
  statsCards[0].textContent = stats.newMembers;
  statsCards[1].textContent = stats.pendingApproval;
  statsCards[2].textContent = stats.activeMembers;
  statsCards[3].textContent = stats.expiredMembers;
}

function displayRegistrations(registrations) {
  const registrationsList = document.getElementById("registrationsList");
  if (!registrationsList) return;

  // Filter only pending registrations
  const pendingRegistrations = registrations.filter(
    (reg) => reg.status === "pending"
  );

  if (pendingRegistrations.length === 0) {
    registrationsList.innerHTML =
      '<div class="text-center text-gray-500 py-4">No pending registrations</div>';
    return;
  }

  // Display only the first 3 registrations
  const recentRegistrations = pendingRegistrations.slice(0, 3);

  registrationsList.innerHTML = recentRegistrations
    .map(
      (reg) => `
    <div class="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer border-l-4 border-yellow-500" data-registration-id="${reg.id}">
      <div class="flex items-start justify-between">
        <div>
          <h4 class="font-semibold">${reg.name}</h4>
          <p class="text-sm text-gray-600">${reg.type}</p>
          <p class="text-xs text-gray-500">Payment: ${reg.paymentMethod}</p>
          <p class="text-xs text-gray-500">Duration: ${reg.membershipDuration}</p>
          <p class="text-xs text-gray-500">Contact: ${reg.contact}</p>
        </div>
        <span class="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-800">
          Pending
        </span>
      </div>
    </div>
  `
    )
    .join("");

  // Add "View all" button if there are more registrations
  if (pendingRegistrations.length > 3) {
    const viewAllButton = document.createElement("div");
    viewAllButton.className = "text-center mt-4";
    viewAllButton.innerHTML = `
      <a href="admin_registration.html" class="text-blue-500 hover:underline">
        View all ${pendingRegistrations.length} registrations
      </a>
    `;
    registrationsList.appendChild(viewAllButton);
  }

  // Add click handler to redirect to registration page
  registrationsList.querySelectorAll(".bg-white").forEach((item) => {
    item.addEventListener("click", () => {
      window.location.href = "admin_registration.html";
    });
  });
}

function updateLastUpdated() {
  const lastUpdatedElement = document.querySelector(".last-updated");
  if (lastUpdatedElement) {
    const now = new Date();
    lastUpdatedElement.textContent = `Last updated: ${now.toLocaleTimeString()}`;
  }
}

function handleError() {
  // Show offline mode notification
  const notification = document.createElement("div");
  notification.className =
    "fixed bottom-4 right-4 bg-yellow-500 text-white px-4 py-2 rounded-md shadow";
  notification.textContent = "Using offline mode";
  document.body.appendChild(notification);

  // Remove notification after 3 seconds
  setTimeout(() => notification.remove(), 3000);
}

async function refreshDashboard() {
  await initializeDashboard();
}

function addRefreshButton() {
  const headerDiv = document.querySelector("header div");
  if (!headerDiv) return;

  const refreshButton = document.createElement("button");
  refreshButton.innerHTML = '<i class="ri-refresh-line"></i>';
  refreshButton.className =
    "ml-2 p-2 rounded-full hover:bg-gray-100 transition-colors";
  refreshButton.addEventListener("click", initializeDashboard);
  headerDiv.appendChild(refreshButton);
}

function updateCurrentDate() {
  const dateElement = document.querySelector("header .text-gray-600");
  if (dateElement) {
    const now = new Date();
    const options = { month: "long", day: "numeric", year: "numeric" };
    dateElement.textContent = now.toLocaleDateString("en-US", options);
  }
}

function setupLogout() {
  const logoutButton = document.querySelector(".logout-button");
  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      // Clear all admin-related data from localStorage
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminBookingsData");
      localStorage.removeItem("adminLoggedIn");
      localStorage.removeItem("adminName");
      localStorage.removeItem("adminEmail");

      // Redirect to login page
      window.location.href = "admin_login_interface.html";
    });
  }
}

// Update the stats cards with demo data
async function updateDashboardStats() {
  try {
    // Get stats from localStorage
    const stats = JSON.parse(
      localStorage.getItem("stats") ||
        '{"newMembers":0,"pendingApproval":0,"activeMembers":0,"expiredMembers":0}'
    );

    // Update stats cards
    const statsCards = document.querySelectorAll(".stats-card p.text-3xl");
    statsCards[0].textContent = stats.newMembers;
    statsCards[1].textContent = stats.pendingApproval;
    statsCards[2].textContent = stats.activeMembers;
    statsCards[3].textContent = stats.expiredMembers;
  } catch (error) {
    console.error("Error updating dashboard stats:", error);
  }
}

// Display recent registrations in the dashboard
async function displayRecentRegistrations() {
  try {
    const registrations = JSON.parse(
      localStorage.getItem("registrations") || "[]"
    );
    const pendingRegistrations = registrations.filter(
      (reg) => reg.status === "pending"
    );
    const recentRegistrations = pendingRegistrations.slice(0, 3); // Only show 3 most recent

    const container = document.getElementById("registrationsList");
    if (!container) return;

    if (recentRegistrations.length === 0) {
      container.innerHTML =
        '<div class="text-center text-gray-500 py-4">No recent registrations</div>';
      return;
    }

    container.innerHTML = recentRegistrations
      .map(
        (reg) => `
      <div class="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer border-l-4 border-yellow-500" data-registration-id="${reg.id}">
        <div class="flex items-start justify-between">
          <div>
            <h4 class="font-semibold">${reg.name}</h4>
            <p class="text-sm text-gray-600">${reg.type}</p>
            <p class="text-xs text-gray-500">Payment: ${reg.paymentMethod}</p>
            <p class="text-xs text-gray-500">Duration: ${reg.membershipDuration}</p>
          </div>
          <span class="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-800">
            Pending
          </span>
        </div>
      </div>
    `
      )
      .join("");

    // Add view all link if there are more registrations
    if (registrations.length > 3) {
      const viewAllLink = document.createElement("a");
      viewAllLink.href = "admin_registration.html";
      viewAllLink.className =
        "block text-center text-blue-500 hover:text-blue-600 mt-4 text-sm";
      viewAllLink.textContent = `View all ${registrations.length} registrations`;
      container.appendChild(viewAllLink);
    }
  } catch (error) {
    console.error("Error displaying recent registrations:", error);
    showNotification("Error loading recent registrations", true);
  }
}

function showNotification(message, isError = false) {
  const notification = document.createElement("div");
  notification.className = `fixed bottom-4 right-4 px-4 py-2 rounded-md text-white ${
    isError ? "bg-red-500" : "bg-green-500"
  }`;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000);
}

function setupStatsCardClickHandlers() {
  const statsCards = document.querySelectorAll(".stats-card");

  // New Members card
  statsCards[0].addEventListener("click", () => {
    window.location.href = "admin_members_database.html?filter=active";
  });

  // Pending Approval card
  statsCards[1].addEventListener("click", () => {
    window.location.href = "admin_registration.html";
  });

  // Active Members card
  statsCards[2].addEventListener("click", () => {
    window.location.href = "admin_members_database.html?filter=active";
  });

  // Expired Members card
  statsCards[3].addEventListener("click", () => {
    window.location.href = "admin_members_database.html?filter=expired";
  });

  // Add cursor pointer to cards
  statsCards.forEach((card) => {
    card.style.cursor = "pointer";
  });
}
