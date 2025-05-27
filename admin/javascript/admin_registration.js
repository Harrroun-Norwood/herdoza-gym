import config, { API_URL } from "./config.js";

// Initialize page
document.addEventListener("DOMContentLoaded", function () {
  // Load initial data
  loadRegistrations("gym");

  // Setup auto-refresh
  setInterval(() => {
    const activeTab = document.querySelector(".tab-active");
    if (activeTab) {
      loadRegistrations(activeTab.id.replace("Tab", "").toLowerCase());
    }
  }, 5000); // Refresh every 5 seconds

  // Add click handlers for tabs
  document
    .getElementById("gymTab")
    ?.addEventListener("click", () => showTab("gym"));
  document
    .getElementById("mmaTab")
    ?.addEventListener("click", () => showTab("mma"));
  document
    .getElementById("danceTab")
    ?.addEventListener("click", () => showTab("dance"));
});

// Function to show/switch tabs
export function showTab(tabName) {
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

// Load registrations for a specific type
function loadRegistrations(type) {
  const registrationList = document.getElementById(`${type}RegistrationList`);
  if (!registrationList) return;

  try {
    // Show loading state
    registrationList.innerHTML = `
      <div class="col-span-full flex items-center justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>`;

    // Get registrations from API
    const registrations = window.adminApi.getRegistrationsByType(type);
    const pendingRegistrations = registrations.filter(
      (reg) => reg.status === "pending" && reg.verified
    );

    // Update UI
    registrationList.innerHTML = pendingRegistrations.length
      ? pendingRegistrations.map((reg) => createRegistrationCard(reg)).join("")
      : '<p class="text-gray-500 col-span-full text-center py-8">No pending registrations</p>';
  } catch (error) {
    console.error("Error loading registrations:", error);
    registrationList.innerHTML =
      '<p class="text-red-500 col-span-full text-center py-8">Error loading registrations</p>';
  }
}

// Create a card element for a registration
function createRegistrationCard(registration) {
  return `
    <div class="bg-white rounded-lg shadow-md p-6 border border-gray-200" data-registration-id="${
      registration.id
    }">
      <div class="flex justify-between items-start mb-4">
        <div>
          <h3 class="font-semibold text-lg">${registration.name}</h3>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-gray-600 text-sm">Email: ${registration.email}</p>
              <p class="text-gray-600 text-sm">Contact: ${
                registration.contact || "N/A"
              }</p>
              <p class="text-gray-500 text-sm">Registered: ${new Date(
                registration.date
              ).toLocaleDateString()}</p>
            </div>
            <div>
              <p class="text-gray-600 text-sm">Type: ${
                registration.membershipType
              }</p>
              <p class="text-gray-600 text-sm">Duration: ${
                registration.membershipDuration || "1"
              } month(s)</p>
              <p class="text-gray-600 text-sm">Payment: ${
                registration.paymentMethod || "Cash"
              }</p>
            </div>
          </div>
        </div>
        <span class="px-3 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">Pending</span>
      </div>
      <div class="space-x-2 flex">
        <button onclick="handleAction('approve', '${registration.id}', '${
    registration.membershipType
  }')"
          class="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors">
          <i class="ri-check-line mr-1"></i>Approve
        </button>
        <button onclick="handleAction('reject', '${registration.id}', '${
    registration.membershipType
  }')"
          class="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors">
          <i class="ri-close-line mr-1"></i>Reject
        </button>
      </div>
    </div>
  `;
}

// Handle approve/reject actions
export async function handleAction(action, id, type) {
  try {
    const response = await fetch(`${API_URL}/registrations/${id}/${action}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to ${action} registration`);
    }

    // Reload the current tab's data
    loadRegistrations(type);

    // Show success message
    alert(`Successfully ${action}ed registration`);
  } catch (error) {
    console.error("Error:", error);
    alert(`Failed to ${action} registration: ${error.message}`);
  }
}
