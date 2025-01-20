import { assertEquals } from "STD/assert/equals";
import {
	getHash,
	getHashSync
} from "./hash.ts";
Deno.test("Main", {
	permissions: {
		read: [Deno.cwd()]
	}
}, async (t) => {
	let resultAsync: string;
	let resultSync: string;
	await t.step("Async", async () => {
		resultAsync = await getHash(Deno.cwd());
	});
	console.log(resultAsync!);
	await t.step("Sync", () => {
		resultSync = getHashSync(Deno.cwd());
	});
	console.log(resultSync!);
	assertEquals(resultSync!, resultAsync!);
});
