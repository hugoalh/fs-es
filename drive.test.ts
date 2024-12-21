import { getDriveInfo } from "./drive.ts";
Deno.test("PowerShell Core", {
	permissions: {
		run: ["pwsh"]
	}
}, async () => {
	console.log(await getDriveInfo());
});
Deno.test("PowerShell Desktop", {
	ignore: Deno.build.os !== "windows",
	permissions: {
		run: ["powershell"]
	}
}, async () => {
	console.log(await getDriveInfo({ powershellPath: "powershell" }));
});
