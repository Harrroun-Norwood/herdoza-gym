// Initialize Swiper for both Service and About Us sections
document.addEventListener("DOMContentLoaded", () => {
  // Common configuration for both swipers
  const commonConfig = {
    slidesPerView: 1,
    spaceBetween: 30,
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    grabCursor: true,
    autoplay: {
      delay: 3000,
      disableOnInteraction: false,
    },
    // Only enable loop if there are enough slides
    loop: false,
    // Responsive breakpoints
    breakpoints: {
      // when window width is >= 640px
      640: {
        slidesPerView: 2,
        spaceBetween: 20,
      },
      // when window width is >= 768px
      768: {
        slidesPerView: 2,
        spaceBetween: 30,
      },
    },
  };

  // Initialize About Us section swiper
  const aboutUsSwiper = document.querySelector(".swiper.mySwiper");
  if (aboutUsSwiper) {
    const aboutSwiper = new Swiper(aboutUsSwiper, commonConfig);
  }
});
