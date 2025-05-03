document.addEventListener("DOMContentLoaded", () => {
  const zumbaButtons = document.querySelectorAll(
    '.zumba-card button[type="button"]'
  );
  const paymentModal = document.querySelector(".payment-modal");
  const paymentMethodInputs = document.querySelectorAll(
    'input[name="payment-method"]'
  );
  const gcashDetails = document.getElementById("gcash-details");
  const onsiteDetails = document.getElementById("onsite-details");
  const cancelPaymentBtn = document.querySelector(".cancel-payment-btn");
  const confirmPaymentBtn = document.querySelector(".confirm-payment-btn");

  // Initialize from localStorage
  let bookedSessions = JSON.parse(
    localStorage.getItem("zumbaBookings") || "[]"
  );

  // Payment method selection handlers
  paymentMethodInputs.forEach((input) => {
    input.addEventListener("change", () => {
      gcashDetails.classList.toggle("hidden", input.value !== "Gcash");
      onsiteDetails.classList.toggle("hidden", input.value !== "Onsite");
    });
  });

  function showPaymentModal(selectedSession) {
    document.querySelector(".booking-details").textContent = selectedSession;
    paymentModal.classList.remove("hidden");
  }

  cancelPaymentBtn?.addEventListener("click", () => {
    paymentModal.classList.add("hidden");
  });

  confirmPaymentBtn?.addEventListener("click", () => {
    const selectedPayment = document.querySelector(
      'input[name="payment-method"]:checked'
    );
    const selectedSession = document.querySelector(".zumba-card select").value;

    if (!selectedPayment) {
      alert("Please select a payment method");
      return;
    }

    if (!selectedSession) {
      alert("Please select a Zumba session first");
      return;
    }

    const bookingDetails = {
      session: selectedSession,
      paymentMethod: selectedPayment.value,
      price: 80, // Fixed price for Zumba sessions
    };

    if (
      confirm(
        `Confirm Zumba Session?\n\n⏰ Session: ${bookingDetails.session}\n💳 Payment: ${bookingDetails.paymentMethod}\n\nPrice: ₱80.00`
      )
    ) {
      // Save booking
      bookedSessions.push(bookingDetails.session);
      localStorage.setItem("zumbaBookings", JSON.stringify(bookedSessions));

      // If connected to backend, send booking to server
      if (window.bookingApi) {
        const backendBookingData = {
          sessionType: "zumba",
          date: new Date().toISOString().split("T")[0],
          time: bookingDetails.session,
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

      // Update UI and show confirmation
      updateBookedSessionsUI();
      paymentModal.classList.add("hidden");
      alert(
        `✅ Zumba Session Confirmed!\n\n⏰ Session: ${bookingDetails.session}\n💳 Payment: ${bookingDetails.paymentMethod}\n\nYou can view your booking in your schedule.`
      );

      // Redirect to schedule page
      setTimeout(() => {
        window.location.href = "user-schedule-zumba.html";
      }, 1500);
    }
  });

  // Update the interface to reflect booked sessions
  function updateBookedSessionsUI() {
    const selects = document.querySelectorAll(".zumba-card select");
    selects.forEach((select) => {
      const options = select.querySelectorAll("option");
      options.forEach((option) => {
        const isBooked = bookedSessions.some(
          (session) => session === option.value
        );
        if (isBooked && option.value) {
          option.disabled = true;
          option.textContent = option.textContent + " (Already Booked)";
        }
      });
    });
  }

  // Event listener for all Zumba booking buttons
  zumbaButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      const card = e.target.closest(".zumba-card");
      const select = card.querySelector("select");
      const selectedSession = select?.value;

      if (!selectedSession) {
        alert("Please select a day and time first.");
        return;
      }

      // Check if session is already booked
      if (bookedSessions.includes(selectedSession)) {
        alert("This session is already booked. Please select another session.");
        return;
      }

      // Show payment modal
      showPaymentModal(selectedSession);
    });
  });

  // Initialize UI
  updateBookedSessionsUI();
});
