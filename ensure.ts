import { dirname as getPathDirname } from "jsr:@std/path@^1.0.8/dirname";
import { fromFileUrl as getPathFromFileUrl } from "jsr:@std/path@^1.0.8/from-file-url";
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
	}
}
export {
	ensureDirSync as ensureDirectorySync
};
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
	}
}
/**
 * Ensure the hard link does exist, asynchronously.
 * 
 * If the hard link does exist, then nothing happened, otherwise it is created.
 * 
 * Hard link across storage units or the directory are impossible.
 * 
 * > **🛡️ Runtime Permissions**
 * > 
 * > - File System - Read \[Deno: `read`; NodeJS 🧪: `fs-read`\]
 * >   - *Resources*
 * > - File System - Write \[Deno: `write`; NodeJS 🧪: `fs-write`\]
 * >   - *Resources*
 * @param {string | URL} src Path of the source file.
 * @param {string | URL} dest Path of the hard link.
 * @returns {Promise<void>}
 * @example
 * ```ts
 * await ensureLink("./path/to/source.dat", "./path/to/link.dat");
 * ```
 */
export async function ensureLink(src: string | URL, dest: string | URL): Promise<void> {
	const srcFmt: string = (src instanceof URL) ? getPathFromFileUrl(src) : src;
	const destFmt: string = (dest instanceof URL) ? getPathFromFileUrl(dest) : dest;
	await ensureDir(getPathDirname(destFmt));
	await Deno.link(srcFmt, destFmt);
}
/**
 * Ensure the hard link does exist, synchronously.
 * 
 * If the hard link does exist, then nothing happened, otherwise it is created.
 * 
 * Hard link across storage units or the directory are impossible.
 * 
 * > **🛡️ Runtime Permissions**
 * > 
 * > - File System - Read \[Deno: `read`; NodeJS 🧪: `fs-read`\]
 * >   - *Resources*
 * > - File System - Write \[Deno: `write`; NodeJS 🧪: `fs-write`\]
 * >   - *Resources*
 * @param {string | URL} src Path of the source file.
 * @param {string | URL} dest Path of the hard link.
 * @returns {void}
 * @example
 * ```ts
 * ensureLinkSync("./path/to/source.dat", "./path/to/link.dat");
 * ```
 */
export function ensureLinkSync(src: string | URL, dest: string | URL): void {
	const srcFmt: string = (src instanceof URL) ? getPathFromFileUrl(src) : src;
	const destFmt: string = (dest instanceof URL) ? getPathFromFileUrl(dest) : dest;
	ensureDirSync(getPathDirname(destFmt));
	Deno.linkSync(srcFmt, destFmt);
}
