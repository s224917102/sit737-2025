document.addEventListener('DOMContentLoaded', async () => {
    const paymentForm = document.getElementById('payment-form');
    const paymentStatus = document.getElementById('payment-status');
    const payNowButton = document.getElementById('pay-now');

    const stripe = Stripe('pk_test_51QkeiVCj8Shpi6Uogk5K9oRYTHEuaQ7WeqEPmjZ0s4OvvXDtKHYRejBjoIeJWsCsmAq3dLzChlxOhELLDT8c4NsL00StQls6Ol');  // Replace with your actual Stripe public key
    const elements = stripe.elements();
    const cardElement = elements.create('card');
    cardElement.mount('#card-element');

    // Get the bookingId from the URL
    const bookingId = new URLSearchParams(window.location.search).get('bookingId');

    // Handle the form submission
    paymentForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Fetch the client secret from the server
        const response = await fetch('http://localhost:3000/api/payement/confirm-payement', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'

            },
            // Include credentials to ensure cookies are sent with the request
            credentials: 'include',
            body: JSON.stringify({ bookingId: bookingId }),
        });

        const paymentData = await response.json();

        // Confirm the payment
        const { clientSecret } = paymentData;

        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: cardElement,
                billing_details: {
                    name: 'Guest',  // You can customize this to get the user's name
                },
            },
        });

        if (error) {
            paymentStatus.textContent = `Payment failed: ${error.message}`;
            paymentStatus.classList.add('error');
        } else if (paymentIntent.status === 'succeeded') {
            // On successful payment, update the booking status
            const updateResponse = await fetch(`http://localhost:3000/api/payement/${bookingId}/confirm-payement`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'

                },
                // Include credentials to ensure cookies are sent with the request
                credentials: 'include',
                body: JSON.stringify({ transactionId: paymentIntent.id }),
            });

            if (updateResponse.ok) {
                Swal.fire({
                    position: "top-end",
                    icon: "success",
                    title: "Payment successful! Your booking is confirmed.",
                    showConfirmButton: false,
                    timer: 1500
                }).then(() => {
                    // Redirect to login page after user clicks OK.
                    window.location.href = '/index.html';
                });;
                // paymentStatus.textContent = 'Payment successful! Your booking is confirmed.';
                // paymentStatus.classList.add('success');
                // window.location.href = '/booking-confirmation.html';  // Redirect to a confirmation page
            } else {
                const errorData = await updateResponse.json();
                paymentStatus.textContent = `Error: ${errorData.message}`;
                paymentStatus.classList.add('error');
            }
        }
    });
});
