


document.addEventListener("DOMContentLoaded", () => {
    // Fetch user details from the API
    fetch('/api/user/me', {
        method: 'GET',
        credentials: 'include', // ensure cookies are sent
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.user) {
                document.getElementById('fullName').textContent = data.user.fullName;
                document.getElementById('email').textContent = data.user.email;
                document.getElementById('gender').textContent = data.user.gender;
            } else {
                console.error("User data not found");
            }
        })
        .catch(err => {
            console.error("Error fetching user details:", err);
        });

    // Toggle the edit profile form
    const editBtn = document.getElementById('editProfileBtn');
    const editFormContainer = document.getElementById('editProfileForm');
    const cancelBtn = document.getElementById('cancelEdit');

    editBtn.addEventListener('click', () => {
        // Pre-populate the form with current details
        document.getElementById('editFullName').value = document.getElementById('fullName').textContent;
        document.getElementById('editEmail').value = document.getElementById('email').textContent;
        document.getElementById('editGender').value = document.getElementById('gender').textContent;
        editFormContainer.style.display = 'block';
    });

    cancelBtn.addEventListener('click', () => {
        editFormContainer.style.display = 'none';
    });

    // Handle profile edit form submission
    document.getElementById('profileEditForm').addEventListener('submit', function (e) {
        e.preventDefault();
        const updatedProfile = {
            fullName: document.getElementById('editFullName').value,
            email: document.getElementById('editEmail').value,
            gender: document.getElementById('editGender').value
        };

        fetch('/api/user/profile', {
            method: 'PUT',
            credentials: 'include', // send cookies
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedProfile)
        })
            .then(response => response.json())
            .then(data => {
                if (data.user) {
                    // Update DOM with new details
                    document.getElementById('fullName').textContent = data.user.fullName;
                    document.getElementById('email').textContent = data.user.email;
                    document.getElementById('gender').textContent = data.user.gender;
                    editFormContainer.style.display = 'none';
                    Swal.fire({
                        position: "top-end",
                        icon: "success",
                        title: "Profile updated successfully!",
                        showConfirmButton: false,
                        timer: 1000
                    });

                } else {
                    Swal.fire({
                        position: "top-end",
                        icon: "error",
                        title: "Error updating profile",
                        showConfirmButton: false,
                        timer: 1000
                    });
                }
            })
            .catch(err => {
                console.error("Error updating profile:", err);
                alert("Error updating profile");
            });
    });
});
