document.addEventListener("DOMContentLoaded", () => {
  const dates = document.querySelector(".dates");
  const header = document.querySelector(".calendar h3");
  const navs = document.querySelectorAll("#prev, #next");
  const okButton = document.querySelector(".ok-btn");
  const cancelButton = document.querySelector(".cancel-btn");
  const timeSlots = document.querySelectorAll('input[name="time-slot"]');
  const peopleInput = document.querySelector('#numberOfPeople');
  const priceDisplay = document.querySelector('.price-display');
  
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // State variables
  let date = new Date();
  let month = date.getMonth();
  let year = date.getFullYear();
  let selectedDate = null;
  let selectedTime = null;
  let bookedSlots = JSON.parse(localStorage.getItem("largeStudioBookings") || "[]");

  function isSameDate(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate();
  }

  function renderCalendar() {
    if (!dates || !header) return;

    const today = new Date();
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    const lastDayIndex = new Date(year, month, lastDate).getDay();
    const prevLastDate = new Date(year, month, 0).getDate();

    header.textContent = `${months[month]} ${year}`;
    let datesHTML = "";

    // Previous month's days
    for (let i = firstDay; i > 0; i--) {
      datesHTML += `<li class="inactive">${prevLastDate - i + 1}</li>`;
    }

    // Current month's days
    for (let i = 1; i <= lastDate; i++) {
      let className = "";
      let currentDate = new Date(year, month, i);
      let dayOfWeek = currentDate.getDay();

      // Check if it's Sunday
      if (dayOfWeek === 0) {
        className = "inactive sunday";
      }
      // Check if date is in the past
      else if (currentDate < today && !isSameDate(currentDate, today)) {
        className = "inactive";
      }
      // Check if it's today
      else if (isSameDate(currentDate, today)) {
        className = "today";
      }
      
      // Check if this is the selected date
      if (selectedDate &&
          selectedDate.day === i &&
          selectedDate.month === month &&
          selectedDate.year === year) {
        className = "selected";
      }

      datesHTML += `<li class="${className}" data-day="${i}" data-month="${month}" data-year="${year}">${i}</li>`;
    }

    dates.innerHTML = datesHTML;

    // Add click events to dates
    document.querySelectorAll(".dates li:not(.inactive)").forEach((day) => {
      day.addEventListener("click", () => {
        selectedDate = {
          day: parseInt(day.dataset.day),
          month: parseInt(day.dataset.month),
          year: parseInt(day.dataset.year)
        };
        updateAvailableTimeSlots();
        renderCalendar();
      });
    });

    // Disable prev button if showing current month
    const todayMonth = today.getMonth();
    const todayYear = today.getFullYear();
    document.getElementById("prev").disabled =
      year < todayYear || (year === todayYear && month <= todayMonth);
  }

  function updateAvailableTimeSlots() {
    timeSlots.forEach((slot) => {
      let isSlotBooked = bookedSlots.some(booking =>
        booking.date === `${selectedDate?.day}/${selectedDate?.month + 1}/${selectedDate?.year}` &&
        booking.time === slot.value
      );

      slot.disabled = isSlotBooked;
      const slotLabel = slot.nextElementSibling.textContent.replace(/ \(Already Booked\)/g, "").trim();
      if (isSlotBooked) {
        slot.checked = false;
        slot.nextElementSibling.innerHTML = `${slotLabel} <span class="text-red-500">(Already Booked)</span>`;
      } else {
        slot.nextElementSibling.innerHTML = slotLabel;
      }
    });
  }

  // Navigation buttons
  navs.forEach((nav) => {
    nav.addEventListener("click", (e) => {
      const btnId = e.target.id;

      if (btnId === "prev" && !document.getElementById("prev").disabled) {
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
      updateAvailableTimeSlots();
    });
  });
  // Handle people input changes
  peopleInput?.addEventListener("input", () => {
    const numberOfPeople = parseInt(peopleInput.value) || 0;
    const pricePerPerson = window.paymentConfigs.studio.large.pricePerPerson;
    const totalPrice = numberOfPeople * pricePerPerson;

    if (priceDisplay) {
      if (numberOfPeople >= 4 && numberOfPeople <= 30) {
        priceDisplay.textContent = `₱ ${totalPrice}`;
        priceDisplay.classList.remove("opacity-50");
      } else {
        priceDisplay.textContent = "---";
        priceDisplay.classList.add("opacity-50");
      }
    }
  });

  // OK Button handler - Show payment popup
  okButton?.addEventListener("click", () => {
    selectedTime = document.querySelector('input[name="time-slot"]:checked');
    const numberOfPeople = parseInt(peopleInput?.value) || 0;

    // Basic required field validation
    if (!selectedDate) {
      alert("Please select a date");
      return;
    }
    if (!selectedTime) {
      alert("Please select a time slot");
      return;
    }
    if (!numberOfPeople) {
      alert("Please enter number of people");
      return;
    }    const dateStr = `${months[selectedDate.month]} ${selectedDate.day}, ${selectedDate.year}`;
    const timeStr = selectedTime.nextElementSibling.textContent
      .replace(" (Already Booked)", "")
      .trim();

    // Show warning if less than 4 people
    if (numberOfPeople > 0 && numberOfPeople < 4) {
      if (!confirm("For groups with less than 4 people, please use the Solo/Small Group option. Would you like to go back to the studio selection page?")) {
        return;
      }
      window.location.href = "dance-studio.html";
      return;
    }

    if (numberOfPeople > 30) {
      alert("Maximum group size is 30 people");
      return;
    }

    // Show centralized payment popup 
    window.openPaymentPopup({
      ...window.paymentConfigs.studio.large,
      date: dateStr,
      time: timeStr,
      extras: {
        numberOfPeople,  
      },
      price: numberOfPeople * window.paymentConfigs.studio.large.pricePerPerson,
      redirectUrl: 'user-schedule-studio.html'
    });
  });

  // Cancel button - Reset selections and return to main page
  cancelButton?.addEventListener("click", () => {
    selectedDate = null;
    selectedTime = null;
    if (peopleInput) peopleInput.value = "";

    // Reset time slots
    timeSlots.forEach((slot) => {
      slot.checked = false;
      const label = slot.nextElementSibling;
      if (label) {
        label.innerHTML = label.textContent.replace(" (Already Booked)", "").trim();
      }
    });

    // Reset price display
    if (priceDisplay) {
      priceDisplay.textContent = "---";
      priceDisplay.classList.add("opacity-50");
    }

    updateAvailableTimeSlots();
    renderCalendar();

    // Return to main page
    window.location.href = "dance-studio.html";
  });

  // Initialize the calendar
  renderCalendar();
  updateAvailableTimeSlots();
});
