const bookBtn = document.getElementById('book_now_btn');
if (bookBtn) {
    bookBtn.addEventListener('click', async function (event) {
        event.preventDefault(); // Prevent any default behavior, if applicable.
        const urlParams = new URLSearchParams(window.location.search);
        const trekId = urlParams.get('id'); // Use 'id' instead of 'trekId'

        if (!trekId) {
            alert('Invalid Trek ID!');
            return;
        }
        try {
            // Make a call to the user status endpoint.
            const response = await fetch('/api/user/me', {
                method: 'GET',
                credentials: 'include', // Ensures cookies (JWT cookie) are sent along with the request.
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (response.ok) {
                window.location.href = `/booking.html?id=${trekId}`;
            } else {
                Swal.fire({
                    position: "top-end",
                    icon: "error",
                    title: "Login Required!",
                    showConfirmButton: false,
                    timer: 800
                }).then(() => {
                    // Redirect to login page after user clicks OK.
                    window.location.href = '/login.html';
                });;
                // window.location.href = '/login.html';

                console.log(`Error: ${response.message}`);
            }
        } catch (error) {
            console.error('Error during login:', error);
            alert('An error occurred while logging in. Please try again later.');
        }
    });
}




document.addEventListener('DOMContentLoaded', function () {

    async function getSpecificTrekDetails() {
        // Extract trek ID from the URL
        const urlParams = new URLSearchParams(window.location.search);
        const trekId = urlParams.get('id'); // Use 'id' instead of 'trekId'

        console.log('trekId:', trekId); // Log trekId for debugging

        if (!trekId) {
            alert('Invalid Trek ID!');
            return;
        }

        // Fetch trek details using the trek ID
        try {
            const response = await fetch(`http://localhost:3000/api/treks/${trekId}`);

            if (!response.ok) {
                throw new Error(`Error: ${response.status} - ${response.statusText}`);
            }

            const trek = await response.json();

            if (response.ok) {

                // Populate other trek details...
                document.getElementById('trek-title').textContent = trek.name;
                document.getElementById('trek-name').textContent = trek.name;
                document.getElementById('trek-description').textContent = trek.description;
                document.getElementById('difficulty-level').textContent = trek.difficultyLevel;
                document.getElementById('total-days').textContent = trek.totalDays;
                document.getElementById('max-altitude').textContent = trek.maxAltitude;
                document.getElementById('best-season').textContent = trek.bestSeason;
                document.getElementById('total-distance').textContent = trek.totalDistance;
                document.getElementById('expenses').textContent = trek.expenses;
                document.getElementById('location').textContent = trek.location;

                // If trek includes a location, fetch and display weather info.
                if (trek.location) {
                    displayWeatherForTrek(trek.location);
                } else {
                    document.getElementById('weatherInfo').innerHTML = `<p>No location data available.</p>`;
                }


                // ----- SLIDER SETUP -----
                const slider = document.getElementById('slider');
                // Clear any existing content (like the initial placeholder image)
                slider.innerHTML = '';

                // Create slide elements dynamically based on the images array from the backend
                trek.images.forEach((image, index) => {
                    const imgElement = document.createElement('img');
                    imgElement.src = image;
                    imgElement.alt = `Trek Image ${index + 1}`;
                    imgElement.classList.add('slide');
                    // Hide all slides initially (CSS: you could also use a class for hidden slides)
                    imgElement.style.display = 'none';
                    // Optionally store the index if needed for other logic
                    imgElement.dataset.index = index;
                    slider.appendChild(imgElement);
                });

                // Initialize slider navigation variables
                let currentIndex = 0;
                const slides = slider.getElementsByClassName('slide');
                const totalSlides = slides.length;

                // Show the first image (if any)
                if (totalSlides > 0) {
                    slides[currentIndex].style.display = 'block';
                }

                // Function to change slide display
                const showSlide = (index) => {
                    // Hide all slides
                    for (let i = 0; i < totalSlides; i++) {
                        slides[i].style.display = 'none';
                    }
                    // Display the slide at the given index
                    slides[index].style.display = 'block';
                };

                // Handle the 'next' button click
                document.getElementById('next').addEventListener('click', () => {
                    currentIndex = (currentIndex + 1) % totalSlides;
                    showSlide(currentIndex);
                });

                // Handle the 'prev' button click
                document.getElementById('prev').addEventListener('click', () => {
                    currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
                    showSlide(currentIndex);
                });


                // Fetch and display all trek reviews, excluding the current user's review
                const reviewsList = document.getElementById('reviews-list');
                const token = localStorage.getItem('token'); // Assume token is used for identifying the user
                const userId = localStorage.getItem('userId');
                const currentUserReview = {};
                if (trek.reviews && trek.reviews.length > 0) {
                    // Filter out the current user's review from the general list of reviews
                    const filteredReviews = trek.reviews.filter(review => {
                        console.log(`userId: ${userId}, review userId: ${review.user._id}`);
                        if (review.user?._id === userId) {
                            currentUserReview.review = review;
                            return false;
                        }
                        return true;
                    });


                    // Display the remaining reviews
                    filteredReviews.forEach(review => {
                        const reviewElement = document.createElement('div');
                        reviewElement.classList.add('review');
                        reviewElement.innerHTML = `
                      <p><strong>User:</strong> ${review.user.fullName}</p>
                      <p><strong>Rating:</strong> ${review.rating}/5</p>
                      <p>${review.review}</p>
                  `;
                        reviewsList.appendChild(reviewElement);
                    });


                } else {
                    reviewsList.innerHTML = `<p>No reviews at the moment.</p>`;
                }


                // Fetch and display "My Review" (fetch based on user token and trek ID)
                const myReviewSection = document.getElementById('my-review');


                if (token) {
                    try {
                        const myReviewResponse = await fetch(`http://localhost:3000/api/treks/${trekId}/my-review`, {
                            headers: {
                                'Content-Type': 'application/json'

                            },
                            // Include credentials to ensure cookies are sent with the request
                            credentials: 'include',
                        });

                        // Check if the response is OK or not (200 OK)
                        if (myReviewResponse.ok) {
                            const myReview = await myReviewResponse.json();

                            // If a review exists, display it
                            myReviewSection.innerHTML = `
                            <h3>My Review</h3>
                            <p><strong>Rating:</strong> ${myReview.rating}/5</p>
                            <p>${myReview.review}</p>
                            <button class="edit-review" onclick="editReview(${myReview.review._id})">Edit</button>
                            <button class="delete-review" onclick="deleteReview(${myReview.review._id})">Delete</button>
                        `;
                        }
                        // Handle the 404 case with the message "No review found"
                        else if (myReviewResponse.status === 404) {
                            const myReview = await myReviewResponse.json();

                            // Check if the message indicates no review found
                            if (myReview.message === 'No review found for this user on this trek destination') {
                                myReviewSection.innerHTML = `<p>You haven't submitted a review yet.</p>`;

                                // Create and append the "Add Review" button
                                const addReviewButton = document.createElement('button');
                                addReviewButton.innerText = 'Add Your Review';
                                addReviewButton.onclick = () => addReview(); // Replace with your review submission logic
                                myReviewSection.appendChild(addReviewButton);
                            }
                        }
                        // Handle other errors
                        else {
                            throw new Error(`Error fetching your review: ${myReviewResponse.status}`);
                        }
                    } catch (error) {
                        console.error('Error fetching my review:', error);
                        // myReviewSection.innerHTML = `<p>An error occurred while fetching your review.</p>`;
                    }
                } else {
                    // User is not logged in, optionally show a login prompt
                    myReviewSection.innerHTML = `<p>Please log in to submit a review.</p>`;
                }
            }
        } catch (error) {
            console.error('Error fetching trek details:', error);
            alert('An error occurred while fetching trek details.');
        }
    }

    getSpecificTrekDetails()
});

// Function to edit a review
async function editReview() {

    // Extract trek ID from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const trekId = urlParams.get('id'); // Use 'id' instead of 'trekId'

    console.log('trekId:', trekId); // Log trekId for debugging

    if (!trekId) {
        alert('Invalid Trek ID!');
        return;
    }

    const newReview = prompt("Enter your new review:");
    const newRating = prompt("Enter your new rating (1-5):");

    if (newReview && newRating) {
        try {

            const response = await fetch(`http://localhost:3000/api/treks/${trekId}/my-review`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                // Include credentials to ensure cookies are sent with the request
                credentials: 'include',
                body: JSON.stringify({ review: newReview, rating: newRating })
            });

            if (response.ok) {
                Swal.fire({
                    position: "top-end",
                    icon: "success",
                    title: 'Review updated successfully!',
                    showConfirmButton: false,
                    timer: 1500
                }).then(() => {
                    location.reload();
                });;
            } else {
                throw new Error('Failed to update review');
            }
        } catch (error) {
            console.error('Error updating review:', error);
            // alert('An error occurred while updating the review.');
            Swal.fire({
                position: "top-end",
                icon: "error",
                title: 'An error occurred while deleting the review.',
                showConfirmButton: false,
                timer: 1500
            })
        }
    }
}


// Function to delete a review
async function deleteReview() {
    // Extract trek ID from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const trekId = urlParams.get('id'); // Use 'id' instead of 'trekId'

    console.log('trekId:', trekId); // Log trekId for debugging
    if (!trekId) {
        alert('Invalid Trek ID!');
        return;
    }
    if (confirm('Are you sure you want to delete your review?')) {
        try {

            const response = await fetch(`http://localhost:3000/api/treks/${trekId}/my-review`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'

                },
                // Include credentials to ensure cookies are sent with the request
                credentials: 'include',
            });

            if (response.ok) {
                Swal.fire({
                    position: "top-end",
                    icon: "success",
                    title: 'Review deleted successfully',
                    showConfirmButton: false,
                    timer: 1500
                }).then(() => {
                    location.reload();
                });;
            } else {
                throw new Error('Failed to delete review');
            }
        } catch (error) {
            console.error('Error deleting review:', error);
            Swal.fire({
                position: "top-end",
                icon: "error",
                title: 'An error occurred while deleting the review.',
                showConfirmButton: false,
                timer: 1500
            })
        }
    }
}



async function addReview() {
    // Extract trek ID from the URL query string
    const urlParams = new URLSearchParams(window.location.search);
    const trekId = urlParams.get('id'); // Use 'id' as the query parameter

    console.log('trekId:', trekId); // Debug: log trekId
    if (!trekId) {
        alert('Invalid Trek ID!');
        return;
    }

    // Show the review form
    const reviewFormTemplate = document.getElementById('reviewFormTemplate');
    reviewFormTemplate.style.display = 'block';



    // Get the form element
    const addReviewForm = document.getElementById('addReviewForm');

    // Handle form submission
    addReviewForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Collect review data from the form
        const rating = document.getElementById('rating').value;
        const review = document.getElementById('review').value;

        try {
            const response = await fetch(`http://localhost:3000/api/treks/${trekId}/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'

                },
                // Include credentials to ensure cookies are sent with the request
                credentials: 'include',
                body: JSON.stringify({
                    rating: rating,
                    review: review
                })
            });

            const result = await response.json();

            if (response.ok) {
                // alert(result.message); // e.g., "Review added successfully"
                Swal.fire({
                    position: "top-end",
                    icon: "success",
                    title: result.message,
                    showConfirmButton: false,
                    timer: 1500
                }).then(() => {
                    window.location.reload();
                });;
                // window.location.reload(); // Reload the page to reflect the new review
            } else {
                throw new Error(result.message || 'Failed to submit review');
            }
        } catch (error) {
            console.error('Error submitting review:', error);
            // alert('There was an error submitting your review. Please try again.');
            Swal.fire({
                position: "top-end",
                icon: "error",
                title: 'There was an error submitting your review. Please try again.',
                showConfirmButton: false,
                timer: 1500
            })
        }
    });
}





// Weather API integration:
const apiKey = 'f53d6f395a446958508b380ba021d7d5'; // Replace with your actual OpenWeatherMap API key
const weatherBaseURL = 'https://api.openweathermap.org/data/2.5/weather';

// Fetch weather data for a given location
function fetchWeatherForLocation(location) {
    const url = `${weatherBaseURL}?q=${encodeURIComponent(location)}&appid=${apiKey}&units=metric`;
    return fetch(url)
        .then(response => response.json())
        .catch(error => {
            console.error('Error fetching weather data:', error);
            return null;
        });
}

// Display weather data in the #weatherInfo container
function displayWeatherForTrek(location) {
    const weatherContainer = document.getElementById('weatherInfo');
    fetchWeatherForLocation(location).then(data => {
        if (data && data.cod === 200) {
            const weatherDescription = data.weather[0].description;
            const temperature = data.main.temp;
            const icon = data.weather[0].icon;
            weatherContainer.innerHTML = `
                <h4>Weather</>
            <p>${weatherDescription.charAt(0).toUpperCase() + weatherDescription.slice(1)}</p>
                <p><strong>${temperature}°C</strong></p>
                <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="Weather Icon" />
            `;
        } else {
            weatherContainer.innerHTML = `<p>Weather data not available for ${location}</p>`;
        }
    });
}
