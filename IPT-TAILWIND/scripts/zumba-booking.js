document.addEventListener("DOMContentLoaded", () => {
  const desktopSelect = document.getElementById("selected_time_date_zumba");
  const mobileSelect = document.getElementById("mobile_time_date_zumba");
  const zumbaButtons = document.querySelectorAll(".zumba-card button");
  const paymentModal = document.querySelector(".payment-modal");
  const cancelPaymentBtn = document.querySelector(".cancel-payment-btn");
  const confirmPaymentBtn = document.querySelector(".confirm-payment-btn");
  const paymentMethodInputs = document.querySelectorAll(
    'input[name="payment-method"]'
  );
  const gcashDetails = document.getElementById("gcash-details");
  const onsiteDetails = document.getElementById("onsite-details");

  // Initialize from localStorage
  let bookedSessions = JSON.parse(
    localStorage.getItem("zumbaBookings") || "[]"
  );

  function showModal() {
    paymentModal.classList.remove("opacity-0", "pointer-events-none");
  }

  function hideModal() {
    paymentModal.classList.add("opacity-0", "pointer-events-none");
  }

  // Payment method selection handlers
  paymentMethodInputs.forEach((input) => {
    input.addEventListener("change", () => {
      gcashDetails.classList.toggle("hidden", input.value !== "Gcash");
      onsiteDetails.classList.toggle("hidden", input.value !== "Onsite");

      // Enable pay now button and update styling based on payment method
      confirmPaymentBtn.classList.remove("bg-gray-500");
      if (input.value === "Gcash") {
        confirmPaymentBtn.classList.add("bg-blue-600", "hover:bg-blue-800");
      } else {
        confirmPaymentBtn.classList.add("bg-green-600", "hover:bg-green-800");
      }
    });
  });

  // Handle booking button clicks
  zumbaButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const selectedDay = e.target
        .closest(".zumba-card")
        .querySelector("select").value;

      if (!selectedDay) {
        alert("Please select a day and time first");
        return;
      }

      // Check if session is already booked
      if (bookedSessions.includes(selectedDay)) {
        alert("This session is already booked. Please select another session.");
        return;
      }

      // Update booking details in payment modal
      document.querySelector(
        ".booking-details"
      ).textContent = `${selectedDay} at 7:00 AM - 8:00 AM`;
      showModal();
    });
  });

  // Cancel payment
  cancelPaymentBtn?.addEventListener("click", hideModal);

  // Confirm payment and booking
  confirmPaymentBtn?.addEventListener("click", () => {
    const selectedPayment = document.querySelector(
      'input[name="payment-method"]:checked'
    );
    const selectedDay = desktopSelect.value || mobileSelect.value;

    if (!selectedPayment) {
      alert("Please select a payment method");
      return;
    }

    const bookingDetails = {
      day: selectedDay,
      time: "7:00 AM - 8:00 AM",
      paymentMethod: selectedPayment.value,
      price: 150,
    };

    if (
      !confirm(
        `Confirm Zumba Session?\n\n` +
          `📅 Day: ${bookingDetails.day}\n` +
          `⏰ Time: ${bookingDetails.time}\n` +
          `💳 Payment: ${bookingDetails.paymentMethod}\n\n` +
          `Price: ₱150.00`
      )
    ) {
      return;
    }

    // Save booking
    bookedSessions.push(selectedDay);
    localStorage.setItem("zumbaBookings", JSON.stringify(bookedSessions));

    // If connected to backend, send booking to server
    if (window.bookingApi) {
      const backendBookingData = {
        sessionType: "zumba",
        day: bookingDetails.day,
        time: bookingDetails.time,
        price: bookingDetails.price,
        paymentMethod: bookingDetails.paymentMethod,
      };

      window.bookingApi
        .bookZumbaSession(backendBookingData)
        .then((response) => {
          console.log("Booking saved to database:", response);
        })
        .catch((error) => {
          console.error("Failed to save booking to database:", error);
        });
    }

    hideModal();

    alert(
      `✅ Zumba Session Confirmed!\n\n` +
        `📅 Day: ${bookingDetails.day}\n` +
        `⏰ Time: ${bookingDetails.time}\n` +
        `💳 Payment: ${bookingDetails.paymentMethod}\n\n` +
        `You can view your bookings in your schedule.`
    );

    // Redirect to schedule page after a short delay
    setTimeout(() => {
      window.location.href = "user-schedule-zumba.html";
    }, 1500);
  });

  // Update select options to show booked sessions
  function updateBookedSessionsUI() {
    [desktopSelect, mobileSelect].forEach((select) => {
      if (!select) return;

      const options = select.querySelectorAll("option");
      options.forEach((option) => {
        const isBooked = bookedSessions.includes(option.value);
        if (isBooked && option.value) {
          option.disabled = true;
          option.textContent = option.textContent + " (Already Booked)";
        }
      });
    });
  }

  // Initialize UI
  updateBookedSessionsUI();
});
