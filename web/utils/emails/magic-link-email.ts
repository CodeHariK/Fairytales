import { sendEmail } from "./send-email"

export async function sendMagicLinkEmail({
	email,
	url,
	token,
}: {
	email: string
	url: string
	token: string
}) {
	return sendEmail({
		to: email,
		subject: "Sign in to your account",
		html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Sign in to your account</h2>
            <p>Hello,</p>
            <p>Click the button below to sign in to your account. This link will expire in 15 minutes.</p>
            <a href="${url}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 16px 0;">Sign In</a>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${url}</p>
            <p>If you didn't request this, please ignore this email.</p>
            <p>Best regards,<br>Your App Team</p>
        </div>
        `,
		text: `Sign in to your account\n\nHello,\n\nClick this link to sign in to your account: ${url}\n\nThis link will expire in 15 minutes.\n\nIf you didn't request this, please ignore this email.\n\nBest regards,\nYour App Team`,
	})
}
