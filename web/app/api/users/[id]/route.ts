import { NextResponse } from "next/server"

type Data = {
	id: string
	name: string
	email: string
}

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	const { id } = await params

	return NextResponse.json({
		id: id,
		name: "Ciirella",
		email: "ciirella@twitch.com",
	})
}

