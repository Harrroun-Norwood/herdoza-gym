// Guest user authentication check
function checkGuestUser() {
  // Check if user is logged in (has a token)
  const userToken = localStorage.getItem("userToken");
  if (!userToken) {
    // Show alert and redirect to login page
    alert("Please login or sign up first to access membership services.");
    window.location.href = "login.html";
    return false;
  }
  return true;
}

// Add auth check to all membership/booking buttons
document.addEventListener("DOMContentLoaded", function () {
  // Get all price buttons (handles gym fitness popup buttons)
  const priceButtons = document.querySelectorAll(
    'button[onclick*="openPopup"]'
  );

  // Replace their onclick handlers with auth check
  priceButtons.forEach((button) => {
    const originalOnclick = button.getAttribute("onclick");
    button.onclick = function (e) {
      e.preventDefault();
      if (checkGuestUser()) {
        // If authenticated, execute original onclick
        eval(originalOnclick);
      }
    };
  });

  // Handle direct link buttons (like in MMA and Dance Studio pages)
  const serviceLinkButtons = document.querySelectorAll(
    'a[href*="booking"], a[href*="calendar"]'
  );
  serviceLinkButtons.forEach((link) => {
    const originalHref = link.getAttribute("href");
    const button = link.querySelector("button") || link;

    // Remove the href to prevent direct navigation
    link.removeAttribute("href");

    // Add click handler to the button or link
    button.onclick = function (e) {
      e.preventDefault();
      if (checkGuestUser()) {
        window.location.href = originalHref;
      }
    };
  });

  // Handle Zumba buttons (specific to dance studio)
  const zumbaButtons = document.querySelectorAll(
    ".zumba-card button, #mobile_time_date_zumba + button"
  );
  zumbaButtons.forEach((button) => {
    const originalOnclick = button.onclick;
    button.onclick = function (e) {
      e.preventDefault();
      if (checkGuestUser()) {
        if (originalOnclick) {
          originalOnclick.call(this, e);
        } else {
          // Default behavior - show booking form or redirect
          const selectedTime = document.querySelector(
            "#selected_time_date_zumba, #mobile_time_date_zumba"
          ).value;
          if (selectedTime) {
            window.location.href = "user-schedule-zumba.html";
          } else {
            alert("Please select a day and time first");
          }
        }
      }
    };
  });
});

// Export for use in other files
window.checkGuestUser = checkGuestUser;
