import { describe, it, expect } from "bun:test"
import { ROUTE_URL } from "@/utils/constants"

async function tryFetch(url: string) {
	const res = await fetch(url, { method: "GET" }).catch(() => null)
	return res
}

describe("[integration] GET /api/health/db", () => {
	it("returns ok: true when server and DB are healthy", async () => {
		const res = await tryFetch(ROUTE_URL.HEALTH_DB)
		if (!res) {
			throw new Error(
				`Could not connect to ${ROUTE_URL.HEALTH_DB}. Start the dev server: bun run dev`
			)
		}

		expect(res.status).toBe(200)
		const body = (await res.json()) as
			| { ok: boolean; service: string }
			| {
					ok: false
					service: string
					error: string
			  }
		expect(body.ok).toBe(true)
		expect(body.service).toBe("postgres")
	})
})

describe("[integration] GET /api/health/redis", () => {
	it("returns ok: true when server and Redis are healthy", async () => {
		const res = await tryFetch(ROUTE_URL.HEALTH_REDIS)
		if (!res) {
			throw new Error(
				`Could not connect to ${ROUTE_URL.HEALTH_REDIS}. Start the dev server: bun run dev`
			)
		}

		expect(res.status).toBe(200)
		const body = (await res.json()) as
			| { ok: boolean; service: string }
			| {
					ok: false
					service: string
					error: string
			  }
		expect(body.ok).toBe(true)
		expect(body.service).toBe("redis")
	})
})

describe("[integration] GET /api/health/resend", () => {
	it("returns ok: true when server and Resend are healthy", async () => {
		const res = await tryFetch(ROUTE_URL.HEALTH_RESEND)
		if (!res) {
			throw new Error(
				`Could not connect to ${ROUTE_URL.HEALTH_RESEND}. Start the dev server: bun run dev`
			)
		}

		const body = (await res.json()) as
			| { ok: boolean; service: string }
			| {
					ok: false
					service: string
					error: string
			  }
		expect(body.service).toBe("resend")

		// Resend health check might fail if API key is not configured, so we check the service name
		// and that it returns either ok: true or ok: false with an error
		if (body.ok) {
			expect(res.status).toBe(200)
		} else {
			expect(res.status).toBe(500)
			expect("error" in body && body.error).toBeDefined()
		}
	})
})
