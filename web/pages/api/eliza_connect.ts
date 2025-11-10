import { ConnectRouter } from "@connectrpc/connect"
import { ElizaService } from "@/gen/eliza/v1/eliza_pb"
import type {
	SayRequest,
	IntroduceRequest,
	ConverseRequest,
} from "@/gen/eliza/v1/eliza_pb"

export default (router: ConnectRouter) =>
	router.service(ElizaService, {
		say(req: SayRequest) {
			return {
				sentence: `You said ${req.sentence}`,
			}
		},

		async *introduce(req: IntroduceRequest) {
			yield { sentence: `Hi ${req.name}, I'm Eliza` }
			await delay(250)
			yield {
				sentence: `Before we begin, ${req.name}, let me tell you something about myself.`,
			}
			await delay(250)
			yield { sentence: `I'm a Rogerian psychotherapist.` }
			await delay(250)
			yield { sentence: `How are you feeling today?` }
		},

		async *converse(reqs: AsyncIterable<ConverseRequest>) {
			for await (const req of reqs) {
				yield {
					sentence: `You said ${req.sentence}`,
				}
			}
		},
	})

function delay(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms))
}
