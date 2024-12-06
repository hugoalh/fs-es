import {
	getSize,
	getSizeSync
} from "./size.ts";
Deno.test("Async", {
	permissions: {
		read: [Deno.cwd()]
	}
}, async () => {
	console.log(await getSize());
});
Deno.test("Sync", {
	permissions: {
		read: [Deno.cwd()]
	}
}, () => {
	console.log(getSizeSync());
});
