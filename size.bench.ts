import {
	getSize,
	getSizeSync
} from "./size.ts";
Deno.bench("Async", {
	permissions: {
		read: [Deno.cwd()]
	}
}, async () => {
	await getSize();
});
Deno.bench("Sync", {
	permissions: {
		read: [Deno.cwd()]
	}
}, () => {
	getSizeSync();
});
