import { API_URL } from "./config.js";

// Admin Dashboard
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache
const MAX_RETRIES = 3;
const statsCache = { data: null, timestamp: 0 };

// Load elements
const loadingElements = {
  stats: document.querySelectorAll(".stats-card"),
  registrations: document.getElementById("registrationsList"),
};

// Setup click handlers for stats cards
function setupStatsCardClickHandlers() {
  const statsCards = document.querySelectorAll(".stats-card");
  if (!statsCards.length) return;

  // Add click handlers for each card
  statsCards.forEach((card, index) => {
    card.style.cursor = "pointer";
    card.addEventListener("click", () => {
      switch (index) {
        case 0: // New Members
          window.location.href = "admin_members_database.html?filter=new";
          break;
        case 1: // Pending Approval
          window.location.href = "admin_registration.html";
          break;
        case 2: // Active Members
          window.location.href = "admin_members_database.html?filter=active";
          break;
        case 3: // Expired Members
          window.location.href = "admin_members_database.html?filter=expired";
          break;
      }
    });
  });
}

// Update dashboard stats
function updateDashboardStats() {
  if (!window.adminApi) return;
  const stats = window.adminApi.getDashboardStats();
  updateDashboardWithStats(stats);
  updateLastUpdated();
}

// Update the UI with stats
function updateDashboardWithStats(stats) {
  const statsCards = document.querySelectorAll(".stats-card p.text-3xl");
  if (!statsCards.length) return;

  statsCards[0].textContent = stats.newMembers;
  statsCards[1].textContent = stats.pendingApproval;
  statsCards[2].textContent = stats.activeMembers;
  statsCards[3].textContent = stats.expiredMembers;
}

// Initialize dashboard
function initializeDashboard() {
  try {
    showLoadingStates();
    updateDashboardStats();
    loadRecentRegistrations();
    setupStatsCardClickHandlers();
  } catch (error) {
    console.error("Error initializing dashboard:", error);
    handleError();
  }
}

// Show loading states for all elements
function showLoadingStates() {
  document.querySelectorAll(".stats-card p.text-3xl").forEach((card) => {
    card.innerHTML =
      '<div class="animate-pulse bg-gray-200 h-8 w-24 rounded"></div>';
  });

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

// Load and display recent registrations
async function loadRecentRegistrations() {
  const registrationsList = document.getElementById("registrationsList");
  if (!registrationsList || !window.adminApi) return;

  const registrations = window.adminApi.getRegistrations();
  const recentRegistrations = registrations
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  if (recentRegistrations.length === 0) {
    registrationsList.innerHTML =
      '<p class="text-gray-500 text-center py-4">No recent registrations</p>';
    return;
  }

  registrationsList.innerHTML = recentRegistrations
    .map(
      (reg) => `
    <div class="flex items-center justify-between p-4 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
      <div>
        <h4 class="font-medium">${reg.name}</h4>
        <p class="text-sm text-gray-600">${reg.membershipType}</p>
        <p class="text-xs text-gray-500">${new Date(
          reg.date
        ).toLocaleDateString()}</p>
        <p class="text-xs text-gray-500">${reg.email}</p>
      </div>
      <span class="px-3 py-1 rounded-full text-xs ${
        reg.status === "pending"
          ? "bg-yellow-100 text-yellow-800"
          : reg.status === "approved"
          ? "bg-green-100 text-green-800"
          : "bg-red-100 text-red-800"
      }">
        ${reg.status}
      </span>
    </div>
  `
    )
    .join("");
}

// Update last updated timestamp
function updateLastUpdated() {
  const lastUpdatedElement = document.querySelector(".last-updated");
  if (lastUpdatedElement) {
    lastUpdatedElement.textContent = `Last updated: ${new Date().toLocaleTimeString()}`;
  }
}

// Handle errors gracefully
function handleError() {
  const notification = document.createElement("div");
  notification.className =
    "fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-md shadow";
  notification.textContent = "Error updating dashboard";
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 3000);
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", async () => {
  // Initialize demo data if none exists
  if (!localStorage.getItem("registrations")) {
    localStorage.setItem(
      "registrations",
      JSON.stringify([
        {
          id: "1",
          name: "John Smith",
          email: "john@example.com",
          membershipType: "gym",
          date: new Date().toISOString(),
          status: "pending",
        },
      ])
    );
  }

  if (!localStorage.getItem("members")) {
    localStorage.setItem(
      "members",
      JSON.stringify([
        {
          id: "1",
          name: "Maria Garcia",
          email: "maria@example.com",
          membershipType: "gym",
          dateJoined: new Date().toISOString(),
          status: "active",
        },
      ])
    );
  }

  // Initialize dashboard
  await initializeDashboard();

  // Setup auto-refresh
  setInterval(updateDashboardStats, 5000);
  setInterval(loadRecentRegistrations, 5000);
});
