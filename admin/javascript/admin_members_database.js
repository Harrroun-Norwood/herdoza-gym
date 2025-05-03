import config from "./config.js";

// Base API URL
const API_URL = config.apiUrl;
let isEditing = false; // Track editing state

// Load members when page loads
document.addEventListener("DOMContentLoaded", async function () {
  // Get filter from URL parameters if present
  const urlParams = new URLSearchParams(window.location.search);
  const filterParam = urlParams.get("filter");

  // Set the filter dropdown to match URL parameter if present
  if (filterParam) {
    const filterSelect = document.getElementById("statusFilter");
    if (filterSelect) {
      filterSelect.value = filterParam;
    }
  }

  // Load initial data with filter from URL or default
  await loadMembers(filterParam || "all");
  setupStatusFilter();
  setupAutoRefresh();

  // Update current date
  updateCurrentDate();
});

function setupAutoRefresh() {
  // Refresh data every 5 seconds if not editing
  setInterval(async () => {
    if (!isEditing) {
      await loadMembers(
        document.getElementById("statusFilter")?.value || "all"
      );
    }
  }, 5000);
}

async function loadMembers(filter = "all") {
  try {
    // Get members from localStorage via adminApi
    const members = window.adminApi.getMembers();

    // Check for expired memberships and update status
    const updatedMembers = members.map((member) => {
      const expirationDate = new Date(member.dateOfExpiration);
      const now = new Date();
      if (expirationDate < now && member.status === "active") {
        member.status = "expired";
      }
      return member;
    });

    // Filter members based on selection
    const filteredMembers = filterMembers(updatedMembers, filter);

    // Display members in the table
    displayMembers(filteredMembers);
  } catch (error) {
    console.error("Error loading members:", error);
    showLoadingState();
  }
}

function filterMembers(members, filter) {
  if (filter === "all") return members;
  return members.filter((member) => member.status === filter);
}

function displayMembers(members) {
  const tableBody = document.getElementById("memberTableBody");
  if (!tableBody) return;

  if (!members.length) {
    tableBody.innerHTML =
      '<tr><td colspan="6" class="text-center py-4 text-gray-500">No members found</td></tr>';
    return;
  }

  tableBody.innerHTML = members
    .map(
      (member) => `
    <tr class="border-b hover:bg-gray-50" data-member-id="${member.id}">
      <td class="py-4">
        <div class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
          <i class="ri-user-line text-gray-500"></i>
        </div>
      </td>
      <td class="py-4">
        <div class="font-medium">${member.name}</div>
        <div class="text-sm text-gray-500">${
          member.email || "No email provided"
        }</div>
      </td>
      <td class="py-4">
        <div class="contact-row">
          <span class="contact-display">${member.contact}</span>
          <button onclick="editContact('${member.id}')" class="edit-btn ml-2">
            <i class="ri-pencil-line"></i>
          </button>
          <div class="edit-form hidden">
            <input type="text" value="${
              member.contact
            }" class="border px-2 py-1 w-32" 
                   onkeydown="if(event.key === 'Enter') saveContact('${
                     member.id
                   }'); 
                             if(event.key === 'Escape') cancelEdit('${
                               member.id
                             }');">
            <button onclick="saveContact('${
              member.id
            }')" class="text-green-500 ml-1">
              <i class="ri-check-line"></i>
            </button>
            <button onclick="cancelEdit('${
              member.id
            }')" class="text-red-500 ml-1">
              <i class="ri-close-line"></i>
            </button>
          </div>
        </div>
      </td>
      <td class="py-4">
        <div class="text-sm">${formatDate(member.dateOfMembership)}</div>
      </td>
      <td class="py-4">
        <div class="text-sm">${formatDate(member.dateOfExpiration)}</div>
      </td>
      <td class="py-4">
        <span class="px-2 py-1 text-xs rounded-full ${
          member.status === "active"
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800"
        }">
          ${capitalizeFirst(member.status)}
        </span>
      </td>
    </tr>
  `
    )
    .join("");
}

function setupStatusFilter() {
  const filterSelect = document.getElementById("statusFilter");
  if (!filterSelect) return;

  filterSelect.addEventListener("change", function () {
    loadMembers(this.value);
  });
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function capitalizeFirst(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function showLoadingState() {
  const tableBody = document.getElementById("memberTableBody");
  if (!tableBody) return;

  tableBody.innerHTML = Array(3)
    .fill(0)
    .map(
      () => `
        <tr class="animate-pulse">
          <td class="py-4">
            <div class="w-10 h-10 bg-gray-200 rounded-full"></div>
          </td>
          <td class="py-4">
            <div class="h-4 bg-gray-200 rounded w-32 mb-2"></div>
            <div class="h-3 bg-gray-200 rounded w-24"></div>
          </td>
          <td class="py-4">
            <div class="h-3 bg-gray-200 rounded w-24"></div>
          </td>
          <td class="py-4">
            <div class="h-3 bg-gray-200 rounded w-32"></div>
          </td>
          <td class="py-4">
            <div class="h-3 bg-gray-200 rounded w-32"></div>
          </td>
          <td class="py-4">
            <div class="h-6 bg-gray-200 rounded w-16"></div>
          </td>
        </tr>
      `
    )
    .join("");
}

function updateCurrentDate() {
  const dateElement = document.querySelector("header .text-gray-600");
  if (dateElement) {
    const now = new Date();
    const options = { month: "long", day: "numeric", year: "numeric" };
    dateElement.textContent = now.toLocaleDateString("en-US", options);
  }
}

// Contact editing functions
function editContact(memberId) {
  isEditing = true;
  const row = document.querySelector(`tr[data-member-id="${memberId}"]`);
  if (!row) return;

  row.querySelector(".contact-display").style.display = "none";
  row.querySelector(".edit-btn").style.display = "none";
  row.querySelector(".edit-form").classList.remove("hidden");
  const input = row.querySelector("input");
  input.focus();
  input.select(); // Select all text for easy editing
}

function saveContact(memberId) {
  const row = document.querySelector(`tr[data-member-id="${memberId}"]`);
  if (!row) return;

  const input = row.querySelector("input");
  const newContact = input.value.trim();
  if (!newContact) return;

  // Update in localStorage
  const members = window.adminApi.getMembers();
  const memberIndex = members.findIndex((m) => m.id === memberId);
  if (memberIndex !== -1) {
    members[memberIndex].contact = newContact;
    localStorage.setItem("members", JSON.stringify(members));

    // Update display
    row.querySelector(".contact-display").textContent = newContact;
    cancelEdit(memberId);

    // Show success notification
    showNotification("Contact updated successfully", "success");
  }
}

function cancelEdit(memberId) {
  isEditing = false;
  const row = document.querySelector(`tr[data-member-id="${memberId}"]`);
  if (!row) return;

  row.querySelector(".contact-display").style.display = "";
  row.querySelector(".edit-btn").style.display = "";
  row.querySelector(".edit-form").classList.add("hidden");
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

  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Make functions available globally
window.editContact = editContact;
window.saveContact = saveContact;
window.cancelEdit = cancelEdit;
