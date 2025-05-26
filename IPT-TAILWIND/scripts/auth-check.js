// Guest user authentication check
export function checkTokenExpiration() {
  const token = localStorage.getItem("token");
  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const isExpired = Date.now() >= payload.exp * 1000;

    if (isExpired) {
      localStorage.removeItem("token");
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error checking token:", error);
    return false;
  }
}

// Make checkGuestUser available globally
window.checkGuestUser = function () {
  const token = localStorage.getItem("token");
  const userEmail = localStorage.getItem("userEmail");

  // List of pages that don't require authentication
  const publicPages = [
    "index.html",
    "login.html",
    "sign-up.html",
    "",
    "gym-fitness.html",
    "mixed-martial-arts.html",
    "dance-studio.html",
    "learn-more.html",
    "our-team.html",
    "privacy-policy.html",
  ];

  // Get current page name
  const currentPage = window.location.pathname.split("/").pop();

  // Allow access to public pages without authentication
  if (publicPages.includes(currentPage)) {
    return true;
  }

  // For protected pages, check if user is logged in
  if (token && userEmail) {
    return true;
  }

  // If not authenticated and trying to access a protected page, redirect to login
  window.location.href = "login.html";
  return false;
};

// Check token on page load only for protected pages
document.addEventListener("DOMContentLoaded", () => {
  const publicPages = [
    "index.html",
    "login.html",
    "sign-up.html",
    "",
    "gym-fitness.html",
    "mixed-martial-arts.html",
    "dance-studio.html",
    "learn-more.html",
    "our-team.html",
    "privacy-policy.html",
  ];
  const currentPage = window.location.pathname.split("/").pop();

  if (!publicPages.includes(currentPage)) {
    if (!checkTokenExpiration()) {
      window.location.href = "login.html";
    }
  }
});

// Handle navigation and service buttons
document.addEventListener("DOMContentLoaded", function () {
  // Get all service buttons
  const serviceButtons = document.querySelectorAll(".join-btn");

  serviceButtons.forEach((button) => {
    const originalOnclick = button.getAttribute("onclick");
    if (originalOnclick) {
      const href = originalOnclick.match(
        /window\.location\.href='([^']+)'/
      )?.[1];
      if (href) {
        button.onclick = function (e) {
          e.preventDefault();
          window.location.href = href;
        };
      }
    }
  });

  // Handle booking buttons that require authentication
  const bookingButtons = document.querySelectorAll(
    '[data-requires-auth="true"]'
  );
  bookingButtons.forEach((button) => {
    const originalOnclick = button.getAttribute("onclick");
    button.onclick = function (e) {
      e.preventDefault();
      if (window.checkGuestUser()) {
        if (originalOnclick) {
          eval(originalOnclick);
        }
      }
    };
  });
});

// Export for use in other files
window.checkGuestUser = checkGuestUser;
