import { getDriveInfo } from "./drive.ts";
Deno.test("Main", {
	permissions: {
		run: ["pwsh"]
	}
}, async () => {
	console.log(await getDriveInfo());
});
