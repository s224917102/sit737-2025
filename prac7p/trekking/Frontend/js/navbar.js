document.addEventListener('DOMContentLoaded', () => {
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.querySelector('.nav-links');
    const navAuth = document.querySelector('.nav-auth');

    navToggle.addEventListener('click', () => {
        navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
        navAuth.style.display = navAuth.style.display === 'flex' ? 'none' : 'flex';
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth >= 768) {
            navLinks.style.display = 'flex';
            navAuth.style.display = 'flex';
        } else {
            navLinks.style.display = 'none';
            navAuth.style.display = 'none';
        }
    });
});