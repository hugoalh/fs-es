import { fromFileUrl as getPathFromFileUrl } from "jsr:@std/path@^1.0.8/from-file-url";
import { join as joinPath } from "jsr:@std/path@^1.0.8/join";
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
	const pathFmt: string = (path instanceof URL) ? getPathFromFileUrl(path) : path;
	await ensureDir(pathFmt);
	const contents: Deno.DirEntry[] = await Array.fromAsync(Deno.readDir(pathFmt));
	const results: PromiseSettledResult<void>[] = await Promise.allSettled(contents.map(({ name }: Deno.DirEntry): Promise<void> => {
		return Deno.remove(joinPath(pathFmt, name), { recursive: true });
	}));
	const fails: PromiseRejectedResult[] = results.filter((result: PromiseSettledResult<void>): result is PromiseRejectedResult => {
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
	const pathFmt: string = (path instanceof URL) ? getPathFromFileUrl(path) : path;
	ensureDirSync(pathFmt);
	const fails: Error[] = [];
	for (const { name } of Deno.readDirSync(pathFmt)) {
		try {
			Deno.removeSync(joinPath(pathFmt, name), { recursive: true });
		} catch (error) {
			fails.push(error as Error);
		}
	}
	if (fails.length > 0) {
		throw new AggregateError(fails, `Unable to empty the directory \`${path}\`!`);
	}
}
export {
	emptyDirSync as emptyDirectorySync
};
