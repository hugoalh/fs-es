import { getHash } from "./hash.ts";
Deno.test("Main", {
	permissions: {
		read: [Deno.cwd()]
	}
}, async () => {
	console.log(await getHash(Deno.cwd()));
});
