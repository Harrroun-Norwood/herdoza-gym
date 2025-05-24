// Global payment popup configuration and functionality
const paymentConfigs = {
  gym: {
    regular: { title: 'Regular Pass', price: 40, redirectUrl: 'user-membership.html' },
    half: { title: '15 Days Pass', price: 250, redirectUrl: 'user-membership.html' },
    full: { title: '30 Days Pass', price: 500, redirectUrl: 'user-membership.html' },
    trainerSingle: { title: 'Personal Training - Single Session', price: 100, redirectUrl: 'user-membership.html' },
    trainer25: { title: 'Personal Training - 25 Sessions', price: 2000, redirectUrl: 'user-membership.html' }
  },
  mma: {
    single: { title: 'MMA Single Session', price: 150, requiresCalendar: true },
    package25: { title: 'MMA 25 Sessions', price: 2500, requiresCalendar: true },
    zumba: { 
      title: 'MMA + Zumba Package',
      description: 'MMA training session + Zumba class on the same day',
      price: 200, 
      requiresCalendar: true 
    }
  },
  studio: {
    small: { title: 'Dance Studio - Solo/Small Group (1-3 people)', price: 100, requiresCalendar: true },
    large: { title: 'Dance Studio - Large Group (4+ people)', pricePerPerson: 25, requiresCalendar: true }
  },
  zumba: {
    single: { 
      title: 'Zumba Fitness Group Class',  
      description: 'Join our energetic group fitness class led by professional Zumba instructors',
      price: 150,
      requiresCalendar: true 
    }
  }
};

// Add required styles
const popupStyles = `
  .payment-summary {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0.7);
    z-index: 10001;
    width: 90%;
    max-width: 650px;
    max-height: 90vh;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease-in-out;
  }

  .payment-summary > div {
    max-height: 80vh;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
  }

  .payment-summary > div::-webkit-scrollbar {
    width: 6px;
  }

  .payment-summary > div::-webkit-scrollbar-track {
    background: transparent;
  }

  .payment-summary > div::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.3);
    border-radius: 3px;
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

  .overlay.show-overlay {
    opacity: 1;
    visibility: visible;
  }

  @media (max-width: 640px) {
    .payment-summary {
      width: 95%;
    }
  }
`;

// Create payment popup HTML
function createPaymentPopupHTML(details) {
  return `
    <div class="payment-summary bg-black-1 max-w-2xl mx-auto text-white">
      <div class="bg-red-600 text-center font-bold py-2">Payment Summary</div>
      <div class="p-6">
        <div class="flex flex-col sm:flex-row border-4 border-red-600 mb-8 mt-4 rounded-lg overflow-hidden bg-black-2">
          <div class="bg-red-600 rounded-br-3xl rounded-tr-3xl mr-4 pr-2 hidden sm:block">
            <img src="./assets/herdoza-logo-trans.png" alt="Herdoza Fitness Center" class="h-30 w-auto">
          </div>

          <div class="flex flex-col justify-center mr-1 flex-1 p-4">
            <div class="text-xs text-red-500 font-bold uppercase tracking-wider">You're Paying for:</div>
            <div class="font-bold text-2xl mb-2 text-white">${details.title}</div>
            <div class="text-sm text-gray-400 mb-3">${details.description || ''}</div>
            <div class="booking-date text-gray-300 font-medium">${details.date || ''}</div>
            <div class="booking-time text-gray-300 font-medium">${details.time ? `Time: ${details.time}` : ''}</div>
            ${details.extras?.zumbaTime ? `<div class="text-gray-300 font-medium">Zumba Time: ${details.extras.zumbaTime}</div>` : ''}
          </div>

          <div class="bg-black-3 md:bg-red-900 amount flex flex-col justify-center items-center px-6 py-4 my-2 mx-2 rounded-lg">
            <div class="text-sm text-gray-300">Amount</div>
            <div class="font-bold text-3xl md:text-2xl text-white">₱ ${details.price}</div>
          </div>
        </div>

        <form id="payment-form" class="pb-4">
          <div class="text-center text-sm mb-4 text-gray-300 font-medium">Select Payment Method</div>
          <div class="flex gap-4 justify-center mb-6">
            <label>
              <input type="radio" name="payment-method" value="Gcash" required class="hidden peer/gcash">
              <div class="bg-red-700 peer-checked/gcash:bg-blue-600 hover:cursor-pointer hover:bg-red-600 transition-all px-8 py-2 rounded-lg font-bold">
                GCash
              </div>
            </label>
            <label>
              <input type="radio" name="payment-method" value="Onsite" required class="hidden peer/onsite">
              <div class="bg-red-700 peer-checked/onsite:bg-green-600 hover:cursor-pointer hover:bg-red-600 transition-all px-8 py-2 rounded-lg font-bold">
                Pay at Gym
              </div>
            </label>
          </div>

          <div id="gcash-details" class="hidden mb-6">
            <div class="bg-black-2 p-4 rounded-lg text-center">
              <p class="font-bold mb-3 text-gray-100">GCash Payment Instructions</p>              
              <div class="flex justify-center mb-4">
                <img src="./assets/instapay-qr.jpg" alt="GCash QR Code" class="w-96 h-96 rounded-lg shadow-lg">
              </div>
              <p class="mb-1 text-gray-300">Send payment to: <span class="font-bold text-white">09307561163</span></p>
              <p class="mb-3 text-gray-300">Amount: <span class="font-bold text-white">₱${details.price}</span></p>
              <p class="text-xs mt-2 text-gray-400">After scanning and sending payment:</p>
              <p class="text-xs text-blue-400 mt-1">Note: Registration will be pending until proof of payment is verified</p>
            </div>
          </div>

          <div id="onsite-details" class="hidden mb-6">
            <div class="bg-black-2 p-4 rounded-lg text-center">
              <p class="font-bold mb-2 text-gray-100">Cash Payment (Onsite)</p>
              <p class="mb-2 text-gray-300">Please pay at the gym reception counter</p>
              <p class="text-gray-400 text-sm">Note: Booking will be considered pending until payment is made</p>
            </div>
          </div>

          <hr class="border-gray-800 my-6">
          <div class="text-center md:text-end mt-4">
            <button type="button" class="cancel-btn bg-red-700 hover:bg-red-600 transition-all mx-2 text-base font-bold px-8 py-2 rounded-lg">
              Cancel
            </button>
            <button type="submit" class="pay-now-btn bg-gray-600 hover:bg-gray-500 transition-all text-base font-bold px-8 py-2 rounded-lg cursor-pointer">
              Pay now
            </button>
          </div>
        </form>
      </div>
    </div>
    <div class="overlay"></div>
  `;
}

// Payment popup handling functions
function setupPaymentHandlers(container, details) {
  const form = container.querySelector('#payment-form');
  const cancelBtn = container.querySelector('.cancel-btn');
  const paymentMethodInputs = container.querySelectorAll('input[name="payment-method"]');
  const gcashDetails = container.querySelector('#gcash-details');
  const onsiteDetails = container.querySelector('#onsite-details');
  const payNowBtn = container.querySelector('.pay-now-btn');

  // Payment method changes
  paymentMethodInputs.forEach(input => {
    input.addEventListener('change', () => {
      gcashDetails.classList.toggle('hidden', input.value !== 'Gcash');
      onsiteDetails.classList.toggle('hidden', input.value !== 'Onsite');

      payNowBtn.classList.remove('bg-gray-500', 'bg-blue-600', 'bg-green-600', 
        'hover:bg-gray-600', 'hover:bg-blue-700', 'hover:bg-green-700');
      
      if (input.value === 'Gcash') {
        payNowBtn.classList.add('bg-blue-600', 'hover:bg-blue-700');
      } else {
        payNowBtn.classList.add('bg-green-600', 'hover:bg-green-700');
      }
    });
  });

  // Form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const selectedPayment = container.querySelector('input[name="payment-method"]:checked');
    if (!selectedPayment) {
      alert('Please select a payment method');
      return;
    }

    try {
      const userEmail = localStorage.getItem("userEmail");
      if (!userEmail) {
        alert('Please log in to continue');
        window.location.href = 'login.html';
        return;
      }

      // Create booking object
      const booking = {
        id: 'booking_' + Date.now(),
        type: details.title,
        date: details.date,
        time: details.time,
        paymentMethod: selectedPayment.value,
        price: details.price,
        userEmail: userEmail,
        status: selectedPayment.value === 'Gcash' ? 'pending_verification' : 'pending_payment',
        timestamp: new Date().toISOString(),
        ...details.extras
      };

      // Save membership data for gym passes
      if (details.title.includes('Pass') || details.title.includes('Training')) {
        const duration = details.duration || 1;
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + duration);

        const membershipData = {
          type: "Gym Fitness",
          daysLeft: duration,
          nextPaymentDate: expiryDate.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric"
          }),
          status: selectedPayment.value === 'Gcash' ? 'pending_verification' : 'pending_payment',
          fee: details.price
        };

        localStorage.setItem(`membershipData_${userEmail}`, JSON.stringify(membershipData));
      }

      // Save booking for other services
      const bookingKey = getBookingStorageKey(details.title);
      const existingBookings = JSON.parse(localStorage.getItem(bookingKey) || '[]');
      existingBookings.push(booking);
      localStorage.setItem(bookingKey, JSON.stringify(existingBookings));

      // Handle Gcash verification requests
      if (selectedPayment.value === 'Gcash') {
        const verificationRequest = {
          id: 'verification_' + Date.now(),
          bookingId: booking.id,
          userEmail: userEmail,
          amount: details.price,
          type: details.title,
          status: 'pending',
          timestamp: new Date().toISOString()
        };
        
        const verifications = JSON.parse(localStorage.getItem('paymentVerifications') || '[]');
        verifications.push(verificationRequest);
        localStorage.setItem('paymentVerifications', JSON.stringify(verifications));
      }

      // Show appropriate message
      const message = selectedPayment.value === 'Gcash' 
        ? 'Your booking will be confirmed after GCash payment verification.\nPlease send your payment using the provided QR code.'
        : 'Your booking will be confirmed after payment at the gym.\nPlease visit our reception to complete your payment.';

      alert(`✅ Booking Successful!\n\n` +
        `📅 Type: ${booking.type}\n` +
        `${booking.date ? `Date: ${booking.date}\n` : ''}` +
        `${booking.time ? `⏰ Time: ${booking.time}\n` : ''}` +
        `💳 Payment Method: ${booking.paymentMethod}\n\n` +
        `${message}\n\n` +
        `You can view your schedule and payment status in your dashboard.`);

      // Close popup and redirect
      closePaymentPopup();
      
      if (details.redirectUrl) {
        setTimeout(() => {
          window.location.href = details.redirectUrl;
        }, 1500);
      }

    } catch (error) {
      console.error('Error processing booking:', error);
      alert('There was an error processing your booking. Please try again.');
    }
  });
  // Cancel button
  cancelBtn.addEventListener('click', () => {
    const isGymMembership = details.title?.includes('Pass') || details.title?.includes('Training');
    closePaymentPopup();
    // Handle gym membership cancellations
    if (isGymMembership) {
      window.location.href = 'gym-fitness.html';
    } 
    // Handle calendar-based services
    else if (details.redirectUrl && details.requiresCalendar) {
      window.location.href = details.redirectUrl.replace('user-schedule-', '').replace('.html', '.html');
    }
  });
}

// Helper function to determine booking storage key
function getBookingStorageKey(bookingType) {
  const type = bookingType.toLowerCase();
  if (type.includes('mma') && type.includes('zumba')) {
    return 'mmaZumbaBookings';
  } else if (type.includes('mma') && type.includes('25')) {
    return 'mma25SessionBookings';
  } else if (type.includes('mma')) {
    return 'mmaPerSessionBookings';
  } else if (type.includes('zumba')) {
    return 'zumbaBookings';
  } else if (type.includes('studio')) {
    return 'studioBookings';
  } else {
    return 'gymBookings';
  }
}

function handleCalendarRequiredService(details, redirectToCalendar) {
  // Special validation for large dance studio
  if (details.title?.includes('Large Group')) {
    return true; // Skip validation since it's handled in calendar page
  }

  // General calendar validation
  if (details.requiresCalendar && !details.date) {
    // If the service requires calendar but no date is selected, redirect to calendar page
    if (redirectToCalendar) window.location.href = redirectToCalendar;
    return false;
  }
  return true;
}

function openPaymentPopup(details) {
  const popupContainer = document.querySelector('.pop-up-con');
  if (!popupContainer) return;

  // Handle calendar-required services
  const calendarRedirects = {
    'MMA Single Session': 'mma-single-booking-calendar.html',
    'MMA 25 Sessions': 'mma-25-session-booking.html',
    'MMA + Zumba Package': 'mma-zumba-booking.html',
    'Dance Studio - Solo/Small Group (1-3 people)': 'small-studio-calendar.html',
    'Dance Studio - Large Group (4+ people)': 'large-studio-calendar.html',
    'Zumba Session': 'zumba-booking.html'
  };

  if (!handleCalendarRequiredService(details, calendarRedirects[details.title])) {
    return;
  }

  // Add popup HTML
  popupContainer.innerHTML = createPaymentPopupHTML(details);
  
  // Add styles if not already added
  if (!document.querySelector('#payment-popup-styles')) {
    const style = document.createElement('style');
    style.id = 'payment-popup-styles';
    style.textContent = popupStyles;
    document.head.appendChild(style);
  }

  // Show popup with animation
  requestAnimationFrame(() => {
    const summary = popupContainer.querySelector('.payment-summary');
    const overlay = popupContainer.querySelector('.overlay');
    summary.classList.add('open-payment-summary');
    overlay.classList.add('show-overlay');
  });

  // Setup event handlers
  setupPaymentHandlers(popupContainer, details);
}

function closePaymentPopup() {
  const popupContainer = document.querySelector('.pop-up-con');
  const summary = popupContainer?.querySelector('.payment-summary');
  const overlay = popupContainer?.querySelector('.overlay');

  if (summary && overlay) {
    summary.classList.remove('open-payment-summary');
    overlay.classList.remove('show-overlay');
    
    // Remove content after animation
    setTimeout(() => {
      popupContainer.innerHTML = '';
    }, 300);
  }
}

// Make functions available globally
if (typeof window !== 'undefined') {
  window.paymentConfigs = paymentConfigs;
  window.openPaymentPopup = openPaymentPopup;
  window.closePaymentPopup = closePaymentPopup;

  // Function to initialize all payment buttons
  window.initPaymentButtons = () => {
    // Gym Membership buttons
    const gymButtons = [
      {id: 'gym-full', mobileId: 'gym-full-mobile', type: 'full'},
      {id: 'gym-half', mobileId: 'gym-half-mobile', type: 'half'},
      {id: 'gym-regular', mobileId: 'gym-regular-mobile', type: 'regular'},
      {id: 'trainer-single', type: 'trainerSingle'},
      {id: 'trainer-25', type: 'trainer25'}
    ];

    gymButtons.forEach(btn => {
      // Handle desktop button
      const desktopBtn = document.getElementById(btn.id);
      if (desktopBtn) {
        desktopBtn.onclick = () => {
          openPaymentPopup({
            ...paymentConfigs.gym[btn.type],
            redirectUrl: 'user-schedule-gym.html'
          });
        };
      }

      // Handle mobile button if it exists
      if (btn.mobileId) {
        const mobileBtn = document.getElementById(btn.mobileId);
        if (mobileBtn) {
          mobileBtn.onclick = () => {
            openPaymentPopup({
              ...paymentConfigs.gym[btn.type],
              redirectUrl: 'user-schedule-gym.html'
            });
          };
        }
      }
    });

    // MMA + Zumba buttons 
    document.querySelectorAll('[onclick*="openMmaZumba"]').forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        openPaymentPopup({
          ...paymentConfigs.mma.zumba,
          redirectUrl: 'user-schedule-mma-zumba.html'
        });
      };
    });

    // MMA 25 Sessions buttons
    document.querySelectorAll('[onclick*="openMma25"]').forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        openPaymentPopup({
          ...paymentConfigs.mma.package25,
          redirectUrl: 'user-schedule-mma.html'
        });
      };
    });

    // MMA Single Session buttons 
    document.querySelectorAll('[onclick*="openMmaSingle"]').forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        openPaymentPopup({
          ...paymentConfigs.mma.single,
          redirectUrl: 'user-schedule-mma.html'
        });
      };
    });

    // Small Studio buttons
    document.querySelectorAll('[onclick*="openSmallStudio"]').forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        openPaymentPopup({
          ...paymentConfigs.studio.small,
          redirectUrl: 'user-schedule-studio.html'
        });
      };
    });

    // Large Studio buttons  
    document.querySelectorAll('[onclick*="openLargeStudio"]').forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        const numberOfPeople = 4; // Default minimum
        openPaymentPopup({
          ...paymentConfigs.studio.large,
          numberOfPeople,
          price: numberOfPeople * paymentConfigs.studio.large.pricePerPerson,
          redirectUrl: 'user-schedule-studio.html'
        });
      };
    });
  };

  // Initialize buttons when DOM loads
  document.addEventListener('DOMContentLoaded', () => {
    window.initPaymentButtons();
  });
}
