function renderSignup() {
    document.querySelector('.js-create-acc').innerHTML = `
        <div class="flex flex-col md:flex-row text-white bg-black shadow-lg rounded-lg overflow-hidden w-full max-w-4xl">
            
            <div class="flex flex-col items-center justify-center p-8 w-full md:w-1/2">
                <div class="flex items-center mb-5">
                    <img src="./assets/herdoza-logo-trans.png" alt="Logo" class="h-12">
                    <div class="orbitron font-bold text-sm ms-2">HERDOZA FITNESS CENTER</div>
                </div>

                <form action="" class="flex flex-col w-full">
                    <div class="text-3xl font-bold mb-6 text-center">Sign Up</div>

                    <div class="mb-4">
                        <label for="first-name" class="text-sm">First Name</label>
                        <input type="text" placeholder="Enter first name" 
                            class="border rounded-md w-full bg-black p-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-red-600" required>
                    </div>

                    <div class="mb-4">
                        <label for="last-name" class="text-sm">Last Name</label>
                        <input type="text" placeholder="Enter last name" 
                            class="border rounded-md w-full bg-black p-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-red-600" required>
                    </div>

                    <div class="mb-4">
                        <label for="contact" class="text-sm">Contact Number</label>
                        <input type="number" placeholder="Enter contact no." 
                            class="border rounded-md w-full bg-black p-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-red-600" required>
                    </div>

                    <div class="mb-5 mt-10 text-center">
                        <button type="submit" class="bg-red-600 px-10 py-2 rounded-lg hover:bg-red-700 transition text-white text-lg cursor-pointer">
                            Create Account
                        </button>
                    </div>
                </form>
            </div>

            <div class="bg-red-600 text-center flex flex-col justify-center items-center p-8 w-full md:w-1/2 lg:rounded-l-4xl">
                <div class="mb-5 text-2xl font-bold">Welcome to Our Gym!</div>
                <div class="text-sm mb-4">Already have an account?</div>
                <button class="border border-white text-lg font-bold px-6 py-2 rounded-lg hover:bg-white hover:text-black transition cursor-pointer">
                    <a href="login.html">Login</a>
                </button>
            </div>

        </div>`;
        
}
function validateAndRenderSignup(event) {
    event.preventDefault(); 

    const form = document.querySelector(".js-create-acc form");
    const passwordInput = document.querySelector('input[placeholder="+6 characters"]');
    const confirmPasswordInput = document.querySelector('input[placeholder="Enter your password"]');
    const checkbox = document.querySelector("#agreeTerms");

    
    if (!form.checkValidity()) {
        form.reportValidity(); 
        return;
    }

    
    if (passwordInput.value !== confirmPasswordInput.value) {
        confirmPasswordInput.setCustomValidity("Passwords do not match.");
    } else {
        confirmPasswordInput.setCustomValidity(""); 
    }

    

    
    if (passwordInput.value !== confirmPasswordInput.value) {
        return;
    }

    
    if (!checkbox.checked) {
        checkbox.setCustomValidity("You must agree to Herdoza's Gym Fitness terms.");
        checkbox.reportValidity(); 
        return;
    } else {
        checkbox.setCustomValidity(""); 
    }

    
    setTimeout(() => {
        renderSignup();
    }, 500);
}


document.addEventListener("DOMContentLoaded", function () {
    const signupButton = document.querySelector(".js-signup-btn");

    if (signupButton) {
        signupButton.addEventListener("click", validateAndRenderSignup);
    }
});




