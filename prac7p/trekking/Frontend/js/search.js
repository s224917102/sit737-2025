// search.js

// Get references to the elements
const searchInput = document.getElementById('searchInput');
const searchModal = document.getElementById('searchModal');
const modalSearchInput = document.getElementById('modalSearchInput');
const modalSearchResults = document.getElementById('modalSearchResults');
const closeModal = document.getElementById('closeModal');
const modalSearchButton = document.getElementById('modalSearchButton');

// Function to open the modal
searchInput.addEventListener('click', () => {
    searchModal.style.display = 'flex'; // Show the modal
    modalSearchInput.focus(); // Focus on the modal search input
});

// Function to close the modal
closeModal.addEventListener('click', () => {
    searchModal.style.display = 'none'; // Hide the modal
});

// Close the modal when clicking outside of it
window.addEventListener('click', (event) => {
    if (event.target === searchModal) {
        searchModal.style.display = 'none'; // Hide the modal
    }
});



// Function to handle the search
async function handleSearch(searchTerm) {
    if (!searchTerm) {
        modalSearchResults.innerHTML = ''; // Clear results if the search term is empty
        return;
    }

    try {
        // Fetch filtered trek data from the API
        const response = await fetch(`/api/treks/search?name=${encodeURIComponent(searchTerm)}`);
        if (!response.ok) {
            throw new Error('Failed to fetch trek data');
        }

        const treks = await response.json(); // Parse the JSON response

        // Display the search results
        displaySearchResults(treks);
    } catch (error) {
        console.error('Error searching for treks:', error);
        alert('An error occurred while searching. Please try again.');
    }
}



// Function to display search results
function displaySearchResults(treks) {
    modalSearchResults.innerHTML = ''; // Clear previous results

    if (treks.length === 0) {
        // Display a message if no treks are found
        modalSearchResults.innerHTML = '<p>No treks found. Try a different search term.</p>';
        return;
    }



    // Display the filtered treks
    const resultsHTML = treks.map(trek => `
        <a href="specific_trek.html?id=${trek._id}" class="trek-link" style="text-decoration: none; color: inherit;">
        <div class="trek-card">
            <h3>${trek.name}</h3>
            <p><strong>Difficulty:</strong> ${trek.difficultyLevel}</p>
            <p><strong>Max Altitude:</strong> ${trek.maxAltitude} meters</p>
            <p><strong>Best Season:</strong> ${trek.bestSeason}</p>
        </div>
        </a>
    `).join('');

    modalSearchResults.innerHTML = resultsHTML;
}



// Listen for input events on the modal search input
modalSearchInput.addEventListener('input', () => {
    const searchTerm = modalSearchInput.value.trim();
    handleSearch(searchTerm); // Trigger search on every input change
});



// Optional: Listen for "Enter" key press in the modal search input
modalSearchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const searchTerm = modalSearchInput.value.trim();
        handleSearch(searchTerm);
    }
});



// Optional: Add a search button in the modal
modalSearchButton.addEventListener('click', () => {
    const searchTerm = modalSearchInput.value.trim();
    handleSearch(searchTerm);
});



