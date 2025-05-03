// Event Section
document.addEventListener("DOMContentLoaded", function () {
  // Add click handler for the events section
  const eventSection = document.querySelector("#event-section");
  if (eventSection) {
    eventSection.style.cursor = "pointer";
    eventSection.addEventListener("click", function () {
      window.open("https://www.facebook.com/HerdozaFitnessCenter", "_blank");
    });
  }
});
