// Function to handle drag and drop
function initDragAndDrop() {
  const notification = document.getElementById("membership-notification");
  let isDragging = false;
  let currentX;
  let currentY;
  let initialX;
  let initialY;
  let xOffset = parseInt(localStorage.getItem("notificationX")) || 0;
  let yOffset = parseInt(localStorage.getItem("notificationY")) || 0;

  // Apply saved position or set default position
  setPosition(notification, xOffset, yOffset);

  function dragStart(e) {
    if (e.type === "touchstart") {
      initialX = e.touches[0].clientX - xOffset;
      initialY = e.touches[0].clientY - yOffset;
    } else {
      initialX = e.clientX - xOffset;
      initialY = e.clientY - yOffset;
    }

    if (e.target.closest("#notification-handle")) {
      isDragging = true;
    }
  }
  function setPosition(element, x, y) {
    // Keep notification within viewport bounds
    const rect = element.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Adjust x position to keep within bounds
    if (x + rect.width > viewportWidth) {
      x = viewportWidth - rect.width;
    }
    if (x < 0) {
      x = 0;
    }

    // Adjust y position to keep within bounds
    if (y + rect.height > viewportHeight) {
      y = viewportHeight - rect.height;
    }
    if (y < 0) {
      y = 0;
    }

    element.style.transform = `translate(${x}px, ${y}px)`;
  }

  function drag(e) {
    if (isDragging) {
      e.preventDefault();

      if (e.type === "touchmove") {
        currentX = e.touches[0].clientX - initialX;
        currentY = e.touches[0].clientY - initialY;
      } else {
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;
      }

      xOffset = currentX;
      yOffset = currentY;

      setPosition(notification, currentX, currentY);
    }
  }

  function dragEnd() {
    if (isDragging) {
      isDragging = false;
      // Save position
      localStorage.setItem("notificationX", xOffset.toString());
      localStorage.setItem("notificationY", yOffset.toString());
    }
  }

  notification.addEventListener("touchstart", dragStart, false);
  notification.addEventListener("touchend", dragEnd, false);
  notification.addEventListener("touchmove", drag, false);
  notification.addEventListener("mousedown", dragStart, false);
  document.addEventListener("mousemove", drag, false);
  document.addEventListener("mouseup", dragEnd, false);
}

// Function to initialize and show membership notification
function initMembershipNotification() {
  // Get user data from localStorage
  const membershipData = getMembershipData();
  const userEmail = localStorage.getItem("userEmail");
  const userName = localStorage.getItem("userName");

  // Only show notification if user is logged in
  if (!userEmail) return;

  const notificationElement = document.getElementById(
    "membership-notification"
  );
  const typeElement = document.getElementById("membership-type");
  const daysElement = document.getElementById("membership-days");
  const nextPaymentElement = document.getElementById("membership-next-payment");
  const userNameElement = document.getElementById("user-name");

  // Show the notification and update user name
  notificationElement.classList.remove("hidden");
  if (userName) {
    userNameElement.textContent = `Welcome back, ${userName}!`;
  }

  // Update notification content
  if (membershipData && membershipData.daysLeft > 0) {
    typeElement.textContent = getMembershipTypeMessage(membershipData);
    daysElement.textContent = `${membershipData.daysLeft} days`;
    nextPaymentElement.textContent = membershipData.nextPaymentDate || "N/A";

    // Show the notification
    setTimeout(() => {
      notificationElement.classList.remove("translate-x-full");
    }, 1000);
  }
}

// Get membership data from localStorage
function getMembershipData() {
  const data = localStorage.getItem("membershipData");
  return data ? JSON.parse(data) : null;
}

// Get appropriate message based on membership type and status
function getMembershipTypeMessage(membershipData) {
  if (membershipData.daysLeft <= 0) {
    return "No active membership";
  }

  const type = localStorage.getItem("membershipType") || "Gym Fitness";
  return `Active ${type} Membership`;
}

// Reset notification position
function resetNotificationPosition() {
  const notification = document.getElementById("membership-notification");
  // Reset to default position (top-right)
  setPosition(notification, 0, 0);
  localStorage.removeItem("notificationX");
  localStorage.removeItem("notificationY");
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  initMembershipNotification();
  initDragAndDrop();

  // Add double-click to reset position
  const notification = document.getElementById("membership-notification");
  notification.addEventListener("dblclick", (e) => {
    if (e.target.closest("#notification-handle")) {
      resetNotificationPosition();
    }
  });
});

// Re-initialize when storage changes
window.addEventListener("storage", function (e) {
  if (e.key === "membershipData" || e.key === "membershipType") {
    initMembershipNotification();
  }
});
