function updateUserNavbar() {
    const section = document.getElementById('user-profile-section');
    if (!section) return;
    const userStr = localStorage.getItem('user');
    let user = null;
    try {
        if (userStr && userStr !== 'undefined') {
            user = JSON.parse(userStr);
        }
    } catch (e) {
        user = null;
    }
    const token = localStorage.getItem('token');
    if (user && token) {
        // Use user.profilePicture if available, else fallback to default
        const profilePicUrl = user.profilePicture || 'static/default-profile.jpg';
        section.innerHTML = `
            <!-- Dark Mode Toggle - Only show on index page -->
            <button aria-label="Toggle Dark Mode" id="darkModeToggle" class="text-xl text-gray-400 hover:text-yellow-300 transition-colors focus:outline-none" style="display: none;">
                <i class="fas fa-moon"></i>
            </button>
            <img id="profilePic" src="${profilePicUrl}" alt="Profile" 
                style="width:20px;height:20px;border-radius:50%;cursor:pointer;object-fit:cover;margin-left:24px;"
                onerror="this.onerror=null; this.src='static/default-profile.jpg';">
        `;
        document.getElementById('profilePic').onclick = () => {
            window.location.href = 'profile.html';
        };
    } else {
        section.innerHTML = `
            <!-- Dark Mode Toggle - Only show on index page -->
            <button aria-label="Toggle Dark Mode" id="darkModeToggle" class="text-xl text-gray-400 hover:text-yellow-300 transition-colors focus:outline-none" style="display: none;">
                <i class="fas fa-moon"></i>
            </button>
            <a href="/login.html">Login</a>
        `;
    }

    // Initialize dark mode toggle after adding it to the DOM
    const darkModeToggle = document.getElementById('darkModeToggle');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    // Set default theme to light
    const currentTheme = localStorage.getItem('theme') || 'light';
    if (currentTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        if (darkModeToggle) darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        if (darkModeToggle) darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }
    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        if (darkModeToggle) darkModeToggle.innerHTML = newTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    }
    if (darkModeToggle) {
        darkModeToggle.removeEventListener('click', toggleTheme); // Prevent duplicate listeners
        darkModeToggle.addEventListener('click', toggleTheme);
    }
    prefersDarkScheme.addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            const newTheme = e.matches ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            if (darkModeToggle) darkModeToggle.innerHTML = newTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        }
    });

    // Show dark mode toggle only on index page
    if (window.location.pathname === '/' || window.location.pathname.endsWith('index.html')) {
        if (darkModeToggle) darkModeToggle.style.display = 'block';
    }

    // Dispatch navbarUpdated event
    document.dispatchEvent(new Event('navbarUpdated'));
}

function logoutUser() {
    localStorage.clear();
    window.location.href = '/login.html';
}

if (localStorage.getItem('user') === 'undefined') {
    localStorage.removeItem('user');
}

// Add this to ensure navbar is updated when page loads
document.addEventListener('DOMContentLoaded', function() {
    updateUserNavbar();

    // --- TUF Navbar Profile & Mobile Menu Logic ---
    const profileBtn = document.getElementById('tufProfileBtn');
    const profileDropdown = document.getElementById('tufProfileDropdownMenu');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn'); // Adjust ID if needed
    const mobileMenu = document.getElementById('mobileMenuTUF'); // Adjust ID if needed
    // const mobileMenuCloseBtn = document.getElementById('tufMobileMenuCloseBtn'); // If you have a close button

    if (profileBtn && profileDropdown) {
        profileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            profileDropdown.classList.toggle('open');
        });
    }
    
    document.addEventListener('click', (e) => {
        if (profileDropdown && profileDropdown.classList.contains('open') && !profileBtn.contains(e.target)) {
            profileDropdown.classList.remove('open');
        }
    });
    
    if(mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('open');
        });
        // If you have a dedicated close button:
        // mobileMenuCloseBtn.addEventListener('click', () => mobileMenu.classList.remove('open'));
    }
});
