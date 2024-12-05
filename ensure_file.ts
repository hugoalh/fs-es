import { dirname as getPathDirname } from "jsr:@std/path@^1.0.8/dirname";
import { fromFileUrl as getPathFromFileUrl } from "jsr:@std/path@^1.0.8/from-file-url";
import {
	getEntityTypeString,
	type EntityType
} from "./_entity_type.ts";
import {
	ensureDir,
	ensureDirSync
} from "./ensure_dir.ts";
/**
 * Ensure the file does exist, asynchronously.
 * 
 * If the file does exist, then nothing happened, otherwise it is created.
 * 
 * > **🛡️ Runtime Permissions**
 * > 
 * > - File System - Read \[Deno: `read`; NodeJS 🧪: `fs-read`\]
 * >   - *Resources*
 * > - File System - Write \[Deno: `write`; NodeJS 🧪: `fs-write`\]
 * >   - *Resources*
 * @param {string | URL} path Path of the file that need to ensure.
 * @returns {Promise<void>}
 * @example
 * ```ts
 * await ensureFile("./foo.dat");
 * ```
 */
export async function ensureFile(path: string | URL): Promise<void> {
	const pathFmt: string = (path instanceof URL) ? getPathFromFileUrl(path) : path;
	try {
		const entityType: EntityType = getEntityTypeString(await Deno.lstat(pathFmt));
		if (entityType !== "file") {
			throw new Error(`Unable to ensure the file \`${path}\` exist, path is a ${entityType}!`);
		}
	} catch (error) {
		if (!(error instanceof Deno.errors.NotFound)) {
			throw error;
		}
		await ensureDir(getPathDirname(pathFmt));
		await Deno.writeFile(pathFmt, new Uint8Array());
		return ensureFile(path);
	}
}
/**
 * Ensure the file does exist, synchronously.
 * 
 * If the file does exist, then nothing happened, otherwise it is created.
 * 
 * > **🛡️ Runtime Permissions**
 * > 
 * > - File System - Read \[Deno: `read`; NodeJS 🧪: `fs-read`\]
 * >   - *Resources*
 * > - File System - Write \[Deno: `write`; NodeJS 🧪: `fs-write`\]
 * >   - *Resources*
 * @param {string | URL} path Path of the file that need to ensure.
 * @returns {void}
 * @example
 * ```ts
 * ensureFileSync("./foo.dat");
 * ```
 */
export function ensureFileSync(path: string | URL): void {
	const pathFmt: string = (path instanceof URL) ? getPathFromFileUrl(path) : path;
	try {
		const entityType: EntityType = getEntityTypeString(Deno.lstatSync(pathFmt));
		if (entityType !== "file") {
			throw new Error(`Unable to ensure the file \`${path}\` exist, path is a ${entityType}!`);
		}
	} catch (error) {
		if (!(error instanceof Deno.errors.NotFound)) {
			throw error;
		}
		ensureDirSync(getPathDirname(pathFmt));
		Deno.writeFileSync(pathFmt, new Uint8Array());
		return ensureFileSync(path);
	}
}
