import {
	walk,
	walkSync
} from "./walk.ts";
Deno.test("Async", {
	permissions: {
		read: [Deno.cwd()]
	}
}, async () => {
	console.log(await Array.fromAsync(await walk(Deno.cwd(), {
		skips: [
			/^\.git[\\\/]/
		]
	})));
});
Deno.test("Sync", {
	permissions: {
		read: [Deno.cwd()]
	}
}, () => {
	console.log(Array.from(walkSync(Deno.cwd(), {
		skips: [
			/^\.git[\\\/]/
		]
	})));
});
