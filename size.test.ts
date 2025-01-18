import { getSize } from "./size.ts";
Deno.test("Main", {
	permissions: {
		read: [Deno.cwd()]
	}
}, async () => {
	console.log(await getSize(Deno.cwd()));
});
