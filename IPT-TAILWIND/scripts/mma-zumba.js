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
  const confirmPaymentBtn = document.querySelector(".confirm-payment-btn");
  const cancelPaymentBtn = document.querySelector(".cancel-payment-btn");

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

  // Initialize bookedSlots from localStorage
  let bookedSlots = JSON.parse(
    localStorage.getItem("mmaZumbaBookings") || "[]"
  );
  let date = new Date();
  let month = date.getMonth();
  let year = date.getFullYear();
  let selectedDate = null;
  let selectedTime = null;
  let selectedPayment = null;

  function saveBookings() {
    localStorage.setItem("mmaZumbaBookings", JSON.stringify(bookedSlots));
    if (window.bookingApi) {
      syncBookingsToBackend();
    }
  }

  function syncBookingsToBackend() {
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
        updateZumbaSchedule();
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

  function updateZumbaSchedule() {
    const zumbaScheduleDiv = document.getElementById("zumba-schedule");
    if (!selectedDate) {
      zumbaScheduleDiv.textContent = "Select an MMA date first";
      zumbaScheduleDiv.classList.add("text-red-600");
      return;
    }

    const dateObj = new Date(
      selectedDate.year,
      selectedDate.month,
      selectedDate.day
    );
    const dayName = dateObj.toLocaleDateString("en-US", { weekday: "long" });
    zumbaScheduleDiv.textContent = `${dayName}, 7:00 AM - 8:00 AM`;
    zumbaScheduleDiv.classList.remove("text-red-600");
  }

  // Navigation buttons
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

  // OK Button handler
  okButton?.addEventListener("click", () => {
    selectedTime = document.querySelector('input[name="time-slot"]:checked');

    let errorMessage = "";
    if (!selectedDate) errorMessage += "• Please select a date\n";
    if (!selectedTime) errorMessage += "• Please select a time slot\n";

    if (errorMessage) {
      alert("Please complete the following:\n" + errorMessage);
      return;
    }

    // Show payment modal
    paymentModal.classList.remove("hidden");
    const selectedDateStr = `${months[selectedDate.month]} ${
      selectedDate.day
    }, ${selectedDate.year}`;
    const timeStr = selectedTime.nextElementSibling.textContent
      .replace(" (Already Booked)", "")
      .trim();
    document.querySelector(
      ".booking-details"
    ).textContent = `MMA: ${selectedDateStr}, ${timeStr}\nZumba: ${selectedDateStr}, 7:00 AM - 8:00 AM`;
  });

  // Cancel button handler
  cancelButton?.addEventListener("click", () => {
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

    paymentMethodInputs.forEach((input) => (input.checked = false));
    updateAvailableTimeSlots();
    updateZumbaSchedule();
    renderCalendar();
    paymentModal.classList.add("hidden");
  });

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

  // Cancel payment button handler
  cancelPaymentBtn?.addEventListener("click", () => {
    paymentModal.classList.add("hidden");
  });

  // Confirm payment button handler
  confirmPaymentBtn?.addEventListener("click", () => {
    selectedPayment = document.querySelector(
      'input[name="payment-method"]:checked'
    );

    if (!selectedPayment) {
      alert("Please select a payment method before proceeding.");
      return;
    }

    const dateStr = `${months[selectedDate.month]} ${selectedDate.day}, ${
      selectedDate.year
    }`;
    const timeStr = selectedTime.nextElementSibling.textContent
      .replace(" (Already Booked)", "")
      .trim();
    const zumbaTime = "7:00 AM - 8:00 AM";

    const bookingDetails = {
      date: dateStr,
      time: timeStr,
      zumbaSchedule: `${dateStr}, ${zumbaTime}`,
      paymentMethod: selectedPayment.value,
      price: 200,
    };

    if (
      !confirm(
        `Confirm MMA + Zumba Package Booking?\n\n` +
          `📅 Date: ${dateStr}\n` +
          `⏰ MMA Time: ${timeStr}\n` +
          `⏰ Zumba Time: ${zumbaTime}\n` +
          `💳 Payment: ${selectedPayment.value}\n\n` +
          `Price: ₱200.00`
      )
    ) {
      return;
    }

    // Add to local storage
    bookedSlots.push(bookingDetails);
    saveBookings();

    // If connected to backend, send booking to server
    if (window.bookingApi) {
      const backendBookingData = {
        sessionType: "mmaZumba",
        date: bookingDetails.date,
        time: bookingDetails.time,
        zumbaSchedule: bookingDetails.zumbaSchedule,
        price: bookingDetails.price,
        paymentMethod: bookingDetails.paymentMethod,
      };

      window.bookingApi
        .bookMMAZumbaSession(backendBookingData)
        .then((response) => {
          console.log("Booking saved to database:", response);
        })
        .catch((error) => {
          console.error("Failed to save booking to database:", error);
        });
    }

    paymentModal.classList.add("hidden");

    alert(
      `✅ MMA + Zumba Package Confirmed!\n\n` +
        `📅 Date: ${dateStr}\n` +
        `⏰ MMA Time: ${timeStr}\n` +
        `⏰ Zumba Time: ${zumbaTime}\n` +
        `💳 Payment: ${selectedPayment.value}\n\n` +
        `You can view your bookings in your schedule.`
    );

    // Redirect to schedule page after a short delay
    setTimeout(() => {
      window.location.href = "user-schedule-mma-zumba.html";
    }, 1500);
  });

  // Initial render
  renderCalendar();
  updateAvailableTimeSlots();
  updateZumbaSchedule();
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
                        MMA + Zumba Package
                    </div>
                    <div class="booking-date text-gray-300">
                        ${mma_payment.date || "Select a date"}
                    </div>
                    <div class="zumba-schedule text-gray-300 mt-1">
                        ${mma_payment.zumbaSchedule || "Select Zumba schedule"}
                    </div>
                </div>

                <div class="bg-none md:bg-red-600 amount flex flex-col justify-center items-center px-6 py-4 my-2 mx-2 rounded-lg">
                    <div class="text-sm">
                        Amount
                    </div>
                    <div class="font-bold text-3xl md:text-2xl">
                        ₱ 200
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
                        <p class="mb-3">Amount: ₱200.00</p>
                        <p class="text-xs mt-2">After scanning and sending payment:</p>
                        <p class="text-xs text-blue-700 dark:text-blue-300 mt-1">Note: Registration will be pending until proof of payment is verified</p>
                    </div>
                </div>

                <div id="onsiteDetails" class="onsite-details hidden mb-6">
                    <div class="bg-amber-100 text-amber-800 p-4 rounded-lg text-center">
                        <p class="font-bold mb-2">Cash Payment (Onsite)</p>
                        <p class="mb-2">Please pay at the gym reception counter</p>
                        <p class="mb-3">Amount: ₱200.00</p>
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
