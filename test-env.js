require('dotenv').config();

console.log("--- test-env.js ---");
console.log("GOOGLE_CLIENT_ID from process.env:", process.env.GOOGLE_CLIENT_ID);
console.log("Loaded from .env file located at:", process.env.PWD || process.cwd()); // Shows current working directory 