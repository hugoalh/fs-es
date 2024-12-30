import { walk } from "./walk.ts";
Deno.test("Main", {
	permissions: {
		read: [Deno.cwd()]
	}
}, async () => {
	console.log(await Array.fromAsync(await walk(Deno.cwd(), {
		extraInfo: true,
		skips: [
			/^\.git(?:\/|\\|$)/
		]
	})));
});
