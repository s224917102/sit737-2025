

document.addEventListener('DOMContentLoaded', function () {


  // 1. Token-based navigation logic
  async function handleTokenBasedNavigation() {

    try {
      // Make a call to the user status endpoint.
      const response = await fetch('/api/user/me', {
        method: 'GET',
        credentials: 'include', // Ensures cookies (JWT cookie) are sent along with the request.
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const navAuth = document.getElementById('nav-auth');
      const navProfile = document.getElementById('nav-profile');
      if (response.ok) {
        // User is logged in (token valid). You could use the returned user info if needed.
        const data = await response.json();
        console.log('User data:', data);


        // Show profile and logout buttons
        if (navAuth && navProfile) {
          navAuth.style.display = 'none';
          navProfile.style.display = 'block';
        }
      } else {
        // No valid token found, so display login/signup buttons.
        if (navAuth && navProfile) {
          navAuth.style.display = 'block';
          navProfile.style.display = 'none';
        }
      }
    } catch (error) {
      console.error('Error checking user status:', error);
      // On error, default to showing login/signup
      const navAuth = document.getElementById('nav-auth');
      const navProfile = document.getElementById('nav-profile');
      if (navAuth && navProfile) {
        navAuth.style.display = 'block';
        navProfile.style.display = 'none';
      }
    }


  }





  // 2. Carousel logic
  function initCarousel() {
    const track = document.querySelector('.carousel-track');
    const prevButton = document.querySelector('.carousel-button.prev');
    const nextButton = document.querySelector('.carousel-button.next');

    if (!track || !prevButton || !nextButton) {
      console.error('Carousel elements not found.');
      return; // Exit if any of the carousel elements are missing
    }

    let currentIndex = 0;

    function updateCarousel() {
      const slideWidth = track.children[0].getBoundingClientRect().width;
      track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;

      prevButton.disabled = currentIndex === 0;
      nextButton.disabled = currentIndex === track.children.length - 1;
    }

    prevButton.addEventListener('click', () => {
      if (currentIndex > 0) {
        currentIndex--;
        updateCarousel();
      }
    });

    nextButton.addEventListener('click', () => {
      if (currentIndex < track.children.length - 1) {
        currentIndex++;
        updateCarousel();
      }
    });

    updateCarousel(); // Initialize carousel
  }


  document.addEventListener("DOMContentLoaded", function () {
    // Define the current role for this page
    const currentRole = "user"; // This page is for regular users

    // Connect to Socket.IO
    const socket = io();

    // Toggle chat widget display
    const chatToggleButton = document.getElementById("chatToggleButton");
    const chatWidget = document.getElementById("chatWidget");
    chatToggleButton.addEventListener("click", function () {
      if (chatWidget.style.display === "none" || chatWidget.style.display === "") {
        chatWidget.style.display = "block";
      } else {
        chatWidget.style.display = "none";
      }
    });

    // Send message on clicking the send button
    const sendButton = document.getElementById("sendButton");
    const chatInput = document.getElementById("chatInput");
    sendButton.addEventListener("click", function () {
      const messageText = chatInput.value.trim();
      if (messageText) {
        // Emit an object containing both the sender and the text
        socket.emit("chat message", { sender: currentRole, text: messageText });
        chatInput.value = "";
      }
    });

    // Listen for incoming messages and display them with appropriate styling
    socket.on("chat message", function (msg) {
      const li = document.createElement("li");
      li.textContent = msg.text;

      // Apply a class based on who sent the message
      if (msg.sender === currentRole) {
        li.classList.add("sent"); // For messages sent by the current user (right side)
      } else {
        li.classList.add("received"); // For messages received (left side)
      }

      document.getElementById("chatMessages").appendChild(li);

      // Auto-scroll to the bottom of the chat body
      const chatBody = document.getElementById("chatBody");
      chatBody.scrollTop = chatBody.scrollHeight;
    });
  });





  // Execute both functions after DOMContentLoaded event

  handleTokenBasedNavigation();
  // getSpecificTrekDetails();
  initCarousel();
});






