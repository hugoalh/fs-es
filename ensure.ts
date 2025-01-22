import { dirname as getPathDirname } from "jsr:@std/path@^1.0.8/dirname";
import { fromFileUrl as getPathFromFileUrl } from "jsr:@std/path@^1.0.8/from-file-url";
import { resolve as resolvePath } from "jsr:@std/path@^1.0.8/resolve";
type EntityType = "directory" | "file" | "unknown" | "symlink";
/**
 * Get the entity type as string.
 * @param {Deno.DirEntry | Deno.FileInfo} stat Entity information.
 * @returns {EntityType} Entity type as a string.
 */
function getEntityTypeString(stat: Deno.DirEntry | Deno.FileInfo): EntityType {
	if (stat.isDirectory) {
		return "directory";
	}
	if (stat.isFile) {
		return "file";
	}
	if (stat.isSymlink) {
		return "symlink";
	}
	return "unknown";
}
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
		const pathStatL: Deno.FileInfo = await Deno.lstat(path);
		if (!pathStatL.isDirectory) {
			throw new Error(`Unable to ensure the directory \`${path}\` exist, path is type of ${getEntityTypeString(pathStatL)}!`);
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
		const pathStatL: Deno.FileInfo = Deno.lstatSync(path);
		if (!pathStatL.isDirectory) {
			throw new Error(`Unable to ensure the directory \`${path}\` exist, path is type of ${getEntityTypeString(pathStatL)}!`);
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
		const pathStatL: Deno.FileInfo = await Deno.lstat(path);
		if (!pathStatL.isFile) {
			throw new Error(`Unable to ensure the file \`${path}\` exist, path is type of ${getEntityTypeString(pathStatL)}!`);
		}
	} catch (error) {
		if (!(error instanceof Deno.errors.NotFound)) {
			throw error;
		}
		await ensureDir(getPathDirname(pathFmt));
		await Deno.writeFile(path, new Uint8Array());
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
		const pathStatL: Deno.FileInfo = Deno.lstatSync(path);
		if (!pathStatL.isFile) {
			throw new Error(`Unable to ensure the file \`${path}\` exist, path is type of ${getEntityTypeString(pathStatL)}!`);
		}
	} catch (error) {
		if (!(error instanceof Deno.errors.NotFound)) {
			throw error;
		}
		ensureDirSync(getPathDirname(pathFmt));
		Deno.writeFileSync(path, new Uint8Array());
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
/**
 * Ensure the symlink does exist, asynchronously.
 * 
 * If the symlink does exist, then nothing happened, otherwise it is created.
 * 
 * > **🛡️ Runtime Permissions**
 * > 
 * > - File System - Read \[Deno: `read`; NodeJS 🧪: `fs-read`\]
 * >   - *Resources*
 * > - File System - Write \[Deno: `write`; NodeJS 🧪: `fs-write`\]
 * >   - *Resources*
 * @param {string | URL} src Path of the source.
 * @param {string | URL} dest Path of the symlink.
 * @returns {Promise<void>}
 * @example
 * ```ts
 * await ensureSymlink("./path/to/source.dat", "./path/to/link.dat");
 * ```
 */
export async function ensureSymlink(src: string | URL, dest: string | URL): Promise<void> {
	const srcFmt: string = (src instanceof URL) ? getPathFromFileUrl(src) : src;
	const destFmt: string = (dest instanceof URL) ? getPathFromFileUrl(dest) : dest;
	const srcStatL: Deno.FileInfo = await Deno.lstat(src);
	try {
		const destStatL: Deno.FileInfo = await Deno.lstat(dest);
		if (!destStatL.isSymlink) {
			throw new Error(`Unable to ensure the symlink \`${dest}\` exist, path is type of ${getEntityTypeString(destStatL)}!`);
		}
		if (resolvePath(srcFmt) !== await Deno.readLink(dest)) {
			throw undefined;
		}
	} catch (error) {
		if (!(
			typeof error === "undefined" ||
			error instanceof Deno.errors.NotFound
		)) {
			throw error;
		}
		await ensureDir(getPathDirname(destFmt));
		await Deno.symlink(src, dest, {
			type: srcStatL.isDirectory ? "dir" : "file"
		});
	}
}
/**
 * Ensure the symlink does exist, synchronously.
 * 
 * If the symlink does exist, then nothing happened, otherwise it is created.
 * 
 * > **🛡️ Runtime Permissions**
 * > 
 * > - File System - Read \[Deno: `read`; NodeJS 🧪: `fs-read`\]
 * >   - *Resources*
 * > - File System - Write \[Deno: `write`; NodeJS 🧪: `fs-write`\]
 * >   - *Resources*
 * @param {string | URL} src Path of the source.
 * @param {string | URL} dest Path of the symlink.
 * @returns {void}
 * @example
 * ```ts
 * ensureSymlinkSync("./path/to/source.dat", "./path/to/link.dat");
 * ```
 */
export function ensureSymlinkSync(src: string | URL, dest: string | URL): void {
	const srcFmt: string = (src instanceof URL) ? getPathFromFileUrl(src) : src;
	const destFmt: string = (dest instanceof URL) ? getPathFromFileUrl(dest) : dest;
	const srcStatL: Deno.FileInfo = Deno.lstatSync(src);
	try {
		const destStatL: Deno.FileInfo = Deno.lstatSync(dest);
		if (!destStatL.isSymlink) {
			throw new Error(`Unable to ensure the symlink \`${dest}\` exist, path is type of ${getEntityTypeString(destStatL)}!`);
		}
		if (resolvePath(srcFmt) !== Deno.readLinkSync(dest)) {
			throw undefined;
		}
	} catch (error) {
		if (!(
			typeof error === "undefined" ||
			error instanceof Deno.errors.NotFound
		)) {
			throw error;
		}
		ensureDirSync(getPathDirname(destFmt));
		Deno.symlinkSync(src, dest, {
			type: srcStatL.isDirectory ? "dir" : "file"
		});
	}
}
