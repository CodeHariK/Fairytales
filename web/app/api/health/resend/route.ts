import { Resend } from "resend"
import { env } from "@/utils/env"

export async function GET() {
	try {
		// Check if API key is configured
		if (!env.RESEND_API_KEY) {
			return Response.json(
				{
					ok: false,
					service: "resend",
					error: "RESEND_API_KEY is not configured",
				},
				{ status: 500 }
			)
		}

		// Check if FROM email is configured
		if (!env.RESEND_FROM_EMAIL) {
			return Response.json(
				{
					ok: false,
					service: "resend",
					error: "RESEND_FROM_EMAIL is not configured",
				},
				{ status: 500 }
			)
		}

		// Try to send a test email to verify Resend is working
		const resend = new Resend(env.RESEND_API_KEY)

		// Send test email to disposable email address for testing
		const testEmailResult = await resend.emails.send({
			from: env.RESEND_FROM_EMAIL,
			to: env.RESEND_TEST_EMAIL!,
			subject: "Resend Health Check Test",
			html: `
				<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
					<h2 style="color: #333;">Resend Health Check</h2>
					<p>This is a test email sent from the Resend health check endpoint.</p>
					<p>If you receive this email, Resend is working correctly!</p>
					<p>Timestamp: ${new Date().toISOString()}</p>
				</div>
			`,
			text: `Resend Health Check\n\nThis is a test email sent from the Resend health check endpoint.\n\nIf you receive this email, Resend is working correctly!\n\nTimestamp: ${new Date().toISOString()}`,
		})

		if (testEmailResult.error) {
			return Response.json(
				{
					ok: false,
					service: "resend",
					error: testEmailResult.error.message || "Failed to send test email",
				},
				{ status: 500 }
			)
		}

		return Response.json({
			ok: true,
			service: "resend",
			message: "Test email sent successfully to shadow@inboxbear.com",
			emailId: testEmailResult.data?.id,
		})
	} catch (error) {
		return Response.json(
			{
				ok: false,
				service: "resend",
				error: (error as Error).message,
			},
			{ status: 500 }
		)
	}
}
