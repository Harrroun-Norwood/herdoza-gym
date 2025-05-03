const gym_payment_summary = [
  {
    id: "gym-full",
    pass: "30 days",
    description: "Get full access to our gym equipment for 30 days.",
    price: 500,
    function_no: 1,
    duration: 30,
  },
  {
    id: "gym-half",
    pass: "15 days",
    description: "Get full access to our gym equipment for 15 days.",
    price: 250, // Updated from 150 to 250 as per requirements
    function_no: 2,
    duration: 15,
  },
  {
    id: "gym-regular",
    pass: "Regular",
    description:
      "Get full access to our gym equipment for as long as you stay in gym days.",
    price: 40,
    function_no: 3,
    duration: 1,
  },
  {
    id: "trainer-single",
    pass: "1 Day with Trainer",
    description:
      "Single training session with our professional fitness expert.",
    price: 100,
    function_no: 4,
    duration: 1,
    hasTrainer: true,
  },
  {
    id: "trainer-25",
    pass: "25 Days with Trainer",
    description: "25 training sessions with our professional fitness expert.",
    price: 2000,
    function_no: 5,
    duration: 25,
    hasTrainer: true,
  },
];

let gym_paymentSummaryHTML = "";

gym_payment_summary.forEach((gym_payment) => {
  gym_paymentSummaryHTML += `
        <div class="payment-summary text-white bg-black-1 max-w-2xl mx-auto" id="${gym_payment.id}">
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
                            ${gym_payment.pass}
                        </div>
                        <div class="text-gray-300">
                            ${gym_payment.description}
                        </div>
                    </div>

                    <div class="bg-none md:bg-red-600 amount flex flex-col justify-center items-center px-6 py-4 my-2 mx-2 rounded-lg">
                        <div class="text-sm">
                            Amount
                        </div>
                        <div class="font-bold text-3xl md:text-2xl">
                            ₱${gym_payment.price}
                        </div>
                    </div>
                </div>

                <form id="paymentForm_${gym_payment.id}" class="payment-form">
                    <div class="text-center text-sm mb-4">Payment Method</div>
                    <div class="flex gap-4 justify-center mb-6">
                        <label>
                            <input type="radio" name="payment_method_${gym_payment.id}" value="Gcash" required class="hidden peer/gcash" />
                            <div class="bg-red-600 peer-checked/gcash:bg-blue-700 hover:cursor-pointer hover:bg-red-700 transition-all
                                        text-sm px-6 py-2 sm:text-base sm:px-8 sm:py-2 rounded-lg text-white text-center">
                                Gcash
                            </div>
                        </label>

                        <label>
                            <input type="radio" name="payment_method_${gym_payment.id}" value="Onsite" required class="hidden peer/onsite" />
                            <div class="bg-red-600 peer-checked/onsite:bg-green-700 hover:cursor-pointer hover:bg-red-700 transition-all
                                        text-sm px-6 py-2 sm:text-base sm:px-8 sm:py-2 rounded-lg text-white text-center">
                                Cash(Onsite)
                            </div>
                        </label>
                    </div>

                    <div id="gcashDetails_${gym_payment.id}" class="gcash-details hidden mb-6">
                        <div class="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 p-4 rounded-lg text-center">
                            <p class="font-bold mb-3">GCash Payment Details</p>
                            <div class="flex justify-center mb-4">
                                <img src="./assets/instapay-qr.jpg" alt="GCash QR Code" class="w-48 h-48 rounded-lg shadow-lg">
                            </div>
                            <p class="mb-1">Send payment to: <span class="font-bold">09307561163</span></p>
                            <p class="mb-3">Amount: ₱${gym_payment.price}.00</p>
                            <p class="text-xs mt-2">After scanning and sending payment:</p>
                            <p class="text-xs text-blue-700 dark:text-blue-300 mt-1">Note: Registration will be pending until proof of payment is verified</p>
                        </div>
                    </div>

                    <div id="onsiteDetails_${gym_payment.id}" class="onsite-details hidden mb-6">
                        <div class="bg-amber-100 text-amber-800 p-4 rounded-lg text-center">
                            <p class="font-bold mb-2">Cash Payment (Onsite)</p>
                            <p class="mb-2">Please pay at the gym reception counter</p>
                            <p class="mb-3">Amount: ₱${gym_payment.price}.00</p>
                            <p class="text-xs mt-2">Your reservation will be pending until payment is received at the gym</p>
                        </div>
                    </div>

                    <hr class="border-gray-700">
                    <div class="text-center md:text-end mt-4">
                        <button type="button"
                            class="cancel-btn bg-red-600 hover:bg-red-700 transition-all mx-2 text-base font-bold px-8 py-2 rounded-lg">
                            Cancel
                        </button>
                        <button type="button"
                            class="pay-now-btn bg-gray-500 hover:bg-gray-600 transition-all text-base font-bold px-8 py-2 rounded-lg cursor-pointer">
                            Pay now
                        </button>
                    </div>
                </form>
            </div>
        </div>`;
});

document.querySelector(".pop-up-con").innerHTML = gym_paymentSummaryHTML;

document.addEventListener("DOMContentLoaded", function () {
  const overlay = document.createElement("div");
  overlay.classList.add("overlay", "hidden");
  document.body.appendChild(overlay);

  // Create a success modal element for membership confirmation
  const successModal = document.createElement("div");
  successModal.classList.add("success-modal", "hidden");
  successModal.innerHTML = `
        <div class="bg-white p-6 rounded-lg max-w-md mx-auto text-center">
            <div class="text-green-600 text-5xl mb-4"><i class="bi bi-check-circle-fill"></i></div>
            <h3 class="text-2xl font-bold mb-2">Payment Confirmed!</h3>
            <p class="mb-4 payment-details"></p>
            <p class="mb-6 membership-update"></p>
            <button class="bg-red-600 hover:bg-red-700 text-white py-2 px-8 rounded-lg font-bold view-membership-btn">
                View My Membership
            </button>
        </div>
    `;
  document.body.appendChild(successModal);

  // Create a pending reservation modal for onsite payments
  const pendingModal = document.createElement("div");
  pendingModal.classList.add("pending-modal", "hidden");
  pendingModal.innerHTML = `
        <div class="bg-white p-6 rounded-lg max-w-md mx-auto text-center">
            <div class="text-amber-500 text-5xl mb-4"><i class="bi bi-clock-fill"></i></div>
            <h3 class="text-2xl font-bold mb-2">Reservation Pending!</h3>
            <p class="mb-4 reservation-details"></p>
            <p class="mb-6 reservation-instruction text-amber-700">Please visit the gym to complete your payment.</p>
            <div class="flex justify-center gap-4">
                <button class="bg-gray-500 hover:bg-gray-700 text-white py-2 px-8 rounded-lg font-bold close-pending-btn">
                    Close
                </button>
                <button class="bg-red-600 hover:bg-red-700 text-white py-2 px-8 rounded-lg font-bold view-reservations-btn">
                    My Reservations
                </button>
            </div>
        </div>
    `;
  document.body.appendChild(pendingModal);

  // Create custom alert modal
  const customAlertModal = document.createElement("div");
  customAlertModal.classList.add("custom-alert-modal", "hidden");
  customAlertModal.innerHTML = `
        <div class="bg-white p-6 rounded-lg max-w-md mx-auto text-center">
            <div class="text-blue-600 text-5xl mb-4"><i class="bi bi-info-circle-fill"></i></div>
            <p class="mb-6 alert-message"></p>
            <button class="bg-blue-600 hover:bg-blue-700 text-white py-2 px-8 rounded-lg font-bold alert-okay-btn">
                Okay
            </button>
        </div>
    `;
  document.body.appendChild(customAlertModal);

  // Create custom confirm modal
  const customConfirmModal = document.createElement("div");
  customConfirmModal.classList.add("custom-confirm-modal", "hidden");
  customConfirmModal.innerHTML = `
        <div class="bg-white p-6 rounded-lg max-w-md mx-auto text-center">
            <div class="text-amber-600 text-5xl mb-4"><i class="bi bi-question-circle-fill"></i></div>
            <p class="mb-6 confirm-message"></p>
            <div class="flex justify-center gap-4">
                <button class="bg-gray-500 hover:bg-gray-700 text-white py-2 px-8 rounded-lg font-bold confirm-cancel-btn">
                    Cancel
                </button>
                <button class="bg-blue-600 hover:bg-blue-700 text-white py-2 px-8 rounded-lg font-bold confirm-okay-btn">
                    Confirm
                </button>
            </div>
        </div>
    `;
  document.body.appendChild(customConfirmModal);

  // Custom alert function to replace standard alert()
  function showCustomAlert(message, callback) {
    customAlertModal.querySelector(".alert-message").textContent = message;
    customAlertModal.classList.remove("hidden");
    overlay.classList.remove("hidden");
    document.body.style.overflow = "hidden";

    customAlertModal.querySelector(".alert-okay-btn").onclick = function () {
      customAlertModal.classList.add("hidden");
      overlay.classList.add("hidden");
      document.body.style.overflow = "";
      if (typeof callback === "function") {
        callback();
      }
    };
  }

  // Custom confirm function to replace standard confirm()
  function showCustomConfirm(message, onConfirm, onCancel) {
    customConfirmModal.querySelector(".confirm-message").textContent = message;
    customConfirmModal.classList.remove("hidden");
    overlay.classList.remove("hidden");
    document.body.style.overflow = "hidden";

    const confirmBtn = customConfirmModal.querySelector(".confirm-okay-btn");
    // Remove any existing event listeners
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

    newConfirmBtn.addEventListener("click", function () {
      customConfirmModal.classList.add("hidden");
      overlay.classList.add("hidden");
      document.body.style.overflow = "";
      // Ensure callback is executed after modal is hidden
      setTimeout(() => {
        if (typeof onConfirm === "function") {
          onConfirm();
        }
      }, 100);
    });

    const cancelBtn = customConfirmModal.querySelector(".confirm-cancel-btn");
    // Remove any existing event listeners
    const newCancelBtn = cancelBtn.cloneNode(true);
    cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);

    newCancelBtn.addEventListener("click", function () {
      customConfirmModal.classList.add("hidden");
      overlay.classList.add("hidden");
      document.body.style.overflow = "";
      if (typeof onCancel === "function") {
        onCancel();
      }
    });
  }

  function openPopup(id) {
    document.getElementById(id).classList.add("open-payment-summary");
    overlay.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  }

  function closePopup(id) {
    document.getElementById(id).classList.remove("open-payment-summary");
    overlay.classList.add("hidden");
    document.body.style.overflow = "";
  }

  // Helper function to ensure overlay is removed
  function ensureOverlayRemoved() {
    overlay.classList.add("hidden");
    document.body.style.overflow = "";
  }

  function showSuccessModal(passDetails, isRenewal) {
    const action = isRenewal ? "renewed" : "purchased";

    successModal.querySelector(
      ".payment-details"
    ).textContent = `You've successfully ${action} the ${passDetails.pass} pass for ₱${passDetails.price}`;

    const updateText = isRenewal
      ? `Your membership has been renewed for ${passDetails.duration} day(s)`
      : `Your membership has been extended by ${passDetails.duration} day(s)`;

    successModal.querySelector(".membership-update").textContent = updateText;

    successModal.classList.remove("hidden");
    overlay.classList.remove("hidden");
    document.body.style.overflow = "hidden";

    // Redirect to membership page when clicking the button
    successModal.querySelector(".view-membership-btn").onclick = function () {
      successModal.classList.add("hidden");
      overlay.classList.add("hidden");
      document.body.style.overflow = "";
      window.location.href = "user-membership.html";
    };
  }

  function showPendingModal(passDetails) {
    pendingModal.querySelector(
      ".reservation-details"
    ).textContent = `Your reservation for the ${passDetails.pass} pass (₱${passDetails.price}) is pending.`;

    pendingModal.classList.remove("hidden");
    overlay.classList.remove("hidden");
    document.body.style.overflow = "hidden";

    // Close the modal
    pendingModal.querySelector(".close-pending-btn").onclick = function () {
      pendingModal.classList.add("hidden");
      overlay.classList.add("hidden");
      document.body.style.overflow = "";
    };

    // Show reservations - using custom alert
    pendingModal.querySelector(".view-reservations-btn").onclick = function () {
      pendingModal.classList.add("hidden");
      overlay.classList.add("hidden");
      document.body.style.overflow = "";

      // Show custom alert with delay to ensure overlay cleanup
      setTimeout(() => {
        showCustomAlert(
          "This would show your pending reservations. Feature coming soon!"
        );
      }, 50);
    };
  }

  // Update database function - now handles renewal vs extension and connects to MongoDB
  function updateMembership(passDetails, paymentMethod) {
    // Check if this is a renewal or an extension
    const isRenewal = localStorage.getItem("membershipRenewal") === "true";

    // Check if this is an onsite payment (which means it's pending)
    const isPending = paymentMethod === "Onsite";

    // Log transaction details to console (would be a server API call in production)
    console.log(
      `Logging transaction: ${passDetails.pass}, ₱${passDetails.price}, ${paymentMethod}, Renewal: ${isRenewal}, Pending: ${isPending}`
    );

    if (isPending) {
      // Store the pending reservation in localStorage
      savePendingReservation(passDetails, isRenewal);

      // Show the pending modal
      showPendingModal(passDetails);
      return;
    }

    // For GCash payments, process immediately

    // Get current membership data (if any)
    let currentMembershipData = null;
    if (window.membershipManager) {
      // If we're on a page with the membership manager loaded, use it
      currentMembershipData = window.membershipManager.getMembershipData();
    } else {
      // Otherwise, fetch directly from localStorage
      const storedData = localStorage.getItem("membershipData");
      if (storedData) {
        currentMembershipData = JSON.parse(storedData);
      }
    }

    // Calculate new membership duration based on whether it's a renewal or extension
    let newDuration = passDetails.duration || 0;

    // If it's not a renewal and there's existing membership, add the new duration
    if (
      !isRenewal &&
      currentMembershipData &&
      currentMembershipData.daysLeft > 0
    ) {
      newDuration += currentMembershipData.daysLeft;
    }

    // Update the membership data
    const updatedMembership = {
      daysLeft: newDuration,
      fee: passDetails.price,
      nextPaymentDate: calculateNextPaymentDate(newDuration),
      purchaseDate: new Date().toISOString(),
      originalDuration: newDuration,
    };

    // Save to localStorage
    localStorage.setItem("membershipData", JSON.stringify(updatedMembership));

    // Determine the type of membership for MongoDB
    let membershipType = "";
    switch (passDetails.id) {
      case "gym-full":
        membershipType = "full";
        break;
      case "gym-half":
        membershipType = "half";
        break;
      case "gym-regular":
        membershipType = "regular";
        break;
      case "trainer-single":
        membershipType = "trainer-single";
        break;
      case "trainer-25":
        membershipType = "trainer-25";
        break;
    }

    // Create MongoDB-ready membership data
    const mongoMembershipData = {
      type: membershipType,
      duration: newDuration,
      fee: passDetails.price,
      hasTrainer: passDetails.hasTrainer || false,
      paymentMethod: paymentMethod,
    };

    // Attempt to update MongoDB if user is logged in with backend auth
    if (
      localStorage.getItem("userToken") &&
      localStorage.getItem("userToken") !== "demo-token"
    ) {
      // Only try to update backend if we have a real auth token
      if (window.authApi && window.authApi.updateMembership) {
        window.authApi
          .updateMembership(mongoMembershipData)
          .then((response) => {
            console.log("Membership updated in MongoDB:", response);
          })
          .catch((error) => {
            console.error("Failed to update membership in MongoDB:", error);
            // We'll still continue with localStorage updates even if MongoDB fails
          });
      }
    }

    // Clear the renewal flag
    localStorage.removeItem("membershipRenewal");

    // Show confirmation modal
    showSuccessModal(passDetails, isRenewal);
  }

  function calculateNextPaymentDate(days) {
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + days);
    return nextDate.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  function handlePayment(paymentId) {
    const form = document.getElementById(`paymentForm_${paymentId}`);
    const selectedPayment = form.querySelector(
      `input[name="payment_method_${paymentId}"]:checked`
    );

    if (!selectedPayment) {
      const paymentOptions = form.querySelectorAll(
        `input[name="payment_method_${paymentId}"] + div`
      );
      paymentOptions.forEach((option) => {
        option.style.border = "2px solid red";
        setTimeout(() => {
          option.style.border = "none";
        }, 2000);
      });

      // Use custom alert instead of browser alert
      showCustomAlert(
        "Please select a payment method (GCash or onsite) before proceeding."
      );
      return;
    }

    const paymentOption = gym_payment_summary.find(
      (opt) => opt.id === paymentId
    );
    const paymentMethod = selectedPayment.value;

    let confirmMessage = `Confirm purchase of ${paymentOption.pass} for ₱${paymentOption.price} via ${paymentMethod}?`;

    if (paymentMethod === "Onsite") {
      confirmMessage +=
        "\n\nNote: Your membership will be activated after payment at the gym.";
    }

    // Close popup first to prevent overlay issues
    closePopup(paymentId);

    // Use custom confirm with callbacks instead of browser confirm
    showCustomConfirm(
      confirmMessage,
      // Confirm callback
      function () {
        // Update membership and log transaction
        updateMembership(paymentOption, paymentMethod);
      },
      // Cancel callback
      function () {
        // Ensure overlay is removed if user cancels
        ensureOverlayRemoved();
      }
    );
  }

  // Show/hide payment details when payment method is selected
  document
    .querySelectorAll('input[type="radio"][value="Gcash"]')
    .forEach((radio) => {
      radio.addEventListener("change", function () {
        const paymentId = this.name.replace("payment_method_", "");
        document
          .getElementById(`gcashDetails_${paymentId}`)
          .classList.remove("hidden");
        document
          .getElementById(`onsiteDetails_${paymentId}`)
          .classList.add("hidden");

        // Enable the Pay Now button
        const payNowBtn = this.closest("form").querySelector(".pay-now-btn");
        payNowBtn.classList.remove("bg-gray-500");
        payNowBtn.classList.add("bg-blue-600", "hover:bg-blue-800");
      });
    });

  document
    .querySelectorAll('input[type="radio"][value="Onsite"]')
    .forEach((radio) => {
      radio.addEventListener("change", function () {
        const paymentId = this.name.replace("payment_method_", "");
        document
          .getElementById(`gcashDetails_${paymentId}`)
          .classList.add("hidden");
        document
          .getElementById(`onsiteDetails_${paymentId}`)
          .classList.remove("hidden");

        // Enable the Pay Now button
        const payNowBtn = this.closest("form").querySelector(".pay-now-btn");
        payNowBtn.classList.remove("bg-gray-500");
        payNowBtn.classList.add("bg-green-600", "hover:bg-green-800");
      });
    });

  document.querySelectorAll(".pay-now-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const form = this.closest("form");
      const paymentId = form.id.replace("paymentForm_", "");
      handlePayment(paymentId);
    });
  });

  document.addEventListener("click", function (e) {
    if (e.target.classList.contains("cancel-btn")) {
      const popup = e.target.closest(".payment-summary");
      if (popup) {
        closePopup(popup.id);
      }
    }
  });

  // Fix for overlay getting stuck - add a global handler
  document.addEventListener("keydown", function (e) {
    // If Escape key is pressed
    if (e.key === "Escape") {
      ensureOverlayRemoved();

      // Hide all modals
      successModal.classList.add("hidden");
      pendingModal.classList.add("hidden");
      customAlertModal.classList.add("hidden");
      customConfirmModal.classList.add("hidden");

      // Reset body overflow
      document.body.style.overflow = "";
    }
  });

  // Add click handler to overlay to close modals when clicking outside
  overlay.addEventListener("click", function () {
    // Don't allow dismiss for some modals
    if (
      !customAlertModal.classList.contains("hidden") ||
      !customConfirmModal.classList.contains("hidden")
    ) {
      // Don't close these by clicking outside
      return;
    }

    ensureOverlayRemoved();
    successModal.classList.add("hidden");
    pendingModal.classList.add("hidden");
  });

  gym_payment_summary.forEach((gym_payment) => {
    window[`openPopup${gym_payment.function_no}`] = () =>
      openPopup(gym_payment.id);
    window[`closePopup${gym_payment.function_no}`] = () =>
      closePopup(gym_payment.id);
  });

  // Add custom CSS for the modals and animations
  const style = document.createElement("style");
  style.textContent = `
    .custom-alert-modal,
    .custom-confirm-modal,
    .success-modal,
    .pending-modal,
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
    
    .custom-alert-modal.hidden,
    .custom-confirm-modal.hidden,
    .success-modal.hidden,
    .pending-modal.hidden {
      display: none;
    }

    .payment-summary.open-payment-summary,
    .custom-alert-modal:not(.hidden),
    .custom-confirm-modal:not(.hidden),
    .success-modal:not(.hidden),
    .pending-modal:not(.hidden) {
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

  // Function to save pending reservation with MongoDB support
  function savePendingReservation(passDetails, isRenewal) {
    // Get existing pending reservations
    let pendingReservations = JSON.parse(
      localStorage.getItem("pendingReservations") || "[]"
    );

    // Create a new reservation
    const newReservation = {
      id: Date.now().toString(),
      pass: passDetails.pass,
      price: passDetails.price,
      duration: passDetails.duration || 0,
      isRenewal: isRenewal,
      dateCreated: new Date().toISOString(),
      status: "pending",
      hasTrainer: passDetails.hasTrainer || false,
    };

    // Add to pending reservations
    pendingReservations.push(newReservation);

    // Save back to localStorage
    localStorage.setItem(
      "pendingReservations",
      JSON.stringify(pendingReservations)
    );

    // Determine the type of membership for MongoDB
    let membershipType = "";
    switch (passDetails.id) {
      case "gym-full":
        membershipType = "full";
        break;
      case "gym-half":
        membershipType = "half";
        break;
      case "gym-regular":
        membershipType = "regular";
        break;
      case "trainer-single":
        membershipType = "trainer-single";
        break;
      case "trainer-25":
        membershipType = "trainer-25";
        break;
    }

    // Create MongoDB-ready membership data for pending reservation
    const mongoReservationData = {
      type: membershipType,
      duration: passDetails.duration || 0,
      fee: passDetails.price,
      hasTrainer: passDetails.hasTrainer || false,
      paymentMethod: "Onsite",
      status: "pending",
    };

    // Attempt to send to MongoDB if user is authenticated
    if (
      localStorage.getItem("userToken") &&
      localStorage.getItem("userToken") !== "demo-token"
    ) {
      // Only try to update backend if we have a real auth token
      if (window.authApi && window.authApi.updateMembership) {
        window.authApi
          .updateMembership(mongoReservationData)
          .then((response) => {
            console.log("Pending reservation created in MongoDB:", response);
          })
          .catch((error) => {
            console.error("Failed to create reservation in MongoDB:", error);
          });
      }
    }
  }
});
