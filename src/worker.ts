/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export interface Env {
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	// MY_KV_NAMESPACE: KVNamespace;
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	// MY_DURABLE_OBJECT: DurableObjectNamespace;
	//
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	// MY_BUCKET: R2Bucket;
	//
	// Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
	// MY_SERVICE: Fetcher;
	//
	// Example binding to a Queue. Learn more at https://developers.cloudflare.com/queues/javascript-apis/
	// MY_QUEUE: Queue;
}

// const COUNTRY_DICT = {

// };

// // global: {
// // 	subdomain: undefined,
// // 	code: "WO",
// // 	name: "Global",
// // 	flag: "🌏",
// // },



const CANADA = {
	subdomain: "ca",
	supportedCountryCodes: ["CA"],
	name: "Canada",
	flag: "🇨🇦",
}

const GLOBAL = 	{
	name: "Global",
	flag: "🌏",
};

const REGION_MAP = [CANADA];


// const regionDict = {
// 	"ca": [COUNTRY_DICT.canada]
// };

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		// Get Cloudflare Referrer
		// Get Cloudflare Country
		//
		// Find the first region dictionary entry match
		// Check if there is a corrorsponding Cloudflare Country that matches the matched region
		//
		// Create API JSON response
		// {
		//   "country": {
		//     "code": "CA",
		//     "name": "Canada",
		//     "flag": "🇨🇦",
		//   }
		//   "region": {
		//	   "code": "ca",
		//	   "name": "Canada",
		//   }
		// }

		// https://api.cayenne-pepper.devon.pizza/

		const referrerHref = request.headers.get("Referer") ?? "";
		const countryCode = `${request.cf?.country ?? ""}`;

		// If no match then "global".
		const targetedRegion = REGION_MAP.find((region) => {
			const regionRegex = new RegExp(`.${region.subdomain}.`);
			return regionRegex.test(referrerHref);
		});

		const hasContextualCountry = Boolean(targetedRegion
			// Regional
			? targetedRegion?.supportedCountryCodes.includes(countryCode)

			// Global:
			: REGION_MAP.find((region) => !region.supportedCountryCodes.includes(countryCode))
		);


		const payload = JSON.stringify({
			hasContextualCountry,

			targetedRegion: targetedRegion ?? GLOBAL,

			contextualRegion: targetedRegion ?? REGION_MAP.find((region) => region.supportedCountryCodes.includes(countryCode))
		})

		return new Response(payload, {
			status: 200,
			statusText: "OK",
			headers: new Headers({
				"Content-Type": "application/json",
				"Access-Control-Allow-Origin": "*",
				"Access-Control-Allow-Methods": "GET, OPTIONS",
				"Access-Control-Allow-Headers": "Content-Type",
			})
		});
	},
};
