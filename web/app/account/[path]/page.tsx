import { AccountView } from "@daveyplate/better-auth-ui"
import { accountViewPaths } from "@daveyplate/better-auth-ui/server"
import { SimpleHeader } from "@/components/nav/simple-header"

import {
	UpdateAvatarCard,
	UpdateNameCard,
	UpdateUsernameCard,
	ChangeEmailCard,
	ChangePasswordCard,
	ProvidersCard,
	SessionsCard,
	DeleteAccountCard,
	UpdateFieldCard,
} from "@daveyplate/better-auth-ui"

export function generateStaticParams() {
	return Object.values(accountViewPaths).map((path) => ({ path }))
}

export default async function AccountPage({ params }: { params: Promise<{ path: string }> }) {
	const { path } = await params

	return (
		<>
			<SimpleHeader />
			<main className="container p-4 md:p-6">
				<AccountView path={path} />
			</main>
		</>
	)
}
