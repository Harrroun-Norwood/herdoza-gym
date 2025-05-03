document.addEventListener("DOMContentLoaded", () => {
  const dates = document.querySelector(".dates");
  const header = document.querySelector(".calendar h3");
  const navs = document.querySelectorAll("#prev, #next");
  const okButton = document.querySelector(".ok-btn");
  const cancelButton = document.querySelector(".cancel-btn");
  const timeSlots = document.querySelectorAll('input[name="time-slot"]');
  const peopleQuantity = document.getElementById("people-quantity");
  const paymentPopup = document.getElementById("studio-pop-up");
  const popupContainer = document.querySelector(".pop-up-con");

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
    localStorage.getItem("largeStudioBookings") || "[]"
  );
  let date = new Date();
  let month = date.getMonth();
  let year = date.getFullYear();
  let selectedDate = null;
  let selectedTime = null;
  let selectedPeople = null;

  // Function to save bookings to localStorage
  function saveBookings() {
    localStorage.setItem("largeStudioBookings", JSON.stringify(bookedSlots));

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
    selectedPeople = peopleQuantity.value;

    // Validate all fields
    let errorMessage = "";

    if (!selectedDate) {
      errorMessage += "• Please select a date\n";
    }

    if (!selectedTime) {
      errorMessage += "• Please select a time slot\n";
    }

    if (!selectedPeople || selectedPeople < 4) {
      errorMessage += "• Please enter number of people (minimum 4)\n";
    }

    if (selectedPeople > 30) {
      errorMessage += "• Maximum group size is 30 people\n";
    }

    if (errorMessage) {
      alert("Please complete the following:\n" + errorMessage);
      return;
    }

    // Create and show payment popup
    showPaymentPopup();
  });

  function showPaymentPopup() {
    const formattedDate = `${months[selectedDate.month]} ${selectedDate.day}, ${
      selectedDate.year
    }`;
    const time = selectedTime.nextElementSibling.textContent
      .replace(" (Already Booked)", "")
      .trim();
    const price = parseInt(selectedPeople) * 25;

    const popupHTML = `
        <div class="payment-summary text-white bg-black-1 open-payment-summary" id="studio-pop-up">
            <div class="bg-red-600 text-center font-bold py-1">Payment Summary</div>
            <div class="p-4">
                <div class="flex flex-col sm:flex-row border-4 border-red-600 mb-8 mt-4">
                    <div class="bg-red-600 rounded-br-3xl rounded-tr-3xl mr-4 pr-2 hidden sm:block">
                        <img src="./assets/herdoza-logo-trans.png" alt="Herdoza Fitness Center" class="h-30">
                    </div>

                    <div class="flex flex-col justify-center mr-1 flex-1 p-4">
                        <div class="text-xs text-red-600 font-bold">
                            You're Paying for:
                        </div>
                        <div class="font-bold text-2xl">
                            Dance Studio - Large Group
                        </div>
                        <div class="booking-date">
                            ${formattedDate}
                        </div>
                        <div class="booking-details">
                            ${selectedPeople} person(s) at ${time}
                        </div>
                        <div class="text-sm mt-2 sm:hidden">
                            Price: ₱${price}.00 (₱25 per person)
                        </div>
                    </div>

                    <div class="bg-none md:bg-red-600 amount flex flex-col justify-center items-center px-6 py-2 my-2 mx-2 text-sm">
                        <div class="text-sm">
                            Amount
                        </div>
                        <div class="font-bold text-3xl md:text-lg price-display">
                            ₱ ${price}.00
                        </div>
                    </div>
                </div>

                <form id="payment-form">
                    <div class="text-center text-xs mb-3">Payment Method</div>
                    <div class="flex gap-4 justify-center mb-6">
                        <label class="mobile-touch-target">
                            <input type="radio" name="payment-method" value="Gcash" required class="hidden peer/gcash" />
                            <div class="bg-red-600 peer-checked/gcash:bg-blue-800 hover:cursor-pointer 
                                        text-sm px-4 py-2 sm:text-lg sm:px-8 sm:py-3 rounded-md text-white text-center transition-all button-text-mobile">
                                Gcash
                            </div>
                        </label>

                        <label class="mobile-touch-target">
                            <input type="radio" name="payment-method" value="Onsite" required class="hidden peer/onsite" />
                            <div class="bg-red-600 peer-checked/onsite:bg-blue-800 hover:cursor-pointer 
                                        text-sm px-4 py-2 sm:text-lg sm:px-8 sm:py-3 rounded-md text-white text-center transition-all button-text-mobile">
                                Cash(Onsite)
                            </div>
                        </label>
                    </div>

                    <div id="gcashDetails" class="gcash-details hidden mb-6">
                        <div class="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 p-3 rounded-md text-center">
                            <p class="font-bold mb-2">GCash Payment Details</p>
                            <div class="flex justify-center mb-4">
                                <img src="./assets/GCash-QR-Code.jpg" alt="GCash QR Code" class="w-48 h-48 rounded-lg shadow-lg">
                            </div>
                            <p>Send payment to: <span class="font-bold">09307561163</span></p>
                            <p>Amount: ₱${price}.00</p>
                            <p class="text-xs mt-2">After scanning and sending payment:</p>
                            <p class="text-xs text-blue-700 dark:text-blue-300 mt-1">Note: Registration will be pending until proof of payment is verified</p>
                        </div>
                    </div>

                    <div id="onsiteDetails" class="onsite-details hidden mb-6">
                        <div class="bg-amber-100 text-amber-800 p-3 rounded-md text-center">
                            <p class="font-bold mb-2">Cash Payment (Onsite)</p>
                            <p>Please pay at the gym reception counter</p>
                            <p>Amount: ₱${price}.00</p>
                            <p class="text-xs mt-2">Your reservation will be pending until payment is received at the gym</p>
                        </div>
                    </div>

                    <hr>
                    <div class="text-center md:text-end mt-3">
                        <button type="button"
                            class="popup-cancel-btn bg-red-600 hover:cursor-pointer hover:bg-red-700 mx-2 text-lg font-bold px-8 py-2 rounded-md mobile-touch-target button-text-mobile">
                            Cancel
                        </button>
                        <button type="submit"
                            class="pay-now-btn bg-gray-500 hover:bg-gray-700 text-lg font-bold px-8 py-2 rounded-md cursor-pointer mobile-touch-target button-text-mobile">
                            Pay now
                        </button>
                    </div>
                </form>
            </div>
        </div>`;

    popupContainer.innerHTML = popupHTML;

    // Add event listeners for payment methods
    const gcashRadio = document.querySelector('input[value="Gcash"]');
    const onsiteRadio = document.querySelector('input[value="Onsite"]');
    const payNowBtn = document.querySelector(".pay-now-btn");

    gcashRadio?.addEventListener("change", function () {
      document.getElementById("gcashDetails").classList.remove("hidden");
      document.getElementById("onsiteDetails").classList.add("hidden");
      payNowBtn.classList.remove("bg-gray-500");
      payNowBtn.classList.add("bg-blue-600", "hover:bg-blue-800");
    });

    onsiteRadio?.addEventListener("change", function () {
      document.getElementById("gcashDetails").classList.add("hidden");
      document.getElementById("onsiteDetails").classList.remove("hidden");
      payNowBtn.classList.remove("bg-gray-500");
      payNowBtn.classList.add("bg-green-600", "hover:bg-green-800");
    });

    // Add event listeners for the popup buttons
    document
      .querySelector(".popup-cancel-btn")
      ?.addEventListener("click", closePaymentPopup);
    document
      .querySelector(".pay-now-btn")
      ?.addEventListener("click", confirmBooking);
  }

  function closePaymentPopup() {
    popupContainer.innerHTML = "";
  }

  function confirmBooking(e) {
    e.preventDefault();

    const selectedPayment = document.querySelector(
      'input[name="payment-method"]:checked'
    );

    if (!selectedPayment) {
      alert("Please select a payment method before proceeding.");
      return;
    }

    const price = parseInt(selectedPeople) * 25;

    const bookingDetails = {
      date: `${months[selectedDate.month]} ${selectedDate.day}, ${
        selectedDate.year
      }`,
      time: selectedTime.nextElementSibling.textContent
        .replace(" (Already Booked)", "")
        .trim(),
      people: selectedPeople,
      paymentMethod: selectedPayment.value,
      price: price,
      type: "large", // Indicates this is a large studio booking
    };

    if (
      !confirm(
        `Confirm Booking?\n📅 Date: ${bookingDetails.date}\n⏰ Time: ${bookingDetails.time}\n👥 People: ${bookingDetails.people}\n💳 Payment: ${bookingDetails.paymentMethod}\n\nPrice: ₱${price}.00 (₱25 per person)`
      )
    ) {
      return;
    }

    bookedSlots.push(bookingDetails);
    saveBookings();

    // If connected to backend, send booking to server
    if (window.bookingApi) {
      const backendBookingData = {
        sessionType: "studio",
        date: bookingDetails.date,
        time: bookingDetails.time,
        studioType: "large",
        numberOfPeople: parseInt(bookingDetails.people),
        price: bookingDetails.price,
        paymentMethod: bookingDetails.paymentMethod,
      };

      window.bookingApi
        .bookStudioSession(backendBookingData)
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
      `✅ Dance Studio Booking Confirmed!\n📅 Date: ${bookingDetails.date}\n⏰ Time: ${bookingDetails.time}\n👥 People: ${bookingDetails.people}\n💳 Payment: ${bookingDetails.paymentMethod}\n\nPrice: ₱${price}.00\n\nYou can view your booking in your schedule.`
    );

    // Redirect to user schedule page after a short delay
    setTimeout(() => {
      window.location.href = "user-schedule-studio.html";
    }, 1500);
  }

  // Cancel button - Reset selections
  cancelButton.addEventListener("click", () => {
    selectedDate = null;
    selectedTime = null;
    selectedPeople = null;
    peopleQuantity.value = "";

    timeSlots.forEach((slot) => {
      slot.checked = false;
      slot.nextElementSibling.innerHTML = slot.nextElementSibling.textContent
        .replace(" (Already Booked)", "")
        .trim();
      slot.parentElement.style.color = "";
    });

    updateAvailableTimeSlots();
    renderCalendar();
    closePaymentPopup();
  });

  // Initial render
  renderCalendar();

  const peopleInput = document.getElementById("people-quantity");
  const paymentModal = document.querySelector(".payment-modal");
  const paymentMethodInputs = document.querySelectorAll(
    'input[name="payment-method"]'
  );
  const priceDisplay = document.querySelector(".price-display");
  const gcashAmount = document.querySelector(".gcash-amount");
  const onsiteAmount = document.querySelector(".onsite-amount");
  const confirmPaymentBtn = document.querySelector(".confirm-payment-btn");
  const cancelPaymentBtn = document.querySelector(".cancel-payment-btn");
  const gcashDetails = document.getElementById("gcash-details");
  const onsiteDetails = document.getElementById("onsite-details");

  function updatePriceDisplay(numberOfPeople) {
    const price = numberOfPeople * 25; // ₱25 per person
    const formattedPrice = `₱${price.toFixed(2)}`;
    priceDisplay.textContent = formattedPrice;
    gcashAmount.textContent = formattedPrice;
    onsiteAmount.textContent = formattedPrice;
  }

  peopleInput?.addEventListener("input", (e) => {
    const value = parseInt(e.target.value) || 0;
    if (value < 4) {
      e.target.setCustomValidity(
        "Minimum 4 people required for large studio booking"
      );
    } else if (value > 30) {
      e.target.setCustomValidity("Maximum 30 people allowed");
    } else {
      e.target.setCustomValidity("");
    }
    updatePriceDisplay(value);
  });

  // Payment method selection handlers
  paymentMethodInputs.forEach((input) => {
    input.addEventListener("change", () => {
      gcashDetails.classList.toggle("hidden", input.value !== "Gcash");
      onsiteDetails.classList.toggle("hidden", input.value !== "Onsite");
    });
  });

  document.querySelector(".ok-btn")?.addEventListener("click", () => {
    const selectedTimeInput = document.querySelector(
      'input[name="time-slot"]:checked'
    );
    const numberOfPeople = parseInt(peopleInput.value);

    if (
      !selectedDate ||
      !selectedTimeInput ||
      !numberOfPeople ||
      numberOfPeople < 4
    ) {
      let errorMessage = "Please complete the following:\n";
      if (!selectedDate) errorMessage += "• Select a date\n";
      if (!selectedTimeInput) errorMessage += "• Select a time slot\n";
      if (!numberOfPeople || numberOfPeople < 4)
        errorMessage += "• Enter number of people (minimum 4)\n";
      alert(errorMessage);
      return;
    }

    selectedTime = selectedTimeInput.value;
    const dateStr = `${months[selectedDate.month]} ${selectedDate.day}, ${
      selectedDate.year
    }`;

    document.querySelector(".booking-details").innerHTML = `
      Date: ${dateStr}<br>
      Time: ${selectedTime}<br>
      Group Size: ${numberOfPeople} people
    `;

    paymentModal.classList.remove("hidden");
  });

  document.querySelector(".cancel-btn")?.addEventListener("click", () => {
    window.location.href = "dance-studio.html";
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
    const numberOfPeople = parseInt(peopleInput.value);
    const totalPrice = numberOfPeople * 25;

    const bookingDetails = {
      date: dateStr,
      time: selectedTime,
      numberOfPeople: numberOfPeople,
      paymentMethod: selectedPayment.value,
      pricePerPerson: 25,
      totalPrice: totalPrice,
    };

    if (
      confirm(
        `Confirm Large Studio Booking?\n\n📅 Date: ${
          bookingDetails.date
        }\n⏰ Time: ${bookingDetails.time}\n👥 Group Size: ${
          bookingDetails.numberOfPeople
        } people\n💳 Payment: ${
          bookingDetails.paymentMethod
        }\n\nPrice: ₱${totalPrice.toFixed(2)} (₱25 per person)`
      )
    ) {
      // Save booking
      const bookedSlots = JSON.parse(
        localStorage.getItem("largeStudioBookings") || "[]"
      );
      bookedSlots.push(bookingDetails);
      localStorage.setItem("largeStudioBookings", JSON.stringify(bookedSlots));

      // Send to backend if available
      if (window.bookingApi) {
        window.bookingApi
          .bookStudio({
            studioType: "large",
            date: bookingDetails.date,
            time: bookingDetails.time,
            numberOfPeople: bookingDetails.numberOfPeople,
            paymentMethod: bookingDetails.paymentMethod,
            totalPrice: bookingDetails.totalPrice,
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
        `✅ Large Studio Booking Confirmed!\n\n📅 Date: ${
          bookingDetails.date
        }\n⏰ Time: ${bookingDetails.time}\n👥 Group Size: ${
          bookingDetails.numberOfPeople
        } people\n💳 Payment: ${
          bookingDetails.paymentMethod
        }\n\nTotal Price: ₱${totalPrice.toFixed(
          2
        )}\n\nYou can view your booking in your schedule.`
      );

      setTimeout(() => {
        window.location.href = "user-schedule-studio.html";
      }, 1500);
    }
  });

  // Calendar navigation and date selection code remains the same
  // ...
});
