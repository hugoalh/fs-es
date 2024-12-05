import {
	getEntityTypeString,
	type EntityType
} from "./_entity_type.ts";
/**
 * Ensure the directory does exist, asynchronously.
 * 
 * If the directory does exist, then nothing happened, otherwise it is created.
 * 
 * > **🛡️ Runtime Permissions**
 * > 
 * > - File System - Read \[Deno: `read`; NodeJS 🧪: `fs-read`\]
 * >   - *Resources*
 * > - File System - Write \[Deno: `write`; NodeJS 🧪: `fs-write`\]
 * >   - *Resources*
 * @param {string | URL} path Path of the directory that need to ensure.
 * @returns {Promise<void>}
 * @example
 * ```ts
 * await ensureDir("./foo");
 * ```
 */
export async function ensureDir(path: string | URL): Promise<void> {
	try {
		const entityType: EntityType = getEntityTypeString(await Deno.lstat(path));
		if (entityType !== "directory") {
			throw new Error(`Unable to ensure the directory \`${path}\` exist, path is a ${entityType}!`);
		}
	} catch (error) {
		if (!(error instanceof Deno.errors.NotFound)) {
			throw error;
		}
		await Deno.mkdir(path, { recursive: true });
		return ensureDir(path);
	}
}
export {
	ensureDir as ensureDirectory
};
/**
 * Ensure the directory does exist, synchronously.
 * 
 * If the directory does exist, then nothing happened, otherwise it is created.
 * 
 * > **🛡️ Runtime Permissions**
 * > 
 * > - File System - Read \[Deno: `read`; NodeJS 🧪: `fs-read`\]
 * >   - *Resources*
 * > - File System - Write \[Deno: `write`; NodeJS 🧪: `fs-write`\]
 * >   - *Resources*
 * @param {string | URL} path Path of the directory that need to ensure.
 * @returns {void}
 * @example
 * ```ts
 * ensureDirSync("./foo");
 * ```
 */
export function ensureDirSync(path: string | URL): void {
	try {
		const entityType: EntityType = getEntityTypeString(Deno.lstatSync(path));
		if (entityType !== "directory") {
			throw new Error(`Unable to ensure the directory \`${path}\` exist, path is a ${entityType}!`);
		}
	} catch (error) {
		if (!(error instanceof Deno.errors.NotFound)) {
			throw error;
		}
		Deno.mkdirSync(path, { recursive: true });
		return ensureDirSync(path);
	}
}
export {
	ensureDirSync as ensureDirectorySync
};
