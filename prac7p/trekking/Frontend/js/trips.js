const cardsData = [
  { title: "Jeju Oedolgae Beach", duration: "3 Days - 3 Nights", time: "May - June", difficulty: "easy", image: "./images/trek-1.jpg" },
  { title: "Pyramids Of Giza", duration: "6 Days - 5 Nights", time: "June - Oct", difficulty: "hard", image: "./images/trekker-1.jpg" },
  { title: "Nile Adventure", duration: "6 Days - 4 Nights", time: "Mar - May", difficulty: "moderate", image: "./images/trekking.png" },
  { title: "France Heritage Tour", duration: "2 Days - 2 Nights", time: "Feb - Mar", difficulty: "easy", image: "./images/mountain.png" },
  { title: "Statue of Liberty Tour", duration: "4 Days - 3 Nights", time: "Aug - Sept", difficulty: "moderate", image: "./images/back-1.png" },
  { title: "Niagara Falls Adventure", duration: "5 Days - 4 Nights", time: "Apr - May", difficulty: "easy", image: "./images/trekker-1.jpg" },
  { title: "Golden Gate Bridge Tour", duration: "3 Days - 2 Nights", time: "May - July", difficulty: "easy", image: "./images/everest.jpeg" },
  { title: "Mount Rushmore Visit", duration: "2 Days - 1 Night", time: "Sept - Oct", difficulty: "hard", image: "./images/back-1.png" },
  { title: "Santorini Escape", duration: "3 Days - 3 Nights", time: "July - Aug", difficulty: "moderate", image: "./images/trek-1.jpg" },
  { title: "Great Wall of China Tour", duration: "5 Days - 4 Nights", time: "Mar - May", difficulty: "hard", image: "./images/everest.jpeg" }
];

const cardsContainer = document.getElementById("travel-cards");
const paginationContainer = document.getElementById("pagination");
const filterDropdown = document.getElementById("difficulty-filter"); // Filter dropdown element
const cardsPerPage = 8;
let currentPage = 1;
let filteredData = [...cardsData]; // Default to show all cards

// Function to display cards
function displayCards(page) {
  cardsContainer.innerHTML = "";
  const startIndex = (page - 1) * cardsPerPage;
  const endIndex = startIndex + cardsPerPage;
  const cardsToShow = filteredData.slice(startIndex, endIndex);

  cardsToShow.forEach(card => {
    const cardElement = document.createElement("div");
    cardElement.classList.add("card");
    cardElement.innerHTML = `
      <img src="${card.image}" alt="${card.title}">
      <div class="card-content">
        <h4>${card.title}</h4>
        <p>${card.duration}</p>
        <p>${card.time}</p>
        <p>Difficulty: <strong>${card.difficulty}</strong></p>
        <button>EXPLORE TRIP</button>
      </div>
    `;
    cardsContainer.appendChild(cardElement);
  });
}

// Function to create pagination buttons
function createPagination() {
  paginationContainer.innerHTML = "";
  const totalPages = Math.ceil(filteredData.length / cardsPerPage);

  for (let i = 1; i <= totalPages; i++) {
    const button = document.createElement("button");
    button.textContent = i;
    button.classList.add("pagination-button");
    if (i === currentPage) button.classList.add("active");
    button.addEventListener("click", () => {
      currentPage = i;
      displayCards(currentPage);
      createPagination();
    });
    paginationContainer.appendChild(button);
  }

  // Previous and Next buttons
  const prevButton = document.createElement("button");
  prevButton.textContent = "Previous";
  prevButton.disabled = currentPage === 1;
  prevButton.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      displayCards(currentPage);
      createPagination();
    }
  });

  const nextButton = document.createElement("button");
  nextButton.textContent = "Next";
  nextButton.disabled = currentPage === totalPages;
  nextButton.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      displayCards(currentPage);
      createPagination();
    }
  });

  paginationContainer.prepend(prevButton);
  paginationContainer.appendChild(nextButton);
}

// Filter Functionality
filterDropdown.addEventListener("change", (e) => {
  const filterValue = e.target.value;
  if (filterValue === "all") {
    filteredData = [...cardsData];
  } else {
    filteredData = cardsData.filter((card) => card.difficulty === filterValue);
  }
  currentPage = 1; // Reset to the first page
  displayCards(currentPage);
  createPagination();
});

// Initialize the display
displayCards(currentPage);
createPagination();
