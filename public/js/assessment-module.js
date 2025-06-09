document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const moduleId = urlParams.get('id'); // Revert to dynamic fetching from URL
    const container = document.getElementById('assessmentContainer');
    const loader = document.getElementById('loaderOverlay');
    let timerInterval, timeLeft, userAnswers = {}, questionsData = [], moduleTimerMinutes;

    const ICONS = { mcq: 'fa-list-check', text: 'fa-keyboard', code: 'fa-file-code' };

    if (!moduleId) {
        window.location.href = 'assessment-home.html';
        return;
    }

    const showLoader = () => loader.classList.add('show');
    const hideLoader = () => loader.classList.remove('show');

    async function loadAssessment() {
        showLoader();
        try {
            const res = await fetch(`/api/assessment/module/${moduleId}`);
            if (!res.ok) throw new Error('Module not found');
            const data = await res.json();
            questionsData = data.questions || [];
            moduleTimerMinutes = data.timerMinutes || 30;
            timeLeft = moduleTimerMinutes * 60;
            
            const navRightContainer = document.getElementById('navRightContainer');
            if (navRightContainer) {
                const blinkingDot = document.createElement('div');
                blinkingDot.id = 'blinkingDot';
                navRightContainer.appendChild(blinkingDot);

                const timerDiv = document.createElement('div');
                timerDiv.id = 'timer';
                timerDiv.textContent = 'TIME';
                navRightContainer.appendChild(timerDiv);
            }

            container.innerHTML = `
              <header class="page-header" data-aos="fade-down">
                  <h1 class="gradient-text-main !text-4xl md:!text-5xl">${data.name}</h1>
                  <p>Time to be a genius! Good luck. 🍀</p>
              </header>
              <form id="assessmentForm"></form>
            `;
            renderQuestions();
            startTimer();
        } catch (error) {
            container.innerHTML = `<div class="text-center"><h2 class="text-2xl font-bold text-red-600">Oh no!</h2><p>Couldn't load assessment. Try going back.</p></div>`;
        } finally {
            hideLoader();
            // Re-initialize AOS for newly added elements
            AOS.init({ duration: 1, once: true, offset: 0, easing: 'ease-out-cubic' });
        }
    }
    
    function renderQuestions() {
        const form = document.getElementById('assessmentForm');
        form.innerHTML = '';
        // let delay = 100; // Removed incremental delay
        questionsData.forEach((q, index) => {
            let inputHtml = '';
            if (q.type === 'mcq') {
                inputHtml = `<div class="options-grid">` + q.options.map(opt => 
                    `<div class="mcq-option" tabindex="0" data-q-id="${q._id}" data-value="${opt}">${opt}</div>`
                ).join('') + `</div>`;
            } else if (q.type === 'text') {
                inputHtml = `<textarea class="text-input" data-q-id="${q._id}" rows="4" placeholder="Type your brilliant answer..."></textarea>`;
            } else if (q.type === 'code') {
                inputHtml = `<textarea class="code-editor" data-q-id="${q._id}" rows="8" placeholder="Write your awesome code...">${q.codeStarter || ''}</textarea>`;
            }
            
            const card = document.createElement('div');
            card.className = 'question-card';
            card.setAttribute('data-aos', 'fade-up');
            // card.setAttribute('data-aos-delay', delay); // Removed incremental delay
            card.innerHTML = `
                <div class="question-badge">${index + 1}</div>
                <div class="question-header-content">
                    <i class="fas ${ICONS[q.type] || 'fa-question-circle'} question-icon"></i>
                    <p class="question-text">${q.questionText}</p>
                </div>
                ${inputHtml}
            `;
            form.appendChild(card);
            // delay += 100; // Removed incremental delay
        });

        const submitBtn = document.createElement('button');
        submitBtn.type = 'submit';
        submitBtn.className = 'submit-button';
        submitBtn.innerHTML = 'Finish & Submit <i class="fas fa-paper-plane ml-2"></i>';
        form.appendChild(submitBtn);

        attachEventListeners();
    }

    function attachEventListeners() {
        document.querySelectorAll('.mcq-option').forEach(el => {
            const handler = function() {
                const qId = this.dataset.qId;
                // Deselect siblings
                this.parentElement.querySelectorAll('.mcq-option').forEach(opt => opt.classList.remove('selected'));
                this.classList.add('selected');
                userAnswers[qId] = this.dataset.value;
            };
            el.addEventListener('click', handler);
            el.addEventListener('keydown', e => e.key === 'Enter' && e.target.click());
        });
        
        document.querySelectorAll('textarea').forEach(el => {
            el.addEventListener('input', e => userAnswers[e.target.dataset.qId] = e.target.value);
        });

        document.getElementById('assessmentForm').addEventListener('submit', e => {
            e.preventDefault();
            if (confirm('Are you sure you want to submit?')) {
                clearInterval(timerInterval);
                submitAssessment();
            }
        });
    }

    async function submitAssessment() {
        showLoader();
        const submissionData = {
            answers: Object.entries(userAnswers).map(([questionId, answer]) => ({ questionId, answer })),
            timeTaken: Math.max(0, (moduleTimerMinutes * 60) - (timeLeft || 0))
        };
        try {
            const res = await fetch(`/api/assessment/submit/${moduleId}`, {
                method: 'POST', headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(submissionData)
            });
            const result = await res.json();
            if (!res.ok || !result.submissionId) throw new Error(result.message || 'Submission failed');
            window.location.href = `assessment-result.html?id=${result.submissionId}`;
        } catch(error) {
            hideLoader();
            alert('Submission Error: ' + error.message);
        }
    }
    
    function startTimer() {
        const timerDiv = document.getElementById('timer');
        timerInterval = setInterval(() => {
            const minutes = Math.floor(timeLeft/60).toString().padStart(2,'0');
            const seconds = (timeLeft % 60).toString().padStart(2, '0');
            timerDiv.innerHTML = `${minutes}:${seconds}`;
            if (--timeLeft < 0) {
                clearInterval(timerInterval);
                alert("Time's up!");
                submitAssessment();
            }
        }, 1000);
    }
    
    loadAssessment();
});