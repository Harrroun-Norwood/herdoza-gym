/**
 * User Schedule JavaScript
 * This file handles fetching and displaying user booking data in the schedule pages
 */

document.addEventListener("DOMContentLoaded", function () {
  // Identify which schedule page we're on
  const currentPage = window.location.pathname.split("/").pop();

  // Initialize schedule container
  const scheduleContainer = document.querySelector(".bg-red-900");

  // Fetch bookings from backend or localStorage
  fetchUserBookings()
    .then((bookings) => {
      displayBookings(bookings, currentPage);
    })
    .catch((error) => {
      console.error("Error fetching bookings:", error);
      // If API fails, try to get from localStorage as fallback
      displayBookingsFromLocalStorage(currentPage);
    });

  /**
   * Fetch user bookings from backend or localStorage
   * @returns {Promise} - Promise that resolves with booking data
   */
  async function fetchUserBookings() {
    try {
      // Check if we have a token (logged in) and booking API is available
      if (
        window.bookingApi &&
        localStorage.getItem("userToken") &&
        localStorage.getItem("userToken") !== "demo-token"
      ) {
        // Fetch from backend
        const response = await window.bookingApi.getUserBookings();
        return response.bookings;
      } else {
        // Use localStorage in demo mode
        // Merge small and large studio bookings into a single array
        const smallStudioBookings = JSON.parse(
          localStorage.getItem("smallStudioBookings") || "[]"
        );
        const largeStudioBookings = JSON.parse(
          localStorage.getItem("largeStudioBookings") || "[]"
        );
        const studioBookings = [...smallStudioBookings, ...largeStudioBookings];

        return {
          mmaPerSession: JSON.parse(
            localStorage.getItem("mmaPerSessionBookings") || "[]"
          ),
          mmaBulkSession: JSON.parse(
            localStorage.getItem("mma25SessionUserBookings") || "[]"
          ),
          mmaZumba: JSON.parse(
            localStorage.getItem("mmaZumbaBookings") || "[]"
          ),
          zumba: JSON.parse(localStorage.getItem("zumbaBookings") || "[]"),
          studio: studioBookings,
        };
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      throw error;
    }
  }

  /**
   * Display bookings from MongoDB/API
   * @param {Object} bookings - All user bookings data
   * @param {String} currentPage - Current page name (e.g., "user-schedule-mma.html")
   */
  function displayBookings(bookings, currentPage) {
    // Clear existing bookings except the heading
    const heading = scheduleContainer.querySelector("h1");
    scheduleContainer.innerHTML = "";
    scheduleContainer.appendChild(heading);

    // Select which bookings to display based on current page
    let relevantBookings = [];
    let bookingType = "";

    switch (currentPage) {
      case "user-schedule-mma.html":
        // Show both per-session and bulk MMA bookings
        relevantBookings = [
          ...(bookings.mmaPerSession || []).map((b) => ({
            ...b,
            type: "single",
          })),
          ...(bookings.mmaBulkSession || []).map((b) => ({
            ...b,
            type: "bulk",
          })),
        ];
        bookingType = "mma";
        break;

      case "user-schedule-mma-zumba.html":
        relevantBookings = bookings.mmaZumba || [];
        bookingType = "mmaZumba";
        break;

      case "user-schedule-zumba.html":
        relevantBookings = bookings.zumba || [];
        bookingType = "zumba";
        break;

      case "user-schedule-studio.html":
        relevantBookings = bookings.studio || [];
        bookingType = "studio";
        break;

      default:
        console.warn("Unknown schedule page");
        return;
    }

    // If no bookings found
    if (!relevantBookings || relevantBookings.length === 0) {
      const noBookingsElement = document.createElement("div");
      noBookingsElement.className =
        "bg-white text-black rounded-lg shadow-lg p-4 mt-4 text-center";
      noBookingsElement.innerHTML =
        'No bookings found. <a href="index.html#service-section" class="text-blue-600 underline">Book a session now</a>.';
      scheduleContainer.appendChild(noBookingsElement);
      return;
    }

    // Sort bookings by date (most recent first)
    relevantBookings.sort((a, b) => {
      const dateA = new Date(a.date || a.startDate);
      const dateB = new Date(b.date || b.startDate);
      return dateB - dateA;
    });

    // Create booking elements
    relevantBookings.forEach((booking) => {
      const bookingElement = createBookingElement(booking, bookingType);
      scheduleContainer.appendChild(bookingElement);
    });
  }

  /**
   * Display bookings from localStorage (fallback if API fails)
   * @param {String} currentPage - Current page name
   */
  function displayBookingsFromLocalStorage(currentPage) {
    // Merge small and large studio bookings into a single array
    const smallStudioBookings = JSON.parse(
      localStorage.getItem("smallStudioBookings") || "[]"
    );
    const largeStudioBookings = JSON.parse(
      localStorage.getItem("largeStudioBookings") || "[]"
    );
    const studioBookings = [...smallStudioBookings, ...largeStudioBookings];

    let bookings = {
      mmaPerSession: JSON.parse(
        localStorage.getItem("mmaPerSessionBookings") || "[]"
      ),
      mmaBulkSession: JSON.parse(
        localStorage.getItem("mma25SessionUserBookings") || "[]"
      ),
      mmaZumba: JSON.parse(localStorage.getItem("mmaZumbaBookings") || "[]"),
      zumba: JSON.parse(localStorage.getItem("zumbaBookings") || "[]"),
      studio: studioBookings,
    };

    displayBookings(bookings, currentPage);
  }

  /**
   * Create a booking element to display in the schedule
   * @param {Object} booking - Booking data
   * @param {String} type - Type of booking (mma, mmaZumba, zumba, studio)
   * @returns {HTMLElement} - Booking element
   */
  function createBookingElement(booking, type) {
    const bookingElement = document.createElement("div");
    bookingElement.className =
      "bg-white text-black rounded-lg shadow-lg p-4 mt-4 flex justify-between items-center";

    let icon, title, dateText, status;

    switch (type) {
      case "mma":
        icon = "mma-icon.png";
        title =
          booking.type === "bulk"
            ? "MMA Training - Full Session (25 Days)"
            : "MMA Training - Single Session";
        dateText =
          booking.type === "bulk"
            ? `${booking.startDate} to ${booking.endDate}, ${booking.time}`
            : `${booking.date}, ${booking.time}`;
        status =
          booking.paymentMethod === "Onsite" ? "Pending Payment" : "Confirmed";
        break;

      case "mmaZumba":
        icon = "mma-icon.png";
        title = "MMA + Zumba Package";
        dateText = `${booking.date}, ${booking.time} (MMA) | ${booking.zumbaSchedule} (Zumba)`;
        status =
          booking.paymentMethod === "Onsite" ? "Pending Payment" : "Confirmed";
        break;

      case "zumba":
        icon = "dance-group-img.jpg";
        title = "Zumba Session";
        dateText = booking;
        status = "Confirmed";
        break;

      case "studio":
        icon = "dance-studio-cal.png";
        // Determine if it's a small or large studio booking
        const studioType =
          booking.type ||
          booking.studioType ||
          (booking.people && parseInt(booking.people) <= 3 ? "small" : "large");
        const studioLabel =
          studioType === "small" ? "Solo/Small Group" : "Large Group";
        const priceInfo =
          studioType === "small"
            ? "₱100 total"
            : `₱${parseInt(booking.people) * 25} (₱25 per person)`;

        title = `Dance Studio - ${studioLabel}`;
        dateText = `${booking.date}, ${booking.time} · ${booking.people} person(s) · ${priceInfo}`;
        status =
          booking.paymentMethod === "Onsite" ? "Pending Payment" : "Confirmed";
        break;
    }

    const statusClass = status.includes("Pending")
      ? "text-yellow-600"
      : "text-green-600";

    bookingElement.innerHTML = `
            <div class="flex items-center gap-2">
                <img src="assets/${icon}" alt="" class="bg-gray-200 p-2 rounded-lg h-12">
                <div>
                    <div class="font-semibold">${title}</div>
                    <div class="text-gray-600 text-sm">${dateText}</div>
                </div>
            </div>
            <div class="${statusClass} font-medium">${status}</div>
        `;

    return bookingElement;
  }
});
