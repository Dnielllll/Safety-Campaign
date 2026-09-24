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
                    from: `"Barangay 178 System" <${smtpUser}>`,
                    to: email,
                    subject: `📢 Barangay 178 Campaign: ${campaign_title}`,
                    html: `
                        <!DOCTYPE html>
                        <html>
                        <body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f8f9fa;">
                            <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;">
                                <div style="background:linear-gradient(135deg,#ea580c,#f97316);padding:30px;text-align:center;">
                                    <h1 style="color:#fff;font-size:24px;margin:0;">Barangay 178</h1>
                                    <p style="color:#fff7ed;font-size:14px;margin:8px 0 0;">Safety Campaign Management System</p>
                                </div>
                                <div style="padding:24px;">
                                    <div style="background:#fff7ed;border-left:4px solid #ea580c;padding:20px;margin-bottom:20px;">
                                        <p style="color:#9a3412;font-size:12px;font-weight:bold;margin:0;text-transform:uppercase;">📢 Campaign Announcement</p>
                                        <h2 style="color:#111827;margin:8px 0 0;font-size:20px;">${campaign_title}</h2>
                                    </div>
                                    <p style="color:#374151;font-size:15px;line-height:1.7;">Dear Resident,</p>
                                    <p style="color:#374151;font-size:15px;line-height:1.7;">We are pleased to inform you about an important safety campaign in our community.</p>
                                    <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:20px;margin:20px 0;">
                                        <h3 style="color:#111827;margin:0 0 12px;font-size:16px;">📋 Campaign Details</h3>
                                        <p style="color:#374151;font-size:14px;line-height:1.8;margin:0;">${campaign_message || 'Please visit our portal for more details.'}</p>
                                    </div>
                                    <div style="text-align:center;margin:32px 0;">
                                        <a href="https://barangay178-safety-campaign.vercel.app/" style="display:inline-block;background:#ea580c;color:#fff;padding:14px 28px;text-decoration:none;border-radius:6px;font-weight:bold;font-size:15px;">
                                            View Campaign Details
                                        </a>
                                    </div>
                                </div>
                                <div style="background:#f8f9fa;padding:24px;text-align:center;border-top:1px solid #e5e7eb;">
                                    <p style="color:#6b7280;font-size:12px;margin:0;">© ${new Date().getFullYear()} Barangay 178 Administration · Camarin, North Caloocan City</p>
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
