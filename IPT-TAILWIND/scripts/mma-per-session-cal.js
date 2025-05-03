document.addEventListener("DOMContentLoaded", () => {
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

  // Initialize bookedSlots from localStorage or empty array if nothing stored
  let bookedSlots = JSON.parse(
    localStorage.getItem("mmaPerSessionBookings") || "[]"
  );
  let date = new Date();
  let month = date.getMonth();
  let year = date.getFullYear();
  let selectedDate = null;
  let selectedTime = null;
  let selectedPayment = null;

  // Function to save bookings to localStorage
  function saveBookings() {
    localStorage.setItem("mmaPerSessionBookings", JSON.stringify(bookedSlots));

    // If connected to backend, sync bookings
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
      let dayOfWeek = currentDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      let formattedDate = `${months[month]} ${i}, ${year}`;

      // Check if it's Sunday (dayOfWeek === 0)
      if (dayOfWeek === 0) {
        className = "inactive sunday"; // Added 'sunday' class for additional styling if needed
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

      // Check if date is selected
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
        selectedDate = { day: dayNumber, month: month, year: year };
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

    let selectedDateStr = `${months[selectedDate.month]} ${selectedDate.day}, ${
      selectedDate.year
    }`;

    timeSlots.forEach((slot) => {
      let slotLabel = slot.nextElementSibling.textContent
        .replace(/ \(Already Booked\)/g, "")
        .trim();
      let isBooked = bookedSlots.some(
        (bookedSlot) =>
          bookedSlot.date === selectedDateStr && bookedSlot.time === slotLabel
      );

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
    // Get current selections
    selectedTime = document.querySelector('input[name="time-slot"]:checked');

    // Validate all fields
    let errorMessage = "";

    if (!selectedDate) {
      errorMessage += "• Please select a date\n";
    }

    if (!selectedTime) {
      errorMessage += "• Please select a time slot\n";
    }

    if (errorMessage) {
      alert("Please complete the following:\n" + errorMessage);
      return;
    }

    // Update payment summary with selected values
    updatePaymentSummary();

    // All fields are filled - show popup
    paymentPopup.classList.add("open-payment-summary");
  });

  function updatePaymentSummary() {
    if (!selectedDate || !selectedTime) return;

    const dateStr = `${months[selectedDate.month]} ${selectedDate.day}, ${
      selectedDate.year
    }`;
    const timeStr = selectedTime.nextElementSibling.textContent
      .replace(" (Already Booked)", "")
      .trim();

    const price = 150;

    // Update payment summary display
    document.querySelector(
      ".payment-summary .amount div:last-child"
    ).textContent = `₱ ${price}`;
    document.querySelector(
      ".payment-summary .booking-date"
    ).textContent = `${dateStr} at ${timeStr}`;
  }

  // Function to close the payment popup
  function closePaymentPopup() {
    paymentPopup.classList.remove("open-payment-summary");
  }

  // Cancel button outside popup - Reset selections
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

  // Cancel button inside popup - Just close the popup
  popupCancelButton.addEventListener("click", closePaymentPopup);

  // Pay Now button - Confirm booking
  payNowButton?.addEventListener("click", (e) => {
    e.preventDefault();

    selectedPayment = document.querySelector(
      'input[name="payment-method"]:checked'
    );

    if (!selectedPayment) {
      alert("Please select a payment method before proceeding.");
      return;
    }

    const bookingDetails = {
      date: `${months[selectedDate.month]} ${selectedDate.day}, ${
        selectedDate.year
      }`,
      time: selectedTime.nextElementSibling.textContent
        .replace(" (Already Booked)", "")
        .trim(),
      paymentMethod: selectedPayment.value,
      price: 150,
    };

    if (
      !confirm(
        `Confirm MMA Training Booking?\n\n📅 Date: ${bookingDetails.date}\n⏰ Time: ${bookingDetails.time}\n💳 Payment: ${bookingDetails.paymentMethod}\n\nPrice: ₱150.00`
      )
    ) {
      return;
    }

    // Save booking to localStorage
    bookedSlots.push(bookingDetails);
    saveBookings();

    // If connected to backend, send booking to server
    if (window.bookingApi) {
      const backendBookingData = {
        sessionType: "mmaPerSession",
        date: bookingDetails.date,
        time: bookingDetails.time,
        price: bookingDetails.price,
        paymentMethod: bookingDetails.paymentMethod,
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

    updateAvailableTimeSlots();
    renderCalendar();
    closePaymentPopup();

    alert(
      `✅ MMA Training Session Confirmed!\n\n📅 Date: ${bookingDetails.date}\n⏰ Time: ${bookingDetails.time}\n💳 Payment: ${bookingDetails.paymentMethod}\n\nYou can view your schedule in the user dashboard.`
    );

    // Redirect to user schedule page after a short delay
    setTimeout(() => {
      window.location.href = "user-schedule-mma.html";
    }, 1500);
  });

  // Show/hide payment details when payment method is selected
  document
    .querySelector('input[value="Gcash"]')
    ?.addEventListener("change", function () {
      document.getElementById("gcashDetails").classList.remove("hidden");
      document.getElementById("onsiteDetails").classList.add("hidden");

      // Enable the Pay Now button with blue styling
      const payNowBtn = this.closest("form").querySelector(".pay-now-btn");
      payNowBtn.classList.remove("bg-gray-500");
      payNowBtn.classList.add("bg-blue-600", "hover:bg-blue-800");
    });

  document
    .querySelector('input[value="Onsite"]')
    ?.addEventListener("change", function () {
      document.getElementById("gcashDetails").classList.add("hidden");
      document.getElementById("onsiteDetails").classList.remove("hidden");

      // Enable the Pay Now button with green styling
      const payNowBtn = this.closest("form").querySelector(".pay-now-btn");
      payNowBtn.classList.remove("bg-gray-500");
      payNowBtn.classList.add("bg-green-600", "hover:bg-green-800");
    });

  // Initial render
  renderCalendar();
  updateAvailableTimeSlots();
});

// Payment summary template
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
                        MMA Training - Single Session
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
                        ₱ 150
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
                            <img src="./assets/GCash-QR-Code.jpg" alt="GCash QR Code" class="w-48 h-48 rounded-lg shadow-lg">
                        </div>
                        <p class="mb-1">Send payment to: <span class="font-bold">09307561163</span></p>
                        <p class="mb-3">Amount: ₱150.00</p>
                        <p class="text-xs mt-2">After scanning and sending payment:</p>
                        <p class="text-xs text-blue-700 dark:text-blue-300 mt-1">Note: Registration will be pending until proof of payment is verified</p>
                    </div>
                </div>

                <div id="onsiteDetails" class="onsite-details hidden mb-6">
                    <div class="bg-amber-100 text-amber-800 p-4 rounded-lg text-center">
                        <p class="font-bold mb-2">Cash Payment (Onsite)</p>
                        <p class="mb-2">Please pay at the gym reception counter</p>
                        <p class="mb-3">Amount: ₱150.00</p>  
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
