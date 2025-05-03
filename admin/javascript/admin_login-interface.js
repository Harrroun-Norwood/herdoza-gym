import config from "./config.js";

// Simple admin authentication using localStorage
document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  const loginBtn = document.getElementById("loginBtn");
  const btnText = document.getElementById("btnText");
  const btnSpinner = document.getElementById("btnSpinner");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const otpModal = document.getElementById("otpModal");
  const otpInput = document.getElementById("otp");
  const verifyOtpBtn = document.getElementById("verifyOtp");

  // Check if already logged in
  if (localStorage.getItem("adminLoggedIn")) {
    window.location.href = "admin_dashboard.html";
    return;
  }

  // Show Toast Message
  function showToast(message, type = "error") {
    const toast = document.createElement("div");
    toast.className = `fixed top-4 left-1/2 transform -translate-x-1/2 z-50 p-4 rounded-md shadow-lg ${
      type === "error" ? "bg-red-500" : "bg-green-500"
    } text-white max-w-md`;

    toast.innerHTML = `
      <div class="flex items-center space-x-2">
        <i class="ri-${
          type === "error" ? "error-warning" : "checkbox-circle"
        }-line text-xl"></i>
        <div class="text-sm font-medium">${message}</div>
      </div>
    `;

    document.body.appendChild(toast);
    setTimeout(() => document.body.removeChild(toast), 3000);
  }

  // Handle form submission
  loginForm?.addEventListener("submit", function (e) {
    e.preventDefault();

    const email = emailInput.value?.trim();
    const password = passwordInput.value;

    // Simple admin credentials check
    if (email === "admin@herdoza-fitness.com" && password === "admin123!@#") {
      // Show OTP modal instead of direct login
      otpModal.style.display = "flex";
      otpInput.value = ""; // Clear any previous input
      otpInput.focus();
    } else {
      showToast("Invalid email or password");
    }
  });

  // Handle OTP verification
  verifyOtpBtn?.addEventListener("click", function () {
    if (otpInput.value === "7777") {
      // Store admin data in localStorage
      localStorage.setItem("adminLoggedIn", "true");
      localStorage.setItem("adminName", "Admin");
      localStorage.setItem("adminEmail", emailInput.value);

      showToast("Login successful!", "success");

      // Hide modal
      otpModal.style.display = "none";

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        window.location.href = "admin_dashboard.html";
      }, 1000);
    } else {
      showToast("Invalid OTP code");
      otpInput.value = "";
      otpInput.focus();
    }
  });

  // Close modal when clicking outside
  otpModal?.addEventListener("click", function (e) {
    if (e.target === otpModal) {
      otpModal.style.display = "none";
    }
  });

  // Handle Enter key in OTP input
  otpInput?.addEventListener("keyup", function (e) {
    if (e.key === "Enter" && this.value.length === 4) {
      verifyOtpBtn.click();
    }
  });

  // Password Visibility Toggle
  document
    .querySelector('[type="password"] + button')
    ?.addEventListener("click", function () {
      const passwordInput = document.getElementById("password");
      const icon = this.querySelector("i");

      if (passwordInput.type === "password") {
        passwordInput.type = "text";
        icon.classList.replace("ri-eye-line", "ri-eye-off-line");
      } else {
        passwordInput.type = "password";
        icon.classList.replace("ri-eye-off-line", "ri-eye-line");
      }
    });
});
