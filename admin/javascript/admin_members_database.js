// Simple member management using localStorage
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
  setupEventListeners();

  // Update current date
  updateCurrentDate();
});

// Setup event listeners
function setupEventListeners() {
  // Create member button
  document.getElementById("createMemberBtn").addEventListener("click", () => {
    showModal();
  });

  // Member form submission
  document.getElementById("memberForm").addEventListener("submit", (e) => {
    e.preventDefault();
    handleMemberFormSubmit(e);
  });

  // Renewal form submission
  document.getElementById("renewalForm").addEventListener("submit", (e) => {
    e.preventDefault();
    handleRenewalFormSubmit(e);
  });
}

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
    showLoadingState();
    let members = await window.adminApi.getMembers();

    // Validate member data structure and fix if necessary
    members = members.map((member) => {
      // Ensure all required fields are present
      const validatedMember = {
        id: member.id || Date.now().toString(),
        name: member.name || "Unknown Member",
        email: member.email || "",
        contact: member.contact || "",
        membershipType: member.membershipType || "Gym Fitness",
        membershipDuration: member.membershipDuration || "1",
        dateOfMembership: member.dateOfMembership || new Date().toISOString(),
        dateOfExpiration: member.dateOfExpiration || new Date().toISOString(),
        status: member.status || "active",
        paymentMethod: member.paymentMethod || "Cash",
        paymentStatus: member.paymentStatus || "paid",
      };

      // Check for expired membership
      const now = new Date();
      const expirationDate = new Date(validatedMember.dateOfExpiration);
      if (expirationDate < now && validatedMember.status === "active") {
        validatedMember.status = "expired";
      }

      return validatedMember;
    });

    // Update localStorage with validated members
    localStorage.setItem("members", JSON.stringify(members));

    // Update dashboard stats with the latest data
    updateDashboardStats();

    // Filter and display members
    const filteredMembers = filterMembers(members, filter);
    displayMembers(filteredMembers);
  } catch (error) {
    console.error("Error loading members:", error);
    showNotification(
      "Error loading members: " + (error.message || "Unknown error"),
      "error"
    );

    // Show empty state instead of loading
    const tableBody = document.getElementById("memberTableBody");
    if (tableBody) {
      tableBody.innerHTML =
        '<tr><td colspan="7" class="text-center py-4 text-gray-500">Error loading members. Please try refreshing the page.</td></tr>';
    }
  }
}

function filterMembers(members, filter) {
  if (filter === "all") return members;
  return members.filter((member) => member.status === filter);
}

// Update the display members function to include action buttons
function displayMembers(members) {
  const tableBody = document.getElementById("memberTableBody");
  if (!tableBody) return;

  if (!members.length) {
    tableBody.innerHTML =
      '<tr><td colspan="7" class="text-center py-4 text-gray-500">No members found</td></tr>';
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
          <button onclick="editContact('${
            member.id
          }')" class="edit-btn ml-2" data-tooltip="Edit contact info">
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
            }')" class="text-green-500 ml-1" data-tooltip="Save changes">
              <i class="ri-check-line"></i>
            </button>
            <button onclick="cancelEdit('${
              member.id
            }')" class="text-red-500 ml-1" data-tooltip="Cancel editing">
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
      <td class="py-4">
        <div class="flex items-center space-x-2">
          ${
            member.status === "active"
              ? `
            <button onclick="showRenewalModal('${member.id}')" class="text-blue-600 hover:text-blue-800" data-tooltip="Renew membership">
              <i class="ri-refresh-line"></i>
            </button>
            <button onclick="cancelMembership('${member.id}')" class="text-red-600 hover:text-red-800" data-tooltip="Cancel active membership">
              <i class="ri-close-circle-line"></i>
            </button>
          `
              : `
            <button onclick="showRenewalModal('${member.id}')" class="text-green-600 hover:text-green-800" data-tooltip="Renew expired membership">
              <i class="ri-refresh-line"></i>
            </button>
          `
          }
          <button onclick="removeMember('${
            member.id
          }')" class="text-red-600 hover:text-red-800" data-tooltip="Delete member">
            <i class="ri-delete-bin-line"></i>
          </button>
        </div>
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

async function saveContact(memberId) {
  const row = document.querySelector(`tr[data-member-id="${memberId}"]`);
  if (!row) return;

  const input = row.querySelector("input");
  const newContact = input.value.trim();
  if (!newContact) return;

  try {
    await window.adminApi.updateMemberContact(memberId, newContact);
    row.querySelector(".contact-display").textContent = newContact;
    cancelEdit(memberId);
    showNotification("Contact updated successfully", "success");
  } catch (error) {
    console.error("Error updating contact:", error);
    showNotification("Error updating contact", "error");
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

async function removeMember(memberId) {
  if (
    !confirm(
      "Are you sure you want to remove this member? This action cannot be undone."
    )
  )
    return;

  try {
    await window.adminApi.removeMember(memberId);
    await loadMembers(document.getElementById("statusFilter").value);
    updateDashboardStats(); // Update stats after removing member
    showNotification("Member removed successfully");
  } catch (error) {
    console.error("Error removing member:", error);
    showNotification("Error removing member", "error");
  }
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

// Modal functions
function showModal(memberId = null) {
  const modal = document.getElementById("memberModal");
  const title = document.getElementById("modalTitle");
  const form = document.getElementById("memberForm");

  if (memberId) {
    title.textContent = "Edit Member";
    // Load member data into form
    const members = window.adminApi.getMembers();
    const member = members.find((m) => m.id === memberId);
    if (member) {
      document.getElementById("memberName").value = member.name;
      document.getElementById("memberEmail").value = member.email;
      document.getElementById("memberContact").value = member.contact;
      document.getElementById("membershipType").value = member.membershipType;
    }
  } else {
    title.textContent = "Create New Member";
    form.reset();
  }

  modal.style.display = "flex";
}

function closeModal() {
  document.getElementById("memberModal").style.display = "none";
}

function showRenewalModal(memberId) {
  const modal = document.getElementById("renewalModal");
  const members = window.adminApi.getMembers();
  const member = members.find((m) => m.id === memberId);

  if (member) {
    document.getElementById("renewMemberId").value = member.id;
    document.getElementById("renewMemberName").value = member.name;
    document.getElementById("currentExpirationDate").value =
      member.dateOfExpiration;
  }

  modal.style.display = "flex";
}

function closeRenewalModal() {
  document.getElementById("renewalModal").style.display = "none";
}

// Form submission handlers
async function handleMemberFormSubmit(e) {
  e.preventDefault();

  // Get form values
  const name = document.getElementById("memberName").value.trim();
  const email = document.getElementById("memberEmail").value.trim();
  const contact = document.getElementById("memberContact").value.trim();
  const membershipType = document.getElementById("membershipType").value;
  const membershipDuration =
    document.getElementById("membershipDuration").value;
  const paymentMethod = document.getElementById("paymentMethod").value;

  // Validate required fields
  if (!name || !email || !contact) {
    showNotification("Please fill in all required fields", "error");
    return;
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showNotification("Please enter a valid email address", "error");
    return;
  }

  const memberData = {
    name,
    email,
    contact,
    membershipType,
    membershipDuration,
    paymentMethod,
  };

  try {
    // Attempt to add new member
    await window.adminApi.addMember(memberData);

    // Refresh the member list with current filter
    const currentFilter =
      document.getElementById("statusFilter").value || "all";
    await loadMembers(currentFilter);

    updateDashboardStats(); // Update stats after adding member

    // Close the modal and show success message
    closeModal();
    showNotification("Member added successfully", "success");
  } catch (error) {
    console.error("Error adding member:", error);
    const errorMessage = error.message || "Error adding member";
    showNotification(errorMessage, "error");
  }
}

async function handleRenewalFormSubmit(e) {
  e.preventDefault();

  const memberId = document.getElementById("renewMemberId").value;
  const duration = parseInt(document.getElementById("renewalDuration").value);
  const paymentMethod = document.getElementById("renewalPaymentMethod").value;

  try {
    await window.adminApi.renewMembership(memberId, duration, paymentMethod);
    await loadMembers(document.getElementById("statusFilter").value);
    updateDashboardStats(); // Update stats after renewing membership
    closeRenewalModal();
    showNotification("Membership renewed successfully", "success");
  } catch (error) {
    console.error("Error renewing membership:", error);
    showNotification("Error renewing membership", "error");
  }
}

async function cancelMembership(memberId) {
  if (!confirm("Are you sure you want to cancel this membership?")) return;

  try {
    await window.adminApi.cancelMembership(memberId);
    await loadMembers(document.getElementById("statusFilter").value);
    updateDashboardStats(); // Update stats after cancelling membership
    showNotification("Membership cancelled successfully", "success");
  } catch (error) {
    console.error("Error cancelling membership:", error);
    showNotification("Error cancelling membership", "error");
  }
}

function updateDashboardStats() {
  const members = window.adminApi.getMembers();
  const registrations = JSON.parse(
    localStorage.getItem("registrations") || "[]"
  );

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

// Make functions available globally
window.editContact = editContact;
window.saveContact = saveContact;
window.cancelEdit = cancelEdit;
window.showRenewalModal = showRenewalModal;
window.closeRenewalModal = closeRenewalModal;
window.closeModal = closeModal;
window.cancelMembership = cancelMembership;
window.removeMember = removeMember;
