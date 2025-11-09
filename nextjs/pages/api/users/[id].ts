import type { NextApiRequest, NextApiResponse } from "next"

type Data = {
	id: string
	name: string
	email: string
}

type Error = {
	error: string
}

export default function handler(req: NextApiRequest, res: NextApiResponse<Data | Error>) {
	const { id } = req.query

	if (req.method === "GET") {
		// Example: fetch user by ID
		res.status(200).json({
			id: id as string,
			name: "Ciirella",
			email: "ciirella@twitch.com",
		})
	} else {
		res.setHeader("Allow", ["GET"])
		res.status(405).end(`Method ${req.method} Not Allowed`)
	}
}
