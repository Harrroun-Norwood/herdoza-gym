document.addEventListener("DOMContentLoaded", function () {
    const calendar = document.getElementById("calendar");
    const timeSlots = document.getElementById("time-slots");
    const selectedDateDisplay = document.getElementById("selected-date");
    const monthSelector = document.getElementById("month-selector");
    const yearSelector = document.getElementById("year-selector");
    const cancelButton = document.getElementById("cancel-selection");
    const confirmButton = document.getElementById("confirm-selection");

    let selectedDate = null;
    let selectedTime = null;

    const bookedDates = {};
    const allTimeSlots = ["09:00-10:00", "10:00-11:00", "11:00-12:00", "12:00-13:00", "13:00-14:00", "14:00-15:00", "15:00-16:00"];

    function formatDate(year, month, day) {
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        return `${months[month]} ${day}, ${year}`;
    }

    function isDayFullyBooked(date) {
        return bookedDates[date] && allTimeSlots.every(time => bookedDates[date].includes(time));
    }

    function populateSelectors() {
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const currentYear = new Date().getFullYear();

        months.forEach((month, index) => {
            let option = document.createElement("option");
            option.value = index;
            option.textContent = month;
            monthSelector.appendChild(option);
        });

        for (let i = currentYear; i <= currentYear + 5; i++) {
            let option = document.createElement("option");
            option.value = i;
            option.textContent = i;
            yearSelector.appendChild(option);
        }

        monthSelector.value = new Date().getMonth();
        yearSelector.value = new Date().getFullYear();
    }

    function generateCalendar() {
        const selectedMonth = parseInt(monthSelector.value);
        const selectedYear = parseInt(yearSelector.value);
        const firstDay = new Date(selectedYear, selectedMonth, 1).getDay();
        const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
        
        calendar.innerHTML = "";
        
        ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].forEach(day => {
            const dayHeader = document.createElement("div");
            dayHeader.classList.add("day-header");
            dayHeader.textContent = day;
            calendar.appendChild(dayHeader);
        });

        for (let i = 0; i < firstDay; i++) {
            const emptyCell = document.createElement("div");
            emptyCell.classList.add("empty-cell");
            calendar.appendChild(emptyCell);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dayCell = document.createElement("div");
            dayCell.classList.add("day");
            dayCell.textContent = day;
            const formattedDate = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            
            if (isDayFullyBooked(formattedDate)) {
                dayCell.classList.add("disabled");
            }

            dayCell.addEventListener("click", function () {
                if (dayCell.classList.contains("disabled")) return;
                document.querySelectorAll(".day").forEach(d => d.classList.remove("active"));
                dayCell.classList.add("active");
                selectedDate = formattedDate;
                selectedDateDisplay.textContent = `Selected Date: ${formatDate(selectedYear, selectedMonth, day)}`;
                updateTimeSlots();
            });

            calendar.appendChild(dayCell);
        }
    }

    function updateTimeSlots() {
        timeSlots.innerHTML = "";
        allTimeSlots.forEach(time => {
            const wrapper = document.createElement("div");
            wrapper.classList.add("time-wrapper");
            
            const input = document.createElement("input");
            input.type = "radio";
            input.name = "time-slot";
            input.value = time;
            input.id = `time-${time.replace(/[:\-]/g, "")}`;
            
            const label = document.createElement("label");
            label.htmlFor = input.id;
            label.textContent = time;
            label.classList.add("time-label");
            
            const status = document.createElement("span");
            status.classList.add("time-status");
            
            if (selectedDate && bookedDates[selectedDate] && bookedDates[selectedDate].includes(time)) {
                input.disabled = true;
                status.textContent = "Fully Booked";
                status.classList.add("fully-booked");
            }
            
            input.addEventListener("change", function () {
                selectedTime = this.value;
            });

            wrapper.appendChild(input);
            wrapper.appendChild(label);
            wrapper.appendChild(status);
            timeSlots.appendChild(wrapper);
        });
    }

    function showPopupMessage(message) {
        const popup = document.getElementById("popup-message");
        popup.textContent = message;
        popup.classList.add("show");
        setTimeout(() => popup.classList.remove("show"), 3000);
    }

    confirmButton.addEventListener("click", function () {
        if (!selectedDate || !selectedTime) {
            showPopupMessage("❌ Please select a date and time before confirming.");
            return;
        }
        if (!bookedDates[selectedDate]) {
            bookedDates[selectedDate] = [];
        }
        bookedDates[selectedDate].push(selectedTime);
        showPopupMessage(`✅ Booking confirmed for ${formatDate(...selectedDate.split("-").map(Number))} at ${selectedTime}`);
        generateCalendar();
        updateTimeSlots();
    });

    cancelButton.addEventListener("click", function () {
        selectedDate = null;
        selectedTime = null;
        selectedDateDisplay.textContent = "No date selected";
        document.querySelectorAll(".day").forEach(d => d.classList.remove("active"));
        updateTimeSlots();
    });

    monthSelector.addEventListener("change", generateCalendar);
    yearSelector.addEventListener("change", generateCalendar);
    
    populateSelectors();
    generateCalendar();
    updateTimeSlots();
});
