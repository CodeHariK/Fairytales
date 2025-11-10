import { ConnectRouter } from "@connectrpc/connect"
import { nextJsApiRouter } from "@connectrpc/connect-next"
import { createValidateInterceptor } from "@connectrpc/validate"
import courseConnect from "./course_connect"
import elizaConnect from "./eliza_connect"

const { handler } = nextJsApiRouter({ 
	interceptors: [createValidateInterceptor()],
	routes: (router: ConnectRouter)=>{
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

