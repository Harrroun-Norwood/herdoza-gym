// Define payment summary data
const mma_payment_summary = [
  {
    id: "mma-single",
    pass: "Single Session",
    description: "One MMA training session.",
    price: 150,
    function_no: 1,
    duration: 1
  },
  {
    id: "mma-25",
    pass: "25 Sessions",
    description: "25 MMA training sessions package.",
    price: 2500,
    function_no: 2,
    duration: 25
  },
  {
    id: "mma-zumba",
    pass: "MMA + Zumba",
    description: "One MMA session and one Zumba session on the same day.",
    price: 200,
    function_no: 3,
    duration: 1  }
];

// Create overlay if it doesn't exist
function ensureOverlay() {
  let overlay = document.querySelector('.overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'overlay hidden';
    document.body.appendChild(overlay);
  }
  return overlay;
}

// Create popup modal for an item
function createPopupModal(item, bookingDetails = {}) {
  const existingPopup = document.getElementById(item.id);
  if (existingPopup) {
    return existingPopup;
  }

  const popupContainer = document.querySelector('.pop-up-con');
  if (!popupContainer) {
    console.error('Popup container not found!');
    return null;
  }

  const popup = document.createElement('div');
  popup.id = item.id;
  popup.className = 'payment-modal opacity-0 pointer-events-none';
  popup.setAttribute('data-item', JSON.stringify(item));
  
  popup.innerHTML = `
    <div class="bg-black-2 text-white rounded-lg relative w-full max-w-2xl mx-4">
      <div class="bg-red-600 px-6 py-3 sticky top-0 z-10 border-b border-red-700">
        <h2 class="text-xl font-bold text-center">Payment Summary</h2>
      </div>
      <div class="p-6">
        <div class="flex flex-col sm:flex-row border-4 border-red-600 mb-8 rounded-lg overflow-hidden">
          <div class="bg-red-600 rounded-br-3xl rounded-tr-3xl mr-4 pr-2 hidden sm:block">
            <img src="./assets/herdoza-logo-trans.png" alt="Herdoza Fitness Center" class="h-30">
          </div>

          <div class="flex flex-col justify-center mr-1 flex-1 p-4">
            <div class="text-xs text-red-600 font-bold">You're Paying for:</div>
            <div class="font-bold text-2xl mb-2">MMA Training - ${item.pass}</div>
            <div class="text-gray-300 booking-details">${bookingDetails.date || ''} ${bookingDetails.time || ''}</div>
            ${bookingDetails.zumbaTime ? `<div class="text-gray-300">Zumba: ${bookingDetails.zumbaTime}</div>` : ''}
            <div class="text-gray-300">${item.description}</div>
          </div>

          <div class="bg-none md:bg-red-600 amount flex flex-col justify-center items-center px-6 py-4 my-2 mx-2 rounded-lg">
            <div class="text-sm">Amount</div>
            <div class="font-bold text-3xl md:text-2xl">₱ ${item.price}</div>
          </div>
        </div>

        <form id="payment-form">
          <div class="text-center text-sm mb-4">Payment Method</div>
          <div class="flex gap-4 justify-center mb-6">
            <label>
              <input type="radio" name="payment-method" value="Gcash" required class="hidden peer/gcash">
              <div class="bg-red-600 peer-checked/gcash:bg-blue-700 hover:cursor-pointer hover:bg-red-700 transition-all
                          text-sm px-6 py-2 sm:text-base sm:px-8 sm:py-2 rounded-lg text-white text-center">
                Gcash
              </div>
            </label>

            <label>
              <input type="radio" name="payment-method" value="Onsite" required class="hidden peer/onsite">
              <div class="bg-red-600 peer-checked/onsite:bg-green-700 hover:cursor-pointer hover:bg-red-700 transition-all
                          text-sm px-6 py-2 sm:text-base sm:px-8 sm:py-2 rounded-lg text-white text-center">
                Cash(Onsite)
              </div>
            </label>
          </div>

          <div id="gcash-details" class="gcash-details hidden mb-6">
            <div class="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 p-4 rounded-lg text-center">
              <p class="font-bold mb-3">GCash Payment Details</p>
              <div class="flex justify-center mb-4">
                <img src="./assets/instapay-qr.jpg" alt="GCash QR Code" class="w-48 h-48 rounded-lg shadow-lg">
              </div>
              <p class="mb-1">Send payment to: <span class="font-bold">09307561163</span></p>
              <p class="mb-3">Amount: ₱${item.price}.00</p>
              <p class="text-xs mt-2">After scanning and sending payment:</p>
              <p class="text-xs text-blue-700 dark:text-blue-300 mt-1">Note: Registration will be pending until proof of payment is verified</p>
            </div>
          </div>

          <div id="onsite-details" class="onsite-details hidden mb-6">
            <div class="bg-amber-100 text-amber-800 p-4 rounded-lg text-center">
              <p class="font-bold mb-2">Cash Payment (Onsite)</p>
              <p class="mb-2">Please pay at the gym reception counter</p>
              <p class="mb-3">Amount: ₱${item.price}.00</p>
              <p class="text-xs mt-2">Your reservation will be pending until payment is received at the gym</p>
            </div>
          </div>

          <hr class="border-gray-700">
          <div class="text-center md:text-end mt-4">
            <button type="button" class="cancel-btn bg-red-600 hover:bg-red-700 transition-all mx-2 text-base font-bold px-8 py-2 rounded-lg">
              Cancel
            </button>
            <button type="submit" class="pay-now-btn bg-gray-500 hover:bg-gray-600 transition-all text-base font-bold px-8 py-2 rounded-lg cursor-pointer">
              Pay now
            </button>
          </div>
        </form>
      </div>
    </div>
  `;

  popupContainer.appendChild(popup);
  initializePaymentHandlers(popup);
  return popup;
}

// Initialize payment handlers for a popup
function initializePaymentHandlers(popup) {
  // Get references to DOM elements
  const paymentMethodInputs = popup.querySelectorAll('input[name="payment-method"]');
  const gcashDetails = popup.querySelector('#gcash-details');
  const onsiteDetails = popup.querySelector('#onsite-details');
  const payNowBtn = popup.querySelector('.pay-now-btn');
  const cancelBtn = popup.querySelector('.cancel-btn');
  const item = JSON.parse(popup.getAttribute('data-item') || '{}');

  // Handle payment method changes
  paymentMethodInputs.forEach(input => {
    input.addEventListener('change', () => {
      if (gcashDetails && onsiteDetails) {
        gcashDetails.classList.toggle('hidden', input.value !== 'Gcash');
        onsiteDetails.classList.toggle('hidden', input.value !== 'Onsite');
      }

      if (payNowBtn) {
        payNowBtn.classList.remove('bg-gray-500', 'bg-blue-600', 'bg-green-600', 'hover:bg-gray-600', 'hover:bg-blue-700', 'hover:bg-green-700');
        if (input.value === 'Gcash') {
          payNowBtn.classList.add('bg-blue-600', 'hover:bg-blue-700');
        } else {
          payNowBtn.classList.add('bg-green-600', 'hover:bg-green-700');
        }
      }
    });
  });

  // Handle form submission
  const form = popup.querySelector('#payment-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const selectedPayment = popup.querySelector('input[name="payment-method"]:checked');
      if (!selectedPayment) {
        alert('Please select a payment method');
        return;
      }

      try {
        const bookingDetails = popup.querySelector('.booking-details')?.textContent || '';
        let bookingData = {
          sessionType: "mma",
          type: item.pass,
          price: item.price,
          paymentMethod: selectedPayment.value
        };

        // Add date and time if they exist in the booking details
        const [date, time] = bookingDetails.split('at').map(s => s.trim());
        if (date) bookingData.date = date;
        if (time) bookingData.time = time;

        // Process payment through booking API
        const booking = await window.bookingApi.createBooking(bookingData);

        const message = booking.paymentMethod === "Gcash" ?
          "Your session will be confirmed after GCash payment verification." :
          "Your session will be confirmed after payment at the gym.";

        alert(
          `✅ MMA Training Booking Process Started!\n\n` +
          `📅 Type: ${booking.type}\n` +
          `📅 Date: ${booking.date || ''}\n` +
          `⏰ Time: ${booking.time || ''}\n` +
          `💳 Payment: ${booking.paymentMethod}\n\n` +
          `${message}\n\n` +
          `You can view your schedule in your dashboard.`
        );

        // Close popup and redirect
        closePopup(popup.id);
        setTimeout(() => {
          window.location.href = "user-schedule-mma.html"; 
        }, 1500);

      } catch (error) {
        console.error("Error processing payment:", error);
        alert("There was an error processing your payment. Please try again.");
      }
    });
  }

  // Handle cancel button
  cancelBtn?.addEventListener('click', () => {
    closePopup(popup.id);
  });
}

// Show popup modal
function showPopupModal(item, bookingDetails = {}) {
  const popup = createPopupModal(item, bookingDetails);
  const overlay = ensureOverlay();
  
  popup?.classList.remove('opacity-0', 'pointer-events-none');
  overlay?.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

// Close popup modal
function closePopup(popupId) {
  const popup = document.getElementById(popupId);
  const overlay = document.querySelector('.overlay');
  
  popup?.classList.add('opacity-0', 'pointer-events-none');
  overlay?.classList.add('hidden');
  document.body.style.overflow = '';
}

// Add opener functions to window for HTML onclick access 
window.openMmaSingle = function(bookingDetails = {}) {
  const item = mma_payment_summary.find(x => x.id === "mma-single");
  if (item) {
    window.openPaymentPopup({
      type: "mma",
      pass: item.pass,
      price: item.price,
      description: item.description,
      duration: item.duration,
      ...bookingDetails
    });
  }
};

window.openMma25 = function(bookingDetails = {}) {
  const item = mma_payment_summary.find(x => x.id === "mma-25");
  if (item) {
    window.openPaymentPopup({
      type: "mma",
      pass: item.pass,
      price: item.price,
      description: item.description,
      duration: item.duration,
      ...bookingDetails
    });
  }
};

window.openMmaZumba = function(bookingDetails = {}) {
  const item = mma_payment_summary.find(x => x.id === "mma-zumba");
  if (item) {
    window.openPaymentPopup({
      type: "mma-zumba",
      pass: item.pass, 
      price: item.price,
      description: item.description,
      duration: item.duration,
      ...bookingDetails
    });
  }
};
