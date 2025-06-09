class AssessmentManager {
    constructor() {
        this.currentAssessment = null;
        this.timer = null;
        this.timeLeft = 0;
        this.answers = [];
        
        // Check if required elements exist
        this.container = document.getElementById('assessment-container');
        if (!this.container) {
            console.error('Assessment container not found');
            return;
        }

        // Initialize after checking elements
        this.loadAssessments();
    }

    async loadAssessments() {
        try {
            const token = utils.getToken();
            if (!token) {
                console.error('No authentication token found');
                utils.showError('Please log in to view assessments');
                return;
            }

            const response = await fetch('/api/assessment/modules', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    console.error('Authentication failed');
                    utils.showError('Session expired. Please log in again.');
                    setTimeout(() => utils.logout(), 2000);
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const modules = await response.json();
            console.log("Received modules data (stringified):", JSON.stringify(modules, null, 2));
            this.renderAssessments(modules);
        } catch (error) {
            console.error('Error loading assessment modules:', error);
            utils.showError('Failed to load assessment modules');
        }
    }

    renderAssessments(modules) {
        this.container.innerHTML = '';

        const groupedModules = modules; // Backend is already sending a grouped object, so no need to reduce

        let sectionDelay = 100;
        for (const groupName in groupedModules) {
            const section = document.createElement('div');
            section.className = 'section';
            section.setAttribute('data-aos', 'fade-up');
            section.setAttribute('data-aos-delay', sectionDelay);

            let iconClass = 'fa-star';
            switch(groupName) {
                case 'Aptitude': iconClass = 'fa-brain'; break;
                case 'Technical': iconClass = 'fa-microchip'; break;
                case 'Coding': iconClass = 'fa-code'; break;
                case 'HR': iconClass = 'fa-handshake-angle'; break;
            }

            section.innerHTML = `
                <div class="section-header">
                    <i class="fas ${iconClass} section-icon bg-gradient-to-br from-purple-500 to-indigo-600"></i>
                    <h2 class="section-title">${groupName}</h2>
                </div>
                <div class="module-grid"></div>
            `;
            
            const moduleGrid = section.querySelector('.module-grid');
            let cardDelay = sectionDelay + 100;

            groupedModules[groupName].forEach(module => {
                console.log("Module object before card creation:", module);
                moduleGrid.appendChild(this.createAssessmentCard(module, cardDelay));
                cardDelay += 50;
            });
            
            this.container.appendChild(section);
            sectionDelay += 200;
        }
    }

    createAssessmentCard(module, delay) {
        const card = document.createElement('div');
        card.className = 'module-card';
        card.setAttribute('data-aos', 'zoom-in-up');
        card.setAttribute('data-aos-delay', delay);

        const now = new Date();
        
        let status = 'active';
        let disabled = false;
        let buttonText = `<i class="fas fa-bolt mr-2"></i> Start Challenge`;

        card.innerHTML = `
                <span class="badge ${status}"></span>
            <h3>${module.name}</h3>
            <p>${module.description}</p>
            <button class="start-button" ${disabled ? 'disabled' : ''}>${buttonText}</button>
        `;

        if (!disabled) {
            card.querySelector('.start-button').addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = `assessment-module.html?id=${module._id}`;
            });
        }

        if(disabled){
            card.querySelector('.start-button').style.opacity = '0.7';
            card.querySelector('.start-button').style.cursor = 'not-allowed';
        }

        return card;
    }

    async startAssessment(assessmentId) {
        try {
            const token = utils.getToken();
            if (!token) {
                console.error('No authentication token found');
                utils.showError('Please log in to start assessment');
                return;
            }

            const response = await fetch(`/api/assessment/module/${assessmentId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    console.error('Authentication failed');
                    utils.showError('Session expired. Please log in again.');
                    setTimeout(() => utils.logout(), 2000);
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const assessment = await response.json();

            if (assessment.submission) {
                this.showError('You have already submitted this assessment');
                return;
            }

            this.currentAssessment = assessment;
            this.timeLeft = assessment.timerMinutes * 60;
            this.answers = [];
            this.showAssessment();
            this.startTimer();
        } catch (error) {
            console.error('Error starting assessment:', error);
            this.showError('Failed to start assessment');
        }
    }

    showAssessment() {
        const container = document.getElementById('assessment-container');
        container.innerHTML = `
            <div class="assessment-content">
                <div class="assessment-header">
                    <h2>${this.currentAssessment.name}</h2>
                    <div class="timer" id="timer">${this.formatTime(this.timeLeft)}</div>
                </div>
                <div class="sections-container"></div>
                <div class="assessment-navigation">
                    <button id="prevSection" class="nav-button hidden">Previous</button>
                    <button id="nextSection" class="nav-button">Next</button>
                </div>
                <button id="submitAssessment" class="submit-button">Submit Assessment</button>
            </div>
        `;

        this.sectionsContainer = container.querySelector('.sections-container');
        this.prevButton = container.querySelector('#prevSection');
        this.nextButton = container.querySelector('#nextSection');
        this.submitButton = container.querySelector('#submitAssessment');

        this.currentSectionIndex = 0;
        this.renderSections();

        this.prevButton.addEventListener('click', () => this.navigateSections(-1));
        this.nextButton.addEventListener('click', () => this.navigateSections(1));
        this.submitButton.addEventListener('click', () => this.submitAssessment());
    }

    navigateSections(direction) {
        this.currentSectionIndex += direction;
        this.renderSections();
    }

    renderSections() {
        this.sectionsContainer.innerHTML = '';
        const section = this.currentAssessment.questions;

        if (section) {
            const sectionEl = document.createElement('div');
            sectionEl.className = 'assessment-section';

            const questionList = document.createElement('div');
            questionList.className = 'question-list';
            section.forEach((question, questionIndex) => {
                questionList.appendChild(this.renderQuestion(question, questionIndex));
            });
            sectionEl.appendChild(questionList);
            this.sectionsContainer.appendChild(sectionEl);
        } else {
            this.sectionsContainer.innerHTML = '<p>No questions found for this module.</p>';
        }

        this.updateNavigationButtons();
    }

    renderQuestion(question, questionIndex) {
        const questionEl = document.createElement('div');
        questionEl.className = 'question-item';
        questionEl.setAttribute('data-question-index', questionIndex);
        questionEl.innerHTML = `
                <div class="question-header">
                    <h4>Question ${questionIndex + 1}</h4>
                <span class="question-type">${question.type}</span>
            </div>
            <p class="question-text">${question.questionText}</p>
            <div class="question-input"></div>
        `;

        const inputContainer = questionEl.querySelector('.question-input');
        this.renderQuestionInput(question, questionIndex, inputContainer);

        return questionEl;
    }

    renderQuestionInput(question, questionIndex, inputContainer) {
        inputContainer.innerHTML = '';

        let inputHtml = '';
        switch (question.type) {
            case 'mcq':
                question.options.forEach((option, optionIndex) => {
                    inputHtml += `
                        <label class="mcq-option">
                            <input type="radio" name="question-${questionIndex}" value="${option}">
                            <span>${option}</span>
                        </label>
                    `;
                });
                break;
            case 'text':
                inputHtml += `
                    <textarea class="text-input" rows="5" placeholder="Type your answer here..."></textarea>
                `;
                break;
            case 'code':
                inputHtml += `
                    <pre class="code-editor" contenteditable="true" data-question-index="${questionIndex}">${question.codeStarter || '// Write your code here'}</pre>
                    <select class="language-selector" data-question-index="${questionIndex}">
                                <option value="javascript">JavaScript</option>
                                <option value="python">Python</option>
                                <option value="java">Java</option>
                                <option value="cpp">C++</option>
                            </select>
                    <button class="run-code-button" data-question-index="${questionIndex}">Run Code</button>
                    <div class="code-output"></div>
                `;
                break;
            default:
                inputHtml += '<p>Unsupported question type.</p>';
        }
        inputContainer.innerHTML = inputHtml;

        if (question.type === 'mcq') {
            inputContainer.querySelectorAll(`input[name="question-${questionIndex}"]`).forEach(radio => {
                radio.addEventListener('change', (e) => this.saveAnswer(questionIndex, e.target.value));
            });
        } else if (question.type === 'text') {
            inputContainer.querySelector('.text-input').addEventListener('input', (e) => this.saveAnswer(questionIndex, e.target.value));
        } else if (question.type === 'code') {
            const editor = inputContainer.querySelector('.code-editor');
            const languageSelector = inputContainer.querySelector('.language-selector');
            const runButton = inputContainer.querySelector('.run-code-button');

            editor.addEventListener('input', (e) => this.saveAnswer(questionIndex, e.target.textContent));
            languageSelector.addEventListener('change', (e) => this.setLanguage(questionIndex, e.target.value));
            runButton.addEventListener('click', () => this.runCode(questionIndex));

            if (this.answers[questionIndex] && this.answers[questionIndex].language) {
                languageSelector.value = this.answers[questionIndex].language;
            }
        }

        if (this.answers[questionIndex]) {
            if (question.type === 'mcq') {
                const savedOption = this.answers[questionIndex].answer;
                if (savedOption) {
                    const radio = inputContainer.querySelector(`input[name="question-${questionIndex}"][value="${savedOption}"]`);
                    if (radio) radio.checked = true;
                }
            } else if (question.type === 'text') {
                inputContainer.querySelector('.text-input').value = this.answers[questionIndex].answer || '';
            } else if (question.type === 'code') {
                inputContainer.querySelector('.code-editor').textContent = this.answers[questionIndex].answer || question.codeStarter || '';
            }
        }
    }

    setLanguage(questionIndex, language) {
        this.answers[questionIndex] = this.answers[questionIndex] || {};
        this.answers[questionIndex].language = language;
    }

    saveAnswer(questionIndex, answer) {
        this.answers[questionIndex] = this.answers[questionIndex] || {};
        this.answers[questionIndex].answer = answer;
    }

    async runCode(questionIndex) {
        const question = this.currentAssessment.questions[questionIndex];
        const answer = this.answers[questionIndex];
        const code = answer ? answer.answer : (question.codeStarter || '');
        const language = answer ? answer.language : 'javascript';

        const codeOutputDiv = document.querySelector(`.question-item[data-question-index="${questionIndex}"] .code-output`);
        codeOutputDiv.innerHTML = 'Running code...';
        codeOutputDiv.style.color = '#60a5fa';

        try {
            const response = await fetch('/api/execute-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${utils.getToken()}`
                },
                body: JSON.stringify({ language, code })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            codeOutputDiv.textContent = `Output:\n${result.output || 'No output'}\nError:\n${result.error || 'No error'}`;
            codeOutputDiv.style.color = result.error ? '#ef4444' : '#10b981';

        } catch (error) {
            console.error('Error running code:', error);
            codeOutputDiv.textContent = `Failed to run code: ${error.message}`;
            codeOutputDiv.style.color = '#ef4444';
        }
    }

    startTimer() {
        if (this.timer) clearInterval(this.timer);
        this.timer = setInterval(() => {
            if (this.timeLeft <= 0) {
                clearInterval(this.timer);
                this.submitAssessment();
            } else {
                this.timeLeft--;
                document.getElementById('timer').textContent = this.formatTime(this.timeLeft);
            }
        }, 1000);
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    async submitAssessment() {
        if (!confirm('Are you sure you want to submit your assessment?')) return;

        try {
            const token = utils.getToken();
            if (!token) {
                utils.showError('No authentication token found. Please log in.');
                return;
            }

            const submissionData = {
                assessmentId: this.currentAssessment._id,
                answers: this.answers.map((ans, index) => ({
                    questionId: this.currentAssessment.questions[index]._id,
                    answer: ans ? ans.answer : '',
                    language: ans ? ans.language : undefined
                })),
                timeTaken: this.currentAssessment.timerMinutes * 60 - this.timeLeft,
            };

            const response = await fetch('/api/assessment/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(submissionData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            utils.showSuccess('Assessment submitted successfully!');
            // Redirect to the assessment results page with the submission ID
            window.location.href = `assessment-result.html?id=${result.submission._id}`;

        } catch (error) {
            console.error('Error submitting assessment:', error);
            utils.showError(`Failed to submit assessment: ${error.message}`);
        }
    }

    async viewResults(assessmentId) {
        try {
            const token = utils.getToken();
            if (!token) {
                utils.showError('No authentication token found. Please log in.');
                return;
            }

            const response = await fetch(`/api/assessments/results/${assessmentId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            if (result.submission) {
                this.showResults(result.submission);
            } else {
                utils.showError('No results found for this assessment.');
            }
        } catch (error) {
            console.error('Error viewing results:', error);
            utils.showError(`Failed to view results: ${error.message}`);
        }
    }

    showResults(submission) {
        const container = document.getElementById('assessment-container');
        container.innerHTML = `
            <div class="results-summary">
                <h2>Assessment Results for ${this.currentAssessment ? this.currentAssessment.name : 'Unknown Assessment'}</h2>
                <p>Total Marks: ${submission.totalMarks}</p>
                <p>Marks Obtained: ${submission.marksObtained}</p>
                <p>Percentage: ${((submission.marksObtained / submission.totalMarks) * 100).toFixed(2)}%</p>
                <p>Status: ${submission.status}</p>
            </div>
            <div class="results-questions"></div>
            <button class="back-to-home-button">Back to Assessments</button>
        `;

        const questionsContainer = container.querySelector('.results-questions');
        submission.answeredQuestions.forEach((ans, index) => {
            const originalQuestion = this.currentAssessment.questions.find(q => q._id === ans.questionId);
            if (!originalQuestion) return;

            const questionResultEl = document.createElement('div');
            questionResultEl.className = 'question-result-item';
            questionResultEl.innerHTML = `
                <h4>Question ${index + 1}: ${originalQuestion.questionText}</h4>
                <p>Your Answer: ${ans.answer}</p>
                <p>Correct Answer: ${originalQuestion.correctAnswer || 'N/A'}</p>
                <p>Marks: ${ans.marksObtained || 0} / ${originalQuestion.marks || 'N/A'}</p>
                ${ans.feedback ? `<p>Feedback: ${ans.feedback}</p>` : ''}
            `;
            questionsContainer.appendChild(questionResultEl);
        });

        container.querySelector('.back-to-home-button').addEventListener('click', () => {
            window.location.href = 'assessment-home.html';
        });
    }

    updateNavigationButtons() {
        this.prevButton.classList.toggle('hidden', this.currentSectionIndex === 0);
        this.nextButton.classList.toggle('hidden', this.currentSectionIndex === this.currentAssessment.questions.length - 1);
        this.submitButton.classList.toggle('hidden', this.currentSectionIndex !== this.currentAssessment.questions.length - 1);
    }

    showError(message) {
        const errorDiv = document.getElementById('error-message');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
            document.querySelector('.loading-spinner').style.display = 'none';
        }
    }
}

function waitForUtils(callback) {
    if (typeof utils !== 'undefined' && typeof utils.getToken === 'function') {
        callback();
    } else {
        setTimeout(() => waitForUtils(callback), 50);
    }
}

if (window.location.pathname.includes('assessment-home.html') || window.location.pathname.includes('assessment-module.html')) {
    waitForUtils(() => {
        if (!window.assessmentManagerInstance) {
            window.assessmentManagerInstance = new AssessmentManager();
        }

        if (window.location.pathname.includes('assessment-module.html')) {
            const urlParams = new URLSearchParams(window.location.search);
            const assessmentId = urlParams.get('id');
            if (assessmentId) {
                window.assessmentManagerInstance.startAssessment(assessmentId);
        } else {
                console.error("No assessment ID found in URL for assessment-module.html");
                window.location.href = 'assessment-home.html';
            }
        }
    });
} 