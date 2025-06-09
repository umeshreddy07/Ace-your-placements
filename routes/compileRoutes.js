const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const auth = require('../middleware/auth');

// Create a temporary directory for code files if it doesn't exist
const tempDir = path.join(__dirname, '..', 'temp_code');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

// Helper function to check if a command exists
function checkCommand(command) {
    return new Promise((resolve) => {
        exec(`where ${command}`, (error) => {
            resolve(!error);
        });
    });
}

// Check for required compilers on startup
let hasJavaCompiler = false;
let hasCCompiler = false;
let hasPythonInterpreter = false;

(async () => {
    hasJavaCompiler = await checkCommand('javac');
    hasCCompiler = await checkCommand('gcc');
    hasPythonInterpreter = await checkCommand('python');
    console.log('Compiler status:', { hasJavaCompiler, hasCCompiler, hasPythonInterpreter });
})();

router.post('/', auth, async (req, res) => {
    const { language, code, input } = req.body;
    console.log(`[Compile API] Received request for lang: ${language}, code snippet: ${code.substring(0, 50)}...`);

    let filePath, command;

    try {
        // Convert language to lowercase for case-insensitive comparison
        const lang = (language || '').toLowerCase();

        switch (lang) {
            case 'javascript':
                filePath = path.join(tempDir, `code_${Date.now()}.js`);
                fs.writeFileSync(filePath, code);
                command = `node "${filePath}"`;
                break;

            case 'python':
                if (!hasPythonInterpreter) {
                    return res.status(400).json({ 
                        error: 'Python interpreter is not installed on the server. Please contact the administrator.',
                        details: 'The server needs a Python interpreter to execute Python code.'
                    });
                }
                filePath = path.join(tempDir, `code_${Date.now()}.py`);
                fs.writeFileSync(filePath, code);
                command = `python "${filePath}"`;
                break;

            case 'java':
                if (!hasJavaCompiler) {
                    return res.status(400).json({ 
                        error: 'Java compiler (javac) is not installed on the server. Please contact the administrator.',
                        details: 'The server needs Java Development Kit (JDK) to compile Java code.'
                    });
                }

                // Extract class name from the code
                const classNameMatch = code.match(/public\s+class\s+(\w+)/);
                if (!classNameMatch) {
                    return res.status(400).json({
                        error: 'Invalid Java Code',
                        details: 'Java code must contain a public class. Please ensure your code has a public class declaration.'
                    });
                }
                const className = classNameMatch[1];
                
                // Create file with class name
                filePath = path.join(tempDir, `${className}.java`);
                
                // Write the code to file
                fs.writeFileSync(filePath, code);
                
                // First compile
                const compileCommand = `javac "${filePath}"`;
                exec(compileCommand, (compileError, compileStdout, compileStderr) => {
                    if (compileError) {
                        fs.unlink(filePath, () => {});
                        return res.status(200).json({ 
                            error: 'Compilation Error',
                            details: compileStderr || compileError.message
                        });
                    }
                    
                    // Then run
                    const runCommand = `java -cp "${tempDir}" ${className}`;
                    exec(runCommand, { timeout: 5000 }, (runError, runStdout, runStderr) => {
                        // Clean up
                        const classFile = path.join(tempDir, `${className}.class`);
                        if (fs.existsSync(classFile)) {
                            fs.unlink(classFile, () => {});
                        }
                        fs.unlink(filePath, () => {});

                        if (runError) {
                            return res.status(200).json({ 
                                error: 'Runtime Error',
                                details: runStderr || runError.message,
                                output: runStdout
                            });
                        }
                        return res.json({ output: runStdout });
                    });
                });
                return; // Early return as we're handling the response in the callback

            case 'c':
                if (!hasCCompiler) {
                    return res.status(400).json({ 
                        error: 'C compiler (gcc) is not installed on the server. Please contact the administrator.',
                        details: 'The server needs GCC compiler to compile C code.'
                    });
                }

                // Create a unique identifier for this compilation
                const cId = Date.now();
                const cSourceFile = path.join(tempDir, `code_${cId}.c`);
                const cExeFile = path.join(tempDir, `code_${cId}.exe`);

                // Write the code to file
                fs.writeFileSync(cSourceFile, code);
                
                // First compile
                const cCompileCommand = `gcc "${cSourceFile}" -o "${cExeFile}"`;
                exec(cCompileCommand, (compileError, compileStdout, compileStderr) => {
                    if (compileError) {
                        // Clean up source file
                        fs.unlink(cSourceFile, () => {});
                        return res.status(200).json({ 
                            error: 'Compilation Error',
                            details: compileStderr || compileError.message
                        });
                    }
                    
                    // Then run
                    exec(`"${cExeFile}"`, { timeout: 5000 }, (runError, runStdout, runStderr) => {
                        // Clean up both files
                        fs.unlink(cSourceFile, () => {});
                        fs.unlink(cExeFile, () => {});

                        if (runError) {
                            return res.status(200).json({ 
                                error: 'Runtime Error',
                                details: runStderr || runError.message,
                                output: runStdout
                            });
                        }
                        return res.json({ output: runStdout });
                    });
                });
                return; // Early return as we're handling the response in the callback

            default:
                return res.status(400).json({ 
                    error: 'Unsupported language',
                    details: `The language "${language}" is not supported. Supported languages are: JavaScript, Python, Java, and C.`
                });
        }

        // For JavaScript and Python (synchronous execution)
        const process = exec(command, { timeout: 5000 }, (error, stdout, stderr) => {
            // Clean up
            if (filePath && fs.existsSync(filePath)) {
                fs.unlink(filePath, (err) => {
                    if (err) console.error(`Error deleting temp file ${filePath}:`, err);
                });
            }

            if (error) {
                console.error(`[Compile API] Execution error:`, error);
                return res.status(200).json({ 
                    error: 'Execution Error',
                    details: stderr || error.message,
                    output: stdout 
                });
            }
            if (stderr) {
                console.warn(`[Compile API] Execution produced stderr:`, stderr);
                return res.status(200).json({ 
                    output: stdout, 
                    error: stderr 
                });
            }
            console.log(`[Compile API] Execution success, stdout: ${stdout.substring(0, 50)}...`);
            return res.json({ output: stdout });
        });

        // Provide input to stdin if provided
        if (input) {
            process.stdin.write(input);
        }
        process.stdin.end();

    } catch (err) {
        console.error('[Compile API] Server Error:', err);
        if (filePath && fs.existsSync(filePath)) {
            fs.unlink(filePath, () => {});
        }
        res.status(500).json({ 
            error: 'Server error during code execution',
            details: err.message
        });
    }
});

module.exports = router; 