import { join as joinPath } from "jsr:@std/path@^1.0.8/join";
import { convertToPathString } from "./_path.ts";
import {
	ensureDir,
	ensureDirSync
} from "./ensure.ts";
/**
 * Ensure the directory is empty and no contents, asynchronously.
 * 
 * If the directory does not exist, then it is created. The directory itself is not deleted.
 * 
 * > **🛡️ Runtime Permissions**
 * > 
 * > - File System - Read \[Deno: `read`; NodeJS 🧪: `fs-read`\]
 * >   - *Resources*
 * > - File System - Write \[Deno: `write`; NodeJS 🧪: `fs-write`\]
 * >   - *Resources*
 * @param {string | URL} path Path of the directory that need to empty.
 * @returns {Promise<void>}
 * @example
 * ```ts
 * await emptyDir("./foo");
 * ```
 */
export async function emptyDir(path: string | URL): Promise<void> {
	const pathFmt: string = convertToPathString(path);
	await ensureDir(path);
	const results: readonly PromiseSettledResult<void>[] = await Promise.allSettled(await Array.fromAsync(Deno.readDir(path), ({ name }: Deno.DirEntry): Promise<void> => {
		return Deno.remove(joinPath(pathFmt, name), { recursive: true });
	}));
	const fails: readonly PromiseRejectedResult[] = results.filter((result: PromiseSettledResult<void>): result is PromiseRejectedResult => {
		return (result.status === "rejected");
	});
	if (fails.length > 0) {
		throw new AggregateError(fails.map((fail: PromiseRejectedResult): Error => {
			return fail.reason as Error;
		}), `Unable to empty the directory \`${path}\`!`);
	}
}
export {
	emptyDir as emptyDirectory
};
/**
 * Ensure the directory is empty and no contents, synchronously.
 * 
 * If the directory does not exist, then it is created. The directory itself is not deleted.
 * 
 * > **🛡️ Runtime Permissions**
 * > 
 * > - File System - Read \[Deno: `read`; NodeJS 🧪: `fs-read`\]
 * >   - *Resources*
 * > - File System - Write \[Deno: `write`; NodeJS 🧪: `fs-write`\]
 * >   - *Resources*
 * @param {string | URL} path Path of the directory that need to empty.
 * @returns {void}
 * @example
 * ```ts
 * emptyDirSync("./foo");
 * ```
 */
export function emptyDirSync(path: string | URL): void {
	const pathFmt: string = convertToPathString(path);
	ensureDirSync(path);
	const errors: Error[] = [];
	for (const { name } of Deno.readDirSync(path)) {
		try {
			Deno.removeSync(joinPath(pathFmt, name), { recursive: true });
		} catch (error) {
			errors.push(error as Error);
		}
	}
	if (errors.length > 0) {
		throw new AggregateError(errors, `Unable to empty the directory \`${path}\`!`);
	}
}
export {
	emptyDirSync as emptyDirectorySync
};
