// Function to show Zumba popup
window.showZumbaModal = function (event) {
  event.preventDefault();

  // Get selected time from the closest select element
  const select = event.target.closest(".zumba-card")?.querySelector("select");
  const selectedDay = select?.value;

  if (!selectedDay) {
    alert("Please select a day and time first");
    return;
  }

  // Show payment popup
  window.openPaymentPopup({
    title: "Zumba Fitness Group Class",
    description:
      "Join our energetic group fitness class led by professional Zumba instructors",
    price: 150,
    date: selectedDay,
    time: "7:00 AM - 8:00 AM",
    redirectUrl: "user-schedule-zumba.html",
    requiresCalendar: false,
  });
};
