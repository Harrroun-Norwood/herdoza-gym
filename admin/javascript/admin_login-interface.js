import config from "./config.js";

document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  const loginBtn = document.getElementById("loginBtn");
  const btnText = document.getElementById("btnText");
  const btnSpinner = document.getElementById("btnSpinner");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const passwordToggleBtn = document.querySelector('button[type="button"]');
  const otpModal = document.getElementById("otpModal");
  const otpInput = document.getElementById("otp");
  const verifyOtpBtn = document.getElementById("verifyOtp");
  const loginError = document.getElementById("loginError");

  // Generate a random OTP code on each page load
  const generatedOTP = Math.floor(1000 + Math.random() * 9000).toString();

  // Clear any stale login state on load
  function clearLoginState() {
    localStorage.removeItem("adminLoggedIn");
    localStorage.removeItem("adminName");
    localStorage.removeItem("adminEmail");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminBookingsData");
  }
  // Clear any stale login state
  clearLoginState();

  // Show Toast Message with auto-cleanup
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

    // Auto-remove toast after 3 seconds
    const timer = setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translate(-50%, -20px)";
      setTimeout(() => toast.remove(), 300);
    }, 3000);

    // Clean up on page change
    return () => {
      clearTimeout(timer);
      toast.remove();
    };
  }

  // Toggle password visibility with proper state management
  passwordToggleBtn?.addEventListener("click", function () {
    const icon = this.querySelector("i");
    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      icon.classList.replace("ri-eye-line", "ri-eye-off-line");
    } else {
      passwordInput.type = "password";
      icon.classList.replace("ri-eye-off-line", "ri-eye-line");
    }
  });

  // Handle form submission
  loginForm?.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = emailInput.value?.trim();
    const password = passwordInput.value;

    // Reset error state
    loginError.classList.add("hidden");
    loginError.textContent = "";

    // Show loading state
    btnText.textContent = "Logging in...";
    btnSpinner.classList.remove("hidden");
    loginBtn.disabled = true;

    try {
      // Validate inputs
      if (!email || !password) {
        throw new Error("Please enter both email and password");
      }

      // Check admin credentials
      if (email !== "admin@herdoza-fitness.com" || password !== "admin123!@#") {
        throw new Error("Invalid email or password");
      }

      // Update OTP display
      const otpDisplay = otpModal.querySelector("span.tracking-widest");
      if (otpDisplay) {
        otpDisplay.textContent = generatedOTP;
      }

      // Show OTP modal
      otpModal.style.display = "flex";
      otpInput.value = ""; // Clear any previous input
      otpInput.focus();
    } catch (error) {
      loginError.textContent = error.message;
      loginError.classList.remove("hidden");
      showToast(error.message);
    } finally {
      // Reset loading state
      btnText.textContent = "Login";
      btnSpinner.classList.add("hidden");
      loginBtn.disabled = false;
    }
  });

  // Handle OTP verification
  verifyOtpBtn?.addEventListener("click", async function () {
    if (!otpInput.value) {
      showToast("Please enter the OTP code");
      return;
    }

    const enteredOTP = otpInput.value.trim();

    if (enteredOTP === generatedOTP) {
      // Show success message
      showToast("Login successful!", "success");

      // Store admin session data with expiration
      const sessionData = {
        timestamp: Date.now(),
        expiresIn: 24 * 60 * 60 * 1000, // 24 hours
      };

      localStorage.setItem("adminLoggedIn", "true");
      localStorage.setItem("adminName", "Admin");
      localStorage.setItem("adminEmail", emailInput.value);
      localStorage.setItem("adminToken", "admin-session-" + Date.now());
      localStorage.setItem("adminSession", JSON.stringify(sessionData));

      // Cleanup and redirect
      otpModal.style.display = "none";
      loginForm.reset();

      setTimeout(() => {
        window.location.href = "./admin_dashboard.html";
      }, 1000);
    } else {
      showToast("Invalid OTP code");
      otpInput.value = "";
      otpInput.focus();
    }
  });

  // Close OTP modal when clicking outside
  otpModal?.addEventListener("click", function (e) {
    if (e.target === otpModal) {
      otpModal.style.display = "none";
      // Reset form state
      btnText.textContent = "Login";
      btnSpinner.classList.add("hidden");
      loginBtn.disabled = false;
    }
  });

  // Handle Enter key in OTP input
  otpInput?.addEventListener("keyup", function (e) {
    if (e.key === "Enter" && this.value.length === 4) {
      verifyOtpBtn.click();
    }
  });

  // Cleanup function to ensure proper state on page load/unload
  function cleanup() {
    loginForm?.reset();
    btnText.textContent = "Login";
    btnSpinner.classList.add("hidden");
    loginBtn.disabled = false;
    otpModal.style.display = "none";
    loginError.classList.add("hidden");
  }

  // Call cleanup on page load
  cleanup();
});
