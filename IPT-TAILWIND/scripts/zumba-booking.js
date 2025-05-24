// Export showZumbaModal function
window.showZumbaModal = function (event) {
  event.preventDefault();
  const select = event.target.closest(".zumba-card").querySelector("select");
  const selectedTime = select?.value;

  if (!selectedTime) {
    alert("Please select a day and time first");
    return;
  }

  // Check if the session is already booked using booking API
  const userBookings = window.bookingApi.getUserBookings().then((bookings) => {
    const zumbaBookings = bookings.zumba || [];
    const isBooked = zumbaBookings.some(
      (booking) => booking.date === selectedTime
    );

    if (isBooked) {
      alert("This session is already booked. Please select another session.");
      return;
    }

    // Show centralized payment popup
    window.openPaymentPopup({
      ...window.paymentConfigs.zumba.single,
      date: selectedTime,
      time: "7:00 AM - 8:00 AM",
      sessionType: "zumba",
      redirectUrl: "user-schedule-zumba.html",
    });
  });
};

document.addEventListener("DOMContentLoaded", () => {
  // Elements for booking UI
  const desktopSelect = document.getElementById("selected_time_date_zumba");
  const mobileSelect = document.getElementById("mobile_time_date_zumba");

  // Initialize from bookingApi
  window.bookingApi.getUserBookings().then((bookings) => {
    const zumbaBookings = bookings.zumba || [];

    function updateBookedSessionsUI() {
      [desktopSelect, mobileSelect].forEach((select) => {
        if (!select) return;

        select.querySelectorAll("option").forEach((option) => {
          const isBooked = zumbaBookings.some(
            (booking) =>
              booking.date === option.value && booking.status !== "cancelled"
          );

          if (isBooked && option.value) {
            option.disabled = true;
            if (!option.textContent.includes("(Already Booked)")) {
              option.textContent = option.textContent + " (Already Booked)";
            }
          }
        });
      });
    } // Initialize UI
    updateBookedSessionsUI();
  });
});
