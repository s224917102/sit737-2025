document.addEventListener('DOMContentLoaded', () => {
    const bookingForm = document.getElementById('booking-form');
    const bookingStatus = document.getElementById('booking-status');
    const agencySelect = document.getElementById('agencySelect');

    const agencyApiUrl = "http://localhost:3000/api/agencies";





    async function fetchAgencies() {
        try {
            const response = await fetch(agencyApiUrl);
            const agencies = await response.json();

            if (agencies.length > 0) {
                // Add a placeholder option
                const defaultOption = document.createElement('option');
                defaultOption.value = '';
                defaultOption.textContent = 'Select an Agency';
                defaultOption.disabled = true;
                defaultOption.selected = true;
                agencySelect.appendChild(defaultOption);

                agencies.forEach(agency => {
                    const option = document.createElement('option');
                    option.value = agency._id;
                    option.textContent = agency.name;
                    agencySelect.appendChild(option);
                });
            } else {
                bookingStatus.textContent = "No agencies available.";
                bookingStatus.classList.add('error');
            }
        } catch (error) {
            console.error("Error fetching agencies:", error);
            bookingStatus.textContent = "Failed to load agencies. Please try again.";
            bookingStatus.classList.add('error');
        }
    }


    bookingForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const urlParams = new URLSearchParams(window.location.search);

        const fullName = document.getElementById('fullName').value;
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        const numberOfPeople = document.getElementById('numberOfPeople').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const agencyId = agencySelect.value;
        const token = localStorage.getItem('token');

        if (!agencyId) {
            bookingStatus.textContent = 'Please select an agency.';
            bookingStatus.classList.add('error');
            return;
        }



        const trekId = new URLSearchParams(window.location.search).get('id');
        const bookingData = {
            fullName,
            agencyId,
            trekId,
            startDate,
            endDate,
            numberOfPeople,
            email,
            phone
        };

        try {
            const response = await fetch(`http://localhost:3000/api/bookings/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'

                },
                // Include credentials to ensure cookies are sent with the request
                credentials: 'include',
                body: JSON.stringify(bookingData)
            });


            const responseData = await response.json();

            if (response.ok) {
                // Extract the booking ID from the response
                const bookingId = responseData._id;  // Assuming the response contains the _id
                console.log(bookingId, responseData)
                // Redirect to payment page
                window.location.href = `payement.html?bookingId=${bookingId}`;
            } else {
                const errorData = await response.json();
                bookingStatus.textContent = `Error: ${errorData.message}`;
            }
        } catch (error) {
            bookingStatus.textContent = 'An error occurred while booking the trek.';
            bookingStatus.classList.add('error');
        }
    });
    fetchAgencies();

    findUser();
});
