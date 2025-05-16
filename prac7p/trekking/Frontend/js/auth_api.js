// Register new user api integration
const signupForm = document.getElementById('signupForm');
if (signupForm) {
    signupForm.addEventListener('submit', async function (event) {
        event.preventDefault(); // Prevent the default form submission

        const fullName = document.getElementById('fullName').value;
        const phone = document.getElementById('phone').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const gender = document.getElementById('gender').value;

        // Form data validation can be done here if necessary
        const signupData = {
            fullName: fullName,
            phone: phone,
            email: email,
            password: password,
            confirmPassword: confirmPassword,
            gender: gender
        };

        try {
            const response = await fetch('http://localhost:3000/api/user/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(signupData)
            });

            const result = await response.json();

            if (response.ok) {
                Swal.fire({
                    position: "top-end",
                    icon: "success",
                    title: "User Created Successfully!",
                    showConfirmButton: false,
                    timer: 1500
                }).then(() => {
                    // Redirect to login page after user clicks OK.
                    window.location.href = '/login.html';
                });;
            } else {
                Swal.fire({
                    position: "top-end",
                    icon: "error",
                    title: result.message,
                    showConfirmButton: false,
                    timer: 1000
                })
                // alert(`Error: ${result.message}`);
            }
        } catch (error) {
            console.error('Error during signup:', error);
            alert('An error occurred while registering. Please try again later.');
        }
    });
}

// Log in api integration
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async function (event) {
        event.preventDefault(); // Prevent the default form submission
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        // Form data validation can be done here if necessary
        const loginData = {
            email: email,
            password: password,
        };

        try {
            const response = await fetch('http://localhost:3000/api/user/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginData)
            });

            const result = await response.json();

            if (response.ok) {
                if (result.user.role == 'admin') {
                    // alert('Admin Logged in successfully!');
                    // window.location.href = '/dashboard.html';
                    Swal.fire({
                        position: "top-end",
                        icon: "success",
                        title: "Admin Logged In Successfully!",
                        showConfirmButton: false,
                        timer: 800
                    }).then(() => {
                        // Redirect to login page after user clicks OK.
                        window.location.href = '/dashboard.html';
                    });;
                } else {
                    // alert('User Logged in successfully!');
                    // window.location.href = '/index.html'; // Redirect to index page on success
                    Swal.fire({
                        position: "top-end",
                        icon: "success",
                        title: "Logged In Successfully!",
                        showConfirmButton: false,
                        timer: 1500
                    }).then(() => {
                        // Redirect to login page after user clicks OK.
                        window.location.href = '/index.html';
                    });;
                }
            } else {
                Swal.fire({
                    position: "top-end",
                    icon: "error",
                    title: result.message,
                    showConfirmButton: false,
                    timer: 900
                })
            }
        } catch (error) {
            console.error('Error during login:', error);
            alert('An error occurred while logging in. Please try again later.');
        }
    });
}

// Log out API integration
const logoutButton = document.getElementById('logoutButton');
if (logoutButton) {
    logoutButton.addEventListener('click', async function () {
        try {
            const response = await fetch('/api/user/logout', {
                method: 'POST', // or GET if you prefer; just make sure it matches your route.
                credentials: 'include'
            });
            if (response.ok) {
                // After logout, update the nav display or redirect to login page.
                window.location.href = '/login.html';
            } else {
                console.error('Logout failed.');
            }
        } catch (error) {
            console.error('Error during logout:', error);
        }
    });
}

