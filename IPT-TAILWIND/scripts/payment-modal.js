document.addEventListener("DOMContentLoaded", () => {
  const paymentModal = document.querySelector(".payment-modal");
  const paymentForm = document.querySelector("#payment-form");
  const gcashDetails = document.getElementById("gcash-details");
  const onsiteDetails = document.getElementById("onsite-details");
  const confirmPaymentBtn = document.querySelector(".confirm-payment-btn");

  function showPaymentModal() {
    if (paymentModal) {
      paymentModal.classList.remove("opacity-0", "pointer-events-none");
      document.body.style.overflow = "hidden";

      // Center content and handle overflow properly
      const modalContent = paymentModal.querySelector(".bg-black-2");
      if (modalContent) {
        modalContent.style.maxHeight = "90vh";
        modalContent.style.overflow = "auto";
      }
    }
  }

  function hidePaymentModal() {
    if (paymentModal) {
      paymentModal.classList.add("opacity-0", "pointer-events-none");
      document.body.style.overflow = "";

      // Reset form
      paymentForm?.reset();

      // Hide payment details
      gcashDetails?.classList.add("hidden");
      onsiteDetails?.classList.add("hidden");

      // Reset button styles
      if (confirmPaymentBtn) {
        confirmPaymentBtn.classList.remove(
          "bg-blue-600",
          "bg-green-600",
          "hover:bg-blue-700",
          "hover:bg-green-700"
        );
        confirmPaymentBtn.classList.add("bg-gray-500", "hover:bg-gray-600");
      }
    }
  }

  // Handle payment method changes
  document.querySelectorAll('input[name="payment-method"]').forEach((input) => {
    input.addEventListener("change", () => {
      // Toggle visibility of payment details
      gcashDetails?.classList.toggle("hidden", input.value !== "Gcash");
      onsiteDetails?.classList.toggle("hidden", input.value !== "Onsite");

      // Update button styling
      if (confirmPaymentBtn) {
        confirmPaymentBtn.classList.remove(
          "bg-gray-500",
          "bg-blue-600",
          "bg-green-600",
          "hover:bg-gray-600",
          "hover:bg-blue-700",
          "hover:bg-green-700"
        );

        if (input.value === "Gcash") {
          confirmPaymentBtn.classList.add("bg-blue-600", "hover:bg-blue-700");
        } else if (input.value === "Onsite") {
          confirmPaymentBtn.classList.add("bg-green-600", "hover:bg-green-700");
        }
      }
    });
  });

  // Expose functions to window for other scripts
  window.showPaymentModal = showPaymentModal;
  window.hidePaymentModal = hidePaymentModal;
});
