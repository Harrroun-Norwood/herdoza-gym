document.addEventListener("DOMContentLoaded", function () {
  const userToken = localStorage.getItem("userToken");
  const userName = localStorage.getItem("userName");
  const userEmail = localStorage.getItem("userEmail");
  const userPicture = localStorage.getItem("userPicture");
  const darkMode = localStorage.getItem("darkMode") === "true";

  // Apply dark mode if saved in localStorage
  if (darkMode) {
    document.body.classList.add("dark-mode");
  }

  // Determine what should be displayed in the login/profile area
  let loginOrProfileHTML;

  if (userToken) {
    // User is logged in - show profile dropdown
    loginOrProfileHTML = `      <div class="relative">        <div class="flex items-center gap-2 cursor-pointer profile-toggle">          <img src="${
      userPicture || "./assets/profile-icon.png"
    }" alt="Profile" class="h-8 w-8 rounded-full object-cover">
          <span class="hidden md:flex items-center">${userName || "User"}</span>
          <i class="bi bi-chevron-down"></i>
        </div>
        
        <div class="absolute right-0 mt-2 w-48 bg-gray-900 rounded-lg shadow-lg py-2 z-50 hidden profile-menu">
          <div class="px-4 py-2 border-b border-gray-800">
            <div class="font-semibold text-ellipsis overflow-hidden">${
              userName || "User"
            }</div>
            <div class="text-sm text-gray-400 text-ellipsis overflow-hidden whitespace-nowrap">${
              userEmail || ""
            }</div>
          </div>
          <a href="user-membership.html" class="block px-4 py-2 hover:bg-gray-800 hover:text-red-500">My Membership</a>
          <a href="user-schedule-mma.html" class="block px-4 py-2 hover:bg-gray-800 hover:text-red-500">My Schedules</a>
          <div class="flex items-center justify-between px-4 py-2 hover:bg-gray-800">
            <span class="hover:text-red-500">Dark Mode</span>
            <label class="dark-mode-toggle">
              <input type="checkbox" id="darkModeToggle" ${
                darkMode ? "checked" : ""
              }>
              <span class="dark-mode-slider"></span>
            </label>
          </div>
          <a href="#" id="logout-btn" class="block px-4 py-2 hover:bg-gray-800 text-red-500">Logout</a>
        </div>
      </div>`;
  } else {
    // User is not logged in - show login button
    loginOrProfileHTML = `
      <a href="login.html">
        <button class="bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700 transition cursor-pointer">
          Login
        </button>
      </a>`;
  }

  // Insert the navbar HTML with dynamic login/profile area
  document.querySelector("nav").innerHTML = `
    <a href="index.html#home-section" class="flex space-x-2 items-center">
      <img src="./assets/herdoza-logo-trans.png" alt="" class="h-10">
      <span class="font-bold text-sm md:text-2xl orbitron">HERDOZA FITNESS CENTER</span>    
    </a>

    <button id="menu-btn" class="md:hidden text-white focus:outline-none cursor-pointer hover:text-red-500">
      <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path>
      </svg>
    </button>

    <div class="hidden md:flex gap-10 items-center">
      <a href="index.html#home-section" class="hover:text-red-500 nav-links">Home</a>
      <a href="index.html#about-section" class="hover:text-red-500 nav-links">About US</a>
      <a href="index.html#service-section" class="hover:text-red-500 nav-links">Services</a>
      <a href="index.html#event-section" class="hover:text-red-500 nav-links">Events</a>
      ${loginOrProfileHTML}
    </div>

    <div id="sidebar-menu" class="fixed top-0 left-0 h-full w-64 bg-gray-900 text-white transform -translate-x-full transition-transform duration-300 flex flex-col gap-6 p-6">
      <div class="flex justify-between mb-8">
        <span class="font-bold text-2xl">Menu</span>
        <button id="close-btn" class="self-end text-white text-2xl cursor-pointer hover:text-red-500">&times;</button>
      </div>
      ${
        userToken
          ? `<div class="mt-4">
            <div class="flex items-center gap-2 mb-4">
              <img src="${
                userPicture || "./assets/profile-icon.png"
              }" alt="Profile" class="h-8 w-8 rounded-full object-cover">
              <span>${userName || "User"}</span>
            </div>
            <a href="user-membership.html" class="block py-2 hover:text-red-500">My Membership</a>
            <a href="user-schedule-mma.html" class="block py-2 hover:text-red-500">My Schedules</a>
            <div class="flex items-center justify-between py-2">
              <span class="hover:text-red-500">Dark Mode</span>
              <label class="dark-mode-toggle">
                <input type="checkbox" id="sidebarDarkModeToggle" ${
                  darkMode ? "checked" : ""
                }>
                <span class="dark-mode-slider"></span>
              </label>
            </div>
            <a href="#" id="sidebar-logout-btn" class="block py-2 text-red-500">Logout</a>
          </div>`
          : `<a href="login.html">
            <button class="bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700 transition cursor-pointer mt-4">
              Login
            </button>
          </a>`
      }
    </div>`;

  // Add event listeners for menu functionality
  document.getElementById("menu-btn")?.addEventListener("click", function () {
    document
      .getElementById("sidebar-menu")
      .classList.remove("-translate-x-full");
    document.body.style.overflow = "hidden";
  });

  document.getElementById("close-btn")?.addEventListener("click", function () {
    document.getElementById("sidebar-menu").classList.add("-translate-x-full");
    document.body.style.overflow = "auto";
  });

  // Add logout functionality
  document
    .getElementById("logout-btn")
    ?.addEventListener("click", handleLogout);
  document
    .getElementById("sidebar-logout-btn")
    ?.addEventListener("click", handleLogout);

  // Toggle profile dropdown on click
  const profileToggle = document.querySelector(".profile-toggle");
  const profileMenu = document.querySelector(".profile-menu");

  if (profileToggle && profileMenu) {
    profileToggle.addEventListener("click", function (e) {
      e.stopPropagation();
      profileMenu.classList.toggle("hidden");
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", function (e) {
      if (
        !profileToggle.contains(e.target) &&
        !profileMenu.contains(e.target)
      ) {
        profileMenu.classList.add("hidden");
      }
    });
  }

  // Add dark mode toggle functionality
  const darkModeToggle = document.getElementById("darkModeToggle");
  const sidebarDarkModeToggle = document.getElementById(
    "sidebarDarkModeToggle"
  );

  function toggleDarkMode() {
    const isDarkMode = document.body.classList.toggle("dark-mode");
    localStorage.setItem("darkMode", isDarkMode);

    // Keep both toggles in sync
    if (darkModeToggle) darkModeToggle.checked = isDarkMode;
    if (sidebarDarkModeToggle) sidebarDarkModeToggle.checked = isDarkMode;
  }

  if (darkModeToggle) {
    darkModeToggle.addEventListener("change", toggleDarkMode);
  }

  if (sidebarDarkModeToggle) {
    sidebarDarkModeToggle.addEventListener("change", toggleDarkMode);
  }
});

// Function to show toast notification
function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = "toast-notification";
  toast.innerHTML = `
    <i class="bi bi-${
      type === "success" ? "check-circle" : "exclamation-circle"
    } text-xl"></i>
    <span>${message}</span>
  `;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// Helper function to clear user data and redirect
function clearUserDataAndRedirect() {
  localStorage.removeItem("userToken");
  localStorage.removeItem("userName");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("userPicture");
  localStorage.removeItem("userDetails");

  // Show logout success toast and redirect after a delay
  showToast("Successfully logged out!");
  setTimeout(() => {
    window.location.href = "index.html";
  }, 2000);
}

// Function to handle logout
function handleLogout(e) {
  e.preventDefault();

  // Try to use the API logout first if available
  if (window.authApi && window.authApi.logoutUser) {
    try {
      window.authApi
        .logoutUser()
        .then(() => {
          clearUserDataAndRedirect();
        })
        .catch(() => {
          // If API call fails, still clear local data
          clearUserDataAndRedirect();
        });
    } catch (error) {
      // Fallback to local clear if API call throws an error
      clearUserDataAndRedirect();
    }
  } else {
    // No API available, just clear local storage
    clearUserDataAndRedirect();
  }
}
