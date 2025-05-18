// Set default membership data if none exists
if (!localStorage.getItem("membershipData")) {
  localStorage.setItem(
    "membershipData",
    JSON.stringify({
      type: "Gym Fitness",
      daysLeft: 30,
      nextPaymentDate: "2025-06-18",
      status: "active",
    })
  );
}

// Set default user data if none exists
if (!localStorage.getItem("userName")) {
  localStorage.setItem("userName", "Guest");
  localStorage.setItem("userEmail", "guest@example.com");
}

// Membership Notification Panel Logic
document.addEventListener("DOMContentLoaded", function () {
  const notification = document.getElementById("membership-notification");
  const pullTab = document.getElementById("notification-pull-tab");
  const panel = document.getElementById("notification-panel");
  const handle = document.getElementById("notification-handle");

  if (!notification || !pullTab || !panel) return;

  let isOpen = true;
  let isDragging = false;
  let startX = 0;
  let currentX = 0;
  let side = "right";
  function updatePanelPosition() {
    if (!notification || !panel || !pullTab) return;

    notification.style.display = "flex";
    notification.style.opacity = "1";

    // Update panel and pull tab positioning
    if (side === "right") {
      notification.style.right = "0";
      notification.style.left = "auto";
      pullTab.style.right = "100%";
      pullTab.style.left = "auto";

      if (isOpen) {
        panel.style.transform = "translateX(0)";
        pullTab.style.transform = "translateX(0)";
      } else {
        panel.style.transform = "translateX(100%)";
        pullTab.style.transform = "translateX(100%)";
      }
    } else {
      notification.style.left = "0";
      notification.style.right = "auto";
      pullTab.style.left = "100%";
      pullTab.style.right = "auto";

      if (isOpen) {
        panel.style.transform = "translateX(0)";
        pullTab.style.transform = "translateX(0)";
      } else {
        panel.style.transform = "translateX(-100%)";
        pullTab.style.transform = "translateX(-100%)";
      }
    }
  }

  function togglePanel() {
    isOpen = !isOpen;
    localStorage.setItem("notificationOpen", isOpen);
    updatePanelPosition();
  }

  // Click handler for pull tab
  pullTab.addEventListener("click", function (e) {
    e.stopPropagation();
    togglePanel();
  });

  // Initialize panel position
  updatePanelPosition();
  // Handle closing panel when clicking outside
  document.addEventListener("click", function (e) {
    if (isOpen && !notification.contains(e.target)) {
      togglePanel();
    }
  });

  // Hide panel on close button (until reload)
  const closeBtn = notification.querySelector("button");
  if (closeBtn) {
    closeBtn.addEventListener("click", function (e) {
      notification.classList.add("hidden");
    });
  }
  // Initial setup
  updatePanelPosition();
  initMembershipNotification();

  // Membership info logic
  function getMembershipData() {
    const data = localStorage.getItem("membershipData");
    return data
      ? JSON.parse(data)
      : {
          type: "Gym Fitness",
          daysLeft: 30,
          nextPaymentDate: "2025-06-18",
          status: "active",
        };
  }
  function getMembershipTypeMessage(membershipData) {
    const type = membershipData?.type || "Gym Fitness";
    return `Active ${type} Membership`;
  }
  function initMembershipNotification() {
    const membershipData = getMembershipData();
    const userEmail = localStorage.getItem("userEmail");
    const userName = localStorage.getItem("userName");
    if (!userEmail) return;
    const notificationElement = document.getElementById(
      "membership-notification"
    );
    const typeElement = document.getElementById("membership-type");
    const daysElement = document.getElementById("membership-days");
    const nextPaymentElement = document.getElementById(
      "membership-next-payment"
    );
    const userNameElement = document.getElementById("user-name");
    if (!notificationElement) return;
    notificationElement.classList.remove("hidden");
    if (userName && userNameElement) {
      userNameElement.textContent = `Welcome back, ${userName}!`;
    }
    if (membershipData && membershipData.daysLeft > 0) {
      if (typeElement)
        typeElement.textContent = getMembershipTypeMessage(membershipData);
      if (daysElement)
        daysElement.textContent = `${membershipData.daysLeft} days`;
      if (nextPaymentElement)
        nextPaymentElement.textContent =
          membershipData.nextPaymentDate || "N/A";
    }
  }
  document.addEventListener("DOMContentLoaded", () => {
    initMembershipNotification();
  });
  window.addEventListener("storage", function (e) {
    if (e.key === "membershipData" || e.key === "membershipType") {
      initMembershipNotification();
    }
  });
})();

// Function to handle membership notification panel
document.addEventListener("DOMContentLoaded", () => {
  const notification = document.getElementById("membership-notification");
  const pullTab = document.getElementById("notification-pull-tab");
  let isOpen = localStorage.getItem("notificationOpen") !== "false";

  // Toggle notification when clicking pull tab
  pullTab.addEventListener("click", (e) => {
    e.stopPropagation();
    isOpen = !isOpen;
    localStorage.setItem("notificationOpen", isOpen);

    // Only transform the main panel, not the pull tab
    if (isOpen) {
      notification.style.transform = "translateX(0)";
    } else {
      notification.style.transform = "translateX(100%)";
    }
  });

  // Initialize notification state
  function initializeNotification() {
    if (!notification) return;

    // Set initial state
    if (isOpen) {
      notification.style.transform = "translateX(0)";
    } else {
      notification.style.transform = "translateX(100%)";
    }

    // Ensure notification and pull tab are visible
    notification.classList.remove("hidden");
  }

  // Initialize membership content
  function initMembershipContent() {
    const membershipData = getMembershipData();
    const userEmail = localStorage.getItem("userEmail");
    const userName = localStorage.getItem("userName");
    const userNameElement = document.getElementById("user-name");

    // Early return if no user is logged in
    if (!userEmail || !userNameElement) return;

    // Update welcome message with user's name
    if (userName) {
      const firstName = userName.split(" ")[0]; // Get first name only
      userNameElement.textContent = `Welcome back, ${firstName}!`;
    } else {
      userNameElement.textContent = "Welcome back!";
    }

    // Update membership details if available
    const typeElement = document.getElementById("membership-type");
    const daysElement = document.getElementById("membership-days");
    const nextPaymentElement = document.getElementById(
      "membership-next-payment"
    );

    if (membershipData && membershipData.daysLeft > 0) {
      if (typeElement)
        typeElement.textContent = getMembershipTypeMessage(membershipData);
      if (daysElement)
        daysElement.textContent = `${membershipData.daysLeft} days`;
      if (nextPaymentElement)
        nextPaymentElement.textContent =
          membershipData.nextPaymentDate || "N/A";
    }
  }

  // Get membership data from localStorage
  function getMembershipData() {
    const data = localStorage.getItem("membershipData");
    return data
      ? JSON.parse(data)
      : {
          type: "Gym Fitness",
          daysLeft: 30,
          nextPaymentDate: "2025-06-18",
          status: "active",
        };
  }

  // Get appropriate message based on membership type and status
  function getMembershipTypeMessage(membershipData) {
    const type = membershipData?.type || "Gym Fitness";
    return `Active ${type} Membership`;
  }

  // Initialize everything
  initializeNotification();
  initMembershipContent();
});

// Re-initialize when storage changes
window.addEventListener("storage", function (e) {
  if (e.key === "membershipData" || e.key === "membershipType") {
    initMembershipContent();
  }
});

// Drag handling functions
(function () {
  const notification = document.getElementById("membership-notification");
  const panel = document.getElementById("notification-panel");
  const handle = document.getElementById("notification-handle");
  let isDragging = false;
  let startX = 0;
  let currentX = 0;
  let side = localStorage.getItem("notificationSide") || "right";
  let isOpen = localStorage.getItem("notificationOpen") !== "false"; // default open

  function updatePanelPosition(immediate = false) {
    if (immediate) {
      notification.style.transition = "none";
    } else {
      notification.style.transition = "transform 0.3s cubic-bezier(.4,2,.6,1)";
    }

    if (side === "right") {
      notification.style.right = "0";
      notification.style.left = "auto";
      if (isOpen) {
        panel.style.transform = "translateX(0)";
      } else {
        panel.style.transform = "translateX(100%)";
      }
    } else {
      notification.style.left = "0";
      notification.style.right = "auto";
      if (isOpen) {
        panel.style.transform = "translateX(0)";
      } else {
        panel.style.transform = "translateX(-100%)";
      }
    }
  }

  function togglePanel() {
    isOpen = !isOpen;
    localStorage.setItem("notificationOpen", isOpen);
    updatePanelPosition();
  }

  function handleDragStart(e) {
    if (e.target.id === "notification-handle") {
      isDragging = true;
      startX = e.type === "mousedown" ? e.clientX : e.touches[0].clientX;
      currentX = startX;

      // Remove transition while dragging
      notification.style.transition = "none";
      panel.style.transition = "none";

      // Add dragging class
      notification.classList.add("dragging");
    }
  }
  function handleDragMove(e) {
    if (!isDragging) return;
    e.preventDefault();

    const x = e.type === "mousemove" ? e.clientX : e.touches[0].clientX;
    const deltaX = x - currentX;
    currentX = x;

    // Get the current transform value and calculate new position
    const transform = new WebKitCSSMatrix(
      window.getComputedStyle(panel).transform
    );
    let newTransformX = transform.m41 + deltaX;

    // Constrain the movement based on current side
    const maxMove = panel.offsetWidth;
    if (side === "right") {
      // When on right side, allow movement left (negative) up to panel width
      newTransformX = Math.min(Math.max(newTransformX, -maxMove), 0);
    } else {
      // When on left side, allow movement right (positive) up to panel width
      newTransformX = Math.min(Math.max(newTransformX, 0), maxMove);
    }

    // Apply transforms to both panel and pull tab
    panel.style.transform = `translateX(${newTransformX}px)`;
    pullTab.style.transform = `translateX(${newTransformX}px)`;

    // Add visual feedback during dragging
    panel.style.opacity = Math.max(0.8, 1 - Math.abs(newTransformX) / maxMove);
  }

  function handleDragEnd(e) {
    if (!isDragging) return;
    isDragging = false;

    // Remove dragging class
    notification.classList.remove("dragging");

    // Get final position
    const transform = new WebKitCSSMatrix(
      window.getComputedStyle(panel).transform
    );
    const finalPosition = transform.m41;
    const threshold = panel.offsetWidth / 2;

    // Determine if we should switch sides or toggle open/closed
    if (Math.abs(finalPosition) > threshold) {
      if (
        (side === "right" && finalPosition < -threshold) ||
        (side === "left" && finalPosition > threshold)
      ) {
        // Switch sides
        side = side === "right" ? "left" : "right";
        localStorage.setItem("notificationSide", side);
      }
      isOpen = false;
    } else {
      isOpen = true;
    }

    localStorage.setItem("notificationOpen", isOpen);
    // Restore transitions and update position
    notification.style.transition = "transform 0.3s cubic-bezier(.4,2,.6,1)";
    panel.style.transition = "transform 0.3s cubic-bezier(.4,2,.6,1)";
    updatePanelPosition();
  }

  // Add drag event listeners
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

  // Cleanup on page unload
  window.addEventListener("unload", () => {
    handle.removeEventListener("mousedown", handleDragStart);
    handle.removeEventListener("touchstart", handleDragStart);
    document.removeEventListener("mousemove", handleDragMove);
    document.removeEventListener("touchmove", handleDragMove);
    document.removeEventListener("mouseup", handleDragEnd);
    document.removeEventListener("touchend", handleDragEnd);
  });
})();
