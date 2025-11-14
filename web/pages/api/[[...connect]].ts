import { ConnectRouter } from "@connectrpc/connect"
import { nextJsApiRouter } from "@connectrpc/connect-next"
import { createValidateInterceptor } from "@connectrpc/validate"
import { createAuthInterceptor } from "@/utils/connect-auth-interceptor"
import courseConnect from "@/lib/api/services/course_service"
import elizaConnect from "@/lib/api/services/eliza_service"

const { handler } = nextJsApiRouter({
	interceptors: [createValidateInterceptor(), createAuthInterceptor()],
	routes: (router: ConnectRouter) => {
		courseConnect(router)
		elizaConnect(router)
	},
})

export default handler

export const config = {
	api: {
		bodyParser: false,
		responseLimit: false,
	},
}
