// Dark Mode Toggle Functionality
function initializeDarkMode() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    
    // Set default theme to light
    const currentTheme = localStorage.getItem('theme') || 'light';
    
    // Apply the theme
    if (currentTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        if (darkModeToggle) {
            darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        if (darkModeToggle) {
            darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        }
    }

    // Toggle theme function
    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // Update icon
        if (darkModeToggle) {
            darkModeToggle.innerHTML = newTheme === 'dark' ? 
                '<i class="fas fa-sun"></i>' : 
                '<i class="fas fa-moon"></i>';
        }
    }

    // Add click event listener
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', toggleTheme);
    }
}

// Initialize dark mode when the DOM is loaded
document.addEventListener('DOMContentLoaded', initializeDarkMode);

// Initialize dark mode when the navbar is updated
document.addEventListener('navbarUpdated', initializeDarkMode); 