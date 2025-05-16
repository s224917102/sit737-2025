document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('agency-container');
    const apiUrl = 'http://localhost:3000/api/agencies';

    try {
        // Fetch data from the API
        const response = await fetch(apiUrl);

        // Check if the response is successful
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Parse JSON data
        const agencies = await response.json();

        // Dynamically generate agency cards
        agencies.forEach(agency => {
            const card = document.createElement('div');
            card.classList.add('agency-card');

            // Limit description to 60 words
            let description = agency.description.split(' ').slice(0, 11).join(' ');
            if (agency.description.split(' ').length > 11) {
                description += '...';
            }


            card.innerHTML = `
                <img src="${agency.image}" alt="${agency.name} Image">
                <h3>${agency.name}</h3>
                <p><span class="label">Email:</span> ${agency.email}</p>
                <p><span class="label">Phone:</span> ${agency.phone}</p>
                <p><span class="label">Address:</span> ${agency.address}</p>
                <p><span class="label">Description:</span> ${description}</p>
                <p><span class="label">Services:</span> ${agency.services.join(', ')}</p> <!-- Services list -->
            `;
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Error fetching agency data:', error);
        container.innerHTML = '<p style="color: red;">Failed to load travel agencies. Please try again later.</p>';
    }
});