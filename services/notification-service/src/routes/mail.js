const express = require('express');
const { Resend } = require('resend');

const router = express.Router();

function getResendClient() {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        throw new Error('RESEND_API_KEY is not properly configured in .env.');
    }
    return new Resend(apiKey);
}

// ─── POST /mail/send-otp ──────────────────────────────────────────────────────
router.post('/send-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ status: 'error', message: 'Email and OTP are required' });
        }

        const resend = getResendClient();
        
        // Note: Resend requires a verified domain. If you don't have one, 
        // you must use 'onboarding@resend.dev' and can only send to yourself.
        // Once you verify a domain, use e.g. 'notifications@yourdomain.com'
        const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

        const { data, error } = await resend.emails.send({
            from: `Barangay 178 System <${fromEmail}>`,
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
            `
        });

        if (error) {
            throw new Error(error.message);
        }

        console.log(`[mail] OTP email sent to ${email}`);
        return res.json({ status: 'success', message: 'OTP sent successfully' });

    } catch (error) {
        console.error('[mail] Error sending OTP:', error.message);
        return res.status(500).json({ status: 'error', message: 'Failed to send OTP email', error: error.message });
    }
});

// ─── POST /mail/send-welcome ─────────────────────────────────────────────────
router.post('/send-welcome', async (req, res) => {
    try {
        const { email, name } = req.body;
        if (!email || !name) {
            return res.status(400).json({ status: 'error', message: 'Email and name are required' });
        }

        const resend = getResendClient();
        const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

        const { data, error } = await resend.emails.send({
            from: `Barangay 178 System <${fromEmail}>`,
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
                        </div>
                        
                        <!-- Footer -->
                        <div style="background-color: #f8f9fa; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
                            <p style="color: #6b7280; font-size: 12px; margin: 0 0 8px;">
                                © ${new Date().getFullYear()} Barangay 178 Administration
                            </p>
                        </div>
                    </div>
                </body>
                </html>
            `
        });

        if (error) {
            throw new Error(error.message);
        }

        console.log(`[mail] Welcome email sent to ${email}`);
        return res.json({ status: 'success', message: 'Welcome email sent successfully' });

    } catch (error) {
        console.error('[mail] Error sending welcome email:', error.message);
        return res.status(500).json({ status: 'error', message: 'Failed to send welcome email', error: error.message });
    }
});

// ─── POST /mail/send-notification ─────────────────────────────────────────────────
router.post('/send-notification', async (req, res) => {
    try {
        const { recipients, campaign_title, campaign_description, campaign_objectives, from_name } = req.body;
        
        const emails = recipients || req.body.emails;
        const message = campaign_description || req.body.campaign_message;
        
        if (!emails || !Array.isArray(emails) || emails.length === 0) {
            return res.status(400).json({ status: 'error', message: 'emails array is required' });
        }
        if (!campaign_title) {
            return res.status(400).json({ status: 'error', message: 'campaign_title is required' });
        }

        let resend;
        try {
            resend = getResendClient();
        } catch (error) {
            return res.status(500).json({ status: 'error', message: error.message });
        }
        
        const senderName = from_name || "Barangay 178 System";
        const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
        const emailSubject = \`📢 Barangay 178 Campaign: \${campaign_title}\`;

        const results = [];
        const batchSize = 10;
        
        for (let i = 0; i < emails.length; i += batchSize) {
            const batch = emails.slice(i, i + batchSize);
            const batchResults = await Promise.allSettled(
                batch.map(async (recipient) => {
                    const emailAddress = typeof recipient === 'string' ? recipient : recipient.email;
                    
                    const { data, error } = await resend.emails.send({
                        from: \`\${senderName} <\${fromEmail}>\`,
                        to: emailAddress,
                        subject: emailSubject,
                        html: \`
                            <div style="font-family: Arial, sans-serif; padding: 20px;">
                                <h2 style="color: #ea580c;">\${campaign_title}</h2>
                                <p>\${message || 'Please visit our portal for more details.'}</p>
                            </div>
                        \`
                    });

                    if (error) {
                        throw new Error(error.message);
                    }
                    return data;
                })
            );
            
            results.push(...batchResults);
        }

        const sent = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;
        
        const failures = results
            .map((result, index) => {
                if (result.status === 'rejected') {
                    const emailAddress = typeof emails[index] === 'string' ? emails[index] : emails[index].email;
                    return { email: emailAddress, error: result.reason?.message || 'Unknown error' };
                }
                return null;
            })
            .filter(Boolean);

        return res.json({
            status: 'success',
            success: true,
            sent,
            failed,
            total: emails.length,
            details: { failures }
        });

    } catch (error) {
        console.error('[mail] Error sending campaign email:', error.message);
        return res.status(500).json({ status: 'error', message: 'Failed to send campaign emails', error: error.message });
    }
});

module.exports = router;
