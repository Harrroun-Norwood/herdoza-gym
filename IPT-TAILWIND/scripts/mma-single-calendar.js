document.addEventListener("DOMContentLoaded", () => {
  // Get DOM elements
  const dates = document.querySelector(".dates");
  const header = document.querySelector(".calendar h3");
  const navs = document.querySelectorAll("#prev, #next");
  const okButton = document.querySelector(".ok-btn");
  const cancelButton = document.querySelector(".cancel-btn");
  const timeSlots = document.querySelectorAll('input[name="time-slot"]');
  const popupContainer = document.querySelector(".pop-up-con");

  // Initialize state
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
  let date = new Date();
  let month = date.getMonth();
  let year = date.getFullYear();
  let selectedDate = null;
  let selectedTime = null;
  let bookedSlots = JSON.parse(
    localStorage.getItem("mmaSingleBookings") || "[]"
  );

  function renderCalendar() {
    if (!dates || !header) {
      console.error("Calendar elements not found!");
      return;
    }

    const today = new Date();
    const start = new Date(year, month, 1).getDay();
    const endDate = new Date(year, month + 1, 0).getDate();
    const end = new Date(year, month, endDate).getDay();
    const endDatePrev = new Date(year, month, 0).getDate();

    let datesHTML = "";

    // Previous month's days
    for (let i = start; i > 0; i--) {
      datesHTML += `<li class="inactive">${endDatePrev - i + 1}</li>`;
    }

    // Current month's days
    for (let i = 1; i <= endDate; i++) {
      let className = "";
      let currentDate = new Date(year, month, i);
      let dayOfWeek = currentDate.getDay();

      // Check if it's Sunday (dayOfWeek === 0)
      if (dayOfWeek === 0) {
        className = "inactive sunday";
      }
      // Check if date is in the past (excluding today)
      else if (
        currentDate < today &&
        !(
          currentDate.getDate() === today.getDate() &&
          currentDate.getMonth() === today.getMonth()
        )
      ) {
        className = "inactive";
      }
      // Check if it's today
      else if (currentDate.toDateString() === today.toDateString()) {
        className = "today";
      }

      // Check if date is selected
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
    for (let i = end; i < 6; i++) {
      datesHTML += `<li class="inactive">${i - end + 1}</li>`;
    }

    dates.innerHTML = datesHTML;
    header.textContent = `${months[month]} ${year}`;

    // Add click event to days (excluding inactive ones)
    document.querySelectorAll(".dates li:not(.inactive)").forEach((day) => {
      day.addEventListener("click", () => {
        let dayNumber = parseInt(day.dataset.day);
        selectedDate = { day: dayNumber, month: month, year: year };
        updateAvailableTimeSlots();
        renderCalendar();
      });
    });

    // Disable prev button if showing current or past month
    const todayMonth = today.getMonth();
    const todayYear = today.getFullYear();
    document.getElementById("prev").disabled =
      year < todayYear || (year === todayYear && month <= todayMonth);
  }

  function updateAvailableTimeSlots() {
    if (!selectedDate) return;

    let selectedDateStr = `${months[selectedDate.month]} ${selectedDate.day}, ${
      selectedDate.year
    }`;

    timeSlots.forEach((slot) => {
      let slotLabel = slot.nextElementSibling.textContent
        .replace(/ \(Already Booked\)/g, "")
        .trim();
      let isBooked = bookedSlots.some(
        (bookedSlot) =>
          bookedSlot.date === selectedDateStr && bookedSlot.time === slotLabel
      );

      slot.disabled = isBooked;
      slot.checked = false;

      if (isBooked) {
        slot.nextElementSibling.innerHTML = `<span class="time-label">${slotLabel}</span> <span class="booked-text">(Already Booked)</span>`;
        slot.parentElement.style.color = "#ccc";
      } else {
        slot.nextElementSibling.innerHTML = `<span class="time-label">${slotLabel}</span>`;
        slot.parentElement.style.color = "";
      }
    });
  }

  // Calendar navigation buttons
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
  // OK Button - Show payment popup
  okButton?.addEventListener("click", () => {
    selectedTime = document.querySelector('input[name="time-slot"]:checked');

    // Validate selections
    const validations = [];
    if (!selectedDate) validations.push("• Please select a date");
    if (!selectedTime) validations.push("• Please select a time slot");

    if (validations.length > 0) {
      alert("Please complete the following:\n" + validations.join("\n"));
      return;
    }

    const dateStr = `${months[selectedDate.month]} ${selectedDate.day}, ${
      selectedDate.year
    }`;
    const timeStr = selectedTime.nextElementSibling.textContent
      .replace(" (Already Booked)", "")
      .trim(); // Show centralized payment popup
    window.openPaymentPopup({
      ...window.paymentConfigs.mma.single,
      date: dateStr,
      time: timeStr,
      redirectUrl: "user-schedule-mma.html",
    });
  });

  // Cancel button - Return to MMA page
  cancelButton.addEventListener("click", () => {
    window.location.href = "./mixed-martial-arts.html";
  });

  renderCalendar();
  updateAvailableTimeSlots();
});
