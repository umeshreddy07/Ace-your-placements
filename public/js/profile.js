// public/js/profile.js

document.addEventListener('DOMContentLoaded', async () => {
    console.log("[PROFILE_JS] DOMContentLoaded: Initializing profile page.");

    // Initial auth check
    const token = auth.getToken();
    if (!token) {
        console.warn("[PROFILE_JS] No auth token found. Redirecting to login.");
        auth.clearAuth();
        window.location.replace('/login.html');
        return;
    }

    // Initialize global UI components (navbar, mobile menu, etc.)
    if (typeof initializeGlobalUI === 'function') {
        initializeGlobalUI();
    } else {
        console.error("Critical Error: initializeGlobalUI() not found in script.js.");
        // Fallback for global UI if script.js fails to load correctly
        document.getElementById('navProfilePic').src = 'static/default-profile.jpg';
        document.getElementById('dropdownProfilePic').src = 'static/default-profile.jpg';
        document.getElementById('dropdownUserName').textContent = 'Guest';
        document.getElementById('dropdownUserEmail').textContent = 'Please log in';
    }

    await fetchAndDisplayUserProfile();

    // --- Navbar Profile Dropdown & Mobile Menu Logic (Moved from profile.html) ---

    // Handle page transitions for all .nav-transition-link elements
    document.querySelectorAll('.nav-transition-link').forEach(link => {
        link.addEventListener('click', handlePageTransition);
    });

    const tufProfileBtn = document.getElementById('navProfileBtn');
    const tufProfileDropdownMenu = document.getElementById('tufProfileDropdownMenu');
    const tufCloseProfileDropdown = document.getElementById('tufCloseProfileDropdown');
    if (tufProfileBtn && tufProfileDropdownMenu) {
        tufProfileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            tufProfileDropdownMenu.classList.toggle('open');
        });
    }
    if (tufCloseProfileDropdown && tufProfileDropdownMenu) {
        tufCloseProfileDropdown.addEventListener('click', () => {
            tufProfileDropdownMenu.classList.remove('open');
        });
    }
    document.addEventListener('click', (e) => {
        if (tufProfileDropdownMenu && tufProfileDropdownMenu.classList.contains('open') && !tufProfileBtn.contains(e.target) && !tufProfileDropdownMenu.contains(e.target)) {
            tufProfileDropdownMenu.classList.remove('open');
        }
    });

    const mobileMenuBtnTUF = document.getElementById('mobileMenuBtnTUF');
    const mobileMenuTUF = document.getElementById('mobileMenuTUF');
    const closeMobileMenuBtnTUF = document.getElementById('closeMobileMenuBtnTUF');
    if (mobileMenuBtnTUF && mobileMenuTUF) {
        mobileMenuBtnTUF.addEventListener('click', () => {
            mobileMenuTUF.classList.remove('-translate-x-full');
            mobileMenuTUF.classList.add('translate-x-0');
            document.body.style.overflow = 'hidden';
        });
    }
    if (closeMobileMenuBtnTUF && mobileMenuTUF) {
        closeMobileMenuBtnTUF.addEventListener('click', () => {
            mobileMenuTUF.classList.remove('translate-x-0');
            mobileMenuTUF.classList.add('-translate-x-full');
            document.body.style.overflow = '';
        });
    }
    if (mobileMenuTUF) {
        mobileMenuTUF.querySelectorAll('a.nav-transition-link, div[onclick*="logoutUser"]').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenuTUF.classList.remove('translate-x-0');
                mobileMenuTUF.classList.add('-translate-x-full');
                document.body.style.overflow = '';
            });
        });
    }

});

// Function to get a cookie value
// This function will now rely on the globally defined getCookie in script.js
// function getCookie(name) {
//     const nameEQ = name + "=";
//     const ca = document.cookie.split(';');
//     for(let i = 0; i < ca.length; i++) {
//         let c = ca[i];
//         while (c.charAt(0) === ' ') c = c.substring(1, c.length);
//         if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
//     }
//     return null;
// }

// Function to update a circular progress bar
function updateCircularProgressBar(elementId, percentage, moduleName, colorClass, circleSize = 100) {
    const wrapper = document.getElementById(elementId);
    if (!wrapper) {
        console.warn(`[PROFILE_JS] Progress bar wrapper not found: ${elementId}`);
        return;
    }
    
    // Set CSS variables for size and color
    wrapper.style.setProperty('--circle-size', `${circleSize}px`);
    wrapper.classList.add(colorClass); // Add color class for stroke and text

    const radius = (circleSize - 10) / 2; // Adjusted for stroke width
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    wrapper.innerHTML = `
        <svg width="${circleSize}" height="${circleSize}">
            <circle class="progress-circle-bg-vibrant" stroke-width="8" cx="${circleSize / 2}" cy="${circleSize / 2}" r="${radius}"></circle>
            <circle class="progress-circle-fg-vibrant" stroke-width="8" cx="${circleSize / 2}" cy="${circleSize / 2}" r="${radius}"
                    stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"></circle>
        </svg>
        <span class="progress-circle-percentage-vibrant">${Math.round(percentage)}%</span>
        <span class="progress-circle-module-name-vibrant">${moduleName}</span>
    `;
}

// Function to render the login heatmap
function renderLoginHeatmap(loginActivity) {
    const heatmapContainer = document.getElementById('loginHeatmapGrid');
    if (!heatmapContainer) {
        console.warn("[PROFILE_JS] Login heatmap container not found.");
        return;
    }
    heatmapContainer.innerHTML = ''; // Clear previous content

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day

    const dates = [];
    for (let i = 29; i >= 0; i--) { // Last 30 days
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        dates.push(d);
    }

    const activityMap = new Map();
    // Assuming loginActivity is an object like { 'YYYY-MM-DD': count }
    for (const dateString in loginActivity) {
        activityMap.set(dateString, loginActivity[dateString]);
    }

    dates.forEach(date => {
        const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD
        const count = activityMap.get(dateString) || 0;

        let intensityClass = 'bg-gray-200'; // No logins
        if (count > 0 && count <= 5) intensityClass = 'bg-green-100';
        else if (count > 5 && count <= 15) intensityClass = 'bg-green-300';
        else if (count > 15 && count <= 30) intensityClass = 'bg-green-500';
        else if (count > 30) intensityClass = 'bg-green-700';
        
        // Darker theme for heatmap cells
        if (count === 0) intensityClass = 'bg-gray-700'; // Dark gray for no logins
        else if (count > 0 && count <= 5) intensityClass = 'bg-green-800'; // Darker greens
        else if (count > 5 && count <= 15) intensityClass = 'bg-green-700';
        else if (count > 15 && count <= 30) intensityClass = 'bg-green-600';
        else if (count > 30) intensityClass = 'bg-green-500';


        const cell = document.createElement('div');
        cell.className = `w-4 h-4 rounded-sm transition-colors duration-200 ease-in-out cursor-pointer ${intensityClass}`;
        cell.title = `${dateString}: ${count} logins`;
        heatmapContainer.appendChild(cell);
    });
}

function createVibrantCircularProgressBar(containerId, percentage, size, strokeWidth, moduleName, strokeClass) {
    const container = document.getElementById(containerId);
    if (!container) { 
        console.error(`Container not found for progress bar: ${containerId}`); 
        return; 
    }
    container.innerHTML = ''; // Clear previous content
    container.style.setProperty('--circle-size', `${size}px`);

    const SVG_NS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("width", size);
    svg.setAttribute("height", size);
    svg.setAttribute("viewBox", `0 0 ${size} ${size}`);

    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    const bgCircle = document.createElementNS(SVG_NS, "circle");
    bgCircle.setAttribute("class", "progress-circle-bg-vibrant");
    bgCircle.setAttribute("cx", size / 2);
    bgCircle.setAttribute("cy", size / 2);
    bgCircle.setAttribute("r", radius);
    bgCircle.setAttribute("fill", "transparent");
    bgCircle.setAttribute("stroke-width", strokeWidth * 0.8);
    svg.appendChild(bgCircle);

    const fgCircle = document.createElementNS(SVG_NS, "circle");
    fgCircle.setAttribute("class", `progress-circle-fg-vibrant ${strokeClass}`);
    fgCircle.setAttribute("cx", size / 2);
    fgCircle.setAttribute("cy", size / 2);
    fgCircle.setAttribute("r", radius);
    fgCircle.setAttribute("fill", "transparent");
    fgCircle.setAttribute("stroke-width", strokeWidth);
    fgCircle.setAttribute("stroke-dasharray", circumference);
    // Set initial offset to full circumference for animation
    fgCircle.style.strokeDashoffset = circumference;
    svg.appendChild(fgCircle);
    
    container.appendChild(svg);

    const textWrapper = document.createElement("div");
    textWrapper.className = "absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none";

    const percentageTextEl = document.createElement("div");
    percentageTextEl.className = "progress-circle-percentage-vibrant";
    percentageTextEl.textContent = `${Math.round(percentage)}%`;

    const nameTextEl = document.createElement("div");
    nameTextEl.className = "progress-circle-module-name-vibrant";
    
    // Special handling for the larger "Overall Matrix" circle
    if (containerId === 'overallProgressCircleWrapper') {
        nameTextEl.textContent = "Overall Matrix";
    } else {
        nameTextEl.textContent = moduleName;
    }

    textWrapper.appendChild(percentageTextEl);
    textWrapper.appendChild(nameTextEl);
    container.appendChild(textWrapper);

    // Trigger the animation after a short delay to ensure the element is in the DOM
    setTimeout(() => {
        fgCircle.style.transition = 'stroke-dashoffset 1.3s cubic-bezier(0.19, 1, 0.22, 1)';
        fgCircle.style.strokeDashoffset = offset;
    }, 100);
}

function generateClientSideLoginHeatmap(containerId, totalActiveDaysCountElId, totalActiveSummaryElId, maxStreakSummaryElId, oldMonthContainerIdToRemove, activityDataFromCaller) {
    // Constants for easy configuration
    const CELL_SIZE = 11; // width and height of a cell in pixels
    const CELL_GAP = 3; // gap between cells in pixels

    // Get main DOM elements
    const container = document.getElementById('siteLoginHeatmapGrid');
    const daysContainer = document.getElementById('siteLoginHeatmapDays');
    const monthsContainer = document.getElementById('siteLoginHeatmapMonths');
    const totalDaysEl = document.getElementById(totalDaysId);
    const totalDaysSummaryEl = document.getElementById(totalDaysSummaryId);
    const maxStreakEl = document.getElementById(maxStreakId);
    
    // --- New wrapper structure ---
    const htmlStructure = `
        <div class="heatmap-container">
            <div id="heatmapMonthsRow" class="heatmap-months-row"></div>
            <div class="heatmap-body">
                <div id="heatmapDaysCol" class="heatmap-days-col"></div>
                <div id="heatmapGrid" class="heatmap-grid"></div>
            </div>
        </div>`;
        
    const heatmapWrapper = document.querySelector('.heatmap-outer-wrapper');
    if (!heatmapWrapper) return;
    heatmapWrapper.innerHTML = htmlStructure;

    // Get newly created elements
    const grid = document.getElementById('heatmapGrid');
    const daysCol = document.getElementById('heatmapDaysCol');
    const monthsRow = document.getElementById('heatmapMonthsRow');


    if (!grid || !daysCol || !monthsRow || !totalDaysEl || !totalDaysSummaryEl || !maxStreakEl) {
        console.warn("[PROFILE_JS] One or more dynamically created heatmap elements not found");
        return;
    }

    // --- 1. Generate Date & Activity Data (Last 365 Days) ---
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize date

    const dates = [];
    // Go back 365 days from today
    for (let i = 364; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        dates.push(d);
    }
    
    const activityMap = new Map(Object.entries(activityDataFromCaller));
    console.log("[PROFILE_JS] Activity Map generated for heatmap:", activityMap);

    // --- 2. Add Padding to Align First Day with Correct Day of the Week ---
    const firstDayOfWeek = dates[0].getDay(); // 0 = Sunday, 1 = Monday...
    console.log("[PROFILE_JS] Heatmap dates array (first 10 days): ", dates.slice(0, 10));
    console.log("[PROFILE_JS] First day of week for heatmap start (0=Sun):", firstDayOfWeek);

    for (let i = 0; i < firstDayOfWeek; i++) {
        const paddingCell = document.createElement('div');
        paddingCell.className = 'heatmap-cell';
        paddingCell.setAttribute('data-level', '-1');
        grid.appendChild(paddingCell);
    }

    // --- 3. Populate Grid and Calculate Stats ---
    let totalActiveDays = 0;
    let maxStreak = 0;
    let currentStreak = 0;
    let monthLabelPositions = new Map();
    let processedMonths = new Set();
    const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'short' });

    dates.forEach((date, index) => {
        const dateString = date.toISOString().split('T')[0];
        const count = activityMap.get(dateString) || 0;

        // Calculate stats
        if (count > 0) {
            totalActiveDays++;
            currentStreak++;
            maxStreak = Math.max(maxStreak, currentStreak);
        } else {
            currentStreak = 0;
        }

        // Determine cell color level
        let intensityLevel = 0;
        if (count > 0 && count <= 2) intensityLevel = 1;
        else if (count > 2 && count <= 5) intensityLevel = 2;
        else if (count > 5 && count <= 10) intensityLevel = 3;
        else if (count > 10) intensityLevel = 4;

        // Create the cell
        const cell = document.createElement('div');
        cell.className = 'heatmap-cell';
        cell.setAttribute('data-level', intensityLevel);
        cell.title = `${dateString}: ${count} submissions`;
        grid.appendChild(cell);

        // --- 4. Logic to place Month labels ---
        const month = monthFormatter.format(date);
        const dayOfMonth = date.getDate();
        
        // Place label if it's the start of a new month we haven't seen yet
        if (dayOfMonth >= 1 && dayOfMonth <= 7 && !processedMonths.has(month)) {
            // Calculate column index for the current day
            const totalCellsSoFar = firstDayOfWeek + index;
            const columnIndex = Math.floor(totalCellsSoFar / 7);
            
            // Calculate the horizontal position
            const position = columnIndex * (CELL_SIZE + CELL_GAP);
            monthLabelPositions.set(month, position);
            processedMonths.add(month);
        }
    });

    // --- 5. Render Month and Day Labels ---
    // Render Month Labels
    monthLabelPositions.forEach((position, month) => {
        const label = document.createElement('div');
        label.className = 'heatmap-month-label';
        label.textContent = month;
        label.style.left = `${position}px`;
        monthsRow.appendChild(label);
    });
    
    // Render Day Labels (Mon, Wed, Fri)
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    [1, 3, 5].forEach(i => { // Indices for Mon, Wed, Fri
        const dayLabel = document.createElement('div');
        dayLabel.textContent = dayNames[i];
        daysCol.appendChild(dayLabel);
    });

    // --- 6. Update Summary Text ---
    const totalCount = Array.from(activityMap.values()).reduce((sum, count) => sum + count, 0);
    totalDaysEl.textContent = `${totalCount} submissions in the past one year`; // This line now uses total submissions
    totalDaysSummaryEl.textContent = `${totalActiveDays} days of activity`;
    maxStreakEl.textContent = `${maxStreak} days`;
    console.log("[PROFILE_JS] Calculated totalActiveDays:", totalActiveDays);
    console.log("[PROFILE_JS] Calculated maxStreak:", maxStreak);

    // Hide loading spinner and show content
    document.getElementById('siteLoginActivityLoading').classList.add('hidden');
    document.getElementById('siteLoginActivityContent').classList.remove('hidden');

    // Scroll to current month
    const scrollableContainer = mainHeatmapGridElement.parentElement;
    if (scrollableContainer && typeof scrollableContainer.scrollLeft !== 'undefined') {
        setTimeout(() => {
            const currentMonthIndex = today.getMonth();
            const allMonthBlocks = mainHeatmapGridElement.children;
            if (allMonthBlocks.length === 12 && currentMonthIndex < allMonthBlocks.length) {
                const targetBlock = allMonthBlocks[currentMonthIndex];
                if (targetBlock) {
                    let scrollPos = 0;
                    for(let i=0; i < currentMonthIndex; i++) {
                        scrollPos += allMonthBlocks[i].offsetWidth + parseFloat(getComputedStyle(mainHeatmapGridElement).gap || '0');
                    }
                    const containerWidth = scrollableContainer.offsetWidth;
                    const targetBlockWidth = targetBlock.offsetWidth;
                    scrollPos = Math.max(0, scrollPos - (containerWidth / 2) + (targetBlockWidth / 2) );
                    scrollableContainer.scrollLeft = Math.min(scrollPos, scrollableContainer.scrollWidth - containerWidth);
                } else {
                    scrollableContainer.scrollLeft = scrollableContainer.scrollWidth; 
                }
            } else {
                scrollableContainer.scrollLeft = scrollableContainer.scrollWidth; 
            }
        }, 100);
    }
}

async function fetchAndDisplayUserProfile() {
    console.log("[PROFILE_JS] Attempting to fetch user profile...");

    try {
        const token = auth.getToken();
        if (!token) {
            console.warn("[PROFILE_JS] No auth token found. Redirecting to login.");
            auth.clearAuth();
            window.location.replace('/login.html');
            return;
        }

        const response = await auth.fetch('/api/users/profile');

        if (!response.ok) {
            throw new Error('Failed to fetch profile data from server.');
        }

        const profileData = await response.json();
        console.log("[PROFILE_JS] Complete User Data Received:", profileData);

        const user = profileData.user;
        auth.setAuth(token, user);
        console.log("[PROFILE_JS] Raw loginActivity from backend:", user.loginActivity);

        // Initialize ProgressTracker and fetch progress data
        const localProgressTracker = new ProgressTracker();
        await localProgressTracker.init(); // This will fetch progress from server

        // Populate User Info Display
        const nameInitial = user.leetcodeUsername ? user.leetcodeUsername.charAt(0).toUpperCase() : (user.name ? user.name.charAt(0).toUpperCase() : '🚀');
        document.getElementById('profileInitialDisplayLogo').textContent = nameInitial;
        let cleanedLeetcodeName = user.leetcodeUsername ? user.leetcodeUsername.replace(/[^a-zA-Z\s]/g, '').trim() : '';
        cleanedLeetcodeName = cleanedLeetcodeName.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        document.getElementById('profileDisplayName').innerHTML = `${cleanedLeetcodeName || user.name || "Profile Data Anomaly"} <span class="login-status-dot"></span>`;
        document.getElementById('profileLeetcodeUsernameDisplay').textContent = user.leetcodeUsername ? `LeetCode ID: @${user.leetcodeUsername}` : "LeetCode ID: Not Linked";
        document.getElementById('userEmailDisplay').textContent = user.email;
        document.getElementById('userSchoolDisplay').textContent = user.school;
        document.getElementById('userLocationDisplay').textContent = user.location;
        
        // Robust profile image handling for navProfileImg
        const userProfilePicUrl = (user && user.profilePicture && user.profilePicture !== "null" && user.profilePicture !== "") 
                                  ? user.profilePicture 
                                  : 'static/default-profile.jpg';
        const navProfileImg = document.getElementById('navProfileImg');
        if (navProfileImg) {
            navProfileImg.src = userProfilePicUrl;
            navProfileImg.onerror = function() {
                console.warn('Failed to load nav profile picture from backend, falling back to default.');
                this.onerror = null; // Prevent infinite loop
                this.src = 'static/default-profile.jpg';
            };
        }

        // Populate Progress Bars
        const modulesToDisplay = [
            { id: 'aptitudeProgress', key: 'aptitude', name: 'Aptitude', colorClass: 'stroke-aptitude-vibrant', size: 110, stroke: 10 },
            { id: 'codingProgress', key: 'coding', name: 'Coding', colorClass: 'stroke-coding-vibrant', size: 110, stroke: 10 },
            { id: 'technicalProgress', key: 'technical', name: 'Technical', colorClass: 'stroke-technical-vibrant', size: 110, stroke: 10 },
            { id: 'hrProgress', key: 'hr_interview', name: 'HR Combat', colorClass: 'stroke-hr-vibrant', size: 110, stroke: 10 },
        ];
        let totalProgressSum = 0;
        let validModulesCount = 0;

        modulesToDisplay.forEach(mod => {
            const progressValue = localProgressTracker.progress[mod.key] !== undefined ? localProgressTracker.progress[mod.key] : 0;
            createVibrantCircularProgressBar(mod.id, progressValue, mod.size, mod.stroke, mod.name, mod.colorClass);
            totalProgressSum += progressValue;
            validModulesCount++;
        });
        const overallAvgProgress = validModulesCount > 0 ? totalProgressSum / validModulesCount : 0;
        createVibrantCircularProgressBar('overallProgressCircleWrapper', overallAvgProgress, 180, 16, 'Overall Matrix', 'stroke-overall-vibrant');

        // Log current day's activity to backend and prepare data for heatmap
        const localTodayForLog = new Date();
        const year = localTodayForLog.getFullYear();
        const month = (localTodayForLog.getMonth() + 1).toString().padStart(2, '0');
        const day = localTodayForLog.getDate().toString().padStart(2, '0');
        const localTodayDateKey = `${year}-${month}-${day}`;

        let heatmapActivityData = user.loginActivity || {}; // Use user.loginActivity from fetched profile

        try {
            console.log(`[PROFILE_JS] Attempting to log activity for local date: ${localTodayDateKey} to backend.`);
            const logResponse = await auth.fetch('/api/users/activity/log', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ dateKey: localTodayDateKey })
            });

            if (logResponse.ok) {
                console.log(`[PROFILE_JS] Activity successfully logged with backend for local date: ${localTodayDateKey}`);
                const logData = await logResponse.json();
                heatmapActivityData = logData.loginActivity || heatmapActivityData; // Update with server's latest
            } else {
                const errorData = await logResponse.json().catch(() => ({}));
                console.error(`[PROFILE_JS] Failed to log activity with backend (${logResponse.status}):`, errorData.message || "Unknown error");
            }
        } catch (err) {
            console.error("[PROFILE_JS] Network error logging activity with backend:", err);
        }
        console.log('[PROFILE_JS] Final heatmapActivityData to be used:', JSON.parse(JSON.stringify(heatmapActivityData)));

        // Populate Site Login Heatmap
        const siteLoginActivityLoadingEl = document.getElementById('siteLoginActivityLoading');
        const siteLoginActivityContentEl = document.getElementById('siteLoginActivityContent');

        if(siteLoginActivityLoadingEl) siteLoginActivityLoadingEl.classList.remove('hidden');
        if(siteLoginActivityContentEl) siteLoginActivityContentEl.classList.add('hidden');

        setTimeout(() => {
            try {
                generateClientSideLoginHeatmap(
                    'siteLoginHeatmapGrid',
                    'siteLoginTotalActiveDaysCount',
                    'siteLoginTotalActiveDaysSummary',
                    'siteLoginMaxStreakSummary',
                    'siteLoginHeatmapMonths', // This parameter is for removing old month container
                    heatmapActivityData
                );
                if(siteLoginActivityLoadingEl) siteLoginActivityLoadingEl.classList.add('hidden');
                if(siteLoginActivityContentEl) siteLoginActivityContentEl.classList.remove('hidden');
                AOS.refreshHard();
            } catch (err) {
                console.error('[PROFILE_JS] Error rendering client-side login heatmap:', err);
                if(siteLoginActivityLoadingEl) siteLoginActivityLoadingEl.innerHTML = `<p class="text-red-500">Error loading engagement grid. Check console.</p>`;
            }
        }, 100);

        // LeetCode Username Link Functionality
        document.getElementById('leetcodeInputField').value = user.leetcodeUsername || '';
        document.getElementById('saveLeetcodeBtn').addEventListener('click', async () => {
            const newLCUsername = document.getElementById('leetcodeInputField').value.trim();

            const lcBtn = document.getElementById('saveLeetcodeBtn');
            const originalLcBtnText = lcBtn.innerHTML;
            lcBtn.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i>Syncing...`;
            lcBtn.disabled = true;

            try {
                const response = await auth.fetch('/api/users/profile/leetcode', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ leetcodeUsername: newLCUsername || null }),
                });

                if (response.ok) {
                    const updatedProfileData = await response.json();
                    if (updatedProfileData.user) {
                        auth.setAuth(auth.getToken(), updatedProfileData.user);
                        await fetchAndDisplayUserProfile();
                    }

                    lcBtn.innerHTML = `<i class="fas fa-check-circle mr-2"></i>Synced!`;
                    lcBtn.classList.remove('from-emerald-500', 'to-green-600', 'hover:from-emerald-600', 'hover:to-green-700');
                    lcBtn.classList.add('from-violet-500', 'to-purple-600', 'hover:from-violet-600', 'hover:to-purple-700');
                } else {
                    const errorData = await response.json().catch(() => ({ message: "Failed to update. Server error."}));
                    console.error("Failed to save LeetCode username to server:", errorData.message);
                    alert(`Error: ${errorData.message || "Could not save LeetCode username."}`);
                    lcBtn.innerHTML = `<i class="fas fa-exclamation-triangle mr-2"></i>Sync Failed`;
                    lcBtn.classList.remove('from-emerald-500', 'to-green-600', 'hover:from-emerald-600', 'hover:to-green-700');
                    lcBtn.classList.add('from-red-500', 'to-pink-600', 'hover:from-red-600', 'hover:to-pink-700');
                }
            } catch (err) {
                console.error("Network error saving LeetCode username:", err);
                alert("Network error. Could not save LeetCode username.");
                lcBtn.innerHTML = `<i class="fas fa-exclamation-triangle mr-2"></i>Network Error`;
                lcBtn.classList.remove('from-emerald-500', 'to-green-600', 'hover:from-emerald-600', 'hover:to-green-700');
                lcBtn.classList.add('from-red-500', 'to-pink-600', 'hover:from-red-600', 'hover:to-pink-700');
            } finally {
                setTimeout(() => {
                    lcBtn.innerHTML = originalLcBtnText;
                    lcBtn.disabled = false;
                    lcBtn.classList.remove('from-violet-500', 'to-purple-600', 'hover:from-violet-600', 'hover:to-purple-700', 'from-red-500', 'to-pink-600', 'hover:from-red-600', 'hover:to-pink-700');
                    lcBtn.classList.add('from-emerald-500', 'to-green-600', 'hover:from-emerald-600', 'hover:to-green-700');
                }, 2500);
            }
        });

    } catch (error) {
        console.error("[PROFILE_JS] Error in fetchAndDisplayUserProfile:", error);
        const matrixContainer = document.querySelector('.lg\\:col-span-2.content-pod-vibrant');
        if (matrixContainer) {
            matrixContainer.innerHTML = `<p class="text-red-500 text-center">Could not load profile data. Please try refreshing the page.</p>`;
        }
    }
}

async function updateLeetcodeUsername(newUsername) {
    try {
        const token = auth.getToken();
        if (!token) {
            auth.clearAuth();
            utils.showToast("Authentication required to update LeetCode username.", 'error');
            window.location.replace('/login.html');
            return;
        }

        utils.showToast("Updating LeetCode username...", 'info');
        const response = await auth.fetch('/api/user/update-leetcode', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ leetcodeUsername: newUsername })
        });

        if (response.status === 401) {
            auth.clearAuth();
            utils.showToast("Session expired. Please log in again.", 'error');
            window.location.replace('/login.html');
            return;
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Failed to update LeetCode username.' }));
            throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        utils.showToast(result.message || "LeetCode username updated successfully!", 'success');
        document.getElementById('profileLeetcodeUsernameDisplay').textContent = `LeetCode ID: ${newUsername}`;
        await fetchAndDisplayUserProfile();

    } catch (error) {
        console.error("[PROFILE_JS] Error updating LeetCode username:", error);
        utils.showToast(`Failed to update LeetCode username: ${error.message}`, 'error');
    }
}

// Debounce utility function
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}

// AOS initialization
AOS.init({ duration: 850, once: true, offset: 50, easing: 'cubic-bezier(0.165, 0.84, 0.44, 1)' });

// Page transition handler
function handlePageTransition(event) {
    event.preventDefault();
    const targetUrl = event.currentTarget.href;
    document.body.classList.add('page-transition-out');
    setTimeout(() => {
        window.location.href = targetUrl;
    }, 500);
}

// Logout functions
function logoutUser() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('platformProgress');
    localStorage.removeItem('platformLoginActivity'); // Clear any client-side heatmap cache
    window.location.href = 'login.html';
}

function logoutUserWithTransition() {
    document.body.classList.remove('page-transition-in');
    document.body.classList.add('page-transition-out');
    setTimeout(logoutUser, 650);
} 