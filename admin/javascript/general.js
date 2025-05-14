// Check authentication state on all admin pages
function checkAuth() {
  const isAdminPage = window.location.pathname.includes("/admin");
  const isLoginPage = window.location.pathname.includes(
    "admin_login_interface.html"
  );
  const isLoggedIn = localStorage.getItem("adminLoggedIn");

  // Check session expiration
  const sessionData = JSON.parse(localStorage.getItem("adminSession") || "{}");
  if (sessionData.timestamp) {
    const now = Date.now();
    const sessionAge = now - sessionData.timestamp;
    if (sessionAge > sessionData.expiresIn) {
      // Session expired, clear all admin data
      clearAdminSession();
      if (!isLoginPage) {
        window.location.href = "./admin_login_interface.html?expired=true";
        return false;
      }
    }
  }

  if (isAdminPage && !isLoggedIn && !isLoginPage) {
    // Redirect to login if not authenticated
    window.location.href = "./admin_login_interface.html";
    return false;
  } else if (isLoginPage && isLoggedIn) {
    // Redirect to dashboard if already logged in
    window.location.href = "./admin_dashboard.html";
    return false;
  }

  // Show session expired message if redirected from expired session
  if (
    isLoginPage &&
    new URLSearchParams(window.location.search).get("expired")
  ) {
    const loginError = document.getElementById("loginError");
    if (loginError) {
      loginError.textContent = "Your session has expired. Please login again.";
      loginError.classList.remove("hidden");
    }
  }

  return true;
}

// Clear all admin session data
function clearAdminSession() {
  localStorage.removeItem("adminLoggedIn");
  localStorage.removeItem("adminName");
  localStorage.removeItem("adminEmail");
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminBookingsData");
  localStorage.removeItem("adminSession");
}

// Handle logout functionality
function setupLogout() {
  const logoutButtons = document.querySelectorAll(".logout-button");
  logoutButtons.forEach((button) => {
    button.addEventListener("click", () => {
      clearAdminSession();
      window.location.href = "./admin_login_interface.html";
    });
  });
}

// Update admin name in UI if available
function updateAdminUI() {
  const adminNameElement = document.querySelector(".font-medium");
  if (adminNameElement) {
    const adminName = localStorage.getItem("adminName");
    if (adminName) {
      adminNameElement.textContent = adminName;
    }
  }
}

// Update real-time date
function updateRealTimeDate(elementSelector = "header span.text-gray-600") {
  const dateElement = document.querySelector(elementSelector);
  if (dateElement) {
    const now = new Date();
    const options = { month: "long", day: "numeric", year: "numeric" };
    dateElement.textContent = now.toLocaleDateString("en-US", options);
  }
}

// Initialize on page load with periodic session checks
document.addEventListener("DOMContentLoaded", () => {
  if (checkAuth()) {
    setupLogout();
    updateAdminUI();
    updateRealTimeDate();

    // Periodically check session status
    setInterval(checkAuth, 60000); // Check every minute
  }
});
