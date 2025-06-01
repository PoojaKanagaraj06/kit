document.addEventListener('DOMContentLoaded', function() {
    // Check authentication status
    fetch('/check-auth')
        .then(response => response.json())
        .then(data => {
            if (!data.authenticated) {
                window.location.href = '/signup.html'; // Redirect to signup page if not logged in
            }
        })
        .catch(error => console.error('Error checking authentication:', error));

    // Attach logout function to logout button
    const logoutMenuItem = document.getElementById('logout-menu');
    logoutMenuItem.addEventListener('click', async () => {
        const response = await fetch('https://spendsmart-sugk.onrender.com/logout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        });

        if (response.ok) {
            // Clear all user content
            localStorage.clear(); // Clear local storage
            sessionStorage.clear(); // Clear session storage

            // Clear browser history and redirect to homepage
            window.location.href = '/index.html';
            window.location.replace('/index.html'); // Replace the current history entry
        } else {
            alert('Logout failed');
        }
    });
});
