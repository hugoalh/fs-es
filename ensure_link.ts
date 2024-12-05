import { dirname as getPathDirname } from "jsr:@std/path@^1.0.8/dirname";
import { fromFileUrl as getPathFromFileUrl } from "jsr:@std/path@^1.0.8/from-file-url";
import {
	ensureDir,
	ensureDirSync
} from "./ensure_dir.ts";
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
