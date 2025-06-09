// Debounce utility function
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}

// Progress tracking functionality
class ProgressTracker {
    constructor() {
        this.completedSubjects = {};
        this.progress = {};
        console.log("[ProgressTracker] Instance created.");
        this.ensureAllCategoriesExist();
    }

    async init() {
        console.log("[ProgressTracker] Initializing - attempting to fetch progress from server...");
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const response = await fetch('/api/users/me/progress', {
                    method: 'GET',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    credentials: 'include'
                });
                console.log('[ProgressTracker] init - /api/users/me/progress response status:', response.status);

                if (!response.ok) {
                    throw new Error(`Failed to fetch progress: ${response.status}`);
                }
                
                const data = await response.json();
                console.log("[ProgressTracker] Fetched progress from server:", data);
                
                if (data && data.completedSubjects) {
                    this.completedSubjects = data.completedSubjects;
                    this.progress = data.progress || {};
                    this.ensureAllCategoriesExist();
                    this.updateOverallProgress();
                    
                    // Update UI after successful fetch
                    if (typeof window.updateAptitudeUIAfterSave === 'function') {
                        window.updateAptitudeUIAfterSave();
                    }
                }
            } else {
                console.log("[ProgressTracker] No auth token found. Loading from localStorage.");
                this.loadFromLocalStorage();
            }
        } catch (error) {
            console.error("[ProgressTracker] Error fetching progress:", error);
            this.loadFromLocalStorage();
        }
    }

    loadFromLocalStorage() {
        console.log("[ProgressTracker] Loading progress from localStorage as fallback.");
        const storedProgress = localStorage.getItem('platformProgress');
        if (storedProgress) {
            try {
                const parsed = JSON.parse(storedProgress);
                this.completedSubjects = parsed.completedSubjects || {};
                this.progress = parsed.progress || {};
                this.ensureAllCategoriesExist();
                this.updateOverallProgress();
            } catch (e) {
                console.error("[ProgressTracker] Error parsing stored progress:", e);
                this.completedSubjects = {};
                this.progress = {};
            }
        }
    }
    
    ensureAllCategoriesExist() {
        const allCats = ['aptitude', 'coding', 'technical', 'hr_interview'];
        allCats.forEach(cat => {
            if (!Array.isArray(this.completedSubjects[cat])) {
                this.completedSubjects[cat] = [];
        }
            if (typeof this.progress[cat] !== 'number') {
                this.progress[cat] = 0;
            }
        });
    }

    categorizeSubtopic(subtopic) {
        if (!subtopic) return null;
        if (subtopic.startsWith('aptitude_')) return 'aptitude';
        if (subtopic.startsWith('coding_')) return 'coding';
        if (subtopic.startsWith('technical_')) return 'technical';
        if (subtopic.startsWith('hr_interview_')) return 'hr_interview';
        return null;
    }

    isCompleted(subtopicId) {
        const category = this.categorizeSubtopic(subtopicId);
        return category && 
               this.completedSubjects[category] && 
               Array.isArray(this.completedSubjects[category]) && 
               this.completedSubjects[category].includes(subtopicId);
    }

    async setCompleted(subtopicId, completed) {
        console.log(`[ProgressTracker] setCompleted called for: ${subtopicId}, completed: ${completed}`);
        
        const category = this.categorizeSubtopic(subtopicId);
        if (!category) {
            console.error(`[ProgressTracker] Invalid category for subtopic: ${subtopicId}`);
            return;
        }

        // Store original state for rollback
        const originalState = JSON.parse(JSON.stringify(this.completedSubjects));

        // Optimistic update
        if (!this.completedSubjects[category]) {
            this.completedSubjects[category] = [];
        }

        if (completed) {
            if (!this.completedSubjects[category].includes(subtopicId)) {
                this.completedSubjects[category].push(subtopicId);
            }
        } else {
            this.completedSubjects[category] = this.completedSubjects[category].filter(id => id !== subtopicId);
        }
            
        // Update progress calculations
        this.calculateAndUpdateProgressForCategory(category);
        this.updateOverallProgress();

        // Update UI immediately
        if (typeof window.updateAptitudeUIAfterSave === 'function') {
            window.updateAptitudeUIAfterSave();
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch('/api/users/me/progress', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                credentials: 'include',
                body: JSON.stringify({ subtopicId, completed })
            });
                    
            console.log('[ProgressTracker] setCompleted - Request headers:', { 'Content-Type': 'application/json', 'credentials': 'include' });
            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}`);
            }

            // Server confirmed update
            const dataFromServer = await response.json();
            console.log(`[ProgressTracker] Successfully updated ${subtopicId} on server. Server response:`, dataFromServer);

            // Update with server response
            if (dataFromServer.completedSubjects) {
                this.completedSubjects = dataFromServer.completedSubjects;
                this.progress = dataFromServer.progress || {};
                this.ensureAllCategoriesExist();
                this.updateOverallProgress();
            }

            // Save to localStorage as backup
            localStorage.setItem('platformProgress', JSON.stringify({
                completedSubjects: this.completedSubjects,
                progress: this.progress
            }));

        } catch (error) {
            console.error("[ProgressTracker] Error updating progress:", error);
            
            // Rollback on error
            this.completedSubjects = originalState;
            this.calculateAndUpdateProgressForCategory(category);
            this.updateOverallProgress();
            
            // Update UI to reflect rollback
            if (typeof window.updateAptitudeUIAfterSave === 'function') {
                window.updateAptitudeUIAfterSave();
            }
            
            throw error;
        }
    }

    calculateAndUpdateProgressForCategory(category) {
        if (!category || !this.completedSubjects[category]) return;

        const totalTopicsMap = {
            aptitude: 12,
            coding: 25,
            technical: 15,
            hr_interview: 7,
        };

        const totalInCategory = totalTopicsMap[category] || 0;
        const completedInCat = Array.isArray(this.completedSubjects[category]) ? 
            this.completedSubjects[category].length : 0;
        
        this.progress[category] = totalInCategory > 0 ? 
            Math.round((completedInCat / totalInCategory) * 100) : 0;
    }

    updateOverallProgress() {
        const categories = ['aptitude', 'coding', 'technical', 'hr_interview'];
        if (categories.length === 0) return;

        const totalProgress = categories.reduce((sum, cat) => sum + (this.progress[cat] || 0), 0);
        this.progress.overall = Math.round(totalProgress / categories.length);
    }
}

// Create global instance
if (typeof window.progressTrackerInstance === 'undefined') {
    window.progressTrackerInstance = new ProgressTracker();
    console.log('[ProgressTracker] Global instance created.');
} 