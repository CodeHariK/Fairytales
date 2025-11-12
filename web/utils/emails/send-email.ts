import { Resend } from "resend"
import { env } from "../env"

const resend = new Resend(env.RESEND_API_KEY)

export async function sendEmail({
	to,
	subject,
	html,
	text,
}: {
	to: string
	subject: string
	html: string
	text: string
}) {
	return resend.emails.send({
		from: env.RESEND_FROM_EMAIL!,
		to: to,
		subject: subject,
		html: html,
		text: text,
	})
}
