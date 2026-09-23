const express = require('express');
const nodemailer = require('nodemailer');

const router = express.Router();

/**
 * Creates a reusable Gmail transporter with enhanced deliverability settings.
 */
function createTransporter() {
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!user || !pass || user === 'your-gmail@gmail.com' || pass === 'your-app-password-here') {
        throw new Error('SMTP_USER and SMTP_PASS are not properly configured in .env. Please set your Gmail credentials.');
    }

    console.log('[mail] Creating Gmail transporter with user:', user);
    
    return nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass },
        // Enhanced deliverability settings
        pool: true,
        maxConnections: 3, // Reduced to prevent rate limiting
        maxMessages: 50,   // Reduced to prevent rate limiting
        rateDelta: 1000,    // Rate limiting: 1 second between emails
        rateLimit: 5,       // Max 5 emails per second
        // Add debug mode in development
        logger: process.env.NODE_ENV === 'development',
        debug: process.env.NODE_ENV === 'development',
        // TLS configuration for better security
        tls: {
            rejectUnauthorized: true
        }
    });
}

// ─── POST /mail/send-otp ──────────────────────────────────────────────────────
// Sends a 6-digit OTP to the user's email on login.
router.post('/send-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ status: 'error', message: 'Email and OTP are required' });
        }

        const transporter = createTransporter();
        const smtpUser = process.env.SMTP_USER;

        await transporter.sendMail({
            from: `"Barangay 178 System" <${smtpUser}>`,
            to: email,
            subject: 'Your Login OTP - Barangay 178 System',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e5e7eb; border-radius: 12px; background: #fff;">
                    <div style="text-align: center; margin-bottom: 24px;">
                        <h2 style="color: #ea580c; font-size: 22px; margin: 0;">Barangay 178</h2>
                        <p style="color: #6b7280; font-size: 13px; margin: 4px 0 0;">Safety Campaign Management System</p>
                    </div>
                    <p style="color: #111827; font-size: 15px;">Hello,</p>
                    <p style="color: #374151; font-size: 14px;">You requested to log in. Here is your One-Time Password:</p>
                    <div style="background: #fff7ed; border: 2px dashed #ea580c; padding: 20px; border-radius: 8px; text-align: center; margin: 24px 0;">
                        <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #ea580c;">${otp}</span>
                    </div>
                    <p style="color: #6b7280; font-size: 13px;">⏰ This code is valid for <strong>2 minutes</strong>. Do not share it with anyone.</p>
                    <p style="color: #6b7280; font-size: 13px;">If you did not request this, please ignore this email.</p>
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
                    <p style="color: #9ca3af; font-size: 12px; text-align: center;">
                        © ${new Date().getFullYear()} Barangay 178 Administration · Camarin, North Caloocan City
                    </p>
                </div>
            `,
            // Enhanced headers for deliverability
            headers: {
                'X-Priority': '1', // High priority
                'X-MSMail-Priority': 'High',
                'Importance': 'high',
                'X-Mailer': 'Barangay 178 System',
                'X-Auto-Response-Suppress': 'All',
                'Precedence': 'bulk',
            }
        });

        console.log(`[mail] OTP email sent to ${email}`);
        return res.json({ status: 'success', message: 'OTP sent successfully' });

    } catch (error) {
        console.error('[mail] Error sending OTP:', error.message);
        return res.status(500).json({ status: 'error', message: 'Failed to send OTP email', error: error.message });
    }
});

// ─── POST /mail/send-welcome ─────────────────────────────────────────────────
// Sends a welcome + account activation reminder email after resident sign-up.
router.post('/send-welcome', async (req, res) => {
    try {
        const { email, name } = req.body;
        if (!email || !name) {
            return res.status(400).json({ status: 'error', message: 'Email and name are required' });
        }

        const transporter = createTransporter();
        const smtpUser = process.env.SMTP_USER;

        await transporter.sendMail({
            from: `"Barangay 178 System" <${smtpUser}>`,
            to: email,
            subject: 'Welcome to Barangay 178 — Your Account is Ready!',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Welcome to Barangay 178</title>
                </head>
                <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8f9fa;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                        <!-- Header Section -->
                        <div style="background: linear-gradient(135deg, #ea580c 0%, #f97316 100%); padding: 30px; text-align: center;">
                            <h1 style="color: #ffffff; font-size: 24px; margin: 0; font-weight: bold;">Welcome to Barangay 178!</h1>
                            <p style="color: #fff7ed; font-size: 14px; margin: 8px 0 0;">Safety Campaign Management System</p>
                        </div>
                        
                        <!-- Main Content -->
                        <div style="padding: 24px;">
                            <p style="color: #111827; font-size: 15px; line-height: 1.7; margin: 0 0 16px;">
                                Hello, <strong>${name}</strong>!
                            </p>
                            <p style="color: #374151; font-size: 15px; line-height: 1.7; margin: 0 0 16px;">
                                Your resident account has been successfully created. You are now part of the Barangay 178 community in Camarin, North Caloocan City.
                            </p>

                            <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 20px 0;">
                                <p style="color: #15803d; font-size: 14px; margin: 0; font-weight: bold;">✅ Account Created Successfully</p>
                            </div>

                            <p style="color: #374151; font-size: 15px; line-height: 1.7; margin: 0 0 16px;">
                                You will be able to access:
                            </p>
                            <ul style="color: #374151; font-size: 14px; line-height: 1.8; margin: 0 0 16px;">
                                <li>📢 Receive safety campaign announcements</li>
                                <li>🚨 Get emergency alerts via SMS</li>
                                <li>🔊 Access AI voice announcements</li>
                                <li>🗺️ View community updates</li>
                                <li>🤝 Submit feedback and concerns</li>
                            </ul>

                            <!-- Call to Action -->
                            <div style="text-align: center; margin: 32px 0;">
                                <a href="https://barangay178-safety-campaign.vercel.app/login" style="display: inline-block; background-color: #ea580c; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 15px;">
                                    Log In to Your Account
                                </a>
                            </div>

                            <!-- Important Notice -->
                            <div style="background-color: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 16px; margin: 20px 0;">
                                <p style="color: #92400e; font-size: 13px; margin: 0;">
                                    <strong>📌 Important:</strong> Your account is ready to use. Simply log in with your email and password to access all features.
                                </p>
                            </div>
                        </div>
                        
                        <!-- Footer -->
                        <div style="background-color: #f8f9fa; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
                            <p style="color: #6b7280; font-size: 12px; margin: 0 0 8px;">
                                © ${new Date().getFullYear()} Barangay 178 Administration
                            </p>
                            <p style="color: #9ca3af; font-size: 11px; margin: 0;">
                                Camarin, North Caloocan City
                            </p>
                            <p style="color: #9ca3af; font-size: 11px; margin: 8px 0 0;">
                                If you did not create this account, please ignore this email.
                            </p>
                        </div>
                    </div>
                </body>
                </html>
            `,
            // Enhanced headers for deliverability
            headers: {
                'X-Priority': '1', // High priority
                'X-MSMail-Priority': 'High',
                'Importance': 'high',
                'X-Mailer': 'Barangay 178 System',
                'X-Auto-Response-Suppress': 'All',
                'Precedence': 'bulk',
            }
        });

        console.log(`[mail] Welcome email sent to ${email}`);
        return res.json({ status: 'success', message: 'Welcome email sent successfully' });

    } catch (error) {
        console.error('[mail] Error sending welcome email:', error.message);
        return res.status(500).json({ status: 'error', message: 'Failed to send welcome email', error: error.message });
    }
});

// ─── POST /mail/send-campaign ─────────────────────────────────────────────────
// Sends a campaign notification email to multiple recipients with Gmail optimization.
router.post('/send-campaign', async (req, res) => {
    try {
        const { recipients, campaign_title, campaign_description, campaign_objectives, from_name, from_email, subject, reply_to } = req.body;
        
        // Support both old and new parameter names for backward compatibility
        const emails = recipients || req.body.emails;
        const message = campaign_description || req.body.campaign_message;
        
        if (!emails || !Array.isArray(emails) || emails.length === 0) {
            return res.status(400).json({ status: 'error', message: 'emails array is required' });
        }
        if (!campaign_title) {
            return res.status(400).json({ status: 'error', message: 'campaign_title is required' });
        }

        console.log(`[mail] Processing campaign email to ${emails.length} recipients for campaign: ${campaign_title}`);
        console.log(`[mail] Email addresses:`, emails);

        let transporter;
        try {
            transporter = createTransporter();
        } catch (error) {
            console.error('[mail] Failed to create transporter:', error.message);
            return res.status(500).json({ 
                status: 'error', 
                success: false,
                message: 'SMTP configuration error. Please check SMTP_USER and SMTP_PASS environment variables.', 
                error: error.message 
            });
        }
        
        const smtpUser = process.env.SMTP_USER;
        const senderName = from_name || "Barangay 178 System";
        const senderEmail = from_email || smtpUser;
        const replyToEmail = reply_to || smtpUser;
        const emailSubject = subject || `📢 Barangay 178 Campaign: ${campaign_title}`;

        // Gmail-optimized HTML template with proper structure and personalization
        const generatePersonalizedBody = (recipientName = '') => {
            const greeting = recipientName ? `Dear ${recipientName},` : 'Dear Resident,';
            return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${campaign_title}</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8f9fa;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header Section -->
                    <div style="background: linear-gradient(135deg, #ea580c 0%, #f97316 100%); padding: 30px; text-align: center;">
                        <h1 style="color: #ffffff; font-size: 24px; margin: 0; font-weight: bold;">Barangay 178</h1>
                        <p style="color: #fff7ed; font-size: 14px; margin: 8px 0 0;">Safety Campaign Management System</p>
                    </div>
                    
                    <!-- Campaign Banner -->
                    <div style="background-color: #fff7ed; border-left: 4px solid #ea580c; padding: 20px; margin: 24px 24px 0;">
                        <p style="color: #9a3412; font-size: 12px; font-weight: bold; margin: 0; text-transform: uppercase; letter-spacing: 1px;">📢 Campaign Announcement</p>
                        <h2 style="color: #111827; margin: 8px 0 0; font-size: 20px;">${campaign_title}</h2>
                    </div>
                    
                    <!-- Main Content -->
                    <div style="padding: 24px;">
                        <p style="color: #374151; font-size: 15px; line-height: 1.7; margin: 0 0 16px;">
                            ${greeting}
                        </p>
                        <p style="color: #374151; font-size: 15px; line-height: 1.7; margin: 0 0 16px;">
                            We are pleased to inform you about an important safety campaign in our community:
                        </p>
                        
                        ${campaign_objectives ? `
                        <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 20px 0;">
                            <h3 style="color: #15803d; margin: 0 0 12px; font-size: 16px;">🎯 Campaign Objectives</h3>
                            <p style="color: #166534; font-size: 14px; line-height: 1.6; margin: 0;">${campaign_objectives}</p>
                        </div>
                        ` : ''}
                        
                        <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
                            <h3 style="color: #111827; margin: 0 0 12px; font-size: 16px;">📋 Campaign Details</h3>
                            <div style="color: #374151; font-size: 14px; line-height: 1.8; margin: 0; white-space: pre-wrap; word-wrap: break-word;">${message || 'Please visit our portal for more details about this campaign.'}</div>
                        </div>
                        
                        <!-- Call to Action -->
                        <div style="text-align: center; margin: 32px 0;">
                            <a href="https://barangay178-safety-campaign.vercel.app/" style="display: inline-block; background-color: #ea580c; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 15px;">
                                View Campaign Details
                            </a>
                        </div>
                        
                        <!-- Important Notice -->
                        <div style="background-color: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 16px; margin: 20px 0;">
                            <p style="color: #92400e; font-size: 13px; margin: 0;">
                                <strong>⚠️ Important:</strong> This is an official announcement from Barangay 178. Please stay informed about community safety initiatives.
                            </p>
                        </div>
                    </div>
                    
                    <!-- Footer -->
                    <div style="background-color: #f8f9fa; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
                        <p style="color: #6b7280; font-size: 12px; margin: 0 0 8px;">
                            © ${new Date().getFullYear()} Barangay 178 Administration
                        </p>
                        <p style="color: #9ca3af; font-size: 11px; margin: 0;">
                            Camarin, North Caloocan City
                        </p>
                        <p style="color: #9ca3af; font-size: 11px; margin: 8px 0 0;">
                            <a href="https://barangay178-safety-campaign.vercel.app/unsubscribe" style="color: #9ca3af; text-decoration: underline;">Unsubscribe from future emails</a>
                        </p>
                    </div>
                </div>
            </body>
            </html>
        `;
        };

        // Send emails with personalization and Gmail optimization with rate limiting
        const results = [];
        const batchSize = 5; // Send in batches to avoid rate limiting
        const delay = 2000; // 2 second delay between batches
        
        for (let i = 0; i < emails.length; i += batchSize) {
            const batch = emails.slice(i, i + batchSize);
            const batchResults = await Promise.allSettled(
                batch.map((recipient) => {
                    const emailAddress = typeof recipient === 'string' ? recipient : recipient.email;
                    const recipientName = typeof recipient === 'object' ? recipient.name : '';
                    
                    console.log(`[mail] Sending email to: ${emailAddress}`);
                    
                    return transporter.sendMail({
                        from: `"${senderName}" <${senderEmail}>`,
                        to: emailAddress,
                        replyTo: replyToEmail,
                        subject: emailSubject,
                        html: generatePersonalizedBody(recipientName),
                        // Enhanced deliverability headers
                        headers: {
                            'X-Priority': '1', // High priority
                            'X-MSMail-Priority': 'High',
                            'Importance': 'high',
                            'X-Mailer': 'Barangay 178 Campaign System',
                            'X-Auto-Response-Suppress': 'All',
                            'Precedence': 'bulk',
                            'List-Unsubscribe': `<https://barangay178-safety-campaign.vercel.app/unsubscribe>, <mailto:${replyToEmail}?subject=unsubscribe>`,
                            'X-Campaign-Id': campaign_title.replace(/\s+/g, '-').toLowerCase(),
                        },
                        // Text version for fallback with proper formatting
                        text: `
Barangay 178 Safety Campaign

${campaign_title}

${message || 'Please visit our portal for more details about this campaign.'}

---
© ${new Date().getFullYear()} Barangay 178 Administration
Camarin, North Caloocan City
                        `.trim(),
                    });
                })
            );
            
            results.push(...batchResults);
            
            // Add delay between batches to avoid rate limiting
            if (i + batchSize < emails.length) {
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }

        const sent    = results.filter(r => r.status === 'fulfilled').length;
        const failed  = results.filter(r => r.status === 'rejected').length;
        
        // Collect detailed failure information
        const failures = results
            .map((result, index) => {
                if (result.status === 'rejected') {
                    const emailAddress = typeof emails[index] === 'string' ? emails[index] : emails[index].email;
                    return {
                        email: emailAddress,
                        error: result.reason?.message || 'Unknown error'
                    };
                }
                return null;
            })
            .filter(Boolean);

        console.log(`[mail] Campaign email sent: ${sent} success, ${failed} failed`);
        if (failures.length > 0) {
            console.warn('[mail] Failed email details:', failures);
        }
        
        return res.json({
            status:  'success',
            success: true,
            sent,
            failed,
            total:   emails.length,
            message: `Campaign email sent to ${sent}/${emails.length} recipients`,
            details: {
                total: emails.length,
                success_count: sent,
                failure_count: failed,
                failures: failures // Include detailed failure information
            }
        });

    } catch (error) {
        console.error('[mail] Error sending campaign email:', error.message);
        return res.status(500).json({ 
            status: 'error', 
            success: false,
            message: 'Failed to send campaign emails', 
            error: error.message 
        });
    }
});

module.exports = router;
