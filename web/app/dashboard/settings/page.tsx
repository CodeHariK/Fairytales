import {
	ProvidersCard,
	ChangeEmailCard,
	UserButton,
	UpdateAvatarCard,
	UpdateUsernameCard,
	ChangePasswordCard,
	SessionsCard,
	DeleteAccountCard,
} from "@daveyplate/better-auth-ui"

export default function SettingsPage() {
	return (
		<div className="flex flex-col gap-6 mx-auto max-w-xl">
			<UserButton />
			<UserButton size="icon" />
			<UpdateAvatarCard />
			<UpdateUsernameCard />
			<ChangeEmailCard />
			<ChangePasswordCard />
			<ProvidersCard />
			<SessionsCard />
			<DeleteAccountCard />
		</div>
	)
}
