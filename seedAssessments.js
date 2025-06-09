const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Assessment = require('./models/Assessment');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ace_your_placement';

const sampleAssessments = [
    {
        title: "Advanced Quantitative Aptitude",
        description: "A comprehensive test covering advanced quantitative concepts including time and work, percentages, and mathematical reasoning.",
        type: "aptitude_practice",
        duration: 30,
        totalMarks: 200,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        sections: [
            {
                name: "Advanced Quantitative Aptitude",
                description: "Questions on advanced arithmetic, algebra, and mathematical reasoning.",
                type: "mcq",
                numQuestions: 20,
                marksPerQuestion: 10,
                questions: [
                    {
                        type: "mcq",
                        questionText: "A booster pump can be used for filling as well as for emptying a tank. The capacity of the tank is 2400 m^3. The emptying capacity of the tank is 10 m^3 per minute higher than its filling capacity and the pump needs 8 minutes lesser to empty the tank than it needs to fill it. What is the filling capacity of the pump?",
                        options: ["40 m^3/min", "50 m^3/min", "60 m^3/min", "30 m^3/min"],
                        correctAnswer: "50 m^3/min",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "If the ratio of the ages of A and B is 3:4 and the sum of their ages is 56 years, what is the age of A?",
                        options: ["24 years", "28 years", "32 years", "30 years"],
                        correctAnswer: "24 years",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "A train running at 72 km/h crosses a platform of 120 meters in 10 seconds. What is the length of the train?",
                        options: ["80 m", "100 m", "120 m", "180 m"],
                        correctAnswer: "80 m",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "The simple interest on a sum of money for 2 years at 5% per annum is ₹120. What is the principal amount?",
                        options: ["₹1000", "₹1100", "₹1200", "₹1500"],
                        correctAnswer: "₹1200",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "A man can row 6 km/h in still water. If the speed of the stream is 2 km/h, how long will he take to row 20 km downstream?",
                        options: ["2 hours", "2.5 hours", "3 hours", "4 hours"],
                        correctAnswer: "2 hours",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "If 12 men can complete a work in 15 days, how many men are required to complete the same work in 10 days?",
                        options: ["18", "20", "16", "14"],
                        correctAnswer: "18",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "What is the compound interest on ₹5000 for 2 years at 10% per annum compounded annually?",
                        options: ["₹1050", "₹1000", "₹1100", "₹1155"],
                        correctAnswer: "₹1050",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "A and B together can complete a work in 12 days. A alone can do it in 18 days. In how many days can B alone complete the work?",
                        options: ["36", "24", "20", "30"],
                        correctAnswer: "36",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "If the perimeter of a square is 48 cm, what is the area?",
                        options: ["144 cm²", "256 cm²", "121 cm²", "169 cm²"],
                        correctAnswer: "144 cm²",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "The average age of 5 students is 20. If one of them is replaced with a new student, the average becomes 21. What is the age of the new student?",
                        options: ["26", "25", "27", "28"],
                        correctAnswer: "26",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "A shopkeeper marks up goods by 40% and then gives a discount of 10%. What is the profit percentage?",
                        options: ["26%", "30%", "20%", "24%"],
                        correctAnswer: "26%",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "What is the value of x if 3x - 5 = 16?",
                        options: ["7", "6", "8", "9"],
                        correctAnswer: "7",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "In an examination, a student scores 20% and fails by 30 marks. If he had scored 40%, he would have got 10 marks more than required. What are the maximum marks?",
                        options: ["200", "150", "250", "300"],
                        correctAnswer: "200",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "A can complete a job in 16 days and B in 12 days. They work together for 4 days. What fraction of work is left?",
                        options: ["⅓", "½", "¾", "⅔"],
                        correctAnswer: "⅔",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "If the difference between simple interest and compound interest for 2 years is ₹25 and the rate is 5% p.a., find the principal.",
                        options: ["₹10,000", "₹5,000", "₹2,000", "₹1,000"],
                        correctAnswer: "₹5,000",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "An amount doubles itself in 8 years at simple interest. In how many years will it become four times?",
                        options: ["16 years", "24 years", "32 years", "20 years"],
                        correctAnswer: "24 years",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "A boat takes 6 hours to go downstream and 9 hours upstream between two points. If the speed of the boat in still water is 12 km/h, find the distance between the two points.",
                        options: ["108 km", "120 km", "100 km", "90 km"],
                        correctAnswer: "108 km",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "If 25% of x is equal to 30% of y, then what is x:y?",
                        options: ["6:5", "5:6", "3:4", "4:3"],
                        correctAnswer: "6:5",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "What is the least number which when divided by 8, 12, and 16 leaves a remainder of 5?",
                        options: ["101", "95", "85", "125"],
                        correctAnswer: "101",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "The price of a laptop was increased by 20% and then decreased by 20%. What is the net percentage change in price?",
                        options: ["4% decrease", "4% increase", "No change", "2% decrease"],
                        correctAnswer: "4% decrease",
                        marks: 10
                    }
                ]
            }
        ]
    },
    {
        title: "Complex Logical Reasoning",
        description: "A comprehensive test covering advanced logical reasoning concepts including coding-decoding, blood relations, series completion, and analytical reasoning.",
        type: "aptitude_practice",
        duration: 30,
        totalMarks: 200,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        sections: [
            {
                name: "Complex Logical Reasoning",
                description: "Questions on coding-decoding, blood relations, series completion, and analytical reasoning.",
                type: "mcq",
                numQuestions: 20,
                marksPerQuestion: 10,
                questions: [
                    {
                        type: "mcq",
                        questionText: "Pointing to a photograph, a man said, 'I have no brothers and sisters, but that man's father is my father's son.' Who is in the photograph?",
                        options: ["His son", "His father", "His cousin", "He himself"],
                        correctAnswer: "His son",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "In a certain code, TEACHER is written as VGCEJGT. How is STUDENT written in that code?",
                        options: ["UVWFGPV", "UVWFGRV", "UVWFGPV", "UVWFGQT"],
                        correctAnswer: "UVWFGPV",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "Statements: Some books are pens. All pens are chairs. Conclusions: I. Some books are chairs. II. All books are chairs.",
                        options: ["Only I follows", "Only II follows", "Both follow", "Neither follows"],
                        correctAnswer: "Only I follows",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "Complete the series: 2, 6, 12, 20, 30, ?",
                        options: ["42", "36", "40", "38"],
                        correctAnswer: "42",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "If ALL = 36 and SUN = 54, then what is the code for MOON?",
                        options: ["57", "66", "63", "60"],
                        correctAnswer: "66",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "Introducing a man, a woman said, 'He is the only son of my mother's mother.' How is the man related to the woman?",
                        options: ["Brother", "Cousin", "Uncle", "Father"],
                        correctAnswer: "Brother",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "Find the missing term: ACE, BDF, ? , DJG",
                        options: ["CEG", "CFG", "CFH", "CFF"],
                        correctAnswer: "CEG",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "A man walks 10 m north, then turns right and walks 20 m. Then again turns right and walks 10 m. What direction is he facing now?",
                        options: ["North", "South", "East", "West"],
                        correctAnswer: "South",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "Which one of the following is different from the others?",
                        options: ["Circle", "Sphere", "Square", "Triangle"],
                        correctAnswer: "Sphere",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "If LANGUAGE is written as OBRHYDJE, then how is ENGLISH written?",
                        options: ["GPINKUJI", "GRINKUJI", "GRINLUJI", "GQINKUJI"],
                        correctAnswer: "GRINKUJI",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "Five people A, B, C, D, and E are sitting in a row. B is to the right of A but to the left of C. E is to the right of C. Who is sitting in the middle?",
                        options: ["B", "C", "D", "A"],
                        correctAnswer: "C",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "Choose the odd one out: Apple, Orange, Banana, Carrot",
                        options: ["Apple", "Orange", "Banana", "Carrot"],
                        correctAnswer: "Carrot",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "Arrange in logical sequence: 1. Seed, 2. Fruit, 3. Tree, 4. Plant, 5. Flower",
                        options: ["1, 4, 3, 5, 2", "1, 2, 3, 4, 5", "1, 3, 4, 2, 5", "1, 4, 5, 2, 3"],
                        correctAnswer: "1, 4, 3, 5, 2",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "If RED is coded as 729, what is the code for BLUE? (A=1 to Z=26)",
                        options: ["2120", "2044", "2080", "2000"],
                        correctAnswer: "2044",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "Find the next number: 3, 5, 9, 17, 33, ?",
                        options: ["65", "63", "67", "69"],
                        correctAnswer: "65",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "Which word cannot be formed from the letters of 'PRODUCTION'?",
                        options: ["CREDIT", "COUNT", "ACTION", "PICTURE"],
                        correctAnswer: "PICTURE",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "If Jan 1, 2021 is Friday, what day is Jan 1, 2022?",
                        options: ["Saturday", "Sunday", "Monday", "Friday"],
                        correctAnswer: "Saturday",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "Find the odd one: 121, 144, 169, 225, 256",
                        options: ["121", "144", "169", "225"],
                        correctAnswer: "225",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "What is the angle between hour and minute hand at 3:15?",
                        options: ["7.5°", "15°", "22.5°", "30°"],
                        correctAnswer: "7.5°",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "What comes next in the pattern: AZ, BY, CX, ?",
                        options: ["DW", "DU", "EV", "FW"],
                        correctAnswer: "DW",
                        marks: 10
                    }
                ]
            }
        ]
    },
    {
        title: "Data Sufficiency & Interpretation",
        description: "A comprehensive test covering data sufficiency, data interpretation, and analytical reasoning with tables, graphs, and charts.",
        type: "aptitude_practice",
        duration: 30,
        totalMarks: 200,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        sections: [
            {
                name: "Data Sufficiency & Interpretation",
                description: "Questions on data sufficiency, data interpretation, and analytical reasoning with tables, graphs, and charts.",
                type: "mcq",
                numQuestions: 20,
                marksPerQuestion: 10,
                questions: [
                    {
                        type: "mcq",
                        questionText: "Directions: A question is followed by two statements I and II. Determine whether the data given in the statements is sufficient to answer the question.\n\nQuestion: What is the value of x?\nI. x^2 = 49\nII. x is a prime number.",
                        options: [
                            "Statement I alone is sufficient.",
                            "Statement II alone is sufficient.",
                            "Both statements together are sufficient.",
                            "Statements I and II together are not sufficient."
                        ],
                        correctAnswer: "Both statements together are sufficient.",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "What is the average of five consecutive even numbers?\nI. The third number is 18.\nII. The largest number is 22.",
                        options: [
                            "Only I is sufficient",
                            "Only II is sufficient",
                            "Either I or II is sufficient",
                            "Both I and II are sufficient"
                        ],
                        correctAnswer: "Either I or II is sufficient",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "Directions: Study the table and answer.\n\n| Month | Profit (in ₹000s) |\n|-------|-------------------|\n| Jan   | 45                |\n| Feb   | 50                |\n| Mar   | 60                |\n| Apr   | 55                |\n\nWhat was the average monthly profit in the first four months?",
                        options: ["52.5", "53.75", "55", "50"],
                        correctAnswer: "52.5",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "What is the percentage increase in profit from Jan to Mar based on the table above?",
                        options: ["33.33%", "20%", "25%", "30%"],
                        correctAnswer: "33.33%",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "Directions: In a pie chart, 25% is allocated to marketing in a company's budget of ₹8,00,000. How much is allocated for marketing?",
                        options: ["₹2,00,000", "₹1,50,000", "₹2,50,000", "₹1,00,000"],
                        correctAnswer: "₹2,00,000",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "If the sales of a company increase by 20% every year, and current sales are ₹1,00,000, what will be the sales after 2 years?",
                        options: ["₹1,44,000", "₹1,40,000", "₹1,20,000", "₹1,30,000"],
                        correctAnswer: "₹1,44,000",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "Directions: What is the average of numbers 24, 36, 42, 18, 30?",
                        options: ["30", "32", "28", "25"],
                        correctAnswer: "30",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "If the average of x, x+2, and x+4 is 24, what is the value of x?",
                        options: ["22", "20", "24", "18"],
                        correctAnswer: "22",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "Directions: In a class of 60 students, 30% are girls. How many boys are there?",
                        options: ["42", "40", "45", "48"],
                        correctAnswer: "42",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "Which of the following graphs best represents a constant rate of change?",
                        options: ["Straight line", "Parabola", "Circle", "Exponential curve"],
                        correctAnswer: "Straight line",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "In a bar graph showing number of books sold in 5 months, Jan has 150 books and Feb has 180 books. What is the percentage increase?",
                        options: ["20%", "25%", "18%", "15%"],
                        correctAnswer: "20%",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "A data set contains the numbers: 5, 8, 12, 15, 15, 18. What is the median?",
                        options: ["12", "13.5", "15", "11"],
                        correctAnswer: "13.5",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "A company's profit and loss over 5 years are: +20k, -10k, +30k, -20k, +40k. What is the net result?",
                        options: ["+60k", "+40k", "+30k", "+50k"],
                        correctAnswer: "+60k",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "If the mean of 4 numbers is 25, and three numbers are 20, 30, and 25, what is the fourth number?",
                        options: ["25", "30", "20", "15"],
                        correctAnswer: "25",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "A pie chart shows 40% on product A, 30% on B, 20% on C, and 10% on D. Which product has the smallest allocation?",
                        options: ["A", "B", "C", "D"],
                        correctAnswer: "D",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "In a line graph, if points rise steeply from Jan to Feb, what does that indicate?",
                        options: ["Increase", "Decrease", "Stagnation", "Drop"],
                        correctAnswer: "Increase",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "What does the mode represent in a data set?",
                        options: ["Most frequent value", "Middle value", "Average", "Highest value"],
                        correctAnswer: "Most frequent value",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "A table shows student marks out of 50. A student scored 40. What is the percentage score?",
                        options: ["80%", "75%", "90%", "85%"],
                        correctAnswer: "80%",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "Two statements are given:\nI. A is greater than B.\nII. B is greater than C.\nIs A greater than C?",
                        options: [
                            "Yes, always",
                            "No, not always",
                            "Only if values are known",
                            "Cannot be determined"
                        ],
                        correctAnswer: "Yes, always",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "A pie chart represents expenses: Rent 30%, Food 25%, Travel 15%, Others 30%. What is the largest expense?",
                        options: ["Rent", "Food", "Travel", "Others"],
                        correctAnswer: "Rent",
                        marks: 10
                    }
                ]
            }
        ]
    },
    {
        title: "Probability & Statistics",
        description: "A comprehensive test covering probability theory, statistical measures, and data analysis concepts.",
        type: "aptitude_practice",
        duration: 30,
        totalMarks: 200,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        sections: [
            {
                name: "Probability & Statistics",
                description: "Questions on probability theory, statistical measures, and data analysis concepts.",
                type: "mcq",
                numQuestions: 20,
                marksPerQuestion: 10,
                questions: [
                    {
                        type: "mcq",
                        questionText: "What is the probability of getting a head when a fair coin is tossed?",
                        options: ["1/2", "1/4", "1/3", "1"],
                        correctAnswer: "1/2",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "If two dice are rolled, what is the probability that the sum is 7?",
                        options: ["1/6", "1/12", "1/9", "1/8"],
                        correctAnswer: "1/6",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "A bag contains 5 red balls and 3 green balls. What is the probability of drawing a red ball?",
                        options: ["5/8", "3/8", "1/2", "5/3"],
                        correctAnswer: "5/8",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "What is the mean of the numbers: 3, 7, 7, 19, 24?",
                        options: ["12", "10", "14", "15"],
                        correctAnswer: "12",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "In a class, 40% of students passed in Maths, 50% passed in English, and 20% passed in both. What is the probability a randomly selected student passed in Maths or English?",
                        options: ["70%", "60%", "90%", "50%"],
                        correctAnswer: "70%",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "If the variance of a data set is 16, what is the standard deviation?",
                        options: ["4", "8", "16", "32"],
                        correctAnswer: "4",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "A card is drawn from a standard deck of 52 cards. What is the probability it is a King?",
                        options: ["1/13", "1/52", "4/52", "1/4"],
                        correctAnswer: "1/13",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "If P(A) = 0.4 and P(B) = 0.5, and events A and B are mutually exclusive, what is P(A or B)?",
                        options: ["0.9", "0.2", "0.5", "0.1"],
                        correctAnswer: "0.9",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "What is the median of the data set: 12, 15, 14, 10, 18?",
                        options: ["14", "15", "12", "13"],
                        correctAnswer: "14",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "In a binomial distribution with n=10 trials and probability of success p=0.5, what is the expected number of successes?",
                        options: ["5", "10", "0.5", "1"],
                        correctAnswer: "5",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "If the probability of an event occurring is 0.75, what are the odds in favor of the event?",
                        options: ["3:1", "1:3", "1:4", "4:1"],
                        correctAnswer: "3:1",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "What is the range of the data set: 25, 30, 15, 20, 28?",
                        options: ["15", "10", "13", "25"],
                        correctAnswer: "15",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "Two independent events A and B have probabilities 0.3 and 0.4 respectively. What is the probability that both events occur?",
                        options: ["0.12", "0.7", "0.1", "0.6"],
                        correctAnswer: "0.12",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "In a normal distribution, approximately what percentage of values lie within one standard deviation of the mean?",
                        options: ["68%", "50%", "95%", "99.7%"],
                        correctAnswer: "68%",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "If the probability of success in a single trial is 0.2, what is the probability of failure?",
                        options: ["0.8", "0.2", "1", "0.4"],
                        correctAnswer: "0.8",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "If the mean of a data set is 50 and the sum of all data points is 500, how many data points are there?",
                        options: ["10", "50", "500", "25"],
                        correctAnswer: "10",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "What is the probability of drawing an ace or a king from a standard deck of cards?",
                        options: ["2/13", "1/13", "1/26", "4/13"],
                        correctAnswer: "2/13",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "If events A and B are independent, what is P(A and B)?",
                        options: [
                            "P(A) × P(B)",
                            "P(A) + P(B)",
                            "P(A) - P(B)",
                            "Cannot be determined"
                        ],
                        correctAnswer: "P(A) × P(B)",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "A die is rolled twice. What is the probability of getting two sixes?",
                        options: ["1/36", "1/12", "1/6", "1/18"],
                        correctAnswer: "1/36",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "If the probability of rain tomorrow is 0.3, what is the probability that it will not rain?",
                        options: ["0.7", "0.3", "1", "0.6"],
                        correctAnswer: "0.7",
                        marks: 10
                    }
                ]
            }
        ]
    },
    {
        title: "Permutations & Combinations",
        description: "A comprehensive test covering permutations, combinations, and counting principles.",
        type: "aptitude_practice",
        duration: 30,
        totalMarks: 200,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        sections: [
            {
                name: "Permutations & Combinations",
                description: "Questions on permutations, combinations, and counting principles.",
                type: "mcq",
                numQuestions: 20,
                marksPerQuestion: 10,
                questions: [
                    {
                        type: "mcq",
                        questionText: "How many ways can 5 people be arranged in a row?",
                        options: ["120", "60", "24", "20"],
                        correctAnswer: "120",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "From a group of 10, how many ways can you choose 3 people?",
                        options: ["120", "720", "30", "100"],
                        correctAnswer: "120",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "What is the number of ways to arrange the letters of the word 'LEVEL'?",
                        options: ["60", "120", "24", "30"],
                        correctAnswer: "60",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "In how many ways can 4 books be placed on a shelf?",
                        options: ["24", "12", "16", "8"],
                        correctAnswer: "24",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "How many different 3-digit numbers can be formed using digits 1, 2, 3, 4 without repetition?",
                        options: ["24", "64", "12", "48"],
                        correctAnswer: "24",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "How many ways can a committee of 4 be formed from 7 people?",
                        options: ["35", "24", "21", "28"],
                        correctAnswer: "35",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "What is the value of 7P3 (permutations of 7 items taken 3 at a time)?",
                        options: ["210", "35", "343", "105"],
                        correctAnswer: "210",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "What is the value of 8C2 (combinations of 8 items taken 2 at a time)?",
                        options: ["28", "56", "16", "64"],
                        correctAnswer: "28",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "How many ways can the letters of the word 'BANANA' be arranged?",
                        options: ["60", "120", "720", "180"],
                        correctAnswer: "60",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "How many ways can 3 boys and 2 girls be arranged in a row?",
                        options: ["120", "60", "24", "20"],
                        correctAnswer: "120",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "If a password consists of 4 letters followed by 2 digits, how many such passwords are possible assuming repetition is allowed?",
                        options: ["456,976,000", "1,679,616", "26,000", "175,760"],
                        correctAnswer: "456,976,000",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "In how many ways can you arrange 5 identical balls in 3 distinct boxes?",
                        options: ["21", "15", "10", "35"],
                        correctAnswer: "21",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "How many ways can you select 2 marbles from a bag containing 5 red and 6 blue marbles?",
                        options: ["55", "11", "30", "15"],
                        correctAnswer: "55",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "What is the total number of subsets of a set with 5 elements?",
                        options: ["32", "25", "16", "10"],
                        correctAnswer: "32",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "How many ways can you arrange 4 men and 3 women in a row such that no two women sit together?",
                        options: ["288", "360", "120", "240"],
                        correctAnswer: "288",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "From 10 people, how many ways can you select a president, vice president, and secretary?",
                        options: ["720", "1000", "7200", "90"],
                        correctAnswer: "720",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "How many different 5-digit numbers can be formed using the digits 1, 2, 3, 4, 5 without repetition?",
                        options: ["120", "60", "24", "100"],
                        correctAnswer: "120",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "How many ways can 3 students be chosen from a class of 12?",
                        options: ["220", "132", "66", "55"],
                        correctAnswer: "220",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "How many ways can the letters of the word 'MISSISSIPPI' be arranged?",
                        options: ["34,650", "11,520", "15,120", "25,200"],
                        correctAnswer: "34,650",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "How many ways can you arrange 3 red balls and 2 green balls in a row?",
                        options: ["10", "12", "20", "30"],
                        correctAnswer: "10",
                        marks: 10
                    }
                ]
            }
        ]
    },
    {
        title: "Time, Work & Optimizations",
        description: "A comprehensive test covering time and work problems, pipe and cistern problems, and work optimization concepts.",
        type: "aptitude_practice",
        duration: 30,
        totalMarks: 200,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        sections: [
            {
                name: "Time, Work & Optimizations",
                description: "Questions on time and work problems, pipe and cistern problems, and work optimization concepts.",
                type: "mcq",
                numQuestions: 20,
                marksPerQuestion: 10,
                questions: [
                    {
                        type: "mcq",
                        questionText: "If 5 workers can complete a work in 12 days, how many days will 3 workers take to complete the same work?",
                        options: ["20 days", "15 days", "18 days", "12 days"],
                        correctAnswer: "20 days",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "A can do a piece of work in 10 days and B in 15 days. How long will they take to finish the work if they work together?",
                        options: ["6 days", "7 days", "8 days", "9 days"],
                        correctAnswer: "6 days",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "If A is twice as efficient as B, and B takes 18 days to complete a work, how many days will A and B take working together to complete the work?",
                        options: ["6 days", "9 days", "12 days", "8 days"],
                        correctAnswer: "6 days",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "Two pipes can fill a tank in 20 minutes and 30 minutes respectively. If both pipes are opened together, how long will it take to fill the tank?",
                        options: ["12 minutes", "15 minutes", "10 minutes", "25 minutes"],
                        correctAnswer: "12 minutes",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "Pipe A can fill a tank in 15 hours and pipe B can empty it in 20 hours. If both pipes are opened simultaneously, how long will it take to fill the tank?",
                        options: ["60 hours", "75 hours", "100 hours", "50 hours"],
                        correctAnswer: "60 hours",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "If 8 men can build a wall in 24 days, how many men are needed to build the same wall in 12 days?",
                        options: ["12", "14", "16", "18"],
                        correctAnswer: "16",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "A and B together can do a work in 18 days. A alone can do it in 30 days. How long will B alone take to do the work?",
                        options: ["45 days", "54 days", "60 days", "36 days"],
                        correctAnswer: "45 days",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "A, B, and C can do a work in 12, 15, and 20 days respectively. If all work together, how long will they take to finish the work?",
                        options: ["5 days", "6 days", "4 days", "7 days"],
                        correctAnswer: "5 days",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "If a pipe fills 1/3 of a tank in 2 hours, how long will it take to fill the entire tank?",
                        options: ["4 hours", "5 hours", "6 hours", "7 hours"],
                        correctAnswer: "6 hours",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "Pipe A can fill a tank in 24 minutes, and pipe B can fill the same tank in 36 minutes. How long will it take to fill the tank if both pipes are opened together?",
                        options: ["14.4 minutes", "15 minutes", "12 minutes", "18 minutes"],
                        correctAnswer: "14.4 minutes",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "A can do a work in 20 days and B in 25 days. They worked together for 5 days. How much work is left?",
                        options: ["3/5", "4/5", "1/5", "2/5"],
                        correctAnswer: "3/5",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "Two pipes can fill a tank in 8 hours and 12 hours respectively. A third pipe can empty the full tank in 6 hours. If all pipes are opened simultaneously, how long will it take to fill the tank?",
                        options: ["10 hours", "12 hours", "8 hours", "9 hours"],
                        correctAnswer: "12 hours",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "A and B together can do a work in 10 days. B alone can do it in 15 days. How long will A alone take to do the work?",
                        options: ["20 days", "30 days", "25 days", "18 days"],
                        correctAnswer: "30 days",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "If a worker can do 1/4 of a work in 3 days, how many days will he take to complete the entire work?",
                        options: ["9 days", "12 days", "15 days", "18 days"],
                        correctAnswer: "12 days",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "A pipe fills a tank in 6 hours. Due to a leak, it takes 8 hours to fill the tank. How long will the leak take to empty the full tank?",
                        options: ["24 hours", "20 hours", "18 hours", "16 hours"],
                        correctAnswer: "24 hours",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "If 6 men can complete a work in 10 days, how many men are needed to complete the work in 5 days?",
                        options: ["10", "12", "15", "20"],
                        correctAnswer: "12",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "Pipe A can fill a tank in 10 hours, and pipe B can fill the same tank in 15 hours. Pipe C empties the tank in 20 hours. If all three pipes are opened together, how long will it take to fill the tank?",
                        options: ["12 hours", "10 hours", "15 hours", "20 hours"],
                        correctAnswer: "12 hours",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "A can do a work in 24 days. He worked for 8 days and then B finished the remaining work in 6 days. How long will B take to complete the entire work alone?",
                        options: ["12 days", "18 days", "24 days", "30 days"],
                        correctAnswer: "18 days",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "If 3 pipes can fill a tank in 12 hours, 18 hours, and 24 hours respectively, how long will they take to fill the tank if all are opened together?",
                        options: ["5 hours", "6 hours", "7 hours", "8 hours"],
                        correctAnswer: "5 hours",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "Two taps running together can fill a tank in 20 minutes. One tap is twice as fast as the other. How long will the slower tap take to fill the tank alone?",
                        options: ["30 minutes", "40 minutes", "60 minutes", "45 minutes"],
                        correctAnswer: "60 minutes",
                        marks: 10
                    }
                ]
            }
        ]
    },
    {
        title: "Pipes, Cisterns, Boats & Streams",
        description: "A comprehensive test covering problems related to pipes and cisterns, boats and streams, and related concepts.",
        type: "aptitude_practice",
        duration: 30,
        totalMarks: 200,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        sections: [
            {
                name: "Pipes, Cisterns, Boats & Streams",
                description: "Questions on pipes and cisterns, boats and streams, and related concepts.",
                type: "mcq",
                numQuestions: 20,
                marksPerQuestion: 10,
                questions: [
                    {
                        type: "mcq",
                        questionText: "Two pipes A and B can fill a tank in 12 and 15 minutes respectively. Pipe C can empty the tank in 20 minutes. If all three pipes are opened together, how long will it take to fill the tank?",
                        options: ["10 minutes", "12 minutes", "15 minutes", "20 minutes"],
                        correctAnswer: "12 minutes",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "A cistern has two inlet pipes and one outlet pipe. The first inlet pipe fills the tank in 6 hours, the second in 8 hours, and the outlet pipe empties it in 12 hours. If all pipes are open, how long will it take to fill the tank?",
                        options: ["10 hours", "12 hours", "14 hours", "16 hours"],
                        correctAnswer: "12 hours",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "A boat goes 20 km downstream in 2 hours and returns upstream in 4 hours. What is the speed of the boat in still water?",
                        options: ["5 km/h", "7.5 km/h", "8 km/h", "10 km/h"],
                        correctAnswer: "7.5 km/h",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "A boat can row at 6 km/h in still water. If the speed of the stream is 2 km/h, how long will it take to row 16 km downstream?",
                        options: ["2 hours", "2.5 hours", "3 hours", "4 hours"],
                        correctAnswer: "2 hours",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "Two pipes can fill a tank in 10 and 15 hours respectively. A leak can empty the tank in 30 hours. If all are opened together, how long will it take to fill the tank?",
                        options: ["8 hours", "10 hours", "12 hours", "15 hours"],
                        correctAnswer: "12 hours",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "A pipe fills a tank in 3 hours. Due to a leak, it takes 5 hours to fill the tank. How long will the leak take to empty the full tank?",
                        options: ["7.5 hours", "10 hours", "15 hours", "20 hours"],
                        correctAnswer: "7.5 hours",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "A boat takes 6 hours to go downstream and 9 hours to come back upstream between two points. If the speed of the boat in still water is 12 km/h, what is the speed of the stream?",
                        options: ["3 km/h", "4 km/h", "5 km/h", "6 km/h"],
                        correctAnswer: "3 km/h",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "A can fill a tank in 8 hours and B can fill it in 12 hours. They fill the tank together, but after 2 hours, pipe B is closed. How long will it take to fill the tank completely?",
                        options: ["10 hours", "11 hours", "12 hours", "13 hours"],
                        correctAnswer: "12 hours",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "A pipe fills a tank in 6 hours. Another pipe fills the same tank in 8 hours. How long will both pipes take to fill the tank if opened together?",
                        options: ["3 hours", "4 hours", "5 hours", "6 hours"],
                        correctAnswer: "3.43 hours",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "A man rows a boat at 5 km/h in still water. If the speed of the stream is 3 km/h, what is his speed upstream?",
                        options: ["2 km/h", "3 km/h", "5 km/h", "8 km/h"],
                        correctAnswer: "2 km/h",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "Two pipes can fill a tank in 20 and 30 minutes respectively. The emptying pipe can empty it in 40 minutes. If all pipes are opened together, how long will it take to fill the tank?",
                        options: ["15 minutes", "18 minutes", "20 minutes", "25 minutes"],
                        correctAnswer: "20 minutes",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "A boat covers a distance of 24 km downstream in 2 hours and the same distance upstream in 3 hours. Find the speed of the boat in still water.",
                        options: ["6 km/h", "7 km/h", "8 km/h", "9 km/h"],
                        correctAnswer: "7.2 km/h",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "If a pipe fills 1/4th of a tank in 3 hours, how long will it take to fill the entire tank?",
                        options: ["6 hours", "9 hours", "12 hours", "15 hours"],
                        correctAnswer: "12 hours",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "A boat goes 16 km downstream in 2 hours and returns upstream in 4 hours. What is the speed of the stream?",
                        options: ["2 km/h", "3 km/h", "4 km/h", "5 km/h"],
                        correctAnswer: "2 km/h",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "Two pipes can fill a tank in 15 and 20 minutes respectively. A leak can empty the full tank in 30 minutes. How long will it take to fill the tank when both pipes and leak are open?",
                        options: ["12 minutes", "13 minutes", "14 minutes", "15 minutes"],
                        correctAnswer: "12 minutes",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "A pipe can fill a tank in 4 hours. A leak can empty the tank in 6 hours. If the tank is full, how long will it take to empty it if both pipe and leak are opened together?",
                        options: ["12 hours", "8 hours", "6 hours", "24 hours"],
                        correctAnswer: "12 hours",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "A boat takes 5 hours to go upstream and 3 hours downstream for a certain distance. What is the speed of the stream if the boat's speed in still water is 6 km/h?",
                        options: ["1 km/h", "1.5 km/h", "2 km/h", "2.5 km/h"],
                        correctAnswer: "1.5 km/h",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "Two pipes can fill a tank in 9 and 12 hours respectively. The tank is filled by both pipes working together. How much of the tank is filled in 3 hours?",
                        options: ["1/3", "1/4", "1/2", "2/3"],
                        correctAnswer: "1/3",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "A boat covers a distance upstream in 6 hours and the same distance downstream in 4 hours. If the speed of the stream is 2 km/h, what is the speed of the boat in still water?",
                        options: ["6 km/h", "7 km/h", "8 km/h", "9 km/h"],
                        correctAnswer: "7 km/h",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "A cistern is filled by three pipes in 12, 15, and 20 hours respectively. How long will it take to fill the cistern if all pipes are opened together?",
                        options: ["5 hours", "6 hours", "7 hours", "8 hours"],
                        correctAnswer: "5 hours",
                        marks: 10
                    }
                ]
            }
        ]
    },
    {
        title: "Advanced DBMS and SQL",
        description: "A comprehensive test covering advanced database management systems concepts, SQL queries, and database design principles.",
        type: "technical",
        duration: 30,
        totalMarks: 200,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        sections: [
            {
                name: "Advanced DBMS and SQL",
                description: "Questions on database concepts, SQL queries, normalization, transactions, and database design.",
                type: "mcq",
                numQuestions: 20,
                marksPerQuestion: 10,
                questions: [
                    {
                        type: "mcq",
                        questionText: "Which normal form is based on the concept of multivalued dependency?",
                        options: ["1NF", "2NF", "3NF", "4NF"],
                        correctAnswer: "4NF",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "In SQL, which command is used to remove a table and all its data permanently?",
                        options: ["DELETE", "DROP", "TRUNCATE", "REMOVE"],
                        correctAnswer: "DROP",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "What does ACID in database transactions stand for?",
                        options: [
                            "Atomicity, Consistency, Isolation, Durability",
                            "Accuracy, Consistency, Isolation, Durability",
                            "Atomicity, Clarity, Integrity, Durability",
                            "Atomicity, Consistency, Integrity, Data"
                        ],
                        correctAnswer: "Atomicity, Consistency, Isolation, Durability",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "Which SQL statement is used to retrieve unique records from a table?",
                        options: ["SELECT UNIQUE", "SELECT DISTINCT", "SELECT ONLY", "SELECT DIFFERENT"],
                        correctAnswer: "SELECT DISTINCT",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "What is a foreign key in a database?",
                        options: [
                            "A key that uniquely identifies a record in its own table",
                            "A key used to establish a link between two tables",
                            "A key that cannot have NULL values",
                            "A key used to index data"
                        ],
                        correctAnswer: "A key used to establish a link between two tables",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "Which SQL clause is used to filter rows based on a condition?",
                        options: ["WHERE", "HAVING", "GROUP BY", "ORDER BY"],
                        correctAnswer: "WHERE",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "Which join returns all records from the left table and matched records from the right table?",
                        options: ["INNER JOIN", "RIGHT JOIN", "LEFT JOIN", "FULL OUTER JOIN"],
                        correctAnswer: "LEFT JOIN",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "Which SQL keyword is used to group rows that have the same values in specified columns?",
                        options: ["GROUP BY", "ORDER BY", "PARTITION BY", "HAVING"],
                        correctAnswer: "GROUP BY",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "What type of SQL constraint ensures that a column cannot have NULL values?",
                        options: ["PRIMARY KEY", "FOREIGN KEY", "NOT NULL", "UNIQUE"],
                        correctAnswer: "NOT NULL",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "In DBMS, what does the term 'deadlock' refer to?",
                        options: [
                            "A condition where two or more transactions wait indefinitely for each other to release locks",
                            "A failure to commit a transaction",
                            "When a transaction is aborted due to constraint violation",
                            "When a database runs out of memory"
                        ],
                        correctAnswer: "A condition where two or more transactions wait indefinitely for each other to release locks",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "Which command in SQL is used to change the structure of an existing table?",
                        options: ["MODIFY TABLE", "ALTER TABLE", "CHANGE TABLE", "UPDATE TABLE"],
                        correctAnswer: "ALTER TABLE",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "What is the default isolation level in most SQL databases?",
                        options: [
                            "Read Uncommitted",
                            "Read Committed",
                            "Repeatable Read",
                            "Serializable"
                        ],
                        correctAnswer: "Read Committed",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "Which SQL function returns the number of rows in a table or group?",
                        options: ["COUNT()", "SUM()", "AVG()", "TOTAL()"],
                        correctAnswer: "COUNT()",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "Which type of join returns records when there is a match in either left or right table?",
                        options: ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL OUTER JOIN"],
                        correctAnswer: "FULL OUTER JOIN",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "What is a trigger in a database?",
                        options: [
                            "A stored procedure that automatically executes in response to certain events",
                            "An index on a table column",
                            "A backup of the database",
                            "A command to create tables"
                        ],
                        correctAnswer: "A stored procedure that automatically executes in response to certain events",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "Which command is used to remove duplicate rows from the result set in SQL?",
                        options: ["DISTINCT", "UNIQUE", "GROUP BY", "FILTER"],
                        correctAnswer: "DISTINCT",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "What is the function of the COMMIT command in SQL?",
                        options: [
                            "Undo changes made by the current transaction",
                            "Save all changes made during the current transaction",
                            "Rollback to the previous savepoint",
                            "Lock the tables involved"
                        ],
                        correctAnswer: "Save all changes made during the current transaction",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "Which of the following is NOT a type of NoSQL database?",
                        options: ["Document", "Graph", "Relational", "Key-Value"],
                        correctAnswer: "Relational",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "Which of the following SQL statements will add a new row into a table named 'Employees'?",
                        options: [
                            "INSERT INTO Employees VALUES ('John', 'Doe', 30)",
                            "ADD INTO Employees ('John', 'Doe', 30)",
                            "UPDATE Employees SET ('John', 'Doe', 30)",
                            "CREATE INTO Employees ('John', 'Doe', 30)"
                        ],
                        correctAnswer: "INSERT INTO Employees VALUES ('John', 'Doe', 30)",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "In SQL, which keyword is used to sort the result set?",
                        options: ["SORT BY", "ORDER BY", "GROUP BY", "FILTER BY"],
                        correctAnswer: "ORDER BY",
                        marks: 10
                    }
                ]
            }
        ]
    },
    {
        title: "Operating System Internals",
        description: "A comprehensive test covering operating system concepts, process management, memory management, and system internals.",
        type: "technical",
        duration: 30,
        totalMarks: 200,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        sections: [
            {
                name: "Operating System Internals",
                description: "Questions on operating system concepts, process management, memory management, and system internals.",
                type: "mcq",
                numQuestions: 20,
                marksPerQuestion: 10,
                questions: [
                    {
                        type: "mcq",
                        questionText: "What is the main function of an operating system?",
                        options: [
                            "To manage hardware and software resources",
                            "To write application software",
                            "To connect computers in a network",
                            "To provide internet access"
                        ],
                        correctAnswer: "To manage hardware and software resources",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "Which of the following is NOT a type of operating system?",
                        options: [
                            "Batch OS",
                            "Distributed OS",
                            "Network OS",
                            "Application OS"
                        ],
                        correctAnswer: "Application OS",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "What is a process in an operating system?",
                        options: [
                            "A program in execution",
                            "A file stored on disk",
                            "An input/output device",
                            "A collection of data"
                        ],
                        correctAnswer: "A program in execution",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "Which data structure is used by the OS to keep track of processes?",
                        options: [
                            "Process Control Block (PCB)",
                            "File Control Block (FCB)",
                            "Page Table",
                            "Interrupt Vector Table"
                        ],
                        correctAnswer: "Process Control Block (PCB)",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "What is the role of a scheduler in an OS?",
                        options: [
                            "To manage memory allocation",
                            "To schedule CPU time among processes",
                            "To handle input/output operations",
                            "To manage file storage"
                        ],
                        correctAnswer: "To schedule CPU time among processes",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "Which scheduling algorithm is non-preemptive?",
                        options: [
                            "Round Robin",
                            "Shortest Job First (SJF)",
                            "Multilevel Queue",
                            "Preemptive Priority Scheduling"
                        ],
                        correctAnswer: "Shortest Job First (SJF)",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "What is thrashing in an operating system?",
                        options: [
                            "Excessive paging leading to low CPU utilization",
                            "A type of virus attack",
                            "System shutdown due to overload",
                            "A security breach"
                        ],
                        correctAnswer: "Excessive paging leading to low CPU utilization",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "Which memory management technique divides memory into fixed-sized partitions?",
                        options: [
                            "Paging",
                            "Segmentation",
                            "Partitioning",
                            "Swapping"
                        ],
                        correctAnswer: "Partitioning",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "What does virtual memory allow a computer to do?",
                        options: [
                            "Run multiple operating systems simultaneously",
                            "Use disk space to extend RAM capacity",
                            "Increase CPU speed",
                            "Protect data from malware"
                        ],
                        correctAnswer: "Use disk space to extend RAM capacity",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "Which of the following is a benefit of using multiprogramming?",
                        options: [
                            "Improved CPU utilization",
                            "Faster disk access",
                            "Better network throughput",
                            "Simpler programming"
                        ],
                        correctAnswer: "Improved CPU utilization",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "In the context of OS, what is a semaphore?",
                        options: [
                            "A signaling mechanism for process synchronization",
                            "A type of process",
                            "A file descriptor",
                            "A CPU scheduling algorithm"
                        ],
                        correctAnswer: "A signaling mechanism for process synchronization",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "Which of the following is NOT a condition necessary for a deadlock to occur?",
                        options: [
                            "Mutual Exclusion",
                            "Hold and Wait",
                            "No Preemption",
                            "Fast Scheduling"
                        ],
                        correctAnswer: "Fast Scheduling",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "What is the main purpose of a device driver?",
                        options: [
                            "To manage hardware devices",
                            "To compile programs",
                            "To store user data",
                            "To allocate memory"
                        ],
                        correctAnswer: "To manage hardware devices",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "Which of the following is a common method to handle deadlocks?",
                        options: [
                            "Prevention",
                            "Creation",
                            "Execution",
                            "Optimization"
                        ],
                        correctAnswer: "Prevention",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "What is a context switch?",
                        options: [
                            "Saving and loading the state of a process",
                            "Starting a new process",
                            "Killing a process",
                            "Allocating memory to a process"
                        ],
                        correctAnswer: "Saving and loading the state of a process",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "Which of the following is a characteristic of a real-time operating system?",
                        options: [
                            "Fast response time to events",
                            "Supports batch processing",
                            "Runs only on mainframes",
                            "Manages disk storage"
                        ],
                        correctAnswer: "Fast response time to events",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "In paging, what is a page fault?",
                        options: [
                            "When a requested page is not in physical memory",
                            "When two processes try to access the same page",
                            "When a process finishes execution",
                            "When memory is corrupted"
                        ],
                        correctAnswer: "When a requested page is not in physical memory",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "What is the function of the kernel in an operating system?",
                        options: [
                            "It acts as a bridge between applications and hardware",
                            "It manages user accounts",
                            "It controls network traffic",
                            "It handles graphics rendering"
                        ],
                        correctAnswer: "It acts as a bridge between applications and hardware",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "Which algorithm is commonly used for deadlock avoidance?",
                        options: [
                            "Banker's Algorithm",
                            "Dijkstra's Algorithm",
                            "Bellman-Ford Algorithm",
                            "Prim's Algorithm"
                        ],
                        correctAnswer: "Banker's Algorithm",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "Which of the following is NOT a part of process state in OS?",
                        options: [
                            "Ready",
                            "Running",
                            "Waiting",
                            "Sleeping"
                        ],
                        correctAnswer: "Sleeping",
                        marks: 10
                    }
                ]
            }
        ]
    },
    {
        title: "Computer Networks Protocols",
        description: "A comprehensive test covering network protocols, OSI model, TCP/IP stack, and networking concepts.",
        type: "technical",
        duration: 30,
        totalMarks: 200,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        sections: [
            {
                name: "Computer Networks Protocols",
                description: "Questions on network protocols, OSI model, TCP/IP stack, and networking concepts.",
                type: "mcq",
                numQuestions: 20,
                marksPerQuestion: 10,
                questions: [
                    {
                        type: "mcq",
                        questionText: "What does the acronym TCP stand for in networking?",
                        options: [
                            "Transmission Control Protocol",
                            "Transport Communication Protocol",
                            "Transfer Control Process",
                            "Transport Channel Protocol"
                        ],
                        correctAnswer: "Transmission Control Protocol",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "Which layer of the OSI model is responsible for routing?",
                        options: [
                            "Network Layer",
                            "Transport Layer",
                            "Data Link Layer",
                            "Physical Layer"
                        ],
                        correctAnswer: "Network Layer",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "What is the primary purpose of the ARP protocol?",
                        options: [
                            "To map IP addresses to MAC addresses",
                            "To transfer files between hosts",
                            "To encrypt data packets",
                            "To assign IP addresses dynamically"
                        ],
                        correctAnswer: "To map IP addresses to MAC addresses",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "Which protocol is used to retrieve emails from a remote server?",
                        options: [
                            "POP3",
                            "SMTP",
                            "FTP",
                            "HTTP"
                        ],
                        correctAnswer: "POP3",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "Which port number is commonly used by HTTP?",
                        options: [
                            "80",
                            "443",
                            "21",
                            "25"
                        ],
                        correctAnswer: "80",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "What is the function of DNS in computer networks?",
                        options: [
                            "Translates domain names to IP addresses",
                            "Manages network congestion",
                            "Controls data encryption",
                            "Monitors network traffic"
                        ],
                        correctAnswer: "Translates domain names to IP addresses",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "Which device operates at the Data Link Layer and forwards data based on MAC addresses?",
                        options: [
                            "Switch",
                            "Router",
                            "Hub",
                            "Gateway"
                        ],
                        correctAnswer: "Switch",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "What type of IP address is 192.168.0.1?",
                        options: [
                            "Private IP address",
                            "Public IP address",
                            "Multicast IP address",
                            "Loopback IP address"
                        ],
                        correctAnswer: "Private IP address",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "Which protocol is connectionless and does not guarantee delivery?",
                        options: [
                            "UDP",
                            "TCP",
                            "FTP",
                            "SMTP"
                        ],
                        correctAnswer: "UDP",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "What is the maximum length of a CAT5 Ethernet cable segment?",
                        options: [
                            "100 meters",
                            "500 meters",
                            "1000 meters",
                            "10 meters"
                        ],
                        correctAnswer: "100 meters",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "Which protocol is used to securely browse the web?",
                        options: [
                            "HTTPS",
                            "HTTP",
                            "FTP",
                            "SMTP"
                        ],
                        correctAnswer: "HTTPS",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "What is the purpose of the subnet mask in IP networking?",
                        options: [
                            "To divide IP address into network and host parts",
                            "To encrypt IP addresses",
                            "To assign IP addresses dynamically",
                            "To manage DNS requests"
                        ],
                        correctAnswer: "To divide IP address into network and host parts",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "Which layer of the OSI model provides end-to-end communication control?",
                        options: [
                            "Transport Layer",
                            "Network Layer",
                            "Session Layer",
                            "Application Layer"
                        ],
                        correctAnswer: "Transport Layer",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "Which of the following is NOT a routing protocol?",
                        options: [
                            "HTTP",
                            "OSPF",
                            "RIP",
                            "BGP"
                        ],
                        correctAnswer: "HTTP",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "What is the role of ICMP in networking?",
                        options: [
                            "Error reporting and diagnostics",
                            "Data encryption",
                            "File transfer",
                            "Email delivery"
                        ],
                        correctAnswer: "Error reporting and diagnostics",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "Which technology is used to connect devices in a PAN (Personal Area Network)?",
                        options: [
                            "Bluetooth",
                            "Wi-Fi",
                            "Ethernet",
                            "Fiber Optics"
                        ],
                        correctAnswer: "Bluetooth",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "What is the purpose of the MAC address?",
                        options: [
                            "Unique hardware identifier for network devices",
                            "IP address for internet communication",
                            "Port number for services",
                            "Encryption key for data security"
                        ],
                        correctAnswer: "Unique hardware identifier for network devices",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "Which protocol is used for sending email?",
                        options: [
                            "SMTP",
                            "POP3",
                            "FTP",
                            "HTTP"
                        ],
                        correctAnswer: "SMTP",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "Which device connects two different networks together?",
                        options: [
                            "Router",
                            "Switch",
                            "Hub",
                            "Repeater"
                        ],
                        correctAnswer: "Router",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "What does NAT stand for?",
                        options: [
                            "Network Address Translation",
                            "Network Access Transmission",
                            "Node Allocation Table",
                            "Network Authentication Token"
                        ],
                        correctAnswer: "Network Address Translation",
                        marks: 10
                    }
                ]
            }
        ]
    },
    {
        title: "Software Engineering",
        description: "A comprehensive test covering software development methodologies, testing, design principles, and project management.",
        type: "technical",
        duration: 30,
        totalMarks: 200,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        sections: [
            {
                name: "Software Engineering",
                description: "Questions on software development methodologies, testing, design principles, and project management.",
                type: "mcq",
                numQuestions: 20,
                marksPerQuestion: 10,
                questions: [
                    {
                        type: "mcq",
                        questionText: "Which software development model follows a linear and sequential approach?",
                        options: [
                            "Waterfall Model",
                            "Agile Model",
                            "Spiral Model",
                            "Incremental Model"
                        ],
                        correctAnswer: "Waterfall Model",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "What is the main focus of Agile methodology?",
                        options: [
                            "Flexibility and customer collaboration",
                            "Comprehensive documentation",
                            "Strict phase completion",
                            "Minimal client involvement"
                        ],
                        correctAnswer: "Flexibility and customer collaboration",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "Which of the following is NOT a type of software testing?",
                        options: [
                            "Regression Testing",
                            "Unit Testing",
                            "Integration Testing",
                            "Compilation Testing"
                        ],
                        correctAnswer: "Compilation Testing",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "What does 'SDLC' stand for?",
                        options: [
                            "Software Development Life Cycle",
                            "System Development Linear Cycle",
                            "Software Design and Logic Cycle",
                            "System Deployment Life Cycle"
                        ],
                        correctAnswer: "Software Development Life Cycle",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "Which UML diagram is used to represent the interactions between users and the system?",
                        options: [
                            "Use Case Diagram",
                            "Class Diagram",
                            "Sequence Diagram",
                            "Activity Diagram"
                        ],
                        correctAnswer: "Use Case Diagram",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "What is 'refactoring' in software development?",
                        options: [
                            "Improving code structure without changing functionality",
                            "Adding new features",
                            "Writing new test cases",
                            "Debugging the software"
                        ],
                        correctAnswer: "Improving code structure without changing functionality",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "Which model emphasizes iterative risk analysis?",
                        options: [
                            "Spiral Model",
                            "Waterfall Model",
                            "V-Model",
                            "Agile Model"
                        ],
                        correctAnswer: "Spiral Model",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "What is the primary goal of version control systems?",
                        options: [
                            "Manage changes to source code",
                            "Execute test cases",
                            "Manage project schedules",
                            "Optimize code performance"
                        ],
                        correctAnswer: "Manage changes to source code",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "Which of the following is a common software metric?",
                        options: [
                            "Lines of Code (LOC)",
                            "CPU Usage",
                            "Memory Leak",
                            "Network Latency"
                        ],
                        correctAnswer: "Lines of Code (LOC)",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "In software testing, what is a 'test case'?",
                        options: [
                            "A set of conditions to check a particular feature",
                            "A type of bug",
                            "A document outlining user requirements",
                            "A programming technique"
                        ],
                        correctAnswer: "A set of conditions to check a particular feature",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "What is the main purpose of a 'prototype' in software development?",
                        options: [
                            "To create a preliminary version for understanding requirements",
                            "To deploy the final product",
                            "To test software performance",
                            "To write documentation"
                        ],
                        correctAnswer: "To create a preliminary version for understanding requirements",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "Which model is best suited for projects with changing requirements?",
                        options: [
                            "Agile Model",
                            "Waterfall Model",
                            "V-Model",
                            "Big Bang Model"
                        ],
                        correctAnswer: "Agile Model",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "What does 'coupling' refer to in software design?",
                        options: [
                            "Degree of interdependence between modules",
                            "Number of lines in a module",
                            "Testing coverage",
                            "Documentation quality"
                        ],
                        correctAnswer: "Degree of interdependence between modules",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "Which testing technique involves testing the internal structures or workings of an application?",
                        options: [
                            "White Box Testing",
                            "Black Box Testing",
                            "Acceptance Testing",
                            "Usability Testing"
                        ],
                        correctAnswer: "White Box Testing",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "What is the 'V-Model' also known as?",
                        options: [
                            "Verification and Validation Model",
                            "Variable Model",
                            "Virtual Model",
                            "Version Control Model"
                        ],
                        correctAnswer: "Verification and Validation Model",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "What does 'SDD' stand for?",
                        options: [
                            "Software Design Document",
                            "System Development Document",
                            "Software Deployment Document",
                            "System Design Diagram"
                        ],
                        correctAnswer: "Software Design Document",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "Which of these is a common issue in software projects?",
                        options: [
                            "Scope Creep",
                            "Memory Leak",
                            "Infinite Loop",
                            "Syntax Error"
                        ],
                        correctAnswer: "Scope Creep",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "In Agile, what is a 'sprint'?",
                        options: [
                            "A time-boxed period to complete tasks",
                            "A software tool",
                            "A type of bug",
                            "A deployment phase"
                        ],
                        correctAnswer: "A time-boxed period to complete tasks",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "Which role is responsible for prioritizing the product backlog in Scrum?",
                        options: [
                            "Product Owner",
                            "Scrum Master",
                            "Development Team",
                            "Project Manager"
                        ],
                        correctAnswer: "Product Owner",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "What is 'Continuous Integration' in software development?",
                        options: [
                            "Frequent merging of code changes into a central repository",
                            "Manual testing process",
                            "Writing code documentation",
                            "Deploying the application to production"
                        ],
                        correctAnswer: "Frequent merging of code changes into a central repository",
                        marks: 10
                    }
                ]
            }
        ]
    },
    {
        title: "Advanced OOPs Concepts",
        description: "A comprehensive test covering compiler design, lexical analysis, syntax analysis, and code optimization.",
        type: "technical",
        duration: 30,
        totalMarks: 200,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        sections: [
            {
                name: "Advanced OOPs Concepts",
                description: "Questions on compiler design, lexical analysis, syntax analysis, and code optimization.",
                type: "mcq",
                numQuestions: 20,
                marksPerQuestion: 10,
                questions: [
                    {
                        type: "mcq",
                        questionText: "What is the first phase of a compiler?",
                        options: [
                            "Lexical Analysis",
                            "Syntax Analysis",
                            "Semantic Analysis",
                            "Code Generation"
                        ],
                        correctAnswer: "Lexical Analysis",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "What does a lexical analyzer generate?",
                        options: [
                            "Tokens",
                            "Parse Trees",
                            "Intermediate Code",
                            "Machine Code"
                        ],
                        correctAnswer: "Tokens",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "What is the purpose of syntax analysis?",
                        options: [
                            "To check grammatical structure of source code",
                            "To check semantic errors",
                            "To generate machine code",
                            "To optimize code"
                        ],
                        correctAnswer: "To check grammatical structure of source code",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "Which data structure is commonly used in parsing?",
                        options: [
                            "Stack",
                            "Queue",
                            "Heap",
                            "Linked List"
                        ],
                        correctAnswer: "Stack",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "Which of the following is NOT a phase of compiler?",
                        options: [
                            "Linking",
                            "Parsing",
                            "Register Allocation",
                            "Garbage Collection"
                        ],
                        correctAnswer: "Garbage Collection",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "Which phase removes redundant instructions and improves performance?",
                        options: [
                            "Code Optimization",
                            "Lexical Analysis",
                            "Semantic Analysis",
                            "Code Generation"
                        ],
                        correctAnswer: "Code Optimization",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "Which intermediate code representation uses three-address code?",
                        options: [
                            "Quadruples",
                            "Syntax Tree",
                            "Tokens",
                            "Symbol Table"
                        ],
                        correctAnswer: "Quadruples",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "What is the role of a symbol table in a compiler?",
                        options: [
                            "To store information about identifiers",
                            "To generate tokens",
                            "To optimize code",
                            "To execute the program"
                        ],
                        correctAnswer: "To store information about identifiers",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "Which parsing technique uses a top-down approach?",
                        options: [
                            "Recursive Descent Parsing",
                            "LR Parsing",
                            "Operator Precedence Parsing",
                            "Shift-Reduce Parsing"
                        ],
                        correctAnswer: "Recursive Descent Parsing",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "What kind of errors are detected during semantic analysis?",
                        options: [
                            "Type Mismatch",
                            "Syntax Errors",
                            "Runtime Errors",
                            "Logical Errors"
                        ],
                        correctAnswer: "Type Mismatch",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "What is 'backpatching' used for in compiler design?",
                        options: [
                            "To handle forward jumps in intermediate code",
                            "To optimize code",
                            "To allocate registers",
                            "To generate machine code"
                        ],
                        correctAnswer: "To handle forward jumps in intermediate code",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "Which of the following is an example of a context-free grammar parsing technique?",
                        options: [
                            "LL Parser",
                            "Regex Matching",
                            "Lexical Analysis",
                            "Semantic Analysis"
                        ],
                        correctAnswer: "LL Parser",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "Which register is used to hold the address of the next instruction to be executed?",
                        options: [
                            "Program Counter",
                            "Accumulator",
                            "Instruction Register",
                            "Stack Pointer"
                        ],
                        correctAnswer: "Program Counter",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "Which optimization technique improves performance by removing unreachable code?",
                        options: [
                            "Dead Code Elimination",
                            "Loop Unrolling",
                            "Inlining",
                            "Constant Folding"
                        ],
                        correctAnswer: "Dead Code Elimination",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "Which of the following is NOT true about static analysis?",
                        options: [
                            "It analyzes code without executing it",
                            "Detects syntax errors",
                            "Detects runtime errors",
                            "Helps in code optimization"
                        ],
                        correctAnswer: "Detects runtime errors",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "What is a 'basic block' in compiler optimization?",
                        options: [
                            "A sequence of instructions with no branches except at entry and exit",
                            "A memory block",
                            "A register allocation block",
                            "A syntax error"
                        ],
                        correctAnswer: "A sequence of instructions with no branches except at entry and exit",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "Which code generation technique translates intermediate code into machine code?",
                        options: [
                            "Target Code Generation",
                            "Lexical Analysis",
                            "Parsing",
                            "Semantic Analysis"
                        ],
                        correctAnswer: "Target Code Generation",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "Which of the following is NOT an example of an optimization?",
                        options: [
                            "Code Obfuscation",
                            "Loop Invariant Code Motion",
                            "Common Subexpression Elimination",
                            "Constant Propagation"
                        ],
                        correctAnswer: "Code Obfuscation",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "What is the use of the 'lexer' in compiler design?",
                        options: [
                            "Tokenizing the input source code",
                            "Generating executable code",
                            "Optimizing code",
                            "Parsing the code"
                        ],
                        correctAnswer: "Tokenizing the input source code",
                        marks: 10
                    },
                    {
                        type: "mcq",
                        questionText: "What is the key difference between compiler and interpreter?",
                        options: [
                            "Compiler translates entire code at once; interpreter translates line-by-line",
                            "Compiler executes code; interpreter translates code",
                            "Interpreter optimizes code; compiler does not",
                            "Interpreter is faster than compiler"
                        ],
                        correctAnswer: "Compiler translates entire code at once; interpreter translates line-by-line",
                        marks: 10
                    }
                ]
            }
        ]
    },
    {
        title: "Advanced Data Structures & Algorithms",
        description: "A comprehensive test covering advanced data structures, algorithms, and problem-solving techniques.",
        type: "coding",
        duration: 60,
        totalMarks: 500,
        sections: [
            {
                name: "Advanced DSA",
                description: "Questions on advanced data structures, algorithms, and problem-solving techniques.",
                type: "coding",
                numQuestions: 5,
                marksPerQuestion: 100,
                questions: [
                    {
                        type: "coding",
                        questionText: "Reverse a Singly Linked List",
                        description: "Given the head of a singly linked list, reverse the list and return the head of the reversed list.",
                        difficulty: "Easy",
                        examples: [
                            {
                                input: "1 -> 2 -> 3 -> 4 -> 5 -> NULL",
                                output: "5 -> 4 -> 3 -> 2 -> 1 -> NULL"
                            },
                            {
                                input: "1 -> 2 -> 3",
                                output: "3 -> 2 -> 1"
                            },
                            {
                                input: "10 -> 20 -> NULL",
                                output: "20 -> 10 -> NULL"
                            },
                            {
                                input: "5 -> NULL",
                                output: "5 -> NULL"
                            }
                        ],
                        marks: 100,
                        timeLimit: 15
                    },
                    {
                        type: "coding",
                        questionText: "Find the Kth Largest Element in an Array",
                        description: "Given an integer array nums and an integer k, return the kth largest element in the array.",
                        difficulty: "Medium",
                        examples: [
                            {
                                input: "nums = [3,2,1,5,6,4], k = 2",
                                output: "5"
                            },
                            {
                                input: "nums = [3,2,3,1,2,4,5,5,6], k = 4",
                                output: "4"
                            },
                            {
                                input: "nums = [1], k = 1",
                                output: "1"
                            },
                            {
                                input: "nums = [7,6,5,4,3,2,1], k = 3",
                                output: "5"
                            }
                        ],
                        marks: 100,
                        timeLimit: 20
                    },
                    {
                        type: "coding",
                        questionText: "Implement LRU Cache",
                        description: "Design and implement a data structure for Least Recently Used (LRU) cache that supports get(key) and put(key, value) operations.",
                        difficulty: "Medium",
                        examples: [
                            {
                                input: "Capacity = 2\nput(1,1)\nput(2,2)\nget(1)\nput(3,3)\nget(2)\nput(4,4)\nget(1)\nget(3)\nget(4)",
                                output: "1\n-1\n-1\n3\n4"
                            },
                            {
                                input: "Capacity = 1\nput(1,1)\nget(1)\nput(2,2)\nget(1)\nget(2)",
                                output: "1\n-1\n2"
                            },
                            {
                                input: "Capacity = 3\nput(1,10)\nput(2,20)\nput(3,30)\nget(2)\nput(4,40)\nget(1)\nget(3)\nget(4)",
                                output: "20\n-1\n30\n40"
                            }
                        ],
                        marks: 100,
                        timeLimit: 25
                    },
                    {
                        type: "coding",
                        questionText: "Serialize and Deserialize Binary Tree",
                        description: "Design algorithms to serialize a binary tree to a string and deserialize it back.",
                        difficulty: "Hard",
                        examples: [
                            {
                                input: "Tree:\n    1\n   / \\\n  2   3\n     / \\\n    4   5",
                                output: "Serialize: \"1,2,null,null,3,4,null,null,5,null,null\""
                            },
                            {
                                input: "Empty tree (root = null)",
                                output: "Serialize: \"null\""
                            },
                            {
                                input: "Single node tree (root = 10)",
                                output: "Serialize: \"10,null,null\""
                            }
                        ],
                        marks: 100,
                        timeLimit: 30
                    },
                    {
                        type: "coding",
                        questionText: "Median of a Data Stream",
                        description: "Design a data structure that supports adding numbers and finding the median efficiently.",
                        difficulty: "Hard",
                        examples: [
                            {
                                input: "addNum(1)\naddNum(2)\nfindMedian()\naddNum(3)\nfindMedian()",
                                output: "1.5\n2"
                            },
                            {
                                input: "addNum(5)\nfindMedian()\naddNum(10)\naddNum(100)\nfindMedian()",
                                output: "5\n10"
                            },
                            {
                                input: "addNum(2)\naddNum(3)\naddNum(4)\naddNum(1)\nfindMedian()",
                                output: "2.5"
                            }
                        ],
                        marks: 100,
                        timeLimit: 30
                    }
                ]
            },
            {
                name: "Heaps and Tries",
                description: "A comprehensive test covering heap operations, trie implementations, and advanced data structure applications.",
                type: "coding",
                numQuestions: 5,
                marksPerQuestion: 100,
                questions: [
                    {
                        type: "coding",
                        questionText: "Implement Min Heap Insert Operation",
                        description: "Given an empty Min Heap, implement the insert operation that adds a new element and maintains the min heap property.",
                        difficulty: "Easy",
                        examples: [
                            {
                                input: "Insert 5 into []",
                                output: "[5]"
                            },
                            {
                                input: "Insert 3 into [5]",
                                output: "[3,5]"
                            },
                            {
                                input: "Insert 4 into [3,5]",
                                output: "[3,5,4]"
                            }
                        ],
                        marks: 100,
                        timeLimit: 15
                    },
                    {
                        type: "coding",
                        questionText: "Find Kth Smallest Element in a Min Heap",
                        description: "Given a Min Heap and an integer k, find the kth smallest element without converting it to a sorted array.",
                        difficulty: "Medium",
                        examples: [
                            {
                                input: "Heap = [1,3,6,5,9,8], k = 3",
                                output: "5"
                            },
                            {
                                input: "Heap = [2,4,7,10,15], k = 1",
                                output: "2"
                            },
                            {
                                input: "Heap = [5,7,9,10,15,20], k = 4",
                                output: "10"
                            }
                        ],
                        marks: 100,
                        timeLimit: 20
                    },
                    {
                        type: "coding",
                        questionText: "Implement Trie for Insert and Search",
                        description: "Implement a Trie data structure that supports insert and search operations for lowercase alphabets.",
                        difficulty: "Medium",
                        examples: [
                            {
                                input: "insert(\"apple\")\nsearch(\"apple\")\nsearch(\"app\")",
                                output: "true\nfalse"
                            },
                            {
                                input: "insert(\"banana\")\nsearch(\"ban\")\nsearch(\"banana\")",
                                output: "false\ntrue"
                            },
                            {
                                input: "insert(\"cat\")\ninsert(\"car\")\nsearch(\"car\")\nsearch(\"cap\")",
                                output: "true\nfalse"
                            }
                        ],
                        marks: 100,
                        timeLimit: 25
                    },
                    {
                        type: "coding",
                        questionText: "Find Median in a Stream Using Heaps",
                        description: "Implement a data structure that supports inserting numbers and retrieving the median efficiently using two heaps.",
                        difficulty: "Hard",
                        examples: [
                            {
                                input: "Stream: 5, 15, 1, 3",
                                output: "Median after each insertion: 5, 10, 5, 4"
                            },
                            {
                                input: "Stream: 2, 4, 7, 1, 5, 3",
                                output: "Median after each insertion: 2, 3, 4, 3, 4, 3.5"
                            },
                            {
                                input: "Stream: 10, 20, 30",
                                output: "Median after each insertion: 10, 15, 20"
                            }
                        ],
                        marks: 100,
                        timeLimit: 30
                    },
                    {
                        type: "coding",
                        questionText: "Word Search II (Using Trie)",
                        description: "Given a 2D board and a list of words from the dictionary, find all words in the board using Trie for optimization.",
                        difficulty: "Hard",
                        examples: [
                            {
                                input: "Board:\n[['o','a','a','n'],\n ['e','t','a','e'],\n ['i','h','k','r'],\n ['i','f','l','v']]\nWords: [\"oath\",\"pea\",\"eat\",\"rain\"]",
                                output: "[\"eat\",\"oath\"]"
                            },
                            {
                                input: "Board:\n[['a','b'],\n ['c','d']]\nWords: [\"abcb\"]",
                                output: "[]"
                            },
                            {
                                input: "Board:\n[['a','a']]\nWords: [\"aaa\"]",
                                output: "[]"
                            }
                        ],
                        marks: 100,
                        timeLimit: 30
                    }
                ]
            }
        ]
    },
    {
        title: "Dynamic Programming & Greedy Algorithms",
        description: "A comprehensive test covering dynamic programming techniques, greedy algorithms, and their applications in problem-solving.",
        type: "coding",
        duration: 60,
        totalMarks: 500,
        sections: [
            {
                name: "Dynamic Programming & Greedy Algorithms",
                description: "Questions on dynamic programming, greedy algorithms, and their applications.",
                type: "coding",
                numQuestions: 5,
                marksPerQuestion: 100,
                questions: [
                    {
                        type: "coding",
                        questionText: "Fibonacci Number (DP)",
                        description: "Calculate the Nth Fibonacci number using Dynamic Programming. F(0) = 0, F(1) = 1, and F(n) = F(n-1) + F(n-2) for n ≥ 2.",
                        difficulty: "Easy",
                        examples: [
                            {
                                input: "5",
                                output: "5"
                            },
                            {
                                input: "10",
                                output: "55"
                            },
                            {
                                input: "0",
                                output: "0"
                            }
                        ],
                        marks: 100,
                        timeLimit: 15
                    },
                    {
                        type: "coding",
                        questionText: "Coin Change - Minimum Coins (DP)",
                        description: "Given a set of coin denominations and a total amount, find the minimum number of coins needed to make that amount. Return -1 if not possible.",
                        difficulty: "Medium",
                        examples: [
                            {
                                input: "coins = [1, 2, 5], amount = 11",
                                output: "3 (11 = 5 + 5 + 1)"
                            },
                            {
                                input: "coins = [2], amount = 3",
                                output: "-1"
                            },
                            {
                                input: "coins = [1], amount = 0",
                                output: "0"
                            }
                        ],
                        marks: 100,
                        timeLimit: 20
                    },
                    {
                        type: "coding",
                        questionText: "Activity Selection Problem (Greedy)",
                        description: "Given start and end times of activities, select the maximum number of activities that can be performed without overlapping.",
                        difficulty: "Medium",
                        examples: [
                            {
                                input: "start = [1,3,0,5,8,5], end = [2,4,6,7,9,9]",
                                output: "4"
                            },
                            {
                                input: "start = [1,2,3,4], end = [2,3,4,5]",
                                output: "4"
                            },
                            {
                                input: "start = [4,2,1], end = [5,3,2]",
                                output: "1"
                            }
                        ],
                        marks: 100,
                        timeLimit: 25
                    },
                    {
                        type: "coding",
                        questionText: "Longest Increasing Subsequence (DP)",
                        description: "Find the length of the longest strictly increasing subsequence in an array.",
                        difficulty: "Hard",
                        examples: [
                            {
                                input: "[10,9,2,5,3,7,101,18]",
                                output: "4 (LIS = [2,3,7,101])"
                            },
                            {
                                input: "[0,1,0,3,2,3]",
                                output: "4"
                            },
                            {
                                input: "[7,7,7,7,7,7,7]",
                                output: "1"
                            }
                        ],
                        marks: 100,
                        timeLimit: 30
                    },
                    {
                        type: "coding",
                        questionText: "Job Scheduling to Maximize Profit (Greedy + DP)",
                        description: "Given start time, end time, and profit for each job, find the maximum profit subset of non-overlapping jobs.",
                        difficulty: "Hard",
                        examples: [
                            {
                                input: "startTime = [1,2,3,3], endTime = [3,4,5,6], profit = [50,10,40,70]",
                                output: "120 (Jobs 1 and 4)"
                            },
                            {
                                input: "startTime = [1,2,3,4,6], endTime = [3,5,10,6,9], profit = [20,20,100,70,60]",
                                output: "150"
                            },
                            {
                                input: "startTime = [1,1,1], endTime = [2,3,4], profit = [5,6,4]",
                                output: "6"
                            }
                        ],
                        marks: 100,
                        timeLimit: 30
                    }
                ]
            }
        ]
    },
    {
        title: "Tree & Segment Tree Problems",
        description: "A comprehensive test covering binary tree operations, segment tree implementations, and advanced tree-based algorithms.",
        type: "technical",
        duration: 60,
        totalMarks: 500,
        startDate: new Date(),
        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        sections: [
            {
                name: "Tree & Segment Tree Problems",
                description: "Questions on binary trees, segment trees, and their applications.",
                type: "coding",
                numQuestions: 5,
                marksPerQuestion: 100,
                questions: [
                    {
                        type: "coding",
                        questionText: "Height of a Binary Tree",
                        description: "Given the root of a binary tree, return its height (the number of nodes along the longest path from the root node down to the farthest leaf node).",
                        difficulty: "Easy",
                        examples: [
                            {
                                input: "[3,9,20,null,null,15,7]",
                                output: "3"
                            },
                            {
                                input: "[1,null,2]",
                                output: "2"
                            },
                            {
                                input: "[]",
                                output: "0"
                            }
                        ],
                        marks: 100,
                        timeLimit: 15
                    },
                    {
                        type: "coding",
                        questionText: "Lowest Common Ancestor of a Binary Tree",
                        description: "Given the root of a binary tree and two nodes p and q, return the lowest common ancestor of p and q.",
                        difficulty: "Medium",
                        examples: [
                            {
                                input: "root = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 1",
                                output: "3"
                            },
                            {
                                input: "root = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 4",
                                output: "5"
                            },
                            {
                                input: "root = [1,2], p = 1, q = 2",
                                output: "1"
                            }
                        ],
                        marks: 100,
                        timeLimit: 20
                    },
                    {
                        type: "coding",
                        questionText: "Segment Tree - Range Sum Query",
                        description: "Given an array, build a segment tree that can efficiently answer queries for the sum of elements in a given range [L, R].",
                        difficulty: "Medium",
                        examples: [
                            {
                                input: "arr = [1,3,5,7,9,11], query = [1,3]",
                                output: "15 (3 + 5 + 7)"
                            },
                            {
                                input: "arr = [2,4,6,8,10], query = [0,2]",
                                output: "12 (2 + 4 + 6)"
                            },
                            {
                                input: "arr = [1,1,1,1,1], query = [2,4]",
                                output: "3"
                            }
                        ],
                        marks: 100,
                        timeLimit: 25
                    },
                    {
                        type: "coding",
                        questionText: "Serialize and Deserialize Binary Tree",
                        description: "Design algorithms to serialize a binary tree into a string and deserialize it back to the original tree structure.",
                        difficulty: "Hard",
                        examples: [
                            {
                                input: "root = [1,2,3,null,null,4,5]",
                                output: "After deserialize(serialize(root)): [1,2,3,null,null,4,5]"
                            },
                            {
                                input: "root = []",
                                output: "[]"
                            },
                            {
                                input: "root = [1]",
                                output: "[1]"
                            }
                        ],
                        marks: 100,
                        timeLimit: 30
                    },
                    {
                        type: "coding",
                        questionText: "Segment Tree - Range Minimum Query with Updates",
                        description: "Build a segment tree that supports querying the minimum element in a range [L, R] and updating values at specific indices.",
                        difficulty: "Hard",
                        examples: [
                            {
                                input: "arr = [2,5,1,4,9,3], queries = [query(1,3), update(2,6), query(1,3)]",
                                output: "[1,6]"
                            },
                            {
                                input: "arr = [1,3,2,7,9], queries = [query(0,4), update(3,0), query(2,4)]",
                                output: "[1,0]"
                            },
                            {
                                input: "arr = [4,4,4,4], queries = [query(0,3), update(1,5), query(0,3)]",
                                output: "[4,4]"
                            }
                        ],
                        marks: 100,
                        timeLimit: 30
                    }
                ]
            }
        ]
    },
    {
        title: "Backtracking & Recursion Challenges",
        description: "A comprehensive test covering backtracking algorithms, recursion techniques, and their applications in problem-solving.",
        type: "technical",
        duration: 60,
        totalMarks: 500,
        startDate: new Date(),
        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        sections: [
            {
                name: "Backtracking & Recursion Challenges",
                description: "Questions on backtracking, recursion, and their applications in solving complex problems.",
                type: "coding",
                numQuestions: 5,
                marksPerQuestion: 100,
                questions: [
                    {
                        type: "coding",
                        questionText: "Print All Subsequences of a String",
                        description: "Given a string s, print all subsequences of s. A subsequence is a sequence that can be derived by deleting zero or more characters without changing the order of the remaining characters.",
                        difficulty: "Easy",
                        examples: [
                            {
                                input: "\"abc\"",
                                output: "\"\" \"a\" \"b\" \"c\" \"ab\" \"ac\" \"bc\" \"abc\""
                            },
                            {
                                input: "\"ab\"",
                                output: "\"\" \"a\" \"b\" \"ab\""
                            },
                            {
                                input: "\"\"",
                                output: "\"\""
                            }
                        ],
                        marks: 100,
                        timeLimit: 15
                    },
                    {
                        type: "coding",
                        questionText: "N-Queens Problem",
                        description: "Place N queens on an N×N chessboard so that no two queens threaten each other. Return all distinct solutions to the N-Queens puzzle.",
                        difficulty: "Medium",
                        examples: [
                            {
                                input: "4",
                                output: "2 distinct solutions (boards)"
                            },
                            {
                                input: "1",
                                output: "1 solution: [\"Q\"]"
                            },
                            {
                                input: "3",
                                output: "No solutions (empty list)"
                            }
                        ],
                        marks: 100,
                        timeLimit: 20
                    },
                    {
                        type: "coding",
                        questionText: "Generate All Permutations of a String",
                        description: "Given a string s, print all permutations of the characters in s.",
                        difficulty: "Medium",
                        examples: [
                            {
                                input: "\"abc\"",
                                output: "[\"abc\", \"acb\", \"bac\", \"bca\", \"cab\", \"cba\"]"
                            },
                            {
                                input: "\"ab\"",
                                output: "[\"ab\", \"ba\"]"
                            },
                            {
                                input: "\"a\"",
                                output: "[\"a\"]"
                            }
                        ],
                        marks: 100,
                        timeLimit: 25
                    },
                    {
                        type: "coding",
                        questionText: "Sudoku Solver",
                        description: "Given a partially filled 9×9 Sudoku board, fill the empty cells such that the final board is valid according to Sudoku rules.",
                        difficulty: "Hard",
                        examples: [
                            {
                                input: "Partial board with some numbers filled",
                                output: "Fully solved valid Sudoku board"
                            },
                            {
                                input: "Almost empty board",
                                output: "One valid complete solution"
                            },
                            {
                                input: "No solution board",
                                output: "Return no solution or empty board"
                            }
                        ],
                        marks: 100,
                        timeLimit: 30
                    },
                    {
                        type: "coding",
                        questionText: "Word Break Problem",
                        description: "Given a string s and a dictionary of words dict, determine if s can be segmented into a space-separated sequence of one or more dictionary words.",
                        difficulty: "Hard",
                        examples: [
                            {
                                input: "s = \"leetcode\", dict = [\"leet\", \"code\"]",
                                output: "true"
                            },
                            {
                                input: "s = \"applepenapple\", dict = [\"apple\", \"pen\"]",
                                output: "true"
                            },
                            {
                                input: "s = \"catsandog\", dict = [\"cats\", \"dog\", \"sand\", \"and\", \"cat\"]",
                                output: "false"
                            }
                        ],
                        marks: 100,
                        timeLimit: 30
                    }
                ]
            }
        ]
    },
    {
        title: "Bit Manipulation & Number Theory",
        description: "A comprehensive test covering bit manipulation techniques, number theory concepts, and their applications in problem-solving.",
        type: "coding",
        duration: 60,
        totalMarks: 500,
        sections: [
            {
                name: "Bit Manipulation & Number Theory",
                description: "Questions on bit manipulation, number theory, and their applications in solving mathematical problems.",
                type: "coding",
                numQuestions: 5,
                marksPerQuestion: 100,
                questions: [
                    {
                        type: "coding",
                        questionText: "Count Set Bits in an Integer",
                        description: "Given a non-negative integer n, return the number of '1' bits it has (also known as the Hamming weight).",
                        difficulty: "Easy",
                        examples: [
                            {
                                input: "5 (binary 101)",
                                output: "2"
                            },
                            {
                                input: "7 (binary 111)",
                                output: "3"
                            },
                            {
                                input: "0 (binary 0)",
                                output: "0"
                            }
                        ],
                        marks: 100,
                        timeLimit: 15
                    },
                    {
                        type: "coding",
                        questionText: "Check if a Number is a Power of Two",
                        description: "Given an integer n, return true if it is a power of two. Otherwise, return false. An integer is a power of two if there exists an integer x such that n == 2^x.",
                        difficulty: "Medium",
                        examples: [
                            {
                                input: "16",
                                output: "true"
                            },
                            {
                                input: "18",
                                output: "false"
                            },
                            {
                                input: "1",
                                output: "true"
                            }
                        ],
                        marks: 100,
                        timeLimit: 20
                    },
                    {
                        type: "coding",
                        questionText: "Find the Missing Number in an Array",
                        description: "Given an array containing n distinct numbers from 0 to n, find the missing number using bitwise operations.",
                        difficulty: "Medium",
                        examples: [
                            {
                                input: "[3, 0, 1]",
                                output: "2"
                            },
                            {
                                input: "[0, 1]",
                                output: "2"
                            },
                            {
                                input: "[9,6,4,2,3,5,7,0,1]",
                                output: "8"
                            }
                        ],
                        marks: 100,
                        timeLimit: 25
                    },
                    {
                        type: "coding",
                        questionText: "Count the Number of Primes Less Than n",
                        description: "Given a non-negative integer n, count all the prime numbers less than n.",
                        difficulty: "Hard",
                        examples: [
                            {
                                input: "10",
                                output: "4 (primes are 2,3,5,7)"
                            },
                            {
                                input: "0",
                                output: "0"
                            },
                            {
                                input: "20",
                                output: "8 (2,3,5,7,11,13,17,19)"
                            }
                        ],
                        marks: 100,
                        timeLimit: 30
                    },
                    {
                        type: "coding",
                        questionText: "Find XOR of All Numbers from 1 to n",
                        description: "Given an integer n, find the XOR of all numbers from 1 to n. Use bit manipulation properties to achieve optimal performance.",
                        difficulty: "Hard",
                        examples: [
                            {
                                input: "5",
                                output: "1 (1⊕2⊕3⊕4⊕5 = 1)"
                            },
                            {
                                input: "7",
                                output: "0"
                            },
                            {
                                input: "10",
                                output: "11"
                            }
                        ],
                        marks: 100,
                        timeLimit: 30
                    }
                ]
            }
        ]
    },
    {
        title: "System Design Fundamentals",
        description: "A comprehensive test covering system design principles, distributed systems, and scalable architecture patterns.",
        type: "technical",
        duration: 90,
        totalMarks: 500,
        startDate: new Date(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        sections: [
            {
                name: "System Design Fundamentals",
                description: "Questions on system design, distributed systems, and scalable architecture patterns.",
                type: "coding",
                numQuestions: 5,
                marksPerQuestion: 100,
                questions: [
                    {
                        type: "coding",
                        questionText: "Design a Distributed File Storage System",
                        description: "Design a distributed file storage system that can store and retrieve files reliably and efficiently. Consider replication, fault tolerance, data consistency, and scalability.",
                        difficulty: "Hard",
                        requirements: [
                            "File storage and retrieval",
                            "Data replication",
                            "Fault tolerance",
                            "Data consistency",
                            "Scalability"
                        ],
                        scenarios: [
                            {
                                input: "User uploads file",
                                output: "File is replicated to multiple storage nodes"
                            },
                            {
                                input: "User retrieves file",
                                output: "System fetches latest consistent version"
                            },
                            {
                                input: "Storage node failure",
                                output: "System handles failure without data loss"
                            }
                        ],
                        marks: 100,
                        timeLimit: 35
                    },
                    {
                        type: "coding",
                        questionText: "Design a Cache System",
                        description: "Design an in-memory cache system that supports storing key-value pairs with operations like get, set, and delete. It should handle cache eviction policies, concurrency, and expiration of keys.",
                        difficulty: "Medium",
                        requirements: [
                            "Support basic CRUD operations",
                            "Implement cache eviction policies (LRU)",
                            "Handle concurrent access",
                            "Support key expiration (TTL)"
                        ],
                        scenarios: [
                            {
                                input: "Set key user_1 with value {\"name\": \"Alice\"}",
                                output: "Get key user_1 returns {\"name\": \"Alice\"}"
                            },
                            {
                                input: "Cache capacity exceeded",
                                output: "Least recently used keys are evicted"
                            },
                            {
                                input: "Key with TTL expires",
                                output: "Key is no longer retrievable after expiration"
                            }
                        ],
                        marks: 100,
                        timeLimit: 25
                    },
                    {
                        type: "coding",
                        questionText: "Design a Real-Time Chat Application",
                        description: "Design a chat application that supports real-time one-to-one messaging with features like message delivery acknowledgment, message history, and online status.",
                        difficulty: "Medium",
                        requirements: [
                            "Real-time message delivery",
                            "Message persistence",
                            "Online/offline status",
                            "Message delivery acknowledgment",
                            "Typing indicators"
                        ],
                        scenarios: [
                            {
                                input: "User A sends message to User B",
                                output: "User B receives message instantly"
                            },
                            {
                                input: "User B is offline",
                                output: "Message is stored and delivered when User B comes online"
                            },
                            {
                                input: "Both users typing",
                                output: "Both see typing indicators"
                            }
                        ],
                        marks: 100,
                        timeLimit: 30
                    },
                    {
                        type: "coding",
                        questionText: "Design a Scalable Video Streaming Service",
                        description: "Design a video streaming platform capable of serving videos to a large user base with minimal latency. Consider storage, CDNs, adaptive bitrate streaming, and load balancing.",
                        difficulty: "Hard",
                        requirements: [
                            "Video storage and delivery",
                            "Content Delivery Network (CDN) integration",
                            "Adaptive bitrate streaming",
                            "Load balancing",
                            "Video processing pipeline"
                        ],
                        scenarios: [
                            {
                                input: "User requests video",
                                output: "System serves best quality stream based on bandwidth"
                            },
                            {
                                input: "Popular video request",
                                output: "System serves from edge servers to reduce latency"
                            },
                            {
                                input: "Large video upload",
                                output: "Triggers asynchronous processing (encoding, thumbnails)"
                            }
                        ],
                        marks: 100,
                        timeLimit: 35
                    },
                    {
                        type: "coding",
                        questionText: "Design a URL Shortener Service",
                        description: "Design a system like bit.ly that shortens URLs. Your design should handle generating unique short URLs, redirection, and basic scalability.",
                        difficulty: "Easy",
                        requirements: [
                            "Generate unique short URLs for long URLs",
                            "Handle URL redirection",
                            "Consider scalability aspects",
                            "Handle duplicate URL shortening requests"
                        ],
                        scenarios: [
                            {
                                input: "Long URL: https://www.example.com/articles/long-article-title",
                                output: "Short URL: https://short.ly/abc123 that redirects to original URL"
                            },
                            {
                                input: "Short URL: https://short.ly/xyz789",
                                output: "Redirects to the original long URL"
                            },
                            {
                                input: "Attempting to shorten the same long URL twice",
                                output: "Returns the same short URL or a new unique URL (design decision)"
                            }
                        ],
                        marks: 100,
                        timeLimit: 20
                    }
                ]
            }
        ]
    },
    {
        title: "HR Interview Preparation",
        description: "A comprehensive set of modules covering various aspects of HR interviews including self-introduction, situational questions, teamwork, and company knowledge.",
        type: "hr",
        duration: 120,
        totalMarks: 700,
        startDate: new Date(),
        endDate: new Date(Date.now() + 120 * 60 * 1000),
        sections: [
            {
                name: "Self Introduction & Career Aspirations",
                description: "Questions about personal background, career goals, and professional aspirations.",
                type: "interview",
                numQuestions: 10,
                marksPerQuestion: 10,
                questions: [
                    {
                        type: "interview",
                        questionText: "Tell me about yourself and your background.",
                        description: "Provide a concise overview of your educational background, relevant experience, and key achievements.",
                        difficulty: "Easy",
                        expectedPoints: [
                            "Educational background",
                            "Relevant experience",
                            "Key achievements",
                            "Professional interests"
                        ],
                        marks: 10,
                        timeLimit: 3
                    },
                    {
                        type: "interview",
                        questionText: "What motivated you to choose this field of study?",
                        description: "Explain your passion for the field and what drives your interest in this career path.",
                        difficulty: "Easy",
                        expectedPoints: [
                            "Personal motivation",
                            "Career alignment",
                            "Future goals",
                            "Industry interest"
                        ],
                        marks: 10,
                        timeLimit: 3
                    },
                    {
                        type: "interview",
                        questionText: "How would you describe your key strengths?",
                        description: "Highlight your main professional strengths with specific examples.",
                        difficulty: "Easy",
                        expectedPoints: [
                            "Technical skills",
                            "Soft skills",
                            "Specific examples",
                            "Relevance to role"
                        ],
                        marks: 10,
                        timeLimit: 3
                    },
                    {
                        type: "interview",
                        questionText: "What are your biggest weaknesses, and how are you working on them?",
                        description: "Discuss areas for improvement and your proactive approach to development.",
                        difficulty: "Medium",
                        expectedPoints: [
                            "Self-awareness",
                            "Improvement plan",
                            "Progress made",
                            "Learning attitude"
                        ],
                        marks: 10,
                        timeLimit: 3
                    },
                    {
                        type: "interview",
                        questionText: "Where do you see yourself in five years?",
                        description: "Outline your career goals and growth plans.",
                        difficulty: "Medium",
                        expectedPoints: [
                            "Career progression",
                            "Skill development",
                            "Role expectations",
                            "Company alignment"
                        ],
                        marks: 10,
                        timeLimit: 3
                    },
                    {
                        type: "interview",
                        questionText: "Why are you interested in this company/role?",
                        description: "Explain your motivation for applying and company alignment.",
                        difficulty: "Medium",
                        expectedPoints: [
                            "Company research",
                            "Role fit",
                            "Career alignment",
                            "Growth opportunities"
                        ],
                        marks: 10,
                        timeLimit: 3
                    },
                    {
                        type: "interview",
                        questionText: "Can you describe a significant achievement you are proud of?",
                        description: "Share a specific accomplishment with measurable results.",
                        difficulty: "Medium",
                        expectedPoints: [
                            "Achievement details",
                            "Impact made",
                            "Skills demonstrated",
                            "Learning outcomes"
                        ],
                        marks: 10,
                        timeLimit: 3
                    },
                    {
                        type: "interview",
                        questionText: "What skills have you acquired during your education that will help you succeed here?",
                        description: "Highlight relevant skills and their application to the role.",
                        difficulty: "Medium",
                        expectedPoints: [
                            "Technical skills",
                            "Soft skills",
                            "Project experience",
                            "Practical application"
                        ],
                        marks: 10,
                        timeLimit: 3
                    },
                    {
                        type: "interview",
                        questionText: "How do you handle criticism or negative feedback?",
                        description: "Demonstrate your ability to accept and learn from feedback.",
                        difficulty: "Medium",
                        expectedPoints: [
                            "Reception of feedback",
                            "Learning attitude",
                            "Improvement actions",
                            "Professional growth"
                        ],
                        marks: 10,
                        timeLimit: 3
                    },
                    {
                        type: "interview",
                        questionText: "What are your career goals and how do you plan to achieve them?",
                        description: "Outline your long-term career objectives and action plan.",
                        difficulty: "Medium",
                        expectedPoints: [
                            "Goal clarity",
                            "Action plan",
                            "Timeline",
                            "Resource utilization"
                        ],
                        marks: 10,
                        timeLimit: 3
                    }
                ]
            },
            {
                name: "Situational & Ethical Dilemmas",
                description: "Questions about handling ethical situations and workplace dilemmas.",
                type: "interview",
                numQuestions: 10,
                marksPerQuestion: 10,
                questions: [
                    {
                        type: "interview",
                        questionText: "Describe a time when you faced an ethical dilemma at work or school. How did you handle it?",
                        description: "Share a specific example of an ethical challenge and your response.",
                        difficulty: "Hard",
                        expectedPoints: [
                            "Situation description",
                            "Decision process",
                            "Actions taken",
                            "Outcome and learning"
                        ],
                        marks: 10,
                        timeLimit: 4
                    },
                    {
                        type: "interview",
                        questionText: "What would you do if you caught a colleague cheating or violating company policy?",
                        description: "Explain your approach to handling policy violations.",
                        difficulty: "Hard",
                        expectedPoints: [
                            "Policy awareness",
                            "Reporting process",
                            "Professional approach",
                            "Team impact"
                        ],
                        marks: 10,
                        timeLimit: 3
                    },
                    {
                        type: "interview",
                        questionText: "How would you handle a situation where you disagreed with your manager's decision?",
                        description: "Demonstrate your approach to professional disagreement.",
                        difficulty: "Hard",
                        expectedPoints: [
                            "Respectful communication",
                            "Alternative solutions",
                            "Team alignment",
                            "Professional maturity"
                        ],
                        marks: 10,
                        timeLimit: 3
                    },
                    {
                        type: "interview",
                        questionText: "Imagine you are assigned a task you feel is unethical. What would you do?",
                        description: "Show your approach to ethical concerns in the workplace.",
                        difficulty: "Hard",
                        expectedPoints: [
                            "Ethical assessment",
                            "Communication approach",
                            "Alternative solutions",
                            "Professional integrity"
                        ],
                        marks: 10,
                        timeLimit: 3
                    },
                    {
                        type: "interview",
                        questionText: "How would you respond if you saw someone being treated unfairly in your team?",
                        description: "Demonstrate your approach to workplace fairness and inclusion.",
                        difficulty: "Hard",
                        expectedPoints: [
                            "Situation assessment",
                            "Appropriate action",
                            "Support provided",
                            "Team harmony"
                        ],
                        marks: 10,
                        timeLimit: 3
                    },
                    {
                        type: "interview",
                        questionText: "Describe a situation where you had to choose between meeting a deadline and maintaining quality. What did you do?",
                        description: "Show your approach to balancing speed and quality.",
                        difficulty: "Medium",
                        expectedPoints: [
                            "Priority assessment",
                            "Solution approach",
                            "Quality standards",
                            "Outcome achieved"
                        ],
                        marks: 10,
                        timeLimit: 3
                    },
                    {
                        type: "interview",
                        questionText: "What steps would you take if you made a mistake that could impact the company?",
                        description: "Demonstrate your approach to handling mistakes professionally.",
                        difficulty: "Medium",
                        expectedPoints: [
                            "Immediate action",
                            "Communication",
                            "Solution implementation",
                            "Learning process"
                        ],
                        marks: 10,
                        timeLimit: 3
                    },
                    {
                        type: "interview",
                        questionText: "How would you prioritize your tasks if you have multiple urgent deadlines?",
                        description: "Show your approach to time management and prioritization.",
                        difficulty: "Medium",
                        expectedPoints: [
                            "Priority assessment",
                            "Time management",
                            "Resource allocation",
                            "Communication approach"
                        ],
                        marks: 10,
                        timeLimit: 3
                    },
                    {
                        type: "interview",
                        questionText: "Describe a time when you had to make a difficult decision with limited information.",
                        description: "Demonstrate your decision-making process in uncertain situations.",
                        difficulty: "Hard",
                        expectedPoints: [
                            "Information gathering",
                            "Risk assessment",
                            "Decision process",
                            "Outcome evaluation"
                        ],
                        marks: 10,
                        timeLimit: 4
                    },
                    {
                        type: "interview",
                        questionText: "How do you ensure honesty and integrity in your work and relationships?",
                        description: "Explain your approach to maintaining professional ethics.",
                        difficulty: "Medium",
                        expectedPoints: [
                            "Personal values",
                            "Professional standards",
                            "Relationship building",
                            "Consistent behavior"
                        ],
                        marks: 10,
                        timeLimit: 3
                    }
                ]
            },
            {
                name: "Teamwork, Leadership & Conflict Resolution",
                description: "Questions about team dynamics, leadership, and conflict management.",
                type: "interview",
                numQuestions: 10,
                marksPerQuestion: 10,
                questions: [
                    {
                        type: "interview",
                        questionText: "Describe a time when you worked effectively within a team. What was your role and contribution?",
                        description: "Share a specific example of successful teamwork.",
                        difficulty: "Medium",
                        expectedPoints: [
                            "Team role",
                            "Contributions made",
                            "Collaboration skills",
                            "Team success"
                        ],
                        marks: 10,
                        timeLimit: 3
                    },
                    {
                        type: "interview",
                        questionText: "How do you handle conflicts within a team? Give an example if possible.",
                        description: "Demonstrate your conflict resolution skills.",
                        difficulty: "Hard",
                        expectedPoints: [
                            "Conflict identification",
                            "Resolution approach",
                            "Communication skills",
                            "Team harmony"
                        ],
                        marks: 10,
                        timeLimit: 4
                    },
                    {
                        type: "interview",
                        questionText: "Describe a situation where you had to lead a team. What challenges did you face and how did you overcome them?",
                        description: "Share your leadership experience and problem-solving approach.",
                        difficulty: "Hard",
                        expectedPoints: [
                            "Leadership role",
                            "Challenges faced",
                            "Solution approach",
                            "Team success"
                        ],
                        marks: 10,
                        timeLimit: 4
                    },
                    {
                        type: "interview",
                        questionText: "How do you motivate team members who are not contributing their best?",
                        description: "Show your approach to team motivation and performance improvement.",
                        difficulty: "Hard",
                        expectedPoints: [
                            "Performance assessment",
                            "Motivation strategies",
                            "Communication approach",
                            "Team development"
                        ],
                        marks: 10,
                        timeLimit: 3
                    },
                    {
                        type: "interview",
                        questionText: "Have you ever had to deal with a difficult team member? How did you handle the situation?",
                        description: "Demonstrate your approach to challenging team dynamics.",
                        difficulty: "Hard",
                        expectedPoints: [
                            "Situation assessment",
                            "Communication approach",
                            "Resolution strategy",
                            "Team harmony"
                        ],
                        marks: 10,
                        timeLimit: 4
                    },
                    {
                        type: "interview",
                        questionText: "What qualities do you think make a good leader? How do you demonstrate these qualities?",
                        description: "Share your understanding of leadership and personal examples.",
                        difficulty: "Medium",
                        expectedPoints: [
                            "Leadership qualities",
                            "Personal examples",
                            "Team impact",
                            "Growth mindset"
                        ],
                        marks: 10,
                        timeLimit: 3
                    },
                    {
                        type: "interview",
                        questionText: "How do you ensure effective communication within a team?",
                        description: "Explain your approach to team communication.",
                        difficulty: "Medium",
                        expectedPoints: [
                            "Communication methods",
                            "Information sharing",
                            "Feedback process",
                            "Team alignment"
                        ],
                        marks: 10,
                        timeLimit: 3
                    },
                    {
                        type: "interview",
                        questionText: "Describe a time when you had to compromise to resolve a disagreement in your team.",
                        description: "Show your approach to finding common ground.",
                        difficulty: "Medium",
                        expectedPoints: [
                            "Situation description",
                            "Compromise approach",
                            "Team benefit",
                            "Learning outcome"
                        ],
                        marks: 10,
                        timeLimit: 3
                    },
                    {
                        type: "interview",
                        questionText: "How do you balance your individual responsibilities with team goals?",
                        description: "Demonstrate your approach to personal and team priorities.",
                        difficulty: "Medium",
                        expectedPoints: [
                            "Priority management",
                            "Time allocation",
                            "Team contribution",
                            "Personal growth"
                        ],
                        marks: 10,
                        timeLimit: 3
                    },
                    {
                        type: "interview",
                        questionText: "What steps do you take to build trust within a team?",
                        description: "Explain your approach to team trust building.",
                        difficulty: "Medium",
                        expectedPoints: [
                            "Trust building actions",
                            "Communication approach",
                            "Reliability demonstration",
                            "Team development"
                        ],
                        marks: 10,
                        timeLimit: 3
                    }
                ]
            },
            {
                name: "Strengths, Weaknesses & Self-Improvement",
                description: "Questions about personal development and self-awareness.",
                type: "interview",
                numQuestions: 10,
                marksPerQuestion: 10,
                questions: [
                    {
                        type: "interview",
                        questionText: "What are your greatest strengths, and how have they helped you in your career or studies?",
                        description: "Highlight your key strengths with specific examples.",
                        difficulty: "Easy",
                        expectedPoints: [
                            "Strength identification",
                            "Specific examples",
                            "Career impact",
                            "Future application"
                        ],
                        marks: 10,
                        timeLimit: 3
                    },
                    {
                        type: "interview",
                        questionText: "Describe a weakness you have and what you are doing to improve it.",
                        description: "Show self-awareness and commitment to improvement.",
                        difficulty: "Medium",
                        expectedPoints: [
                            "Weakness identification",
                            "Improvement plan",
                            "Progress made",
                            "Learning attitude"
                        ],
                        marks: 10,
                        timeLimit: 3
                    },
                    {
                        type: "interview",
                        questionText: "How do you handle criticism or negative feedback? Can you give an example?",
                        description: "Demonstrate your approach to receiving and acting on feedback.",
                        difficulty: "Medium",
                        expectedPoints: [
                            "Feedback reception",
                            "Learning approach",
                            "Improvement actions",
                            "Growth mindset"
                        ],
                        marks: 10,
                        timeLimit: 3
                    },
                    {
                        type: "interview",
                        questionText: "Tell me about a time when you failed at something. What did you learn from that experience?",
                        description: "Share a learning experience from failure.",
                        difficulty: "Medium",
                        expectedPoints: [
                            "Failure description",
                            "Learning outcomes",
                            "Improvement actions",
                            "Future application"
                        ],
                        marks: 10,
                        timeLimit: 3
                    },
                    {
                        type: "interview",
                        questionText: "How do you stay motivated to improve yourself continuously?",
                        description: "Explain your approach to self-motivation and growth.",
                        difficulty: "Medium",
                        expectedPoints: [
                            "Motivation sources",
                            "Learning methods",
                            "Goal setting",
                            "Progress tracking"
                        ],
                        marks: 10,
                        timeLimit: 3
                    },
                    {
                        type: "interview",
                        questionText: "What skills are you currently working on developing?",
                        description: "Share your current learning and development focus.",
                        difficulty: "Easy",
                        expectedPoints: [
                            "Skill identification",
                            "Development plan",
                            "Progress made",
                            "Future goals"
                        ],
                        marks: 10,
                        timeLimit: 3
                    },
                    {
                        type: "interview",
                        questionText: "How do you prioritize self-improvement while managing other responsibilities?",
                        description: "Show your approach to balancing growth and responsibilities.",
                        difficulty: "Medium",
                        expectedPoints: [
                            "Time management",
                            "Priority setting",
                            "Resource allocation",
                            "Balance achievement"
                        ],
                        marks: 10,
                        timeLimit: 3
                    },
                    {
                        type: "interview",
                        questionText: "Describe a situation where you took the initiative to learn something new outside of your formal education.",
                        description: "Share an example of self-directed learning.",
                        difficulty: "Medium",
                        expectedPoints: [
                            "Learning initiative",
                            "Resource utilization",
                            "Skill acquisition",
                            "Application of learning"
                        ],
                        marks: 10,
                        timeLimit: 3
                    },
                    {
                        type: "interview",
                        questionText: "How do you set personal and professional goals?",
                        description: "Explain your goal-setting process.",
                        difficulty: "Medium",
                        expectedPoints: [
                            "Goal setting process",
                            "Action planning",
                            "Progress tracking",
                            "Achievement strategy"
                        ],
                        marks: 10,
                        timeLimit: 3
                    },
                    {
                        type: "interview",
                        questionText: "How do you measure your progress toward self-improvement goals?",
                        description: "Show your approach to tracking personal development.",
                        difficulty: "Medium",
                        expectedPoints: [
                            "Progress metrics",
                            "Evaluation methods",
                            "Adjustment process",
                            "Success indicators"
                        ],
                        marks: 10,
                        timeLimit: 3
                    }
                ]
            },
            {
                name: "Motivation, Adaptability & Learning Ability",
                description: "Questions about personal drive, adaptability, and learning approach.",
                type: "interview",
                numQuestions: 10,
                marksPerQuestion: 10,
                questions: [
                    {
                        type: "interview",
                        questionText: "What motivates you to perform your best at work or in studies?",
                        description: "Explain your sources of motivation and drive.",
                        difficulty: "Easy",
                        expectedPoints: [
                            "Motivation sources",
                            "Personal drive",
                            "Achievement focus",
                            "Growth mindset"
                        ],
                        marks: 10,
                        timeLimit: 3
                    },
                    {
                        type: "interview",
                        questionText: "Can you describe a time when you had to adapt quickly to a significant change? How did you handle it?",
                        description: "Share an example of successful adaptation.",
                        difficulty: "Medium",
                        expectedPoints: [
                            "Change situation",
                            "Adaptation process",
                            "Learning approach",
                            "Success outcome"
                        ],
                        marks: 10,
                        timeLimit: 3
                    },
                    {
                        type: "interview",
                        questionText: "How do you keep yourself motivated during challenging or repetitive tasks?",
                        description: "Show your approach to maintaining motivation.",
                        difficulty: "Medium",
                        expectedPoints: [
                            "Motivation strategies",
                            "Task management",
                            "Goal focus",
                            "Personal drive"
                        ],
                        marks: 10,
                        timeLimit: 3
                    },
                    {
                        type: "interview",
                        questionText: "Tell me about a situation where you had to learn a new skill or technology in a short time. How did you manage?",
                        description: "Demonstrate your learning ability and approach.",
                        difficulty: "Medium",
                        expectedPoints: [
                            "Learning situation",
                            "Resource utilization",
                            "Time management",
                            "Skill acquisition"
                        ],
                        marks: 10,
                        timeLimit: 3
                    },
                    {
                        type: "interview",
                        questionText: "How do you stay updated with industry trends and developments?",
                        description: "Explain your approach to continuous learning.",
                        difficulty: "Medium",
                        expectedPoints: [
                            "Learning resources",
                            "Update methods",
                            "Application of knowledge",
                            "Industry awareness"
                        ],
                        marks: 10,
                        timeLimit: 3
                    },
                    {
                        type: "interview",
                        questionText: "Describe a time when you had to work outside your comfort zone. What did you learn?",
                        description: "Share an experience of growth through challenge.",
                        difficulty: "Medium",
                        expectedPoints: [
                            "Challenge description",
                            "Learning process",
                            "Growth outcomes",
                            "Future application"
                        ],
                        marks: 10,
                        timeLimit: 3
                    },
                    {
                        type: "interview",
                        questionText: "How do you approach problem-solving when faced with unfamiliar situations?",
                        description: "Show your problem-solving methodology.",
                        difficulty: "Medium",
                        expectedPoints: [
                            "Problem analysis",
                            "Solution approach",
                            "Resource utilization",
                            "Learning process"
                        ],
                        marks: 10,
                        timeLimit: 3
                    },
                    {
                        type: "interview",
                        questionText: "How do you handle setbacks or failures while trying to achieve a goal?",
                        description: "Demonstrate your resilience and learning approach.",
                        difficulty: "Medium",
                        expectedPoints: [
                            "Setback handling",
                            "Learning process",
                            "Adaptation strategy",
                            "Goal achievement"
                        ],
                        marks: 10,
                        timeLimit: 3
                    },
                    {
                        type: "interview",
                        questionText: "What strategies do you use to manage stress and maintain productivity?",
                        description: "Explain your stress management approach.",
                        difficulty: "Medium",
                        expectedPoints: [
                            "Stress management",
                            "Productivity maintenance",
                            "Work-life balance",
                            "Personal well-being"
                        ],
                        marks: 10,
                        timeLimit: 3
                    },
                    {
                        type: "interview",
                        questionText: "Can you share an example of how your adaptability benefited a team or project?",
                        description: "Show the impact of your adaptability.",
                        difficulty: "Medium",
                        expectedPoints: [
                            "Adaptation situation",
                            "Team impact",
                            "Project success",
                            "Learning outcomes"
                        ],
                        marks: 10,
                        timeLimit: 3
                    }
                ]
            },
            {
                name: "Problem Solving & Decision Making",
                description: "Questions about analytical thinking and decision-making processes.",
                type: "interview",
                numQuestions: 10,
                marksPerQuestion: 10,
                questions: [
                    {
                        type: "interview",
                        questionText: "Describe a situation where you faced a difficult problem at work or in your studies. How did you solve it?",
                        description: "Share a specific problem-solving example.",
                        difficulty: "Medium",
                        expectedPoints: [
                            "Problem identification",
                            "Solution approach",
                            "Implementation process",
                            "Outcome achieved"
                        ],
                        marks: 10,
                        timeLimit: 4
                    },
                    {
                        type: "interview",
                        questionText: "How do you approach making important decisions when there is limited information available?",
                        description: "Show your decision-making process in uncertain situations.",
                        difficulty: "Hard",
                        expectedPoints: [
                            "Information gathering",
                            "Risk assessment",
                            "Decision process",
                            "Outcome evaluation"
                        ],
                        marks: 10,
                        timeLimit: 4
                    },
                    {
                        type: "interview",
                        questionText: "Can you give an example of a time when you had to choose between multiple solutions? What factors influenced your decision?",
                        description: "Demonstrate your decision-making criteria and process.",
                        difficulty: "Medium",
                        expectedPoints: [
                            "Solution evaluation",
                            "Decision criteria",
                            "Choice justification",
                            "Outcome assessment"
                        ],
                        marks: 10,
                        timeLimit: 4
                    },
                    {
                        type: "interview",
                        questionText: "How do you prioritize tasks when working on several projects simultaneously?",
                        description: "Explain your task prioritization approach.",
                        difficulty: "Medium",
                        expectedPoints: [
                            "Priority assessment",
                            "Time management",
                            "Resource allocation",
                            "Project success"
                        ],
                        marks: 10,
                        timeLimit: 3
                    },
                    {
                        type: "interview",
                        questionText: "Tell me about a time when your initial solution didn't work. How did you adapt your approach?",
                        description: "Show your adaptability in problem-solving.",
                        difficulty: "Medium",
                        expectedPoints: [
                            "Initial approach",
                            "Adaptation process",
                            "Learning outcomes",
                            "Success achievement"
                        ],
                        marks: 10,
                        timeLimit: 3
                    },
                    {
                        type: "interview",
                        questionText: "Describe a situation where you identified a problem others did not notice. What did you do?",
                        description: "Demonstrate your problem identification skills.",
                        difficulty: "Medium",
                        expectedPoints: [
                            "Problem identification",
                            "Action taken",
                            "Team communication",
                            "Solution implementation"
                        ],
                        marks: 10,
                        timeLimit: 3
                    },
                    {
                        type: "interview",
                        questionText: "How do you handle situations where your decision is challenged by others?",
                        description: "Show your approach to handling disagreement.",
                        difficulty: "Medium",
                        expectedPoints: [
                            "Response approach",
                            "Communication skills",
                            "Conflict resolution",
                            "Team harmony"
                        ],
                        marks: 10,
                        timeLimit: 3
                    },
                    {
                        type: "interview",
                        questionText: "What steps do you take to ensure your decisions are effective and timely?",
                        description: "Explain your decision-making process.",
                        difficulty: "Medium",
                        expectedPoints: [
                            "Decision process",
                            "Time management",
                            "Effectiveness measures",
                            "Outcome evaluation"
                        ],
                        marks: 10,
                        timeLimit: 3
                    },
                    {
                        type: "interview",
                        questionText: "Share an example of a creative solution you implemented to solve a problem.",
                        description: "Demonstrate your creative problem-solving skills.",
                        difficulty: "Hard",
                        expectedPoints: [
                            "Problem description",
                            "Creative approach",
                            "Implementation process",
                            "Success outcome"
                        ],
                        marks: 10,
                        timeLimit: 4
                    },
                    {
                        type: "interview",
                        questionText: "How do you evaluate the risks and benefits before making a decision?",
                        description: "Show your risk assessment process.",
                        difficulty: "Medium",
                        expectedPoints: [
                            "Risk assessment",
                            "Benefit analysis",
                            "Decision criteria",
                            "Outcome evaluation"
                        ],
                        marks: 10,
                        timeLimit: 3
                    }
                ]
            },
            {
                name: "Company Knowledge & Fit",
                description: "Questions about company understanding and cultural fit.",
                type: "interview",
                numQuestions: 10,
                marksPerQuestion: 10,
                questions: [
                    {
                        type: "interview",
                        questionText: "What do you know about our company's mission and values?",
                        description: "Demonstrate your understanding of the company's core principles.",
                        difficulty: "Easy",
                        expectedPoints: [
                            "Mission understanding",
                            "Values alignment",
                            "Company research",
                            "Personal fit"
                        ],
                        marks: 10,
                        timeLimit: 3
                    },
                    {
                        type: "interview",
                        questionText: "Why do you want to work with our company specifically?",
                        description: "Show your motivation for joining the company.",
                        difficulty: "Medium",
                        expectedPoints: [
                            "Company attraction",
                            "Role alignment",
                            "Career goals",
                            "Growth opportunities"
                        ],
                        marks: 10,
                        timeLimit: 3
                    },
                    {
                        type: "interview",
                        questionText: "How do you think your skills and experiences align with our company's goals?",
                        description: "Demonstrate your fit for the company.",
                        difficulty: "Medium",
                        expectedPoints: [
                            "Skill alignment",
                            "Experience relevance",
                            "Goal contribution",
                            "Value addition"
                        ],
                        marks: 10,
                        timeLimit: 3
                    },
                    {
                        type: "interview",
                        questionText: "What do you expect to learn or achieve by working here?",
                        description: "Share your growth expectations.",
                        difficulty: "Medium",
                        expectedPoints: [
                            "Learning goals",
                            "Career growth",
                            "Skill development",
                            "Company contribution"
                        ],
                        marks: 10,
                        timeLimit: 3
                    },
                    {
                        type: "interview",
                        questionText: "How do you see yourself contributing to our company's success?",
                        description: "Show your potential impact.",
                        difficulty: "Medium",
                        expectedPoints: [
                            "Skill contribution",
                            "Value addition",
                            "Team impact",
                            "Company growth"
                        ],
                        marks: 10,
                        timeLimit: 3
                    },
                    {
                        type: "interview",
                        questionText: "What do you know about our company's main products or services?",
                        description: "Demonstrate your company knowledge.",
                        difficulty: "Easy",
                        expectedPoints: [
                            "Product knowledge",
                            "Service understanding",
                            "Market position",
                            "Industry impact"
                        ],
                        marks: 10,
                        timeLimit: 3
                    },
                    {
                        type: "interview",
                        questionText: "How do you keep yourself updated about industry trends relevant to our company?",
                        description: "Show your industry awareness.",
                        difficulty: "Medium",
                        expectedPoints: [
                            "Learning resources",
                            "Industry knowledge",
                            "Trend awareness",
                            "Application of knowledge"
                        ],
                        marks: 10,
                        timeLimit: 3
                    },
                    {
                        type: "interview",
                        questionText: "Can you describe a challenge our industry is currently facing and how you think companies like ours should respond?",
                        description: "Demonstrate your industry understanding.",
                        difficulty: "Hard",
                        expectedPoints: [
                            "Industry challenges",
                            "Solution approach",
                            "Company response",
                            "Future impact"
                        ],
                        marks: 10,
                        timeLimit: 4
                    },
                    {
                        type: "interview",
                        questionText: "What motivates you to perform well in a corporate environment like ours?",
                        description: "Show your corporate motivation.",
                        difficulty: "Medium",
                        expectedPoints: [
                            "Corporate motivation",
                            "Performance drive",
                            "Team success",
                            "Personal growth"
                        ],
                        marks: 10,
                        timeLimit: 3
                    },
                    {
                        type: "interview",
                        questionText: "How do you handle working in a company culture that may be different from your previous experiences?",
                        description: "Demonstrate your adaptability to company culture.",
                        difficulty: "Medium",
                        expectedPoints: [
                            "Cultural adaptation",
                            "Learning approach",
                            "Team integration",
                            "Success strategy"
                        ],
                        marks: 10,
                        timeLimit: 3
                    }
                ]
            }
        ]
    }
];

async function seed() {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // Clear existing assessments
        await Assessment.deleteMany({});
        console.log('Cleared existing assessments');

        // Create new assessments
        const createdAssessments = await Assessment.insertMany(sampleAssessments);
        console.log(`Successfully created ${createdAssessments.length} assessments`);

        // Close the connection
        await mongoose.connection.close();
        console.log('Database connection closed');
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

// Run the seed function
seed();

module.exports = {
    sampleAssessments
};