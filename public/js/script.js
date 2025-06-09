'use strict';

// State management
const state = {
    menuOpen: false,
    currentProgress: new Map(),
    activeModals: new Set(),

    updateProgress(id, value) {
        this.currentProgress.set(id, value);
        localStorage.setItem(`progress_${id}`, value);
        this.notifyProgressUpdate(id, value);
    },

    notifyProgressUpdate(id, value) {
        document.dispatchEvent(new CustomEvent('progressUpdate', {
            detail: { id, value }
        }));
    }
};

// UI Components
class MobileMenu {
    constructor() {
        this.menuToggle = document.querySelector('.menu-toggle');
        this.navLinks = document.querySelector('.nav-links');
        this.isAnimating = false;
        this.init();
    }

    init() {
        if (!this.menuToggle || !this.navLinks) return;

        this.menuToggle.addEventListener('click', this.toggleMenu.bind(this));
        this.setupLinkHandlers();
        this.setupOutsideClickHandler();
    }

    toggleMenu() {
        if (this.isAnimating) return;
        this.isAnimating = true;

        const isOpen = this.navLinks.classList.contains('active');
        this.navLinks.classList.toggle('active');
        this.menuToggle.classList.toggle('active');

        const links = this.navLinks.querySelectorAll('a');
        links.forEach((link, index) => {
            utils.animate(link, [
                { transform: 'translateX(-20px)', opacity: 0 },
                { transform: 'translateX(0)', opacity: 1 }
            ], {
                delay: index * 100,
                duration: 300
            });
        });

        setTimeout(() => {
            this.isAnimating = false;
        }, links.length * 100 + 300);
    }

    setupLinkHandlers() {
        this.navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    this.closeMenu();
                }
            });
        });
    }

    setupOutsideClickHandler() {
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 &&
                !this.navLinks.contains(e.target) &&
                !this.menuToggle.contains(e.target) &&
                this.navLinks.classList.contains('active')) {
                this.closeMenu();
            }
        });
    }

    closeMenu() {
        this.navLinks.classList.remove('active');
        this.menuToggle.classList.remove('active');
    }
}

class InteractiveCard {
    constructor(element) {
        this.element = element;
        this.init();
    }

    init() {
        this.element.addEventListener('mouseenter', this.handleHover.bind(this));
        this.element.addEventListener('mouseleave', this.handleLeave.bind(this));
        this.element.addEventListener('mousemove', utils.throttle(this.handleMove.bind(this), 50));
    }

    handleHover() {
        utils.animate(this.element, [
            { transform: 'translateY(-10px) scale(1.02)' }
        ]);
    }

    handleLeave() {
        utils.animate(this.element, [
            { transform: 'translateY(0) scale(1)' }
        ]);
    }

    handleMove(e) {
        const { left, top, width, height } = this.element.getBoundingClientRect();
        const x = e.clientX - left;
        const y = e.clientY - top;
        
        const xPercent = x / width;
        const yPercent = y / height;
        
        const rotateX = (yPercent - 0.5) * 10;
        const rotateY = (xPercent - 0.5) * 10;

        this.element.style.transform = 
            `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    }
}

// Global UI initialization
function initializeGlobalUI() {
    console.log("Initializing Global UI Components from script.js...");
    
    // Initialize profile dropdown
    const profileBtn = document.getElementById('navProfileBtn');
    const profileDropdown = document.getElementById('tufProfileDropdownMenu');
    const closeProfileDropdown = document.getElementById('tufCloseProfileDropdown');

    if (profileBtn && profileDropdown) {
        profileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            profileDropdown.classList.toggle('open');
        });

        if (closeProfileDropdown) {
            closeProfileDropdown.addEventListener('click', (e) => {
                e.stopPropagation();
                profileDropdown.classList.remove('open');
            });
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!profileDropdown.contains(e.target) && !profileBtn.contains(e.target)) {
                profileDropdown.classList.remove('open');
            }
        });
    }

    // Initialize mobile menu
    const mobileMenuBtn = document.getElementById('mobileMenuBtnTUF');
    const mobileMenu = document.getElementById('mobileMenuTUF');
    const closeMobileMenuBtn = document.getElementById('closeMobileMenuBtnTUF');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.remove('-translate-x-full');
        });

        if (closeMobileMenuBtn) {
            closeMobileMenuBtn.addEventListener('click', () => {
                mobileMenu.classList.add('-translate-x-full');
            });
        }
    }

    // Initialize AOS
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: true
        });
    }
}

// Wait for utils to be loaded
function waitForUtils(callback) {
    if (typeof utils !== 'undefined') {
        callback();
    } else {
        setTimeout(() => waitForUtils(callback), 100);
    }
}

// Initialize after DOM is loaded and utils is available
document.addEventListener('DOMContentLoaded', () => {
    waitForUtils(() => {
        console.log('Initializing Global UI Components from script.js...');
        // Initialize mobile menu
        const mobileMenu = new MobileMenu();

        // Initialize interactive cards
        document.querySelectorAll('.interactive-card').forEach(card => {
            new InteractiveCard(card);
        });

        // Initialize AOS animations
        document.querySelectorAll('[data-aos]').forEach(element => {
            element.classList.add('aos-init');
        });

        // Initialize intersection observers for animations
        const animationObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    animationObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.2
        });

        document.querySelectorAll('.animate-on-scroll').forEach(element => {
            animationObserver.observe(element);
        });

        // HR Interview Answer Toggle
        const answerToggles = document.querySelectorAll('.toggle-answer');
        answerToggles.forEach(button => {
            button.addEventListener('click', () => {
                const answerContent = button.nextElementSibling;
                if (answerContent && answerContent.classList.contains('answer-content')) {
                    answerContent.classList.toggle('show'); // Toggle the 'show' class
                    if (answerContent.classList.contains('show')) {
                        button.textContent = 'Hide Example Answer';
                    } else {
                        button.textContent = 'Show Example Answer';
                    }
                }
            });
        });

        // Simple alert for quiz buttons (demo purpose)
        const quizButtons = document.querySelectorAll('.roadmap-item .btn-secondary:last-child, .roadmap-item .btn-outline-primary:last-child');
        quizButtons.forEach(button => {
            if (button.textContent.includes('Start Quiz')) {
                 button.addEventListener('click', (e) => {
                    e.preventDefault();
                    alert('Quiz functionality coming soon!');
                });
            }
        });

        // Simple alert for concept buttons (demo purpose)
        const conceptButtons = document.querySelectorAll('.roadmap-item .btn-secondary:first-child, .roadmap-item .btn-outline-primary:first-child');
         conceptButtons.forEach(button => {
            if (button.textContent.includes('View Concepts')) {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    alert('Detailed concept page coming soon!');
                });
            }
        });

        // Enhanced Login Form with Validation
        const loginForm = document.querySelector('.login-form');
        if (loginForm) {
            const emailInput = loginForm.querySelector('input[type="email"]');
            const passwordInput = loginForm.querySelector('input[type="password"]');
            const submitButton = loginForm.querySelector('button[type="submit"]');

            function updateFormValidity() {
                const isEmailValid = utils.validateEmail(emailInput.value);
                const isPasswordValid = utils.validatePassword(passwordInput.value);
                submitButton.disabled = !(isEmailValid && isPasswordValid);
            }

            emailInput.addEventListener('input', updateFormValidity);
            passwordInput.addEventListener('input', updateFormValidity);

            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                if (!utils.validateEmail(emailInput.value)) {
                    alert('Please enter a valid email address');
                    return;
                }

                if (!utils.validatePassword(passwordInput.value)) {
                    alert('Password must be at least 8 characters long and include uppercase, lowercase, and numbers');
                    return;
                }

                // Here you would typically make an API call to your backend
                console.log('Login attempted with:', { email: emailInput.value });
                
                // Make API call to backend login endpoint
                try {
                    const response = await fetch('/api/auth/login', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ email: emailInput.value, password: passwordInput.value })
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        // Display backend error message to the user
                        alert(`Login failed: ${errorData.message || 'Invalid credentials'}`);
                        console.error('Login failed:', errorData);
                        return; // Stop if login failed
                    }

                    const data = await response.json();
                    // Assuming the backend sends back a token in the response body
                    const token = data.token;
                    const user = data.user; // Assuming user details are also sent back

                    if (token) {
                        console.log('[Frontend Login] Token value received from backend:', token);
                        // Store the token in local storage
                        localStorage.setItem('token', token);
                        console.log('Login successful. Token stored in localStorage.');
                        console.log('[Frontend Login] Value saved to localStorage for key "token":', localStorage.getItem('token'));
                        // Optionally store user data (e.g., name, profile pic URL) for UI
                        if (user) {
                            localStorage.setItem('user', JSON.stringify(user));
                            console.log('User data stored in localStorage.');
                        }

                        // Redirect to assessment page or index page
                        // Redirecting to assessment-home.html directly after login
                        window.location.replace('assessment-home.html');
                    } else {
                        alert('Login failed: No token received from server.');
                        console.error('Login failed: No token in response data', data);
                    }

                } catch (error) {
                    console.error('Login failed:', error);
                    alert('An unexpected error occurred during login. Please try again.');
                }
            });
        }

        // Modal functionality
        const openModalButtons = document.querySelectorAll('[data-modal-target]');
        const closeModalButtons = document.querySelectorAll('[data-close-button]');
        const overlays = document.querySelectorAll('.overlay');

        openModalButtons.forEach(button => {
            button.addEventListener('click', () => {
                const modal = document.querySelector(button.dataset.modalTarget);
                openModal(modal);
            });
        });

        overlays.forEach(overlay => {
            overlay.addEventListener('click', () => {
                const modals = document.querySelectorAll('.modal.active');
                modals.forEach(modal => {
                    closeModal(modal);
                });
            });
        });

        closeModalButtons.forEach(button => {
            button.addEventListener('click', () => {
                const modal = button.closest('.modal');
                closeModal(modal);
            });
        });

        function openModal(modal) {
            if (modal == null) return;
            modal.classList.add('active');
            document.body.classList.add('modal-open'); // To prevent body scroll
            const overlay = modal.nextElementSibling; // Assuming overlay is right after modal
            if (overlay && overlay.classList.contains('overlay')) {
                overlay.classList.add('active');
            }
        }

        function closeModal(modal) {
            if (modal == null) return;
            modal.classList.remove('active');
            document.body.classList.remove('modal-open');
            const overlay = modal.nextElementSibling;
            if (overlay && overlay.classList.contains('overlay')) {
                overlay.classList.remove('active');
            }
        }

        // Global event listeners for toasts (if any)
        document.addEventListener('showGlobalError', (e) => {
            utils.showToast(e.detail.message, 'error');
        });

        document.addEventListener('showGlobalSuccess', (e) => {
            utils.showToast(e.detail.message, 'success');
        });

        document.addEventListener('showGlobalInfo', (e) => {
            utils.showToast(e.detail.message, 'info');
        });

        // Assessment page specific logic (moved here for consistency)
        // The specific logic for handling AssessmentManager is in assessment.js now.
        // This script only provides the utilities.


        // Countdown for upcoming assessment (if applicable)
        function updateCountdown() {
            const countdownElement = document.getElementById('weekendCountdown');
            if (!countdownElement) return;

            const now = new Date();
            const nextSunday = new Date(now);
            nextSunday.setDate(now.getDate() + (0 + 7 - now.getDay()) % 7); // 0 is Sunday
            nextSunday.setHours(17, 0, 0, 0); // Set to 5 PM Sunday

            // If it's already past 5 PM Sunday, set to next Sunday
            if (now > nextSunday) {
                nextSunday.setDate(nextSunday.getDate() + 7);
            }

            const timeRemaining = nextSunday - now;

            if (timeRemaining <= 0) {
                countdownElement.textContent = 'Assessment is Live!';
                return;
            }

            const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

            countdownElement.textContent = `Next Assessment in: ${days}d ${hours}h ${minutes}m ${seconds}s`;
        }

        // Call it once immediately and then every second
        if (document.getElementById('weekendCountdown')) {
            updateCountdown();
            setInterval(updateCountdown, 1000);
        }


        // Function to set active class on current nav link
        function setActiveNavLink() {
            const currentPath = window.location.pathname.split('/').pop();
            document.querySelectorAll('.floating-navbar-link').forEach(link => {
                if (link.href.split('/').pop() === currentPath) {
                    link.classList.add('active-nav-link');
                } else {
                    link.classList.remove('active-nav-link');
                }
            });

            // Also check for mobile menu links
            const mobileMenu = document.getElementById('mobileMenuTUF');
            if (mobileMenu) {
                 mobileMenu.querySelectorAll('a').forEach(link => {
                    if (link.href.split('/').pop() === currentPath) {
                        link.classList.add('active-nav-link');
                    } else {
                        link.classList.remove('active-nav-link');
                }
            });
        }
        }
        setActiveNavLink(); // Call on DOMContentLoaded


        // Helper to get user data from localStorage for display
        function getUserFromLocalStorage() {
            const userString = localStorage.getItem('user');
            if (userString) {
                try {
                    return JSON.parse(userString);
                } catch (e) {
                    console.error("Error parsing user data from localStorage:", e);
                    return null;
                }
            }
            return null;
        }

        // Function to update user info in navbar dropdown
        function updateNavUserInfo() {
            const user = getUserFromLocalStorage();
            const dropdownUserName = document.getElementById('dropdownUserName');
            const dropdownUserEmail = document.getElementById('dropdownUserEmail');
            const navProfilePic = document.getElementById('navProfilePic');
            const dropdownProfilePic = document.getElementById('dropdownProfilePic');

            if (dropdownUserName) {
                dropdownUserName.textContent = `Hi, ${user ? user.name || 'User' : 'Guest'}`;
            }
            if (dropdownUserEmail) {
                dropdownUserEmail.textContent = user ? user.email || '' : '';
            }

            const profileSrc = user && user.profilePicture ? user.profilePicture : 'static/default-profile.jpg';
            
            if (navProfilePic) {
                navProfilePic.src = profileSrc;
                navProfilePic.onerror = function() {
                    this.onerror = null;
                    this.src = 'static/default-profile.jpg';
                };
            }
            if (dropdownProfilePic) {
                dropdownProfilePic.src = profileSrc;
                dropdownProfilePic.onerror = function() {
                    this.onerror = null;
                    this.src = 'static/default-profile.jpg';
                };
            }
        }
        updateNavUserInfo(); // Call on DOMContentLoaded

        // Logout functionality
        function logoutUser() {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Clear any specific cookies if necessary, e.g., utils.deleteCookie('frontendToken');
            window.location.replace('login.html');
        }
        // Global function for logout with transition
        window.logoutUserWithTransition = function() {
            document.body.classList.add('page-transition-out');
            setTimeout(() => {
                logoutUser();
            }, 400);
        };

        // Global function for page transition handling
        window.handlePageTransition = function(event) {
            const link = event.currentTarget;
            const targetUrl = link.href;
            if (targetUrl && (link.hostname === window.location.hostname || !link.hostname) && !link.getAttribute('target')) {
                event.preventDefault();
                document.body.classList.add('page-transition-out');
                setTimeout(() => { window.location.href = targetUrl; }, 400);
            }
        };

        // Expose utilities globally if needed by other scripts
        window.utils = utils;
        window.initializeGlobalUI = initializeGlobalUI; // Expose global UI initializer

        // Password Visibility Toggle
        const passwordToggle = document.querySelector('.password-toggle');
        const loginPasswordInput = document.getElementById('loginPassword');

        if (passwordToggle && loginPasswordInput) {
            passwordToggle.addEventListener('click', () => {
                const type = loginPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                loginPasswordInput.setAttribute('type', type);
                passwordToggle.classList.toggle('fa-eye');
                passwordToggle.classList.toggle('fa-eye-slash');
            });
        }
    });
});

// Call initializeGlobalUI here so it's run when script.js loads, not just on DOMContentLoaded
initializeGlobalUI();