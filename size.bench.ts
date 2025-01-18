import {
	getSize,
	getSizeSync
} from "./size.ts";
Deno.bench("Async", {
	permissions: {
		read: [Deno.cwd()]
	}
}, async () => {
	await getSize(Deno.cwd());
});
Deno.bench("Sync", {
	permissions: {
		read: [Deno.cwd()]
	}
}, () => {
	getSizeSync(Deno.cwd());
});
