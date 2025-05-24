// Utility functions for payment modals
export function showPaymentModal(modalId) {
  const modal = document.querySelector(modalId);
  if (modal) {
    // Remove initial hidden state
    modal.classList.remove("opacity-0", "pointer-events-none");
    // Prevent background scrolling
    document.body.style.overflow = "hidden";

    // Set proper modal position and size
    const modalContent = modal.querySelector(".bg-black-2");
    if (modalContent) {
      modalContent.style.maxHeight = "90vh";
      modalContent.style.overflow = "auto";
    }
  }
}

export function hidePaymentModal(modalId) {
  const modal = document.querySelector(modalId);
  if (modal) {
    // Add hidden state
    modal.classList.add("opacity-0", "pointer-events-none");
    // Restore background scrolling
    document.body.style.overflow = "";

    // Reset form if exists
    const form = modal.querySelector("form");
    if (form) {
      form.reset();
    }

    // Hide payment method details
    const gcashDetails = modal.querySelector(".gcash-details");
    const onsiteDetails = modal.querySelector(".onsite-details");
    if (gcashDetails) gcashDetails.classList.add("hidden");
    if (onsiteDetails) onsiteDetails.classList.add("hidden");
  }
}

export function initPaymentMethodHandlers(modalId) {
  const modal = document.querySelector(modalId);
  if (!modal) return;

  const gcashRadio = modal.querySelector('input[value="Gcash"]');
  const onsiteRadio = modal.querySelector('input[value="Onsite"]');
  const paymentButton = modal.querySelector(
    ".confirm-payment-btn, .pay-now-btn"
  );
  const gcashDetails = modal.querySelector(".gcash-details");
  const onsiteDetails = modal.querySelector(".onsite-details");

  gcashRadio?.addEventListener("change", () => {
    gcashDetails?.classList.remove("hidden");
    onsiteDetails?.classList.add("hidden");
    updatePaymentButtonStyle(paymentButton, "gcash");
  });

  onsiteRadio?.addEventListener("change", () => {
    gcashDetails?.classList.add("hidden");
    onsiteDetails?.classList.remove("hidden");
    updatePaymentButtonStyle(paymentButton, "onsite");
  });
}

function updatePaymentButtonStyle(button, type) {
  if (!button) return;

  // Remove all possible button styles
  button.classList.remove(
    "bg-gray-500",
    "bg-blue-600",
    "bg-green-600",
    "hover:bg-gray-600",
    "hover:bg-blue-700",
    "hover:bg-green-700"
  );

  // Add appropriate styles based on payment type
  if (type === "gcash") {
    button.classList.add("bg-blue-600", "hover:bg-blue-700");
  } else if (type === "onsite") {
    button.classList.add("bg-green-600", "hover:bg-green-700");
  }
}
