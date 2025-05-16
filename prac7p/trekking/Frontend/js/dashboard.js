// dashboard.js

// ----- Sidebar & Tab Navigation ----- //
let menuicn = document.querySelector(".menuicn");
let nav = document.querySelector(".navcontainer");

menuicn.addEventListener("click", () => {
    nav.classList.toggle("navclose");
});


document.addEventListener("DOMContentLoaded", function () {
    // Define the current role for this page
    const currentRole = "admin"; // This page is for the admin

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
            li.classList.add("sent"); // For messages sent by the admin (could be styled to appear on the right)
        } else {
            li.classList.add("received"); // For messages received from the user (left side)
        }

        document.getElementById("chatMessages").appendChild(li);

        // Auto-scroll to the bottom of the chat body
        const chatBody = document.getElementById("chatBody");
        chatBody.scrollTop = chatBody.scrollHeight;
    });
});


// Tab switching for nav options
document.querySelectorAll(".nav-option").forEach((option) => {
    option.addEventListener("click", function () {
        // Remove active class from all nav options
        document.querySelectorAll(".nav-option").forEach((opt) =>
            opt.classList.remove("active")
        );
        this.classList.add("active");

        // Hide all content sections
        document.querySelectorAll(".content-section").forEach((section) => {
            section.classList.remove("active");
        });

        // Show the targeted content section
        const targetId = this.getAttribute("data-target");
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
            targetSection.classList.add("active");
        }
    });
});

// ----- Trek Destinations Management ----- //

// Global variable to track editing mode
let editingTrekId = null;

// Fetch and display all trek destinations
async function fetchTrekDestinations() {
    try {
        const response = await fetch("http://localhost:3000/api/treks", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });
        if (response.ok) {
            const treks = await response.json();
            populateTrekList(treks);
        } else {
            console.error("Error fetching trek destinations");
        }
    } catch (error) {
        console.error("Error fetching trek destinations:", error);
    }
}

// Populate trek destinations into the table
function populateTrekList(treks) {
    const trekListBody = document.getElementById("trekListBody");
    trekListBody.innerHTML = ""; // Clear previous content
    treks.forEach((trek) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
      <td>${trek.name}</td>
      <td>${trek.description.substring(0, 50)}...</td>
      <td>
          <button class="action-btn edit-btn" onclick="editTrek('${trek._id}')">Edit</button>
          <button class="action-btn delete-btn" onclick="deleteTrek('${trek._id}')">Delete</button>
      </td>
    `;
        trekListBody.appendChild(tr);
    });
}

// Handle create/update form submission
document.getElementById("createTrekForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    // Gather form data
    const trekData = {
        name: document.getElementById("trekName").value,
        images: document.getElementById("trekImages").value
            .split(",")
            .map((url) => url.trim()),
        description: document.getElementById("trekDescription").value,
        totalDays: document.getElementById("trekTotalDays").value,
        expenses: document.getElementById("trekExpenses").value,
        difficultyLevel: document.getElementById("trekDifficultyLevel").value,
        maxAltitude: document.getElementById("trekMaxAltitude").value,
        bestSeason: document.getElementById("trekBestSeason").value,
        trekMap: document.getElementById("trekMap").value,
        totalDistance: document.getElementById("trekTotalDistance").value,
    };

    // If in editing mode, update the existing trek destination
    if (editingTrekId) {
        try {
            const response = await fetch(`http://localhost:3000/api/treks/${editingTrekId}`, {
                method: "PUT",
                headers: {
                    'Content-Type': 'application/json'

                },
                // Include credentials to ensure cookies are sent with the request
                credentials: 'include',
                body: JSON.stringify(trekData),
            });
            if (response.ok) {
                Swal.fire("Success", "Trek destination updated successfully", "success");
                editingTrekId = null; // Reset editing mode
                document.getElementById("form-title").innerText = "Create New Trek Destination";
                document.getElementById("createTrekForm").reset();
                fetchTrekDestinations();
            } else {
                const errorResult = await response.json();
                Swal.fire("Error", errorResult.message || "Error updating trek destination", "error");
            }
        } catch (error) {
            console.error("Error updating trek:", error);
            Swal.fire("Error", "Error updating trek destination", "error");
        }
    } else {
        // Otherwise, create a new trek destination
        try {
            const response = await fetch("http://localhost:3000/api/treks/create", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'

                },
                // Include credentials to ensure cookies are sent with the request
                credentials: 'include',
                body: JSON.stringify(trekData),
            });
            if (response.ok) {
                Swal.fire("Success", "Trek destination created successfully", "success");
                document.getElementById("createTrekForm").reset();
                fetchTrekDestinations();
            } else {
                const errorResult = await response.json();
                Swal.fire("Error", errorResult.message || "Error creating trek destination", "error");
            }
        } catch (error) {
            console.error("Error creating trek:", error);
            Swal.fire("Error", "Error creating trek destination", "error");
        }
    }
});

// Edit: Pre-populate the form with selected trek destination data
async function editTrek(trekId) {
    try {
        // Assuming there's an endpoint to fetch a single trek destination
        const response = await fetch(`http://localhost:3000/api/treks/${trekId}`, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json'

            },
            // Include credentials to ensure cookies are sent with the request
            credentials: 'include',
        });
        if (response.ok) {
            const trek = await response.json();
            document.getElementById("trekName").value = trek.name;
            document.getElementById("trekImages").value = trek.images.join(", ");
            document.getElementById("trekDescription").value = trek.description;
            document.getElementById("trekTotalDays").value = trek.totalDays;
            document.getElementById("trekExpenses").value = trek.expenses;
            document.getElementById("trekDifficultyLevel").value = trek.difficultyLevel;
            document.getElementById("trekMaxAltitude").value = trek.maxAltitude;
            document.getElementById("trekBestSeason").value = trek.bestSeason;
            document.getElementById("trekMap").value = trek.trekMap;
            document.getElementById("trekTotalDistance").value = trek.totalDistance;

            editingTrekId = trekId;
            document.getElementById("form-title").innerText = "Edit Trek Destination";
        } else {
            Swal.fire("Error", "Error fetching trek data for editing", "error");
        }
    } catch (error) {
        console.error("Error fetching trek for edit:", error);
        Swal.fire("Error", "Error fetching trek data for editing", "error");
    }
}

// Delete: Remove a trek destination
async function deleteTrek(trekId) {
    const confirmResult = await Swal.fire({
        title: "Confirm Deletion",
        text: "Are you sure you want to delete this trek destination?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
    });

    if (confirmResult.isConfirmed) {
        try {
            // Assuming the DELETE endpoint is at /api/trek/:id
            const response = await fetch(`http://localhost:3000/api/treks/${trekId}`, {
                method: "DELETE",
                headers: {
                    'Content-Type': 'application/json'

                },
                // Include credentials to ensure cookies are sent with the request
                credentials: 'include',
            });
            if (response.ok) {
                Swal.fire("Deleted", "Trek destination deleted successfully", "success");
                fetchTrekDestinations();
            } else {
                const errorResult = await response.json();
                Swal.fire("Error", errorResult.message || "Error deleting trek destination", "error");
            }
        } catch (error) {
            console.error("Error deleting trek:", error);
            Swal.fire("Error", "Error deleting trek destination", "error");
        }
    }
}



// ----- Bookings Management (Get & Cancel) ----- //
// ----- Bookings Management (Admin View) ----- //

// Fetch all bookings (all users) from the API
async function fetchAllBookings() {
    try {
        const response = await fetch("http://localhost:3000/api/bookings/all", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
        });
        if (response.ok) {
            const bookings = await response.json();
            populateBookingsList(bookings);
        } else {
            console.error("Error fetching bookings");
        }
    } catch (error) {
        console.error("Error fetching bookings:", error);
    }
}

// Populate the bookings table with details
function populateBookingsList(bookings) {
    const bookingsListBody = document.getElementById("bookingsListBody");
    bookingsListBody.innerHTML = ""; // Clear existing rows
    bookings.forEach((booking) => {
        const user = booking.userId;
        const trek = booking.trekId;
        const agency = booking.agencyId;
        const tr = document.createElement("tr");
        tr.innerHTML = `
        <td>${user ? user.fullName : "N/A"}</td>
        <td>${user ? user.email : "N/A"}</td>
        <td>${trek ? trek.name : "N/A"}</td>
        <td>${agency ? agency.name : "N/A"}</td>
        <td>${new Date(booking.startDate).toLocaleDateString()}</td>
        <td>${new Date(booking.endDate).toLocaleDateString()}</td>
        <td>${booking.numberOfPeople}</td>
        <td>${booking.status || "N/A"}</td>
        <td>
          <button class="action-btn delete-btn" onclick="deleteBooking('${booking._id}')">
            Delete
          </button>
        </td>
      `;
        bookingsListBody.appendChild(tr);
    });
}

// Delete a booking using the DELETE API
async function deleteBooking(bookingId) {
    const confirmResult = await Swal.fire({
        title: "Confirm Deletion",
        text: "Are you sure you want to delete this booking?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
    });

    if (confirmResult.isConfirmed) {
        try {
            const response = await fetch(`http://localhost:3000/api/bookings/${bookingId}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            });
            if (response.ok) {
                Swal.fire("Deleted", "Booking deleted successfully", "success");
                fetchAllBookings(); // Refresh the list after deletion
            } else {
                const errorResult = await response.json();
                Swal.fire("Error", errorResult.message || "Error deleting booking", "error");
            }
        } catch (error) {
            console.error("Error deleting booking:", error);
            Swal.fire("Error", "Error deleting booking", "error");
        }
    }
}

// -----FOr All users ---------------------------------- ----- //

// Fetch all users from the API
async function fetchAllUsers() {
    try {
        const response = await fetch("http://localhost:3000/api/user/all", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
        });
        if (response.ok) {
            const users = await response.json();
            populateUsersList(users);
        } else {
            console.error("Error fetching users");
        }
    } catch (error) {
        console.error("Error fetching users:", error);
    }
}

// Populate the users table with details
function populateUsersList(users) {
    const usersListBody = document.getElementById("usersListBody");
    usersListBody.innerHTML = ""; // Clear existing rows
    users.forEach((user) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
        <td>${user.fullName}</td>
        <td>${user.email}</td>
        <td>${user.phone}</td>
        <td>${user.gender}</td>
        <td>${user.role || "user"}</td>
        <td>
          <button class="action-btn delete-btn" onclick="deleteUser('${user._id}')">
            Delete
          </button>
        </td>
      `;
        usersListBody.appendChild(tr);
    });
}

// Delete a user using the DELETE API
async function deleteUser(userId) {
    const confirmResult = await Swal.fire({
        title: "Confirm Deletion",
        text: "Are you sure you want to delete this user?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
    });

    if (confirmResult.isConfirmed) {
        try {
            const response = await fetch(`http://localhost:3000/api/user/${userId}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            });
            if (response.ok) {
                Swal.fire("Deleted", "User deleted successfully", "success");
                fetchAllUsers(); // Refresh the list after deletion
            } else {
                const errorResult = await response.json();
                Swal.fire("Error", errorResult.message || "Error deleting user", "error");
            }
        } catch (error) {
            console.error("Error deleting user:", error);
            Swal.fire("Error", "Error deleting user", "error");
        }
    }
}

// Call the function to fetch all users when the page loads
fetchAllUsers();



// ============== Agencies Management ===== //
let editingAgencyId = null;

// Handle Create/Update Form Submission
document.getElementById("createAgencyForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const agencyData = {
        name: document.getElementById("agencyName").value,
        email: document.getElementById("agencyEmail").value,
        phone: document.getElementById("agencyPhone").value,
        address: document.getElementById("agencyAddress").value,
        description: document.getElementById("agencyDescription").value,
        image: document.getElementById("agencyImage").value,
        services: document.getElementById("agencyServices").value.split(',').map(s => s.trim()),
    };

    // If editingAgencyId is set, update the agency; otherwise, create a new one.
    if (editingAgencyId) {
        try {
            const response = await fetch(`http://localhost:3000/api/agencies/${editingAgencyId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(agencyData),
            });
            if (response.ok) {
                Swal.fire("Success", "Agency updated successfully", "success");
                editingAgencyId = null;
                document.getElementById("agency-form-title").innerText = "Create New Agency";
                document.getElementById("createAgencyForm").reset();
                fetchAgencies();
            } else {
                const errorResult = await response.json();
                Swal.fire("Error", errorResult.message || "Error updating agency", "error");
            }
        } catch (error) {
            console.error("Error updating agency:", error);
            Swal.fire("Error", "Error updating agency", "error");
        }
    } else {
        // Create a new agency
        try {
            const response = await fetch("http://localhost:3000/api/agencies", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(agencyData),
            });
            if (response.ok) {
                Swal.fire("Success", "Agency created successfully", "success");
                document.getElementById("createAgencyForm").reset();
                fetchAgencies();
            } else {
                const errorResult = await response.json();
                Swal.fire("Error", errorResult.message || "Error creating agency", "error");
            }
        } catch (error) {
            console.error("Error creating agency:", error);
            Swal.fire("Error", "Error creating agency", "error");
        }
    }
});

// Fetch all agencies from the API
async function fetchAgencies() {
    try {
        const response = await fetch("http://localhost:3000/api/agencies", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });
        if (response.ok) {
            const agencies = await response.json();
            populateAgenciesList(agencies);
        } else {
            console.error("Error fetching agencies");
        }
    } catch (error) {
        console.error("Error fetching agencies:", error);
    }
}

// Populate the agencies table
function populateAgenciesList(agencies) {
    const agencyListBody = document.getElementById("agencyListBody");
    agencyListBody.innerHTML = ""; // Clear previous content

    agencies.forEach((agency) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
      <td>${agency.name}</td>
      <td>${agency.email}</td>
      <td>${agency.phone}</td>
      <td>${agency.address}</td>
      <td>${agency.description}</td>
      <td>${agency.services.join(', ')}</td>
      <td>
        <button class="action-btn edit-btn" onclick="editAgency('${agency._id}')">Edit</button>
        <button class="action-btn delete-btn" onclick="deleteAgency('${agency._id}')">Delete</button>
      </td>
    `;
        agencyListBody.appendChild(tr);
    });
}

// Edit: Fetch a single agency and prefill the form
async function editAgency(agencyId) {
    try {
        const response = await fetch(`http://localhost:3000/api/agencies/${agencyId}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });
        if (response.ok) {
            const agency = await response.json();
            document.getElementById("agencyName").value = agency.name;
            document.getElementById("agencyEmail").value = agency.email;
            document.getElementById("agencyPhone").value = agency.phone;
            document.getElementById("agencyAddress").value = agency.address;
            document.getElementById("agencyDescription").value = agency.description;
            document.getElementById("agencyImage").value = agency.image;
            document.getElementById("agencyServices").value = agency.services.join(', ');

            editingAgencyId = agencyId;
            document.getElementById("agency-form-title").innerText = "Edit Agency";
        } else {
            Swal.fire("Error", "Error fetching agency data for editing", "error");
        }
    } catch (error) {
        console.error("Error fetching agency for edit:", error);
        Swal.fire("Error", "Error fetching agency data for editing", "error");
    }
}

// Delete: Remove an agency
async function deleteAgency(agencyId) {
    const confirmResult = await Swal.fire({
        title: "Confirm Deletion",
        text: "Are you sure you want to delete this agency?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
    });

    if (confirmResult.isConfirmed) {
        try {
            const response = await fetch(`http://localhost:3000/api/agencies/${agencyId}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
            });
            if (response.ok) {
                Swal.fire("Deleted", "Agency deleted successfully", "success");
                fetchAgencies(); // Refresh the list
            } else {
                const errorResult = await response.json();
                Swal.fire("Error", errorResult.message || "Error deleting agency", "error");
            }
        } catch (error) {
            console.error("Error deleting agency:", error);
            Swal.fire("Error", "Error deleting agency", "error");
        }
    }
}

// ============== GUides Management ===== //

// Global variable to track editing mode
let editingGuideId = null;

// Fetch all guides from the API and populate the table
async function fetchGuides() {
    try {
        const response = await fetch("http://localhost:3000/api/guides", {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });
        if (response.ok) {
            const guides = await response.json();
            populateGuideList(guides);
        } else {
            console.error("Error fetching guides:", response.status);
        }
    } catch (error) {
        console.error("Error fetching guides:", error);
    }
}

// Populate the guide list table with data
function populateGuideList(guides) {
    const guideListBody = document.getElementById("guideListBody");
    guideListBody.innerHTML = ""; // Clear existing content

    guides.forEach((guide) => {
        const tr = document.createElement("tr");
        // Limit description length for the table view
        const shortDescription =
            guide.description.split(" ").length > 20
                ? guide.description.split(" ").slice(0, 20).join(" ") + "..."
                : guide.description;
        tr.innerHTML = `
      <td>${guide.title}</td>
      <td>${guide.category}</td>
      <td>${guide.author}</td>
      <td>${shortDescription}</td>
      <td>
        <button class="action-btn edit-btn" onclick="editGuide('${guide._id}')">Edit</button>
        <button class="action-btn delete-btn" onclick="deleteGuide('${guide._id}')">Delete</button>
      </td>
    `;
        guideListBody.appendChild(tr);
    });
}

// Handle form submission for creating/updating a guide
document.getElementById("createGuideForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    // Gather form data
    const guideData = {
        title: document.getElementById("guideTitle").value,
        description: document.getElementById("guideDescription").value,
        content: document.getElementById("guideContent").value,
        category: document.getElementById("guideCategory").value,
        featuredImage: document.getElementById("guideFeaturedImage").value,
        images: document.getElementById("guideImages").value.split(",").map(img => img.trim()),
        tags: document.getElementById("guideTags").value.split(",").map(tag => tag.trim()),
        author: document.getElementById("guideAuthor").value
    };

    if (editingGuideId) {
        // Update existing guide
        try {
            const response = await fetch(`http://localhost:3000/api/guides/${editingGuideId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(guideData)
            });
            if (response.ok) {
                Swal.fire("Success", "Guide updated successfully", "success");
                editingGuideId = null;
                document.getElementById("guide-form-title").innerText = "Create New Guide";
                document.getElementById("createGuideForm").reset();
                fetchGuides();
            } else {
                const errorResult = await response.json();
                Swal.fire("Error", errorResult.message || "Error updating guide", "error");
            }
        } catch (error) {
            Swal.fire("Error", "Error updating guides", "error");
        }
    } else {
        // Create new guide
        try {
            const response = await fetch("http://localhost:3000/api/guides", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(guideData)
            });
            if (response.ok) {
                alert("Guide created successfully");
                document.getElementById("createGuideForm").reset();
                fetchGuides();
            } else {
                const errorResult = await response.json();
                alert(errorResult.message || "Error creating guide");
            }
        } catch (error) {
            console.error("Error creating guide:", error);
        }
    }
});

// Expose editGuide to the global scope so it can be called from inline onclick
window.editGuide = async function (guideId) {
    try {
        const response = await fetch(`http://localhost:3000/api/guides/${guideId}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });
        if (response.ok) {
            const guide = await response.json();
            // Pre-fill the form with the guide's data
            document.getElementById("guideTitle").value = guide.title;
            document.getElementById("guideDescription").value = guide.description;
            document.getElementById("guideContent").value = guide.content;
            document.getElementById("guideCategory").value = guide.category;
            document.getElementById("guideFeaturedImage").value = guide.featuredImage;
            document.getElementById("guideImages").value = guide.images.join(", ");
            document.getElementById("guideTags").value = guide.tags.join(", ");
            document.getElementById("guideAuthor").value = guide.author;

            editingGuideId = guideId;
            document.getElementById("guide-form-title").innerText = "Edit Guide";
        } else {
            alert("Error fetching guide details");
        }
    } catch (error) {
        console.error("Error fetching guide:", error);
    }
};

// Expose deleteGuide to the global scope so it can be called from inline onclick
window.deleteGuide = async function (guideId) {
    if (confirm("Are you sure you want to delete this guide?")) {
        try {
            const response = await fetch(`http://localhost:3000/api/guides/${guideId}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" }
            });
            if (response.ok) {
                alert("Guide deleted successfully");
                fetchGuides();
            } else {
                const errorResult = await response.json();
                alert(errorResult.message || "Error deleting guide");
            }
        } catch (error) {
            console.error("Error deleting guide:", error);
        }
    }
};




// ----- ---------------------------------- ----- //

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

        } else {

            Swal.fire({
                position: "top-end",
                icon: "error",
                title: "Unauthorized access!",
                showConfirmButton: false,
                timer: 1500
            }).then(() => {
                // Redirect to login page after user clicks OK.
                window.location.href = '/login.html';
            });;
            window.location.href = '/login.html';
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


// On page load, fetch all trek destinations
document.addEventListener("DOMContentLoaded", () => {
    fetchTrekDestinations();
    fetchAllBookings();
    fetchAgencies();
    fetchGuides();

    handleTokenBasedNavigation();
});
