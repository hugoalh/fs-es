import { getHash } from "./hash.ts";
Deno.bench("Main", {
	permissions: {
		read: [Deno.cwd()]
	}
}, async () => {
	await getHash(Deno.cwd());
});
