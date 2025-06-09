const aiFeedbackTemplate = {
    "Overall Assessment": {
        emoji: "📊",
        structure: {
            "Score": "⭐️⭐️⭐️⭐️⭐️", // 1-5 stars
            "Time Complexity": "⏱️ O(n)",
            "Space Complexity": "💾 O(1)",
            "Code Quality": "✨ Good/Needs Improvement/Excellent"
        }
    },
    "Code Analysis": {
        emoji: "🔍",
        structure: {
            "Correctness": "✅/❌",
            "Edge Cases": "🎯 Handled/Not Handled",
            "Error Handling": "⚠️ Present/Missing",
            "Input Validation": "🔒 Implemented/Needed"
        }
    },
    "Performance": {
        emoji: "⚡",
        structure: {
            "Time Efficiency": "⏱️ Fast/Moderate/Slow",
            "Memory Usage": "💾 Optimal/Excessive",
            "Algorithm Choice": "🎯 Appropriate/Suboptimal",
            "Optimization": "🚀 Possible/Implemented"
        }
    },
    "Code Style": {
        emoji: "🎨",
        structure: {
            "Readability": "📖 Clear/Unclear",
            "Documentation": "📝 Good/Needs Improvement",
            "Naming Conventions": "🏷️ Consistent/Inconsistent",
            "Code Organization": "📚 Well-structured/Needs Restructuring"
        }
    },
    "Best Practices": {
        emoji: "📚",
        structure: {
            "Design Patterns": "🎯 Used/Not Used",
            "SOLID Principles": "🔧 Followed/Not Followed",
            "Testing": "🧪 Included/Needed",
            "Security": "🔒 Considered/Not Considered"
        }
    },
    "Improvements": {
        emoji: "🚀",
        structure: {
            "Critical": "⚠️ [List of critical improvements]",
            "Important": "📌 [List of important improvements]",
            "Optional": "💡 [List of optional improvements]"
        }
    },
    "Suggestions": {
        emoji: "💡",
        structure: {
            "Code": "📝 [Code-specific suggestions]",
            "Architecture": "🏗️ [Architecture suggestions]",
            "Testing": "🧪 [Testing suggestions]",
            "Documentation": "📚 [Documentation suggestions]"
        }
    },
    "Example Feedback": {
        emoji: "📝",
        structure: `🎯 Problem: Reverse a Singly Linked List
📊 Overall Score: ⭐️⭐️⭐️
⏱️ Time Complexity: O(n)
💾 Space Complexity: O(1)

🔍 Code Analysis:
✅ Correctness: Partially Correct
🎯 Edge Cases: Not Fully Handled
⚠️ Error Handling: Missing
🔒 Input Validation: Needed

⚡ Performance:
⏱️ Time Efficiency: Good
💾 Memory Usage: Optimal
🎯 Algorithm Choice: Appropriate
🚀 Optimization: Possible

🎨 Code Style:
📖 Readability: Clear
📝 Documentation: Needs Improvement
🏷️ Naming Conventions: Consistent
📚 Code Organization: Well-structured

🚀 Improvements:
⚠️ Critical:
- Add null pointer checks
- Handle empty list case
📌 Important:
- Add input validation
- Improve error messages
💡 Optional:
- Add performance comments
- Include usage examples

💡 Suggestions:
📝 Code:
- Use more descriptive variable names
- Add type hints
🏗️ Architecture:
- Consider using a builder pattern
🧪 Testing:
- Add unit tests for edge cases
📚 Documentation:
- Add function documentation
- Include complexity analysis`
    }
};

module.exports = aiFeedbackTemplate; 