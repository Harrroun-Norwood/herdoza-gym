document.addEventListener("DOMContentLoaded", () => {
  const dates = document.querySelector(".dates");
  const header = document.querySelector(".calendar h3");
  const navs = document.querySelectorAll("#prev, #next");
  const okButton = document.querySelector(".ok-btn");
  const cancelButton = document.querySelector(".cancel-btn");
  const timeSlots = document.querySelectorAll('input[name="time-slot"]');
  const peopleSlots = document.querySelectorAll('input[name="people-slot"]');

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
  let selectedPeople = null;
  let bookedSlots = JSON.parse(
    localStorage.getItem("smallStudioBookings") || "[]"
  );

  function isSameDate(date1, date2) {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
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

  function updateAvailableTimeSlots() {
    timeSlots.forEach((slot) => {
      let isSlotBooked = bookedSlots.some(
        (booking) =>
          booking.date ===
            `${selectedDate?.day}/${selectedDate?.month + 1}/${
              selectedDate?.year
            }` && booking.time === slot.value
      );

      slot.disabled = isSlotBooked;
      const slotLabel = slot.nextElementSibling.textContent
        .replace(/ \(Already Booked\)/g, "")
        .trim();
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

  // OK Button - Open centralized payment popup with validation
  okButton.addEventListener("click", () => {
    selectedTime = document.querySelector('input[name="time-slot"]:checked');
    selectedPeople = document.querySelector(
      'input[name="people-slot"]:checked'
    );

    // Validate all fields
    const validations = [];
    if (!selectedDate) validations.push("• Please select a date");
    if (!selectedTime) validations.push("• Please select a time slot");
    if (!selectedPeople) validations.push("• Please select number of people");

    if (validations.length > 0) {
      alert("Please complete the following:\n" + validations.join("\n"));
      return;
    }

    // Get booking details and open centralized payment popup
    const dateStr = `${months[selectedDate.month]} ${selectedDate.day}, ${
      selectedDate.year
    }`;
    const timeStr = selectedTime.nextElementSibling.textContent
      .replace(" (Already Booked)", "")
      .trim();
    const peopleStr = selectedPeople.nextElementSibling.textContent.trim();

    // Show centralized payment popup
    window.openPaymentPopup({
      ...window.paymentConfigs.studio.small,
      date: dateStr,
      time: timeStr,
      type: "small-studio",
      description: `Dance Studio Solo/Small Group (${peopleStr})`,
      extras: {
        numberOfPeople: peopleStr,
        studioType: "small",
      },
      redirectUrl: "user-schedule-studio.html",
    });
  });

  // Cancel button - Reset all selections
  cancelButton.addEventListener("click", () => {
    selectedDate = null;
    selectedTime = null;
    selectedPeople = null;

    // Reset time slots
    timeSlots.forEach((slot) => {
      slot.checked = false;
      const label = slot.nextElementSibling;
      if (label) {
        label.innerHTML = `<span class="time-label">${label.textContent
          .replace(/ \(Already Booked\)/g, "")
          .trim()}</span>`;
        label.style.color = "";
      }
    });

    // Reset people selection
    peopleSlots.forEach((slot) => (slot.checked = false));

    // Update UI
    updateAvailableTimeSlots();
    renderCalendar();

    // Return to main page
    window.location.href = "dance-studio.html";
  });

  // Initialize the calendar
  renderCalendar();
  updateAvailableTimeSlots();
});
