const nodemailer = require('nodemailer');

function createTransporter() {
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!user || !pass) {
        throw new Error('SMTP_USER and SMTP_PASS are not configured.');
    }

    return nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass },
    });
}

module.exports = async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { emails, campaign_title, campaign_message } = req.body;

        if (!emails || !Array.isArray(emails) || emails.length === 0) {
            return res.status(400).json({ status: 'error', message: 'emails array is required' });
        }
        if (!campaign_title) {
            return res.status(400).json({ status: 'error', message: 'campaign_title is required' });
        }

        const transporter = createTransporter();
        const smtpUser = process.env.SMTP_USER;

        const results = await Promise.allSettled(
            emails.map((email) =>
                transporter.sendMail({
                    from: `"Barangay 178 — Camarin, Caloocan" <${smtpUser}>`,
                    to: email,
                    subject: `Barangay 178 Safety Campaign: ${campaign_title}`,
                    // Plain text version — critical for avoiding spam filters
                    text: `
Barangay 178 Safety Campaign Notification
==========================================

Campaign: ${campaign_title}

Dear Resident,

${campaign_message || 'Please visit our portal for more details.'}

View full campaign details:
https://barangay178-safety-campaign.vercel.app/

--
Barangay 178 Administration
Camarin, North Caloocan City

This email was sent to you as a registered resident of Barangay 178.
                    `.trim(),
                    html: `
                        <!DOCTYPE html>
                        <html lang="en">
                        <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
                        <body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f8f9fa;">
                            <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
                                <div style="background:linear-gradient(135deg,#ea580c,#f97316);padding:30px;text-align:center;">
                                    <h1 style="color:#fff;font-size:22px;margin:0;">Barangay 178</h1>
                                    <p style="color:#fff7ed;font-size:13px;margin:6px 0 0;">Safety Campaign Management System · Camarin, North Caloocan City</p>
                                </div>
                                <div style="padding:28px;">
                                    <div style="background:#fff7ed;border-left:4px solid #ea580c;padding:16px 20px;margin-bottom:20px;border-radius:4px;">
                                        <p style="color:#9a3412;font-size:11px;font-weight:bold;margin:0 0 6px;text-transform:uppercase;letter-spacing:0.5px;">Campaign Announcement</p>
                                        <h2 style="color:#111827;margin:0;font-size:20px;">${campaign_title}</h2>
                                    </div>
                                    <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 12px;">Dear Resident,</p>
                                    <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 20px;">The Barangay 178 administration would like to inform you about the following safety campaign in our community:</p>
                                    <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:20px;margin:0 0 28px;">
                                        <p style="color:#374151;font-size:14px;line-height:1.8;margin:0;">${campaign_message || 'Please visit our portal for more details.'}</p>
                                    </div>
                                    <div style="text-align:center;margin-bottom:8px;">
                                        <a href="https://barangay178-safety-campaign.vercel.app/" style="display:inline-block;background:#ea580c;color:#fff;padding:13px 28px;text-decoration:none;border-radius:6px;font-weight:bold;font-size:15px;">
                                            View Campaign Details
                                        </a>
                                    </div>
                                </div>
                                <div style="background:#f8f9fa;padding:20px;text-align:center;border-top:1px solid #e5e7eb;">
                                    <p style="color:#6b7280;font-size:12px;margin:0 0 4px;">© ${new Date().getFullYear()} Barangay 178 Administration · Camarin, North Caloocan City</p>
                                    <p style="color:#9ca3af;font-size:11px;margin:0;">You received this email as a registered resident of Barangay 178.</p>
                                </div>
                            </div>
                        </body>
                        </html>
                    `,
                })
            )
        );

        const sent = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;
        const failures = results
            .map((r, i) => r.status === 'rejected' ? { email: emails[i], error: r.reason?.message } : null)
            .filter(Boolean);

        console.log(`[send-notification] ${sent} sent, ${failed} failed`);

        return res.status(200).json({
            status: 'success',
            success: true,
            sent,
            failed,
            total: emails.length,
            details: { failures },
        });

    } catch (error) {
        console.error('[send-notification] Error:', error.message);
        return res.status(500).json({ status: 'error', message: error.message });
    }
};
