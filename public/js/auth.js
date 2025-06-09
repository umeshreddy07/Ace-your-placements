// Authentication utility functions
const auth = {
    // Get the current authentication token
    getToken: function() {
        return localStorage.getItem('token');
    },

    // Check if user is authenticated
    isAuthenticated: function() {
        return !!this.getToken();
    },

    // Get user data from localStorage
    getUser: function() {
        const userStr = localStorage.getItem('user');
        try {
            return userStr ? JSON.parse(userStr) : null;
        } catch (e) {
            console.error('Error parsing user data:', e);
            return null;
        }
    },

    // Set authentication data
    setAuth: function(token, user) {
        if (token) {
            localStorage.setItem('token', token);
            // Set frontendToken cookie
            document.cookie = `frontendToken=${token}; path=/; max-age=${24 * 60 * 60}; SameSite=Lax`;
        }
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
        }
    },

    // Clear authentication data
    clearAuth: function() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('platformProgress');
        localStorage.removeItem('platformLoginActivity');
        // Clear frontendToken cookie
        document.cookie = 'frontendToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    },

    // Logout user
    logout: function() {
        this.clearAuth();
        window.location.href = 'login.html';
    },

    // Make authenticated fetch request
    fetch: async function(url, options = {}) {
        const token = this.getToken();
        if (!token) {
            throw new Error('No authentication token found');
        }

        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include'
        };

        const response = await fetch(url, { ...defaultOptions, ...options });
        
        if (response.status === 401) {
            this.clearAuth();
            window.location.href = 'login.html';
            throw new Error('Session expired');
        }

        return response;
    }
};

// Export for use in other files
window.auth = auth;
