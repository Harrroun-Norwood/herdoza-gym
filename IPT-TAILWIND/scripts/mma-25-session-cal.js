function addPopupStyles() {
  const style = document.createElement("style");
  style.textContent = `
    .payment-summary {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(0.7);
      z-index: 10001;
      width: 90%;
      max-width: 650px;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease-in-out;
    }

    .payment-summary.open-payment-summary {
      opacity: 1;
      visibility: visible;
      transform: translate(-50%, -50%) scale(1);
    }

    .overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      opacity: 0;
      visibility: hidden;
      z-index: 10000;
      transition: all 0.3s ease-in-out;
    }

    .overlay:not(.hidden) {
      opacity: 1;
      visibility: visible;
    }

    @media (max-width: 640px) {
      .payment-summary {
        width: 95%;
      }
    }
  `;
  document.head.appendChild(style);
}

document.addEventListener("DOMContentLoaded", () => {
  addPopupStyles();
  const dates = document.querySelector(".dates");
  const header = document.querySelector(".calendar h3");
  const navs = document.querySelectorAll("#prev, #next");
  const okButton = document.querySelector(".ok-btn");
  const cancelButton = document.querySelector(".cancel-btn");
  const timeSlots = document.querySelectorAll('input[name="time-slot"]');
  const paymentOptions = document.querySelectorAll(
    'input[name="payment-method"]'
  );
  const paymentPopup = document.getElementById("studio-pop-up");
  const payNowButton = document.querySelector(".pay-now-btn");
  const popupCancelButton = document.querySelector(
    "#studio-pop-up .cancel-btn"
  );

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Initialize userBookings and bookedSlots from localStorage
  let userBookings = JSON.parse(
    localStorage.getItem("mma25SessionUserBookings") || "[]"
  );
  let bookedSlots = JSON.parse(
    localStorage.getItem("mma25SessionBookedSlots") || "[]"
  );
  let date = new Date();
  let month = date.getMonth();
  let year = date.getFullYear();
  let selectedDate = null; // This will store just the start date
  let selectedTime = null;
  let selectedPayment = null;
  let hasActiveBooking = false; // Flag to track if user has active booking

  // Function to save bookings to localStorage
  function saveBookings() {
    localStorage.setItem(
      "mma25SessionUserBookings",
      JSON.stringify(userBookings)
    );
    localStorage.setItem(
      "mma25SessionBookedSlots",
      JSON.stringify(bookedSlots)
    );

    // Sync with backend if available
    syncBookingsToBackend();
  }

  // Function to sync bookings to backend
  function syncBookingsToBackend() {
    // This will only work if bookingApi exists and user is logged in
    if (
      window.bookingApi &&
      localStorage.getItem("userToken") &&
      localStorage.getItem("userToken") !== "demo-token"
    ) {
      window.bookingApi
        .getUserBookings()
        .then((response) => {
          console.log("Synced bookings with backend");
        })
        .catch((error) => {
          console.error("Failed to sync bookings:", error);
        });
    }
  }

  function checkActiveBookings() {
    const now = new Date();
    hasActiveBooking = userBookings.some((booking) => {
      const bookingEndDate = new Date(booking.endDate);
      return bookingEndDate > now;
    });
  }

  function updateUIForActiveBooking() {
    checkActiveBookings();

    // Disable calendar navigation if user has active booking
    navs.forEach((nav) => {
      nav.disabled = hasActiveBooking;
    });

    // Disable date selection if user has active booking
    const dateElements = document.querySelectorAll(".dates li:not(.inactive)");
    dateElements.forEach((dateElement) => {
      if (hasActiveBooking) {
        dateElement.style.pointerEvents = "none";
        dateElement.style.opacity = "0.5";
      } else {
        dateElement.style.pointerEvents = "auto";
        dateElement.style.opacity = "1";
      }
    });

    // Disable time slots if user has active booking
    timeSlots.forEach((slot) => {
      if (hasActiveBooking) {
        slot.disabled = true;
        slot.parentElement.style.opacity = "0.5";
      } else {
        // Only disable if already booked by someone else
        slot.disabled =
          slot.nextElementSibling.textContent.includes("Already Booked");
        slot.parentElement.style.opacity = slot.disabled ? "0.5" : "1";
      }
    });

    // Update button states
    okButton.disabled = hasActiveBooking;
    cancelButton.disabled = hasActiveBooking;

    // Show message if user has active booking
    const bookingMessage = document.getElementById("booking-message");
    if (bookingMessage) {
      if (hasActiveBooking) {
        const activeBooking = userBookings.find((booking) => {
          const bookingEndDate = new Date(booking.endDate);
          return bookingEndDate > new Date();
        });
        bookingMessage.textContent = `You have an active booking until ${activeBooking.endDate}.`;
        bookingMessage.style.display = "block";
      } else {
        bookingMessage.style.display = "none";
      }
    }
  }

  function renderCalendar() {
    if (!dates || !header) {
      console.error("Calendar elements not found!");
      return;
    }

    const today = new Date();
    const start = new Date(year, month, 1).getDay();
    const endDate = new Date(year, month + 1, 0).getDate();
    const end = new Date(year, month, endDate).getDay();
    const endDatePrev = new Date(year, month, 0).getDate();

    let datesHTML = "";

    // Previous month's days
    for (let i = start; i > 0; i--) {
      datesHTML += `<li class="inactive">${endDatePrev - i + 1}</li>`;
    }

    // Current month's days
    for (let i = 1; i <= endDate; i++) {
      let className = "";
      let currentDate = new Date(year, month, i);
      let dayOfWeek = currentDate.getDay();
      let formattedDate = `${months[month]} ${i}, ${year}`;

      // Check if it's Sunday (dayOfWeek === 0)
      if (dayOfWeek === 0) {
        className = "inactive sunday";
      }
      // Check if date is in the past (excluding today)
      else if (
        currentDate < today &&
        !(
          currentDate.getDate() === today.getDate() &&
          currentDate.getMonth() === today.getMonth()
        )
      ) {
        className = "inactive";
      }
      // Check if it's today
      else if (currentDate.toDateString() === today.toDateString()) {
        className = "today";
      }

      // Check if this is the selected start date
      if (
        selectedDate &&
        selectedDate.day === i &&
        selectedDate.month === month &&
        selectedDate.year === year
      ) {
        className = "selected";
      }

      datesHTML += `<li class="${className}" data-day="${i}" data-month="${month}" data-year="${year}">${i}</li>`;
    }

    // Next month's days
    for (let i = end; i < 6; i++) {
      datesHTML += `<li class="inactive">${i - end + 1}</li>`;
    }

    dates.innerHTML = datesHTML;
    header.textContent = `${months[month]} ${year}`;

    // Add click event to days (excluding inactive ones)
    document.querySelectorAll(".dates li:not(.inactive)").forEach((day) => {
      day.addEventListener("click", () => {
        let dayNumber = parseInt(day.dataset.day);
        let monthNumber = parseInt(day.dataset.month);
        let yearNumber = parseInt(day.dataset.year);

        selectedDate = { day: dayNumber, month: monthNumber, year: yearNumber };
        updateAvailableTimeSlots();
        renderCalendar();
      });
    });

    // Disable prev button if showing current or past month
    const todayMonth = today.getMonth();
    const todayYear = today.getFullYear();
    document.getElementById("prev").disabled =
      year < todayYear || (year === todayYear && month <= todayMonth);
  }

  function updateAvailableTimeSlots() {
    if (!selectedDate) return;

    // Get all dates in the 25-day range (excluding Sundays)
    let bookingDates = get25DayRangeDates(selectedDate);

    timeSlots.forEach((slot) => {
      let slotLabel = slot.nextElementSibling.textContent
        .replace(/ \(Already Booked\)/g, "")
        .trim();
      let isBooked = false;

      // Check if this time slot is booked on any of the 25 days
      bookingDates.forEach((bookingDate) => {
        let dateStr = `${months[bookingDate.month]} ${bookingDate.day}, ${
          bookingDate.year
        }`;

        if (
          bookedSlots.some(
            (bookedSlot) =>
              bookedSlot.date === dateStr && bookedSlot.time === slotLabel
          )
        ) {
          isBooked = true;
        }
      });

      slot.disabled = isBooked;
      slot.checked = false;

      if (isBooked) {
        slot.nextElementSibling.innerHTML = `<span class="time-label">${slotLabel}</span> <span class="booked-text">(Already Booked)</span>`;
        slot.parentElement.style.color = "#ccc";
      } else {
        slot.nextElementSibling.innerHTML = `<span class="time-label">${slotLabel}</span>`;
        slot.parentElement.style.color = "";
      }
    });
  }

  // Helper function to get all dates in the 25-day range (excluding Sundays)
  function get25DayRangeDates(startDateObj) {
    const dates = [];
    let daysCounted = 0;
    let currentDate = new Date(
      startDateObj.year,
      startDateObj.month,
      startDateObj.day
    );

    while (daysCounted < 25) {
      if (currentDate.getDay() !== 0) {
        // Skip Sundays (0)
        dates.push({
          day: currentDate.getDate(),
          month: currentDate.getMonth(),
          year: currentDate.getFullYear(),
        });
        daysCounted++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  }

  // Navigation buttons
  navs.forEach((nav) => {
    nav.addEventListener("click", (e) => {
      const btnId = e.target.id;
      const today = new Date();

      if (btnId === "prev") {
        month--;
        if (month < 0) {
          month = 11;
          year--;
        }
      } else if (btnId === "next") {
        month++;
        if (month > 11) {
          month = 0;
          year++;
        }
      }

      renderCalendar();
    });
  });

  // OK Button - Open payment popup with validation
  okButton.addEventListener("click", () => {
    selectedTime = document.querySelector('input[name="time-slot"]:checked');

    let errorMessage = "";

    if (!selectedDate) {
      errorMessage += "• Please select a start date\n";
    }

    if (!selectedTime) {
      errorMessage += "• Please select a time slot\n";
    }

    if (errorMessage) {
      alert("Please complete the following:\n" + errorMessage);
      return;
    }

    updatePaymentSummary();
    paymentPopup.classList.add("open-payment-summary");
  });

  function updatePaymentSummary() {
    if (!selectedDate || !selectedTime) return;

    const startDateStr = `${months[selectedDate.month]} ${selectedDate.day}, ${
      selectedDate.year
    }`;
    const timeStr = selectedTime.nextElementSibling.textContent
      .replace(" (Already Booked)", "")
      .trim();

    // Calculate end date (25 days later, excluding Sundays)
    let daysCounted = 0;
    let currentDate = new Date(
      selectedDate.year,
      selectedDate.month,
      selectedDate.day
    );
    let endDate = new Date(
      selectedDate.year,
      selectedDate.month,
      selectedDate.day
    );

    while (daysCounted < 25) {
      if (currentDate.getDay() !== 0) {
        // Skip Sundays
        daysCounted++;
      }
      if (daysCounted < 25) {
        currentDate.setDate(currentDate.getDate() + 1);
        endDate = new Date(currentDate);
      }
    }

    const endDateStr = `${
      months[endDate.getMonth()]
    } ${endDate.getDate()}, ${endDate.getFullYear()}`;
    const price = 2500;

    document.querySelector(
      ".payment-summary .amount div:last-child"
    ).textContent = `₱ ${price}`;
    document.querySelector(
      ".payment-summary .booking-date"
    ).textContent = `${startDateStr} to ${endDateStr} at ${timeStr} (25 sessions)`;
  }

  function closePaymentPopup() {
    paymentPopup.classList.remove("open-payment-summary");
  }

  cancelButton.addEventListener("click", () => {
    selectedDate = null;
    selectedTime = null;
    selectedPayment = null;

    timeSlots.forEach((slot) => {
      slot.checked = false;
      slot.nextElementSibling.innerHTML = `<span class="time-label">${slot.nextElementSibling.textContent
        .replace(/ \(Already Booked\)/g, "")
        .trim()}</span>`;
      slot.parentElement.style.color = "";
    });

    paymentOptions.forEach((slot) => (slot.checked = false));

    updateAvailableTimeSlots();
    renderCalendar();
    closePaymentPopup();
  });

  popupCancelButton.addEventListener("click", closePaymentPopup);

  payNowButton.addEventListener("click", (e) => {
    e.preventDefault();

    selectedPayment = document.querySelector(
      'input[name="payment-method"]:checked'
    );

    if (!selectedPayment) {
      alert("Please select a payment method before proceeding.");
      return;
    }

    checkActiveBookings();
    if (hasActiveBooking) {
      const activeBooking = userBookings.find((booking) => {
        const bookingEndDate = new Date(booking.endDate);
        return bookingEndDate > new Date();
      });
      alert(
        `You already have an active booking until ${activeBooking.endDate}. Please wait until your current booking period is complete before booking again.`
      );
      return;
    }

    // Get all dates in the 25-day range (excluding Sundays)
    const bookingDates = get25DayRangeDates(selectedDate);
    const timeStr = selectedTime.nextElementSibling.textContent
      .replace(" (Already Booked)", "")
      .trim();

    // Create booking for each date
    const newBookings = bookingDates.map((date) => {
      return {
        date: `${months[date.month]} ${date.day}, ${date.year}`,
        time: timeStr,
        paymentMethod: selectedPayment.value,
      };
    });

    // Calculate end date for user's booking
    const lastBookingDate = bookingDates[bookingDates.length - 1];
    const endDateStr = `${months[lastBookingDate.month]} ${
      lastBookingDate.day
    }, ${lastBookingDate.year}`;

    if (
      !confirm(
        `Confirm 25-Day Booking?\n\n📅 Dates: ${months[selectedDate.month]} ${
          selectedDate.day
        }, ${
          selectedDate.year
        } to ${endDateStr}\n⏰ Time: ${timeStr}\n💳 Payment: ${
          selectedPayment.value
        }\n\nPrice: ₱2,500 (25 sessions)`
      )
    ) {
      return;
    }

    // Add all bookings to bookedSlots
    bookedSlots = [...bookedSlots, ...newBookings];

    // Add to user's bookings with end date
    const newUserBooking = {
      startDate: `${months[selectedDate.month]} ${selectedDate.day}, ${
        selectedDate.year
      }`,
      endDate: endDateStr,
      time: timeStr,
      paymentMethod: selectedPayment.value,
    };
    userBookings.push(newUserBooking);

    // Save bookings to localStorage
    saveBookings();

    // If connected to backend, send booking to server
    if (window.bookingApi) {
      const backendBookingData = {
        sessionType: "mmaBulkSession",
        date: newUserBooking.startDate,
        time: timeStr,
        endDate: endDateStr,
        price: 2500, // Full session price
        paymentMethod: selectedPayment.value,
      };

      window.bookingApi
        .bookMMASession(backendBookingData)
        .then((response) => {
          console.log("Booking saved to database:", response);
        })
        .catch((error) => {
          console.error("Failed to save booking to database:", error);
        });
    }

    updateUIForActiveBooking();

    updateAvailableTimeSlots();
    renderCalendar();
    closePaymentPopup();

    alert(
      `✅ 25-Day MMA Training Package Confirmed!\n\n📅 Dates: ${
        months[selectedDate.month]
      } ${selectedDate.day}, ${
        selectedDate.year
      } to ${endDateStr}\n⏰ Time: ${timeStr}\n💳 Payment: ${
        selectedPayment.value
      }\n\nYou cannot book again until ${endDateStr}. Visit your user dashboard to view your schedule.`
    );

    // Redirect to user schedule page after a short delay
    setTimeout(() => {
      window.location.href = "user-schedule-mma.html";
    }, 1500);
  });

  function initBookingUI() {
    // Add a message element if it doesn't exist
    if (!document.getElementById("booking-message")) {
      const messageDiv = document.createElement("div");
      messageDiv.id = "booking-message";
      messageDiv.style.color = "red";
      messageDiv.style.margin = "10px 0";
      messageDiv.style.fontWeight = "bold";
      messageDiv.style.textAlign = "center";
      messageDiv.style.padding = "5px";
      messageDiv.style.display = "none";
      document.querySelector(".calendar").appendChild(messageDiv);
    }

    updateUIForActiveBooking();
  }
  // Initial render
  renderCalendar();
  updateAvailableTimeSlots();
  initBookingUI();
});

const paymentDetails = [
  {
    id: null,
    date: null,
    persons: null,
    price: null,
  },
];

let mma_paymentSummaryHTML = "";

paymentDetails.forEach((mma_payment) => {
  mma_paymentSummaryHTML += `
    <div class="payment-summary text-white bg-black-1 max-w-2xl mx-auto" id="studio-pop-up">
        <div class="bg-red-600 text-center font-bold py-2">Payment Summary</div>
        <div class="p-6">
            <div class="flex flex-col sm:flex-row border-4 border-red-600 mb-8 mt-4 rounded-lg overflow-hidden">
                <div class="bg-red-600 rounded-br-3xl rounded-tr-3xl mr-4 pr-2 hidden sm:block">
                    <img src="./assets/herdoza-logo-trans.png" alt="Herdoza Fitness Center" class="h-30">
                </div>

                <div class="flex flex-col justify-center mr-1 flex-1 p-4">
                    <div class="text-xs text-red-600 font-bold">
                        You're Paying for:
                    </div>
                    <div class="font-bold text-2xl mb-2">
                        MMA Training - Full Session Package (25 Days)
                    </div>
                    <div class="booking-date text-gray-300">
                        ${mma_payment.date || "Select a date"}
                    </div>
                </div>

                <div class="bg-none md:bg-red-600 amount flex flex-col justify-center items-center px-6 py-4 my-2 mx-2 rounded-lg">
                    <div class="text-sm">
                        Amount
                    </div>
                    <div class="font-bold text-3xl md:text-2xl">
                        ₱ 2500
                    </div>
                </div>
            </div>

            <form id="payment-form">
                <div class="text-center text-sm mb-4">Payment Method</div>
                <div class="flex gap-4 justify-center mb-6">
                    <label>
                        <input type="radio" name="payment-method" value="Gcash" required class="hidden peer/gcash" />
                        <div class="bg-red-600 peer-checked/gcash:bg-blue-700 hover:cursor-pointer hover:bg-red-700 transition-all
                                    text-sm px-6 py-2 sm:text-base sm:px-8 sm:py-2 rounded-lg text-white text-center">
                            Gcash
                        </div>
                    </label>

                    <label>
                        <input type="radio" name="payment-method" value="Onsite" required class="hidden peer/onsite" />
                        <div class="bg-red-600 peer-checked/onsite:bg-green-700 hover:cursor-pointer hover:bg-red-700 transition-all
                                    text-sm px-6 py-2 sm:text-base sm:px-8 sm:py-2 rounded-lg text-white text-center">
                            Cash(Onsite)
                        </div>
                    </label>
                </div>

                <div id="gcashDetails" class="gcash-details hidden mb-6">
                    <div class="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 p-4 rounded-lg text-center">
                        <p class="font-bold mb-3">GCash Payment Details</p>
                        <div class="flex justify-center mb-4">
                            <img src="./assets/instapay-qr.jpg" alt="GCash QR Code" class="w-48 h-48 rounded-lg shadow-lg">
                        </div>
                        <p class="mb-1">Send payment to: <span class="font-bold">09307561163</span></p>
                        <p class="mb-3">Amount: ₱2500.00</p>
                        <p class="text-xs mt-2">After scanning and sending payment:</p>
                        <p class="text-xs text-blue-700 dark:text-blue-300 mt-1">Note: Registration will be pending until proof of payment is verified</p>
                    </div>
                </div>

                <div id="onsiteDetails" class="onsite-details hidden mb-6">
                    <div class="bg-amber-100 text-amber-800 p-4 rounded-lg text-center">
                        <p class="font-bold mb-2">Cash Payment (Onsite)</p>
                        <p class="mb-2">Please pay at the gym reception counter</p>
                        <p class="mb-3">Amount: ₱2500.00</p>
                        <p class="text-xs mt-2">Your reservation will be pending until payment is received at the gym</p>
                    </div>
                </div>

                <hr class="border-gray-700">
                <div class="text-center md:text-end mt-4">
                    <button type="button"
                        class="cancel-btn bg-red-600 hover:bg-red-700 transition-all mx-2 text-base font-bold px-8 py-2 rounded-lg">
                        Cancel
                    </button>
                    <button type="submit"
                        class="pay-now-btn bg-gray-500 hover:bg-gray-600 transition-all text-base font-bold px-8 py-2 rounded-lg cursor-pointer">
                        Pay now
                    </button>
                </div>
            </form>
        </div>
    </div>`;
});

document.querySelector(".pop-up-con").innerHTML = mma_paymentSummaryHTML;

document.addEventListener("DOMContentLoaded", () => {
  const dates = document.querySelector(".dates");
  const header = document.querySelector(".calendar h3");
  const navs = document.querySelectorAll("#prev, #next");
  const okButton = document.querySelector(".ok-btn");
  const cancelButton = document.querySelector(".cancel-btn");
  const timeSlots = document.querySelectorAll('input[name="time-slot"]');
  const paymentModal = document.querySelector(".payment-modal");
  const paymentMethodInputs = document.querySelectorAll(
    'input[name="payment-method"]'
  );
  const gcashDetails = document.getElementById("gcash-details");
  const onsiteDetails = document.getElementById("onsite-details");
  const cancelPaymentBtn = document.querySelector(".cancel-payment-btn");
  const confirmPaymentBtn = document.querySelector(".confirm-payment-btn");

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Initialize state
  let bookedSlots = JSON.parse(
    localStorage.getItem("mma25SessionBookings") || "[]"
  );
  let date = new Date();
  let month = date.getMonth();
  let year = date.getFullYear();
  let selectedDate = null;
  let selectedTime = null;

  function renderCalendar() {
    // ... existing calendar rendering code ...
  }

  function updateAvailableTimeSlots() {
    if (!selectedDate) return;

    let selectedDateStr = `${months[selectedDate.month]} ${selectedDate.day}, ${
      selectedDate.year
    }`;

    timeSlots.forEach((slot) => {
      const slotTime = slot.value || slot.nextElementSibling.textContent;
      const isBooked = bookedSlots.some(
        (booking) =>
          booking.startDate === selectedDateStr && booking.time === slotTime
      );

      slot.disabled = isBooked;
      const label = slot.nextElementSibling;

      if (isBooked) {
        label.innerHTML = `${slotTime} (Already Booked)`;
        label.style.color = "#666";
      } else {
        label.innerHTML = slotTime;
        label.style.color = "";
      }
    });
  }

  function showPaymentModal() {
    const dateStr = `${months[selectedDate.month]} ${selectedDate.day}, ${
      selectedDate.year
    }`;
    const timeStr =
      selectedTime.value || selectedTime.nextElementSibling.textContent;

    document.querySelector(".booking-details").innerHTML = `
      Start Date: ${dateStr}<br>
      Time Slot: ${timeStr}<br>
      Duration: 25 Sessions (1 Month)
    `;

    paymentModal.classList.remove("hidden");
  }

  // Payment method selection handlers
  paymentMethodInputs.forEach((input) => {
    input.addEventListener("change", () => {
      gcashDetails.classList.toggle("hidden", input.value !== "Gcash");
      onsiteDetails.classList.toggle("hidden", input.value !== "Onsite");

      // Enable pay now button and update styling based on payment method
      const payNowBtn = document.querySelector(".pay-now-btn");
      payNowBtn.classList.remove("bg-gray-500");
      if (input.value === "Gcash") {
        payNowBtn.classList.add("bg-blue-600", "hover:bg-blue-800");
      } else {
        payNowBtn.classList.add("bg-green-600", "hover:bg-green-800");
      }
    });
  });

  cancelPaymentBtn?.addEventListener("click", () => {
    paymentModal.classList.add("hidden");
  });

  confirmPaymentBtn?.addEventListener("click", () => {
    const selectedPayment = document.querySelector(
      'input[name="payment-method"]:checked'
    );

    if (!selectedPayment) {
      alert("Please select a payment method");
      return;
    }

    const dateStr = `${months[selectedDate.month]} ${selectedDate.day}, ${
      selectedDate.year
    }`;
    const timeStr =
      selectedTime.value || selectedTime.nextElementSibling.textContent;

    const bookingDetails = {
      startDate: dateStr,
      time: timeStr,
      paymentMethod: selectedPayment.value,
      type: "25-session",
      price: 2500,
    };

    if (
      !confirm(
        `Confirm MMA 25-Session Package?\n\n📅 Start Date: ${bookingDetails.startDate}\n⏰ Time Slot: ${bookingDetails.time}\n💳 Payment: ${bookingDetails.paymentMethod}\n\nPrice: ₱2,500.00`
      )
    ) {
      return;
    }

    // Save booking
    bookedSlots.push(bookingDetails);
    localStorage.setItem("mma25SessionBookings", JSON.stringify(bookedSlots));

    // Send to backend if available
    if (window.bookingApi) {
      window.bookingApi
        .bookMMASession({
          sessionType: "25-session",
          startDate: bookingDetails.startDate,
          time: bookingDetails.time,
          price: bookingDetails.price,
          paymentMethod: bookingDetails.paymentMethod,
        })
        .then((response) => {
          console.log("Booking saved to database:", response);
        })
        .catch((error) => {
          console.error("Failed to save booking to database:", error);
        });
    }

    paymentModal.classList.add("hidden");
    alert(
      `✅ MMA 25-Session Package Confirmed!\n\n📅 Start Date: ${bookingDetails.startDate}\n⏰ Time Slot: ${bookingDetails.time}\n💳 Payment: ${bookingDetails.paymentMethod}\n\nYou can view your schedule in the user dashboard.`
    );

    setTimeout(() => {
      window.location.href = "user-schedule-mma.html";
    }, 1500);
  });

  // Button handlers
  okButton?.addEventListener("click", () => {
    selectedTime = document.querySelector('input[name="time-slot"]:checked');

    if (!selectedDate || !selectedTime) {
      let errorMessage = "Please complete the following:\n";
      if (!selectedDate) errorMessage += "• Select a start date\n";
      if (!selectedTime) errorMessage += "• Select a time slot\n";
      alert(errorMessage);
      return;
    }

    showPaymentModal();
  });

  cancelButton?.addEventListener("click", () => {
    window.location.href = "mixed-martial-arts.html";
  });

  // Calendar navigation
  navs.forEach((nav) => {
    nav.addEventListener("click", (e) => {
      if (e.target.id === "prev") {
        month--;
        if (month < 0) {
          month = 11;
          year--;
        }
      } else {
        month++;
        if (month > 11) {
          month = 0;
          year++;
        }
      }
      renderCalendar();
    });
  });

  // Initialize calendar
  renderCalendar();
  updateAvailableTimeSlots();
});
