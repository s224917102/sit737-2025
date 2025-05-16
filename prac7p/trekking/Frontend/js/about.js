const menuItems = document.querySelectorAll('.menu-item');
const displayImage = document.getElementById('display-image');
const displayHeading = document.getElementById('display-heading');
const displayDescription = document.getElementById('display-description');
const prevButton = document.querySelector('.nav-button.prev');
const nextButton = document.querySelector('.nav-button.next');

const data = [
  {
    image: "./images/everest.jpeg", // Relative path to the image
    heading: "Everest Tour",
    description: "Explore the serene and beautiful islands with our exclusive tour packages."
  },
  {
    image: "./images/annapurna.jpeg",
    heading: "Annapurna Tour",
    description: "Discover the exotic wildlife in its natural habitat."
  },
  {
    image: "./images/tilicho.jpg",
    heading: "Tilicho",
    description: "Enjoy thrilling mountain biking adventures in breathtaking landscapes."
  }
];

let currentIndex = 0;

menuItems.forEach(item => {
  item.addEventListener('click', () => {
    const index = parseInt(item.getAttribute('data-index'));
    updateDisplay(index);
  });
});

prevButton.addEventListener('click', () => {
  if (currentIndex > 0) {
    updateDisplay(currentIndex - 1);
  }
});

nextButton.addEventListener('click', () => {
  if (currentIndex < data.length - 1) {
    updateDisplay(currentIndex + 1);
  }
});

function updateDisplay(index) {
  currentIndex = index;
  const { image, heading, description } = data[index];
  displayImage.src = image;
  displayHeading.textContent = heading;
  displayDescription.textContent = description;

  menuItems.forEach(menu => menu.classList.remove('active'));
  menuItems[index].classList.add('active');
}

// faq

const faqMenuItems = document.querySelectorAll('.faq-menu-item');
const faqItems = document.querySelectorAll('.faq-item');

faqMenuItems.forEach(menuItem => {
  menuItem.addEventListener('click', () => {
    faqMenuItems.forEach(item => item.classList.remove('active'));
    menuItem.classList.add('active');
  });
});

faqItems.forEach(faqItem => {
  faqItem.addEventListener('click', () => {
    faqItem.classList.toggle('active');
  });
});