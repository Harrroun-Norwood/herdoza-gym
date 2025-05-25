// Initialize or get membership data from localStorage
import MembershipStatusManager from "./membership-status-manager.js";

// Function to initialize membership notification functionality
function initializeMembershipNotification() {
  const notification = document.getElementById("membership-notification");
  const pullTab = document.getElementById("notification-pull-tab");
  const panel = document.getElementById("notification-panel");
  const handle = document.getElementById("notification-handle");

  if (!notification || !pullTab || !panel) return;

  // Initialize MembershipStatusManager watchers
  MembershipStatusManager.initStatusWatchers();

  // Setup panel position
  let isOpen = localStorage.getItem("notificationOpen") !== "false";
  let isDragging = false;
  let startX = 0;
  let currentX = 0;
  let side = localStorage.getItem("notificationSide") || "right";

  // Function to initialize membership content
  function initMembershipContent() {
    const userEmail = localStorage.getItem("userEmail");
    const userName = localStorage.getItem("userName");
    const userNameElement = document.getElementById("user-name");
    const typeElement = document.getElementById("membership-type");
    const daysElement = document.getElementById("membership-days");
    const nextPaymentElement = document.getElementById(
      "membership-next-payment"
    );

    // Early return if no user is logged in
    if (!userEmail) {
      notification.classList.add("hidden");
      return;
    }

    // Show notification for logged in users
    notification.classList.remove("hidden");

    // Get membership data
    let membershipData =
      MembershipStatusManager.getUserMembershipData(userEmail);
    if (!membershipData) {
      // Try to get from local storage
      const storedData = localStorage.getItem(`membershipData_${userEmail}`);
      if (storedData) {
        membershipData = JSON.parse(storedData);
      }
    }
    if (!membershipData) return;

    // Update welcome message
    if (userNameElement) {
      const firstName = userName ? userName.split(" ")[0] : "back";
      userNameElement.textContent = `Welcome ${firstName}!`;
    }

    // Update membership type and status
    if (typeElement) {
      const status =
        membershipData.status === "active"
          ? "Active"
          : membershipData.status === "expired"
          ? "Expired"
          : "Pending";
      typeElement.textContent = `${membershipData.type} Membership - ${status}`;

      // Update color based on status
      const statusColor =
        membershipData.status === "active"
          ? "text-green-600"
          : membershipData.status === "pending"
          ? "text-yellow-600"
          : "text-red-600";
      typeElement.className = `text-lg font-semibold ${statusColor}`;
    }

    // Update days remaining
    if (daysElement) {
      const daysLeft = Math.max(0, parseInt(membershipData.daysLeft) || 0);
      daysElement.textContent = `${daysLeft} days remaining`;

      // Add warning class if days are low
      if (daysLeft <= 7 && daysLeft > 0) {
        daysElement.classList.add("text-red-600");
      } else {
        daysElement.classList.remove("text-red-600");
      }
    }

    // Update next payment date
    if (nextPaymentElement && membershipData.nextPaymentDate) {
      nextPaymentElement.textContent = membershipData.nextPaymentDate;
    } else if (nextPaymentElement) {
      nextPaymentElement.textContent = "Not available";
    }
  }

  // Initialize membership content
  initMembershipContent();

  // Listen for membership status updates
  window.addEventListener("membershipStatusUpdated", function (e) {
    if (e.detail.email === localStorage.getItem("userEmail")) {
      initMembershipContent();
    }
  });

  // Listen for storage changes
  window.addEventListener("storage", function (e) {
    if (
      e.key &&
      (e.key.includes("membershipData") ||
        e.key === "members" ||
        e.key.includes("members-data") ||
        e.key === "userEmail" ||
        e.key === "userStatus")
    ) {
      initMembershipContent();
    }
  });

  // Function to update panel position
  function updatePanelPosition(immediate = false) {
    const transition = "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
    notification.style.transition = immediate ? "none" : transition;

    // Use transform for smooth animation
    const transform = isOpen
      ? "translateX(0)"
      : side === "right"
      ? "translateX(16rem)"
      : "translateX(-16rem)";
    notification.style.transform = transform;

    // Set initial position
    notification.style[side] = "0";
    notification.style[side === "right" ? "left" : "right"] = "auto";
  }

  // Toggle panel visibility
  function togglePanel() {
    isOpen = !isOpen;
    localStorage.setItem("notificationOpen", isOpen);
    updatePanelPosition();
  }

  // Expose toggle function to window for close button
  window.toggleMembershipPanel = togglePanel;

  // Add click handler to pull tab
  pullTab.addEventListener("click", togglePanel);

  // Handle drag functionality
  function handleDragStart(e) {
    if (e.target.id === "notification-handle") {
      isDragging = true;
      startX = e.type === "mousedown" ? e.clientX : e.touches[0].clientX;
      currentX = startX;

      notification.style.transition = "none";
      notification.classList.add("dragging");
    }
  }

  function handleDragMove(e) {
    if (!isDragging) return;

    e.preventDefault();
    const x = e.type === "mousemove" ? e.clientX : e.touches[0].clientX;
    const dx = x - startX;
    currentX = x;

    if ((side === "right" && dx < 0) || (side === "left" && dx > 0)) {
      notification.style.transform = `translateX(${dx}px)`;
    }
  }

  function handleDragEnd() {
    if (!isDragging) return;
    isDragging = false;

    notification.classList.remove("dragging");

    const threshold = panel.offsetWidth / 2;
    const transform = notification.style.transform;
    const matrix = new WebKitCSSMatrix(
      window.getComputedStyle(notification).transform
    );
    const finalPosition = matrix.m41;

    if (Math.abs(finalPosition) > threshold) {
      if (
        (side === "right" && finalPosition < -threshold) ||
        (side === "left" && finalPosition > threshold)
      ) {
        side = side === "right" ? "left" : "right";
        localStorage.setItem("notificationSide", side);
      }
      isOpen = false;
    } else {
      isOpen = true;
    }

    localStorage.setItem("notificationOpen", isOpen);
    updatePanelPosition();
  }

  // Add event listeners for dragging
  handle.addEventListener("mousedown", handleDragStart);
  handle.addEventListener("touchstart", handleDragStart);
  document.addEventListener("mousemove", handleDragMove);
  document.addEventListener("touchmove", handleDragMove, { passive: false });
  document.addEventListener("mouseup", handleDragEnd);
  document.addEventListener("touchend", handleDragEnd);

  // Handle window resize
  window.addEventListener("resize", () => {
    if (!isDragging) {
      updatePanelPosition(true);
    }
  });
  // Initialize panel position
  updatePanelPosition(true);

  // Cleanup on page exit - using beforeunload which is the recommended event
  const cleanupEventListeners = () => {
    handle.removeEventListener("mousedown", handleDragStart);
    handle.removeEventListener("touchstart", handleDragStart);
    document.removeEventListener("mousemove", handleDragMove);
    document.removeEventListener("touchmove", handleDragMove);
    document.removeEventListener("mouseup", handleDragEnd);
    document.removeEventListener("touchend", handleDragEnd);
  };

  // Use beforeunload for cleanup
  window.addEventListener("beforeunload", cleanupEventListeners);

  // Also cleanup on visibility change to handle tab/window closing
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      cleanupEventListeners();
    }
  });
}

// Initialize when DOM is ready
function initMembershipUI() {
  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initializeMembershipNotification
    );
  } else {
    initializeMembershipNotification();
  }
}

// Call initialization
initMembershipUI();
