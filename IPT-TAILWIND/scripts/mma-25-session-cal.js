function addPopupStyles() {
  const style = document.createElement("style");
  style.textContent = `
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
}

document.addEventListener("DOMContentLoaded", () => {
  const dates = document.querySelector(".dates");
  const header = document.querySelector(".calendar h3");
  const navs = document.querySelectorAll("#prev, #next");
  const okButton = document.querySelector(".ok-btn");
  const cancelButton = document.querySelector(".cancel-btn");
  const timeSlots = document.querySelectorAll('input[name="time-slot"]');

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // State variables
  let date = new Date();
  let month = date.getMonth();
  let year = date.getFullYear();
  let selectedDate = null;
  let selectedTime = null;
  let bookedSlots = JSON.parse(
    localStorage.getItem("mma25SessionBookings") || "[]"
  );

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

      // Check if it's Sunday (dayOfWeek === 0)
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
      if (
        selectedDate &&
        selectedDate.day === i &&
        selectedDate.month === month &&
        selectedDate.year === year
      ) {
        className = "selected";
      }

      datesHTML += `<li class="${className}" data-day="${i}" data-month="${month}" data-year="${year}">${i}</li>`;
    }

    // Next month's days
    for (let i = lastDayIndex; i < 6; i++) {
      datesHTML += `<li class="inactive">${i - lastDayIndex + 1}</li>`;
    }

    dates.innerHTML = datesHTML;

    // Add click events to dates
    document.querySelectorAll(".dates li:not(.inactive)").forEach((day) => {
      day.addEventListener("click", () => {
        selectedDate = {
          day: parseInt(day.dataset.day),
          month: parseInt(day.dataset.month),
          year: parseInt(day.dataset.year),
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

  function isSameDate(date1, date2) {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  }

  function get25DayRangeDates(startDateObj) {
    const dates = [];
    let daysCounted = 0;
    let currentDate = new Date(
      startDateObj.year,
      startDateObj.month,
      startDateObj.day
    );

    while (daysCounted < 25) {
      if (currentDate.getDay() !== 0) {
        // Skip Sundays
        dates.push({
          day: currentDate.getDate(),
          month: currentDate.getMonth(),
          year: currentDate.getFullYear(),
        });
        daysCounted++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  }

  function updateAvailableTimeSlots() {
    if (!selectedDate) return;

    // Get all dates in the 25-day range (excluding Sundays)
    let bookingDates = get25DayRangeDates(selectedDate);

    timeSlots.forEach((slot) => {
      let slotLabel = slot.nextElementSibling.textContent
        .replace(/ \(Already Booked\)/g, "")
        .trim();
      let isBooked = false;

      // Check if this time slot is booked on any of the 25 days
      bookingDates.forEach((bookingDate) => {
        let dateStr = `${months[bookingDate.month]} ${bookingDate.day}, ${
          bookingDate.year
        }`;

        if (
          bookedSlots.some(
            (bookedSlot) =>
              bookedSlot.date === dateStr && bookedSlot.time === slotLabel
          )
        ) {
          isBooked = true;
        }
      });

      slot.disabled = isBooked;
      slot.checked = false;

      if (isBooked) {
        slot.nextElementSibling.innerHTML = `${slotLabel} <span class="text-red-500">(Already Booked)</span>`;
      } else {
        slot.nextElementSibling.innerHTML = slotLabel;
      }
    });
  }

  // Calendar navigation
  navs.forEach((nav) => {
    nav.addEventListener("click", (e) => {
      if (e.target.id === "prev") {
        month--;
        if (month < 0) {
          month = 11;
          year--;
        }
      } else {
        month++;
        if (month > 11) {
          month = 0;
          year++;
        }
      }
      renderCalendar();
    });
  });

  // OK Button handler - Show payment popup
  okButton?.addEventListener("click", () => {
    selectedTime = document.querySelector('input[name="time-slot"]:checked');

    if (!selectedDate || !selectedTime) {
      let errorMessage = "Please complete the following:\n";
      if (!selectedDate) errorMessage += "• Select a date\n";
      if (!selectedTime) errorMessage += "• Select a time slot\n";
      alert(errorMessage);
      return;
    }

    // Calculate 25-day range and show popup
    const bookingDates = get25DayRangeDates(selectedDate);
    const startDateStr = `${months[selectedDate.month]} ${selectedDate.day}, ${
      selectedDate.year
    }`;
    const endDate = bookingDates[bookingDates.length - 1];
    const endDateStr = `${months[endDate.month]} ${endDate.day}, ${
      endDate.year
    }`;
    const timeStr = selectedTime.nextElementSibling.textContent.trim();

    // Show centralized payment popup
    window.openPaymentPopup({
      ...window.paymentConfigs.mma.package25,
      date: `${startDateStr} to ${endDateStr}`,
      time: timeStr,
      extras: {
        startDate: startDateStr,
        endDate: endDateStr,
        sessionDates: bookingDates,
      },
      redirectUrl: "user-schedule-mma.html",
    });
  });

  // Cancel button handler - Return to MMA page
  cancelButton.addEventListener("click", () => {
    window.location.href = "mixed-martial-arts.html";
  });

  // Initialize calendar and available time slots
  renderCalendar();
  updateAvailableTimeSlots();
});
