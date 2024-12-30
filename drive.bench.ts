import {
	getDriveInfo,
	getDriveInfoSync
} from "./drive.ts";
Deno.bench("Async", {
	permissions: {
		run: ["pwsh"]
	}
}, async () => {
	await getDriveInfo();
});
Deno.bench("Sync", {
	permissions: {
		run: ["pwsh"]
	}
}, () => {
	getDriveInfoSync();
});
