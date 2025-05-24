// Shared modal utility functions
export function showModal(modal) {
  if (modal) {
    modal.classList.remove("opacity-0", "pointer-events-none");
    document.body.style.overflow = "hidden"; // Prevent background scrolling
  }
}

export function hideModal(modal) {
  if (modal) {
    modal.classList.add("opacity-0", "pointer-events-none");
    document.body.style.overflow = ""; // Restore scrolling

    // Reset form state
    const paymentForm = modal.querySelector("form");
    if (paymentForm) {
      paymentForm.reset();
    }

    // Reset payment sections
    const gcashDetails = document.getElementById("gcash-details");
    const onsiteDetails = document.getElementById("onsite-details");
    if (gcashDetails) gcashDetails.classList.add("hidden");
    if (onsiteDetails) onsiteDetails.classList.add("hidden");
  }
}

export function initializePaymentMethodHandlers(form) {
  const gcashRadio = form.querySelector('input[value="Gcash"]');
  const onsiteRadio = form.querySelector('input[value="Onsite"]');
  const payNowBtn = form.querySelector(".confirm-payment-btn, .pay-now-btn");

  gcashRadio?.addEventListener("change", () => {
    document.getElementById("gcash-details")?.classList.remove("hidden");
    document.getElementById("onsite-details")?.classList.add("hidden");

    if (payNowBtn) {
      payNowBtn.classList.remove(
        "bg-gray-500",
        "bg-green-600",
        "hover:bg-gray-600",
        "hover:bg-green-700"
      );
      payNowBtn.classList.add("bg-blue-600", "hover:bg-blue-700");
    }
  });

  onsiteRadio?.addEventListener("change", () => {
    document.getElementById("gcash-details")?.classList.add("hidden");
    document.getElementById("onsite-details")?.classList.remove("hidden");

    if (payNowBtn) {
      payNowBtn.classList.remove(
        "bg-gray-500",
        "bg-blue-600",
        "hover:bg-gray-600",
        "hover:bg-blue-700"
      );
      payNowBtn.classList.add("bg-green-600", "hover:bg-green-700");
    }
  });
}
