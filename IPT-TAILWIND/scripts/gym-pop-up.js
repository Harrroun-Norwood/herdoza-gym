import { handlePaymentSuccess } from "./payment-success-handler.js";

// Membership configurations
const gym_payment_summary = [
  {
    id: "gym-full",
    mobileId: "gym-full-mobile",
    pass: "30 days",
    description: "Get full access to our gym equipment for 30 days.",
    price: 500,
    duration: 30,
  },
  {
    id: "gym-half",
    mobileId: "gym-half-mobile",
    pass: "15 days",
    description: "Get full access to our gym equipment for 15 days.",
    price: 250,
    duration: 15,
  },
  {
    id: "gym-regular",
    mobileId: "gym-regular-mobile",
    pass: "Regular",
    description:
      "Get full access to our gym equipment for as long as you stay in gym days.",
    price: 40,
    duration: 1,
  },
  {
    id: "trainer-single",
    pass: "1 Day with Trainer",
    description:
      "Single training session with our professional fitness expert.",
    price: 100,
    duration: 1,
    hasTrainer: true,
  },
  {
    id: "trainer-25",
    pass: "25 Days with Trainer",
    description: "25 training sessions with our professional fitness expert.",
    price: 2000,
    duration: 25,
    hasTrainer: true,
  },
];

// Function to open membership popup
function openGymMembershipPopup(item) {
  const typeKey = item.hasTrainer
    ? item.duration === 1
      ? "trainerSingle"
      : "trainer25"
    : item.duration === 30
    ? "full"
    : item.duration === 15
    ? "half"
    : "regular";

  // Save selected membership data temporarily
  localStorage.setItem(
    "selectedMembershipData",
    JSON.stringify({
      type: "Gym Fitness",
      duration: item.duration,
      price: item.price,
      description: item.description,
      hasTrainer: item.hasTrainer || false,
      pass: item.pass,
    })
  );

  window.openPaymentPopup({
    ...window.paymentConfigs.gym[typeKey],
    duration: item.duration,
    description: item.description,
    hasTrainer: item.hasTrainer || false,
  }); // redirectUrl is handled by paymentConfigs
}

// Initialize membership buttons
document.addEventListener("DOMContentLoaded", function () {
  gym_payment_summary.forEach((item) => {
    // Handle both desktop and mobile buttons
    const buttons = [];
    if (item.id) buttons.push(document.getElementById(item.id));
    if (item.mobileId) buttons.push(document.getElementById(item.mobileId));

    buttons.forEach((button) => {
      if (button) {
        button.addEventListener("click", () => openGymMembershipPopup(item));
      }
    });
  });

  // Listen for cancel button clicks in payment popups
  document.addEventListener("click", function (e) {
    if (e.target.closest(".cancel-btn")) {
      // Clear any temporary membership data
      localStorage.removeItem("selectedMembershipData");

      // Close any open popups
      const popups = document.querySelectorAll(".pop-up-con");
      popups.forEach((popup) => {
        if (popup.style.display !== "none") {
          popup.style.display = "none";
        }
      });
    }
  });
});
