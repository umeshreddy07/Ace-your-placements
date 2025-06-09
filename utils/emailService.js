const nodemailer = require('nodemailer');

// Debug logging for email configuration
console.log('Email Configuration:', {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: parseInt(process.env.EMAIL_PORT || "587") === 465,
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS ? '****' : 'Not Set',
    from: process.env.EMAIL_FROM
});

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || "587"),
    secure: parseInt(process.env.EMAIL_PORT || "587") === 465,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls: {
        // DANGER: Allow self-signed certificates - FOR DEVELOPMENT/DEBUGGING ONLY
        rejectUnauthorized: false
    },
    // Add debug logging for the transporter
    logger: true,
    debug: true // include SMTP traffic in logs
});

// Verify transporter configuration
transporter.verify(function(error, success) {
    if (error) {
        console.error('Email transporter verification failed:', error);
        console.error('Error details:', {
            code: error.code,
            command: error.command,
            response: error.response,
            responseCode: error.responseCode
        });
    } else {
        console.log('Email transporter is ready to send messages');
    }
});

async function sendOtpEmail(toEmail, otp) {
    console.log('Preparing to send OTP email to:', toEmail);
    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: toEmail,
        subject: 'Your Password Reset OTP Code',
        text: `Your OTP code for password reset is: ${otp}\nIt is valid for 5 minutes.`,
        html: `<p>Your OTP code for password reset is: <strong>${otp}</strong></p><p>It is valid for 5 minutes.</p>`,
    };
    try {
        console.log('Sending OTP email with options:', {
            from: mailOptions.from,
            to: mailOptions.to,
            subject: mailOptions.subject
        });
        const info = await transporter.sendMail(mailOptions);
        console.log('OTP email sent successfully:', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending OTP email:', error);
        console.error('Error details:', {
            code: error.code,
            command: error.command,
            response: error.response,
            responseCode: error.responseCode
        });
        throw new Error('Could not send OTP email.');
    }
}

async function sendLoginNotificationEmail(toEmail, name) {
    console.log('Preparing to send login notification email to:', toEmail);
    
    if (!process.env.EMAIL_FROM || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error('Email configuration missing:', {
            EMAIL_FROM: process.env.EMAIL_FROM ? 'Set' : 'Not Set',
            EMAIL_USER: process.env.EMAIL_USER ? 'Set' : 'Not Set',
            EMAIL_PASS: process.env.EMAIL_PASS ? 'Set' : 'Not Set'
        });
        throw new Error('Email configuration incomplete');
    }

    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: toEmail,
        subject: 'Welcome to Ace Your Placements!',
        text: `Hi ${name},\n\nWelcome to Ace Your Placements! You have successfully signed in to your account.\n\nWe're excited to have you on board and help you achieve your career goals.\n\nBest regards,\nThe AYP Team`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #4A90E2;">Welcome to Ace Your Placements!</h2>
                <p>Hi ${name},</p>
                <p>You have successfully signed in to your account.</p>
                <p>We're excited to have you on board and help you achieve your career goals. Our platform offers:</p>
                <ul>
                    <li>Comprehensive placement preparation resources</li>
                    <li>Personalized learning paths</li>
                    <li>Real-time progress tracking</li>
                    <li>Expert guidance and support</li>
                </ul>
                <p>If you have any questions or need assistance, feel free to reach out to our support team.</p>
                <p>Best regards,<br>The AYP Team</p>
            </div>
        `,
    };
    try {
        console.log('Sending login notification email with options:', {
            from: mailOptions.from,
            to: mailOptions.to,
            subject: mailOptions.subject
        });
        
        const info = await transporter.sendMail(mailOptions);
        console.log('Login notification email sent successfully:', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending login notification email:', error);
        console.error('Error details:', {
            code: error.code,
            command: error.command,
            response: error.response,
            responseCode: error.responseCode
        });
        throw new Error('Could not send login notification email.');
    }
}

module.exports = { sendOtpEmail, sendLoginNotificationEmail }; 