/**
 * User Schedule JavaScript
 * This file handles fetching and displaying user booking data in the schedule pages
 */

document.addEventListener("DOMContentLoaded", async function () {
  // Identify which schedule page we're on
  const currentPage = window.location.pathname.split("/").pop();

  // Initialize schedule container
  const scheduleContainer = document.querySelector(".bg-red-900");
  if (!scheduleContainer) return;

  try {
    // Show loading state
    scheduleContainer.innerHTML = '<h1 class="text-xl font-bold text-white">My Schedule</h1><div class="text-white mt-4">Loading your schedule...</div>';

    // Fetch and display bookings
    const bookings = await fetchUserBookings();
    displayBookings(bookings, currentPage);

  } catch (error) {
    console.error("Error loading schedule:", error);
    scheduleContainer.innerHTML = '<h1 class="text-xl font-bold text-white">My Schedule</h1><div class="text-white mt-4">Failed to load schedule. Please try again later.</div>';
  }
});

/**
 * Fetch user bookings from backend or localStorage
 * @returns {Promise} - Promise that resolves with booking data
 */
async function fetchUserBookings() {
  try {
    // Try to get bookings from backend first
    const response = await fetch('http://localhost:3000/api/user/bookings', {
      headers: { 'Content-Type': 'application/json' }
    });

    if (response.ok) {
      const bookings = await response.json();
      return bookings;
    }
  } catch (error) {
    console.warn('Failed to fetch from backend, using localStorage:', error);
  }

  // Fallback to localStorage if backend fails
  return {
    mmaPerSession: JSON.parse(localStorage.getItem('mmaPerSessionBookings') || '[]'),
    mmaBulkSession: JSON.parse(localStorage.getItem('mma25SessionUserBookings') || '[]'),
    mmaZumba: JSON.parse(localStorage.getItem('mmaZumbaBookings') || '[]'),
    zumba: JSON.parse(localStorage.getItem('zumbaBookings') || '[]'),
    studio: [
      ...JSON.parse(localStorage.getItem('smallStudioBookings') || '[]'),
      ...JSON.parse(localStorage.getItem('largeStudioBookings') || '[]')
    ]
  };
}

/**
 * Display bookings from backend/localStorage
 * @param {Object} bookings - All user bookings data
 * @param {String} currentPage - Current page name (e.g., "user-schedule-mma.html")
 */
function displayBookings(bookings, currentPage) {
  if (!bookings) {
    console.error("No booking data provided");
    return;
  }

  // Clear existing bookings except the heading
  const scheduleContainer = document.querySelector(".bg-red-900");
  const heading = scheduleContainer?.querySelector("h1");
  if (scheduleContainer) {
    scheduleContainer.innerHTML = "";
    if (heading) {
      scheduleContainer.appendChild(heading);
    }
  }

  // Get relevant bookings based on current page
  let relevantBookings = [];
  let bookingType = "";

  switch (currentPage) {
    case "user-schedule-mma.html":
      relevantBookings = [
        ...(bookings.mmaPerSession || []).map(b => ({ ...b, type: "single" })),
        ...(bookings.mmaBulkSession || []).map(b => ({ ...b, type: "bulk" }))
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
      console.warn("Unknown schedule page:", currentPage);
      return;
  }

  // Sort bookings by date
  relevantBookings.sort((a, b) => {
    const dateA = new Date(a.date || a.startDate);
    const dateB = new Date(b.date || b.startDate);
    return dateB - dateA;
  });

  // Display bookings or "no bookings" message
  if (relevantBookings.length === 0) {
    const noBookingsMsg = document.createElement("div");
    noBookingsMsg.className = "text-white mt-4";
    noBookingsMsg.textContent = "No upcoming bookings found.";
    scheduleContainer.appendChild(noBookingsMsg);
    return;
  }

  // Create and append booking elements
  relevantBookings.forEach(booking => {
    const bookingElement = createBookingElement(booking, bookingType);
    scheduleContainer.appendChild(bookingElement);
  });
}

/**
 * Create HTML element for a booking
 * @param {Object} booking - Booking data
 * @param {String} type - Type of booking
 * @returns {HTMLElement} - Booking element
 */
function createBookingElement(booking, type) {
  const bookingDiv = document.createElement("div");
  bookingDiv.className = "bg-gray-800 p-4 rounded-lg mt-4 text-white";
  
  const date = booking.date || booking.startDate;
  const status = booking.status || "pending";
  const statusColor = status === "confirmed" ? "text-green-500" : 
                     status === "pending" ? "text-yellow-500" : "text-red-500";
  
  let content = "";
  
  switch(type) {
    case "mma":
      content = `
        <div class="flex justify-between items-center">
          <div>
            <div class="font-bold">${booking.type === "bulk" ? "25-Session Package" : "Single Session"}</div>
            <div class="text-sm text-gray-400">${date}</div>
            <div class="text-sm">Time: ${booking.time}</div>
            ${booking.type === "bulk" ? `<div class="text-sm">End Date: ${booking.endDate}</div>` : ""}
          </div>
          <div class="text-sm ${statusColor} capitalize">${status}</div>
        </div>
      `;
      break;
      
    case "mmaZumba":
      content = `
        <div class="flex justify-between items-center">
          <div>
            <div class="font-bold">MMA + Zumba Package</div>
            <div class="text-sm text-gray-400">${booking.date}</div>
            <div class="text-sm">MMA Time: ${booking.time}</div>
            <div class="text-sm">Zumba: ${booking.zumbaSchedule}</div>
          </div>
          <div class="text-sm ${statusColor} capitalize">${status}</div>
        </div>
      `;
      break;
      
    case "zumba":
      content = `
        <div class="flex justify-between items-center">
          <div>
            <div class="font-bold">Zumba Session</div>
            <div class="text-sm text-gray-400">${booking.date}</div>
            <div class="text-sm">Time: ${booking.time}</div>
          </div>
          <div class="text-sm ${statusColor} capitalize">${status}</div>
        </div>
      `;
      break;
      
    case "studio":
      content = `
        <div class="flex justify-between items-center">
          <div>
            <div class="font-bold">Dance Studio ${booking.studioType === 'small' ? 'Solo/Small Group' : 'Large Group'}</div>
            <div class="text-sm text-gray-400">${booking.date}</div>
            <div class="text-sm">Time: ${booking.time}</div>
            <div class="text-sm">People: ${booking.numberOfPeople}</div>
          </div>
          <div class="text-sm ${statusColor} capitalize">${status}</div>
        </div>
      `;
      break;
  }
  
  bookingDiv.innerHTML = content;
  return bookingDiv;
}
