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
window.openLargeStudioPayment = function (date, time, numberOfPeople) {
  const price =
    numberOfPeople * window.paymentConfigs.studio.large.pricePerPerson;
  window.openPaymentPopup({
    ...window.paymentConfigs.studio.large,
    date,
    time,
    price,
    numberOfPeople,
    redirectUrl: "user-schedule-studio.html",
  });
};
