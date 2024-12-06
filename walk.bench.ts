import {
	walk,
	walkSync
} from "./walk.ts";
Deno.bench("Async", {
	permissions: {
		read: [Deno.cwd()]
	}
}, async () => {
	await Array.fromAsync(await walk(Deno.cwd(), {
		skips: [
			/^\.git[\\\/]/
		]
	}));
});
Deno.bench("Sync", {
	permissions: {
		read: [Deno.cwd()]
	}
}, () => {
	Array.from(walkSync(Deno.cwd(), {
		skips: [
			/^\.git[\\\/]/
		]
	}));
});
