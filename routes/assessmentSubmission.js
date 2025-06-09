const express = require('express');
const router = express.Router();
const AssessmentModule = require('../models/AssessmentModule');
const UserAssessmentSubmission = require('../models/UserAssessmentSubmission');
const auth = require('../middleware/auth');
const axios = require('axios');
const rateLimit = require('express-rate-limit');

// Rate limiting for AI review requests
const aiReviewLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

// POST /api/assessment/submit/:moduleId
router.post('/submit/:moduleId', auth, aiReviewLimiter, async (req, res) => {
    try {
        const { answers, timeTaken } = req.body;
        const moduleId = req.params.moduleId;
        const userId = req.user.userId;

        console.log('Submission request received:', {
            moduleId,
            userId,
            timeTaken,
            answersCount: answers?.length
        });

        const module = await AssessmentModule.findById(moduleId);
        if (!module) return res.status(404).json({ message: 'Module not found' });

        let score = 0;
        const processedAnswers = [];
        const maxMarksPerQuestion = 5;

        for (const q of module.questions) {
            const userAnswer = answers.find(a => String(a.questionId) === String(q._id));
            
            // Handle unanswered questions
            if (!userAnswer || !userAnswer.answer?.trim()) {
                 processedAnswers.push({
                    questionId: q._id,
                    answer: "No answer provided.",
                    isCorrect: false,
                    marksAwarded: 0,
                    aiReview: null
                });
                continue;
            }

            let isCorrect = null;
            let marksAwarded = 0;
            let finalAiReview = null;

            // Get AI review for all question types
            if (q.type === 'mcq') {
                isCorrect = (userAnswer.answer === q.correctAnswer);
                marksAwarded = isCorrect ? maxMarksPerQuestion : 0;
                // Get AI explanation for MCQ
                finalAiReview = await getGeminiReview(userAnswer.answer, q.type, q.questionText, q.correctAnswer);
            } else if (q.type === 'text' || q.type === 'code') {
                finalAiReview = await getGeminiReview(userAnswer.answer, q.type, q.questionText);
                marksAwarded = finalAiReview.rating;
                isCorrect = finalAiReview.rating >= (maxMarksPerQuestion / 2);
            }
            
            score += marksAwarded;

            processedAnswers.push({
                questionId: q._id,
                answer: userAnswer.answer,
                aiReview: finalAiReview,
                isCorrect: isCorrect,
                marksAwarded: marksAwarded
            });
        }

        const totalPossibleScore = module.questions.length * maxMarksPerQuestion;

        console.log('Preparing submission with:', {
            score,
            processedAnswersCount: processedAnswers.length,
            timeTaken,
            totalPossibleScore
        });

        // Save submission
        const submission = new UserAssessmentSubmission({
            userId,
            moduleId,
            answers: processedAnswers,
            score,
            timeTaken: timeTaken || 0,
            submittedAt: new Date(),
            totalPossibleScore
        });

        console.log('Attempting to save submission...');
        await submission.save();
        console.log('Submission saved successfully');

        res.json({ 
            message: "Submission successful!",
            submissionId: submission._id,
            score: submission.score,
            totalPossibleScore: submission.totalPossibleScore
        });
    } catch (err) {
        console.error('FATAL SUBMISSION ERROR:', { message: err.message, stack: err.stack });
        res.status(500).json({ message: 'Server error during submission', error: err.message });
    }
});

// Helper: Gemini AI review with standardized JSON output
async function getGeminiReview(answer, type, questionText, correctAnswer = null) {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) throw new Error('Google API key not configured');

    const personalityPrompt = `
        Your persona is a friendly, witty, and super encouraging AI Coach.
        Use emojis generously (like 🚀, ✅, 💡, 🤔, 🎉) to make the feedback lively and engaging.
        Always respond ONLY with a single, valid JSON object.
        The JSON object must have two keys: "rating" (an integer 0-5) and "feedback" (a single string with "\\n\\n" separators).
    `;

    let promptContent;

    if (type === 'mcq') {
        const wasCorrect = answer === correctAnswer;
        promptContent = `
        ${personalityPrompt}
        Analyze this multiple-choice question. The user's answer was "${answer}" and the correct answer is "${correctAnswer}".
        
        The "feedback" string should explain the solution step-by-step in a fun way.
        - Start with a fun, one-line reaction to their answer (e.g., "Spot on! 🎉" or "So close! Let's break it down.").
        - Then provide a "Step-by-Step Solution:" section.
        - End with a "💡 Pro Tip:" or "🧠 Key Concept:" to help them remember.
        
        For the "rating", give 5 if the answer was correct, and 2 if it was incorrect.
        
        ---
        Question: "${questionText}"
        `;
    } else if (type === 'code') {
        promptContent = `
        ${personalityPrompt}
        Review the user's code submission.
        
        The "feedback" string must follow this structure:
        🚀 Overall Vibe Check:\n[A fun, one-paragraph summary of the code.]\n\n✅ The Nitty-Gritty:\n- Correctness: [Comment on correctness]\n- Efficiency: [Comment on time/space complexity]\n- Style: [Comment on readability and style]\n\n💡 Bright Ideas for Improvement:\n- [Specific, actionable improvement 1]\n- [Specific, actionable improvement 2]
        
        ---
        Question: "${questionText}"
        User's Code:\n${answer}`;
    } else { // 'text' (HR/Technical)
        promptContent = `
        ${personalityPrompt}
        Evaluate this written response as an expert interviewer.
        
        The "feedback" string must follow this structure:
        🤔 First Impressions:\n[A concise, engaging summary of the response.]\n\n🔍 Deeper Dive:\n- Clarity & Structure: [How clear was the answer?]\n- Relevance & Depth: [Did it answer the question well?]\n- Professionalism: [Comment on the tone.]\n\n✨ How to Level Up:\n- [Specific suggestion 1]\n- [Specific suggestion 2]
        
        ---
        Question: "${questionText}"
        User's Response: "${answer}"`;
    }

    try {
        const response = await axios.post(
            'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + apiKey,
            { contents: [{ parts: [{ text: promptContent }] }],
              generationConfig: { responseMimeType: "application/json", temperature: 0.7 } }
        );

        let reviewText = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!reviewText) throw new Error('AI response was empty.');
        
        const parsedReview = JSON.parse(reviewText);

        if (typeof parsedReview.rating !== 'number' || typeof parsedReview.feedback !== 'string') {
            throw new Error('AI response did not match the required JSON structure.');
        }
        return parsedReview;
    } catch (error) {
        console.error('GEMINI REVIEW FAILED:', error.message);
        return { rating: 0, feedback: `🤖 Whoops! Our AI coach is taking a coffee break.\n\nWe couldn't get feedback for this question right now. Please try again later!` };
    }
}

// GET /api/assessment/result/:submissionId
router.get('/result/:submissionId', auth, async (req, res) => {
    try {
        const { submissionId } = req.params;
        const sub = await UserAssessmentSubmission.findById(submissionId)
            .populate('moduleId', 'name category');
            
        if (!sub) return res.status(404).json({ message: 'Submission not found' });
        
        const module = await AssessmentModule.findById(sub.moduleId._id).select('questions');
        const questionMap = new Map(module.questions.map(q => [String(q._id), q.questionText]));

        res.json({
            score: sub.score,
            moduleName: sub.moduleId.name,
            category: sub.moduleId.category,
            submittedAt: sub.submittedAt,
            aiReviews: sub.answers.map(a => ({
                questionId: a.questionId,
                questionText: questionMap.get(String(a.questionId)) || 'N/A',
                aiReview: a.aiReview
            })),
            totalPossibleScore: sub.totalPossibleScore
        });
    } catch (err) {
        console.error('ERROR FETCHING RESULT:', { message: err.message, stack: err.stack });
        res.status(500).json({ message: 'Error fetching result', error: err.message });
    }
});

module.exports = router; 