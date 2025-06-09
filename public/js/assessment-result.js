document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const submissionId = urlParams.get('id');
    const container = document.querySelector('.result-container');

    if (!submissionId) {
        container.innerHTML = `
            <div class="text-center">
                <h2 class="text-2xl font-bold text-red-600">Oops!</h2>
                <p>No submission ID found. Please go back to assessments.</p>
                <button onclick="window.location.href='/assessments'" class="back-button mt-4">
                    <i class="fas fa-arrow-left mr-2"></i>Back to Assessments
                </button>
            </div>`;
        return;
    }

    try {
        const res = await fetch(`/api/assessment/result/${submissionId}`);
        if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.message || 'Submission not found');
        }
        const data = await res.json();

        // Add back button at the top
        const backButton = document.createElement('button');
        backButton.className = 'back-button mb-6';
        backButton.innerHTML = '<i class="fas fa-arrow-left mr-2"></i>Back to Assessments';
        backButton.onclick = () => window.location.href = '/assessments';
        container.insertBefore(backButton, container.firstChild);

        // Update header with enhanced styling
        document.getElementById('moduleName').textContent = data.moduleName;
        document.getElementById('category').textContent = data.category;
        document.getElementById('submittedAt').textContent = new Date(data.submittedAt).toLocaleString();

        const scoreValueEl = document.getElementById('scoreValue');
        const percentageScore = data.totalPossibleScore > 0 ? (data.score / data.totalPossibleScore) * 100 : 0;
        animateValue(scoreValueEl, 0, percentageScore, '%');

        const aiReviewsContainer = document.getElementById('aiReviews');
        aiReviewsContainer.innerHTML = ''; 

        if (data.aiReviews && data.aiReviews.length > 0) {
            let delay = 0;
            data.aiReviews.forEach(review => {
                const reviewCard = document.createElement('div');
                reviewCard.className = 'ai-review-card';
                reviewCard.setAttribute('data-aos', 'fade-up');
                reviewCard.setAttribute('data-aos-delay', delay);
                
                const aiReviewData = review.aiReview;

                if (aiReviewData && typeof aiReviewData === 'object') {
                    const feedback = aiReviewData.feedback || 'No feedback text was provided.';
                    const rating = typeof aiReviewData.rating === 'number' ? aiReviewData.rating : 0;

                    reviewCard.innerHTML = `
                        <div class="review-header">
                            <h4 class="text-lg font-semibold text-purple-800">Question</h4>
                            <p class="text-gray-700 question-text">${review.questionText || 'N/A'}</p>
                        </div>
                        <div class="review-content mt-4">
                            <h5 class="text-md font-semibold text-purple-700 mb-2">AI Coach's Feedback</h5>
                            <pre class="feedback-text">${feedback}</pre>
                        </div>
                        <div class="rating-display mt-4">
                            <h5 class="text-md font-semibold text-purple-700 mb-2">Rating:</h5>
                            <div class="stars">
                                ${generateStars(rating)}
                            </div>
                        </div>
                    `;
                } else {
                    reviewCard.innerHTML = `
                        <div class="review-header">
                            <h4 class="text-lg font-semibold text-purple-800">Question</h4>
                            <p class="text-gray-700 question-text">${review.questionText || 'N/A'}</p>
                        </div>
                        <div class="review-content mt-4 text-center text-gray-500">
                            <i class="fas fa-minus-circle text-2xl mb-2"></i>
                            <p>This question was not answered.</p>
                        </div>
                    `;
                }
                
                aiReviewsContainer.appendChild(reviewCard);
                delay += 100;
            });
        } else {
            aiReviewsContainer.innerHTML = `
                <div class="ai-review-card text-center text-gray-600">
                    <i class="fas fa-info-circle text-2xl mb-2"></i>
                    <p>No specific AI feedback available for this submission.</p>
                </div>
            `;
        }

        AOS.init({ duration: 600, once: true, offset: 40, easing: 'ease-out-cubic' });
    } catch (error) {
        console.error('Error loading results:', error);
        container.innerHTML = `
            <div class="text-center">
                <h2 class="text-2xl font-bold text-red-600">Error</h2>
                <p class="text-gray-600">Failed to load assessment results. ${error.message}</p>
                <button onclick="window.location.href='/assessments'" class="back-button mt-4">
                    <i class="fas fa-arrow-left mr-2"></i>Back to Assessments
                </button>
            </div>
        `;
    }
});

function generateStars(rating) {
    let starsHtml = '';
    const fullStars = Math.round(rating);
    for (let i = 1; i <= 5; i++) {
        starsHtml += `<i class="fas fa-star ${i <= fullStars ? 'text-yellow-400' : 'text-gray-300'}"></i>`;
    }
    return starsHtml;
}

function animateValue(element, start, end, suffix = '') {
    if (end === start) {
        element.textContent = end.toFixed(0) + suffix;
        return;
    }
    const duration = 1500;
    const range = end - start;
    let current = start;
    const stepTime = 16;
    const increment = range / (duration / stepTime);
    
    const animate = () => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            element.textContent = current.toFixed(0) + suffix;
        } else {
            element.textContent = current.toFixed(0) + suffix;
            requestAnimationFrame(animate);
        }
    };
    animate();
}