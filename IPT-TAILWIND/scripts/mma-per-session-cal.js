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
    localStorage.getItem("mmaPerSessionBookings") || "[]"
  );

  function saveBooking(bookingDetails) {
    bookedSlots.push(bookingDetails);
    localStorage.setItem("mmaPerSessionBookings", JSON.stringify(bookedSlots));
  }

  function renderCalendar() {
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

      // Check if date is past
      if (currentDate < today && !isSameDate(currentDate, today)) {
        className = "inactive";
      }
      // Check if it's today
      else if (isSameDate(currentDate, today)) {
        className = "today";
      }
      // Check if date is selected
      if (
        selectedDate &&
        i === selectedDate.day &&
        month === selectedDate.month &&
        year === selectedDate.year
      ) {
        className = "selected";
      }
      // Check if it's Sunday
      if (new Date(year, month, i).getDay() === 0) {
        className += " inactive";
      }

      datesHTML += `<li class="${className}" data-day="${i}" data-month="${month}" data-year="${year}">${i}</li>`;
    }

    // Next month's days
    for (let i = 1; i <= 6 - lastDayIndex; i++) {
      datesHTML += `<li class="inactive">${i}</li>`;
    }

    dates.innerHTML = datesHTML;

    // Add click listeners to active dates
    document.querySelectorAll(".dates li:not(.inactive)").forEach((day) => {
      day.addEventListener("click", () => {
        let dayNumber = parseInt(day.dataset.day);
        selectedDate = { day: dayNumber, month: month, year: year };
        updateAvailableTimeSlots();
        renderCalendar();
      });
    });
  }

  function isSameDate(date1, date2) {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  }

  function updateAvailableTimeSlots() {
    if (!selectedDate) return;

    let selectedDateStr = `${months[selectedDate.month]} ${selectedDate.day}, ${
      selectedDate.year
    }`;

    timeSlots.forEach((slot) => {
      let timeStr = slot.nextElementSibling.textContent
        .replace(/ \(Already Booked\)/g, "")
        .trim();
      let isBooked = bookedSlots.some(
        (booking) =>
          booking.startDate === selectedDateStr && booking.time === timeStr
      );

      slot.disabled = isBooked;
      slot.checked = false;
      slot.nextElementSibling.innerHTML = isBooked
        ? `${timeStr} <span class="text-red-500">(Already Booked)</span>`
        : timeStr;
    });
  }

  // Event Handlers
  okButton.addEventListener("click", () => {
    selectedTime = document.querySelector('input[name="time-slot"]:checked');

    if (!selectedDate || !selectedTime) {
      let errorMessage = "Please complete the following:\n";
      if (!selectedDate) errorMessage += "• Select a date\n";
      if (!selectedTime) errorMessage += "• Select a time slot\n";
      alert(errorMessage);
      return;
    }

    const dateStr = `${months[selectedDate.month]} ${selectedDate.day}, ${
      selectedDate.year
    }`;
    const timeStr = selectedTime.nextElementSibling.textContent
      .replace(" (Already Booked)", "")
      .trim();

    // Show centralized payment popup
    window.openPaymentPopup({
      ...window.paymentConfigs.mma.single,
      date: dateStr,
      time: timeStr,
      redirectUrl: "user-schedule-mma.html",
    });
  });

  // Cancel button - Return to MMA page
  cancelButton.addEventListener("click", () => {
    window.location.href = "mixed-martial-arts.html";
  });

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

  // Initial render
  renderCalendar();
  updateAvailableTimeSlots();
});
