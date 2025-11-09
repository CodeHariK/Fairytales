import type { NextApiRequest, NextApiResponse } from "next"

type Data = {
	message: string
	timestamp: string
}

export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
	if (req.method === "GET") {
		res.status(200).json({
			message: "Hello from Next.js API route!",
			timestamp: new Date().toISOString(),
		})
	} else {
		res.setHeader("Allow", ["GET"])
		res.status(405).end(`Method ${req.method} Not Allowed`)
	}
}
