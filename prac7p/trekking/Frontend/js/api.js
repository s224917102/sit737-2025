

const apiUrl = "http://localhost:3000/api/treks";

// Fetch the trek data from the API
async function fetchTrekData() {
    try {
        const response = await fetch(apiUrl);
        const trekData = await response.json();
        return trekData;
    } catch (error) {
        console.error("Error fetching the trek data:", error);
    }
}

// Helper function to generate star rating
function getStarRating(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        stars += i <= rating ? '&#9733;' : '&#9734;'; // Filled star or empty star
    }
    return stars;
}

// Function to dynamically create trek cards and populate the carousel
function populateCarousel(trekData) {
    const carouselTrack = document.querySelector('.carousel-track');

    // Clear the existing carousel content
    carouselTrack.innerHTML = "";

    trekData.forEach(trek => {
        const trekCard = document.createElement('div');
        trekCard.classList.add('carousel-card');

        trekCard.innerHTML = `
    
            <img src="${trek.images[0]}" alt="${trek.name}">
           
                <h3>${trek.name}</h3>
                <div class="rating" style="padding-left: 10px;color: gold;font-size: 24px;">
                    
                    ${getStarRating(trek.averageRating)}
                </div>
                <div class="icons-info">
                    <span><img src="images/trekking.png" alt="Duration"> ${trek.totalDays} days |</span>
                    <span><img src="images/mountain.png" alt="Altitude"> ${trek.maxAltitude}m |</span>
                    <span><img src="images/difficult.png" alt="Difficulty"> ${trek.difficultyLevel}</span>
                </div>
                <p>${trek.description.substring(0, 50)}...</p> <!-- Shorten description -->
               <button class="view-btn" onclick="window.location.href='specific_trek.html?id=${trek._id}'">View &rarr;</button>

          
        `;

        carouselTrack.appendChild(trekCard);
    });
}

// Initialize the trek data and populate the carousel
fetchTrekData().then(trekData => {
    if (trekData) {
        populateCarousel(trekData);
    }
});

