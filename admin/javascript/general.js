// Check authentication state on all admin pages
function checkAuth() {
  const isAdminPage = window.location.pathname.includes("/admin/");
  const isLoginPage = window.location.pathname.includes(
    "admin_login_interface.html"
  );
  const isLoggedIn = localStorage.getItem("adminLoggedIn");

  if (isAdminPage && !isLoggedIn && !isLoginPage) {
    // Redirect to login if not authenticated
    window.location.href = "admin_login_interface.html";
    return false;
  } else if (isLoginPage && isLoggedIn) {
    // Redirect to dashboard if already logged in
    window.location.href = "admin_dashboard.html";
    return false;
  }
  return true;
}

// Handle logout functionality
function setupLogout() {
  const logoutButtons = document.querySelectorAll(".logout-button");
  logoutButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Clear admin data from localStorage
      localStorage.removeItem("adminLoggedIn");
      localStorage.removeItem("adminName");
      localStorage.removeItem("adminEmail");

      // Redirect to login page
      window.location.href = "admin_login_interface.html";
    });
  });
}

// Update admin name in UI if available
function updateAdminUI() {
  const adminElements = document.querySelectorAll(".admin-name, .font-medium");
  adminElements.forEach((element) => {
    if (element.textContent.includes("Admin")) {
      const adminName = localStorage.getItem("adminName") || "Admin";
      element.textContent = adminName;
    }
  });
}

// Update real-time date
function updateRealTimeDate(elementSelector = "header span.text-gray-600") {
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const today = new Date().toLocaleDateString("en-US", options);

  const dateElements = document.querySelectorAll(elementSelector);
  dateElements.forEach((element) => {
    if (!element.textContent.includes("Last updated")) {
      element.textContent = today;
    }
  });
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  if (checkAuth()) {
    setupLogout();
    updateAdminUI();
    updateRealTimeDate();
  }
});
