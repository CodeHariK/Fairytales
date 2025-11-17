import type Stripe from "stripe"
import { db } from "./pg"
import { enrollment } from "@/schema/schema"
import { eq } from "drizzle-orm"

/**
 * Handles Stripe webhook events for course enrollments
 */
export async function handleStripeEvent(event: Stripe.Event) {
	console.log("Stripe event:", event.type)

	// Handle one-time payment events for course enrollments
	switch (event.type) {
		case "checkout.session.completed": {
			const session = event.data.object as Stripe.Checkout.Session

			// Only handle one-time payments (not subscriptions)
			if (session.mode === "payment" && session.metadata?.enrollmentId) {
				await completeEnrollment(session.metadata.enrollmentId, session.payment_intent as string)
			}
			break
		}
		case "payment_intent.succeeded": {
			const paymentIntent = event.data.object as Stripe.PaymentIntent

			// Find enrollment by payment intent ID
			const enrollmentRecord = await db.query.enrollment.findFirst({
				where: (enrollment, { eq }) => eq(enrollment.stripePaymentIntentId, paymentIntent.id),
			})

			if (enrollmentRecord && enrollmentRecord.status === "pending") {
				await completeEnrollment(enrollmentRecord.id, paymentIntent.id)
			}
			break
		}
	}
}

/**
 * Completes an enrollment by updating its status to "completed"
 */
async function completeEnrollment(enrollmentId: string, paymentIntentId: string) {
	await db
		.update(enrollment)
		.set({
			status: "completed",
			stripePaymentIntentId: paymentIntentId,
		})
		.where(eq(enrollment.id, enrollmentId))

	console.log(`Enrollment ${enrollmentId} completed`)
}
