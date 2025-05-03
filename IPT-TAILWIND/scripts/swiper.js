const swiper = new Swiper('.mySwiper', {
    loop: true,
    
    spaceBetween: 20,
    slidesPerView: "auto",
    centeredSlides: true,
    autoplay: {
        delay: 3000,
        disableOnInteraction: true,
    },

    pagination: {
        el: '.swiper-pagination',
        clickable: true,
        dynamicBullets: true,
    },

    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },
});