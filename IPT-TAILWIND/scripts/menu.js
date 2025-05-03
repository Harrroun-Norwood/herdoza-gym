document.addEventListener("DOMContentLoaded", function () {
    const menuBtn = document.getElementById("menu-btn");
    const closeBtn = document.getElementById("close-btn");
    const sidebarMenu = document.getElementById("sidebar-menu");
    const body = document.body;

    menuBtn.addEventListener("click", function () {
        sidebarMenu.classList.remove("-translate-x-full");
        body.style.overflow = "hidden"; 
    });

    closeBtn.addEventListener("click", function () {
        sidebarMenu.classList.add("-translate-x-full");
        body.style.overflow = "auto"; 
    });

   
    document.addEventListener("click", function (event) {
        if (!sidebarMenu.contains(event.target) && !menuBtn.contains(event.target)) {
            sidebarMenu.classList.add("-translate-x-full");
            body.style.overflow = "auto"; 
        }
    });
});