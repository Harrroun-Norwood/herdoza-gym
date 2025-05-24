document.addEventListener("DOMContentLoaded", function () {
  const notificationPanel = document.getElementById("notification-panel");
  const dragHandle = document.getElementById("notification-handle");
  let isDraggable = false;

  notificationPanel.addEventListener("click", function () {
    if (!isDraggable) {
      // Show the drag handle with animation
      dragHandle.style.opacity = "1";
      isDraggable = true;
    }
  });

  // Hide drag handle when clicking outside
  document.addEventListener("click", function (event) {
    if (!notificationPanel.contains(event.target)) {
      dragHandle.style.opacity = "0";
      isDraggable = false;
    }
  });
});
