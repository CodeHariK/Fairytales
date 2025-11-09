import { nextJsApiRouter } from "@connectrpc/connect-next"
import { createValidateInterceptor } from "@connectrpc/validate"
import routes from "./connect"

const { handler } = nextJsApiRouter({
	interceptors: [createValidateInterceptor()],
	routes,
})

export default handler

export const config = {
	api: {
		bodyParser: false,
		responseLimit: false,
	},
}
