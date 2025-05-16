function toggleDetails(event) {
    const item = event.currentTarget;
    const expanded = item.nextElementSibling;
    if (expanded.style.display === "block") {
        expanded.style.display = "none";
        item.querySelector(".toggle").textContent = "▼";
    } else {
        expanded.style.display = "block";
        item.querySelector(".toggle").textContent = "▲";
    }
}
function filterGuides() {
    const selectedCountry = document.getElementById("country-filter").value;
    const guideSections = document.querySelectorAll(".country-section");
    guideSections.forEach(section => {
        if (selectedCountry === "all" || section.dataset.country === selectedCountry) {
            section.classList.remove("hidden");
        } else {
            section.classList.add("hidden");
        }
    });
}
document.addEventListener("DOMContentLoaded", async () => {
    const guidesContainer = document.querySelector('.guides-container');
    const modal = document.getElementById('guideModal');
    const modalContent = document.getElementById('modalContent');
    const closeModal = document.getElementById('closeModal');

    try {
        const response = await fetch('/api/guides');
        if (!response.ok) {
            throw new Error(`Error fetching guides: ${response.status}`);
        }
        const guides = await response.json();

        guidesContainer.innerHTML = ''; // Clear container

        guides.forEach((guide) => {
            const guideCard = document.createElement('div');
            guideCard.classList.add('guide-card');

            // Escape the JSON string to prevent issues with special characters
            const guideData = encodeURIComponent(JSON.stringify(guide));

            guideCard.innerHTML = `
                <img src="${guide.featuredImage}" alt="${guide.title}" />
                <div class="guide-card-content">
                    <span class="guide-category">${guide.category}</span>
                    <h3 class="guide-title">${guide.title}</h3>
                    <p class="guide-description">${guide.description}</p>
                    <div class="guide-tags">
                        ${guide.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                    <button class="read-more-btn" data-guide="${guideData}">Read More</button>
                </div>
            `;

            guidesContainer.appendChild(guideCard);
        });

        // Handle modal popup
        document.querySelectorAll(".read-more-btn").forEach(button => {
            button.addEventListener("click", (event) => {
                const guideData = decodeURIComponent(event.target.getAttribute("data-guide"));
                const guide = JSON.parse(guideData);

                modalContent.innerHTML = `
                    <h2>${guide.title}</h2>
                    <p><strong>Category:</strong> ${guide.category}</p>
                    <p><strong>Author:</strong> ${guide.author}</p>
                    <img class="modal-featured-image" src="${guide.featuredImage}" alt="${guide.title}">
                    <p class="modal-description">${guide.description}</p>
                    <p class="modal-content-text">${guide.content}</p>
                    <div class="modal-tags">
                        ${guide.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                    <h3>Gallery</h3>
                    <div class="modal-gallery">
                        ${guide.images.map(img => `<img src="${img}" alt="Trekking Image">`).join('')}
                    </div>
                `;

                modal.style.display = "block";
            });
        });

        closeModal.addEventListener("click", () => {
            modal.style.display = "none";
        });

        window.addEventListener("click", (event) => {
            if (event.target === modal) {
                modal.style.display = "none";
            }
        });

    } catch (error) {
        console.error(error);
        guidesContainer.innerHTML = `<p>Error loading guides.</p>`;
    }
});
