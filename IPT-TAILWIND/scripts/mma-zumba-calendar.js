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
    localStorage.getItem("mmaZumbaBookings") || "[]"
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
        updateZumbaSchedule();
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

  function updateAvailableTimeSlots() {
    if (!selectedDate) return;

    const dateStr = `${months[selectedDate.month]} ${selectedDate.day}, ${
      selectedDate.year
    }`;

    timeSlots.forEach((slot) => {
      const timeStr = slot.nextElementSibling.textContent
        .replace(/ \(Already Booked\)/g, "")
        .trim();
      const isBooked = bookedSlots.some(
        (booking) => booking.date === dateStr && booking.time === timeStr
      );

      slot.disabled = isBooked;
      slot.checked = false;

      if (isBooked) {
        slot.nextElementSibling.innerHTML = `${timeStr} <span class="text-red-500">(Already Booked)</span>`;
      } else {
        slot.nextElementSibling.innerHTML = timeStr;
      }
    });
  }

  // Add updateZumbaSchedule function
  function updateZumbaSchedule() {
    const zumbaScheduleDiv = document.getElementById("zumba-schedule");

    if (selectedDate) {
      const dateStr = `${months[selectedDate.month]} ${selectedDate.day}, ${
        selectedDate.year
      }`;
      const timeStr = "7:00 AM - 8:00 AM";
      zumbaScheduleDiv.innerHTML = `${dateStr}<br>${timeStr}`;
    } else {
      zumbaScheduleDiv.textContent = "Select an MMA date first";
    }
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

  // OK Button handler
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
    const timeStr = selectedTime.nextElementSibling.textContent.trim();
    const zumbaTimeStr = "7:00 AM - 8:00 AM";

    // Show payment popup with all the details
    const type = "MMA + Zumba Package";
    window.openPaymentPopup({
      ...window.paymentConfigs.mma.zumba,
      title: type,
      date: dateStr,
      time: timeStr,
      extras: {
        zumbaTime: zumbaTimeStr,
      },
      type: "mma-zumba",
      description: "MMA training session + Zumba class on the same day",
      redirectUrl: "user-schedule-mma-zumba.html",
    });
  });
  // Cancel button handler - Return to MMA page
  cancelButton.addEventListener("click", () => {
    window.location.href = "./mixed-martial-arts.html";
  });

  // Initialize calendar and available time slots
  renderCalendar();
  updateAvailableTimeSlots();
  updateZumbaSchedule();
});
