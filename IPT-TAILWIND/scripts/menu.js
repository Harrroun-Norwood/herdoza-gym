document.addEventListener("DOMContentLoaded", function () {
  const menuBtn = document.getElementById("menu-btn");
  const closeBtn = document.getElementById("close-btn");
  const sidebarMenu = document.getElementById("sidebar-menu");
  const body = document.body;

  menuBtn?.addEventListener("click", function () {
    sidebarMenu?.classList.remove("-translate-x-full");
    body.style.overflow = "hidden";
  });

  closeBtn?.addEventListener("click", function () {
    sidebarMenu?.classList.add("-translate-x-full");
    body.style.overflow = "auto";
  });

  document.addEventListener("click", function (event) {
    if (
      sidebarMenu &&
      !sidebarMenu.contains(event.target) &&
      !menuBtn?.contains(event.target)
    ) {
      sidebarMenu.classList.add("-translate-x-full");
      body.style.overflow = "auto";
    }
  });

  // Collapsible menu functionality
  const collapsibleToggles = document.querySelectorAll(
    '[id^="collapsible-toggle-"]'
  );
  collapsibleToggles.forEach((toggle) => {
    toggle.addEventListener("change", function () {
      const label = this.nextElementSibling;
      const chevron = label.querySelector(".bi-chevron-down");
      const list = label.nextElementSibling;
      if (this.checked) {
        list.style.maxHeight = list.scrollHeight + "px";
        chevron.style.transform = "rotate(180deg)";
      } else {
        list.style.maxHeight = "0";
        chevron.style.transform = "rotate(0deg)";
      }
    });
  });

  // Auto-expand the Schedule menu if we're on a schedule page
  const currentPath = window.location.pathname;
  if (currentPath.includes("schedule")) {
    const scheduleToggle = document.getElementById("collapsible-toggle-2");
    if (scheduleToggle && !scheduleToggle.checked) {
      scheduleToggle.checked = true;
      scheduleToggle.dispatchEvent(new Event("change"));
    }
  }
});
