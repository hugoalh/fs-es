import {
	getHash,
	getHashSync
} from "./hash.ts";
Deno.bench("Async", {
	permissions: {
		read: [Deno.cwd()]
	}
}, async () => {
	await getHash(Deno.cwd());
});
Deno.bench("Sync", {
	permissions: {
		read: [Deno.cwd()]
	}
}, () => {
	getHashSync(Deno.cwd());
});
