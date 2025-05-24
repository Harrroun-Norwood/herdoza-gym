// Function to show Zumba popup
window.showZumbaModal = function(event) {
  event.preventDefault();
  
  // Get selected time from either desktop or mobile select
  const desktopSelect = document.getElementById("selected_time_date_zumba");
  const mobileSelect = document.getElementById("mobile_time_date_zumba");
  const select = event.target.closest(".zumba-card").querySelector("select");
  const selectedDay = select?.value;

  if (!selectedDay) {
    alert("Please select a day and time first");
    return;
  }

  // Show centralized payment popup
  window.openPaymentPopup({
    ...window.paymentConfigs.zumba.single,
    date: selectedDay,
    time: "7:00 AM - 8:00 AM",
    redirectUrl: 'user-schedule-zumba.html'
  });
};
