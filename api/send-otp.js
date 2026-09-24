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
                <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:30px;border:1px solid #e5e7eb;border-radius:12px;background:#fff;">
                    <div style="text-align:center;margin-bottom:24px;">
                        <h2 style="color:#ea580c;font-size:22px;margin:0;">Barangay 178</h2>
                        <p style="color:#6b7280;font-size:13px;margin:4px 0 0;">Safety Campaign Management System</p>
                    </div>
                    <p style="color:#111827;font-size:15px;">Hello,</p>
                    <p style="color:#374151;font-size:14px;">Here is your One-Time Password:</p>
                    <div style="background:#fff7ed;border:2px dashed #ea580c;padding:20px;border-radius:8px;text-align:center;margin:24px 0;">
                        <span style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#ea580c;">${otp}</span>
                    </div>
                    <p style="color:#6b7280;font-size:13px;">⏰ This code is valid for <strong>2 minutes</strong>. Do not share it with anyone.</p>
                    <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
                    <p style="color:#9ca3af;font-size:12px;text-align:center;">© ${new Date().getFullYear()} Barangay 178 Administration · Camarin, North Caloocan City</p>
                </div>
            `,
        });

        console.log(`[send-otp] OTP sent to ${email}`);
        return res.status(200).json({ status: 'success', message: 'OTP sent successfully' });

    } catch (error) {
        console.error('[send-otp] Error:', error.message);
        return res.status(500).json({ status: 'error', message: error.message });
    }
};
