// Dance studio calendar scripts

// Function to open small group studio payment popup
window.openSmallStudioPayment = function (date, time) {
  window.openPaymentPopup({
    ...window.paymentConfigs.studio.small,
    date,
    time,
    redirectUrl: "user-schedule-studio.html",
  });
};

// Function to open large group studio payment popup
window.openLargeStudioPayment = function (date, time, numberOfPeople = 4) {
  // Validate number of people
  if (numberOfPeople < 4) {
    if (
      confirm(
        "For groups with less than 4 people, please use the Solo/Small Group option. Would you like to go back to the studio selection page?"
      )
    ) {
      window.location.href = "dance-studio.html";
    }
    return;
  }

  if (numberOfPeople > 30) {
    alert("Maximum group size is 30 people");
    return;
  }

  const basePrice = window.paymentConfigs.studio.large.pricePerPerson;
  const totalPrice = numberOfPeople * basePrice;

  window.openPaymentPopup({
    ...window.paymentConfigs.studio.large,
    date,
    time,
    price: totalPrice,
    extras: {
      numberOfPeople,
      pricePerPerson: basePrice,
    },
    description: `Dance studio session for ${numberOfPeople} people (₱${basePrice} per person)`,
    redirectUrl: "user-schedule-studio.html",
  });
};
