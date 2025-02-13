import { dirname as getPathDirname } from "jsr:@std/path@^1.0.8/dirname";
import {
	convertToPathString,
	resolvePathAbsolute
} from "./_path.ts";
type EntityType =
	| "directory"
	| "file"
	| "unknown"
	| "symlink";
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
		const statL: Deno.FileInfo = await Deno.lstat(path);
		if (!statL.isDirectory) {
			throw new Error(`Unable to ensure the directory \`${path}\` exist, path is type of ${getEntityTypeString(statL)}!`);
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
		const statL: Deno.FileInfo = Deno.lstatSync(path);
		if (!statL.isDirectory) {
			throw new Error(`Unable to ensure the directory \`${path}\` exist, path is type of ${getEntityTypeString(statL)}!`);
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
	try {
		const statL: Deno.FileInfo = await Deno.lstat(path);
		if (!statL.isFile) {
			throw new Error(`Unable to ensure the file \`${path}\` exist, path is type of ${getEntityTypeString(statL)}!`);
		}
	} catch (error) {
		if (!(error instanceof Deno.errors.NotFound)) {
			throw error;
		}
		await ensureDir(getPathDirname(convertToPathString(path)));
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
	try {
		const statL: Deno.FileInfo = Deno.lstatSync(path);
		if (!statL.isFile) {
			throw new Error(`Unable to ensure the file \`${path}\` exist, path is type of ${getEntityTypeString(statL)}!`);
		}
	} catch (error) {
		if (!(error instanceof Deno.errors.NotFound)) {
			throw error;
		}
		ensureDirSync(getPathDirname(convertToPathString(path)));
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
 * @param {string | URL} sourcePath Path of the source file.
 * @param {string | URL} targetPath Path of the hard link.
 * @returns {Promise<void>}
 * @example
 * ```ts
 * await ensureLink("./path/to/source.dat", "./path/to/link.dat");
 * ```
 */
export async function ensureLink(sourcePath: string | URL, targetPath: string | URL): Promise<void> {
	const targetPathFmt: string = convertToPathString(targetPath);
	await ensureDir(getPathDirname(targetPathFmt));
	await Deno.link(convertToPathString(sourcePath), targetPathFmt);
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
 * @param {string | URL} sourcePath Path of the source file.
 * @param {string | URL} targetPath Path of the hard link.
 * @returns {void}
 * @example
 * ```ts
 * ensureLinkSync("./path/to/source.dat", "./path/to/link.dat");
 * ```
 */
export function ensureLinkSync(sourcePath: string | URL, targetPath: string | URL): void {
	const targetPathFmt: string = convertToPathString(targetPath);
	ensureDirSync(getPathDirname(targetPathFmt));
	Deno.linkSync(convertToPathString(sourcePath), targetPathFmt);
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
 * @param {string | URL} sourcePath Path of the source.
 * @param {string | URL} targetPath Path of the symlink.
 * @returns {Promise<void>}
 * @example
 * ```ts
 * await ensureSymlink("./path/to/source.dat", "./path/to/link.dat");
 * ```
 */
export async function ensureSymlink(sourcePath: string | URL, targetPath: string | URL): Promise<void> {
	const sourcePathFmt: string = resolvePathAbsolute(sourcePath);
	const targetPathFmt: string = resolvePathAbsolute(targetPath);
	const sourceStatL: Deno.FileInfo = await Deno.lstat(sourcePath);
	try {
		const targetStatL: Deno.FileInfo = await Deno.lstat(targetPath);
		if (!targetStatL.isSymlink) {
			throw new Error(`Unable to ensure the symlink \`${targetPath}\` exist, path is type of ${getEntityTypeString(targetStatL)}!`);
		}
		if (sourcePathFmt !== await Deno.readLink(targetPath)) {
			throw undefined;
		}
	} catch (error) {
		if (!(
			typeof error === "undefined" ||
			error instanceof Deno.errors.NotFound
		)) {
			throw error;
		}
		await ensureDir(getPathDirname(targetPathFmt));
		await Deno.symlink(sourcePath, targetPath, {
			type: sourceStatL.isDirectory ? "dir" : "file"
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
 * @param {string | URL} sourcePath Path of the source.
 * @param {string | URL} targetPath Path of the symlink.
 * @returns {void}
 * @example
 * ```ts
 * ensureSymlinkSync("./path/to/source.dat", "./path/to/link.dat");
 * ```
 */
export function ensureSymlinkSync(sourcePath: string | URL, targetPath: string | URL): void {
	const sourcePathFmt: string = resolvePathAbsolute(sourcePath);
	const targetPathFmt: string = resolvePathAbsolute(targetPath);
	const sourceStatL: Deno.FileInfo = Deno.lstatSync(sourcePath);
	try {
		const targetStatL: Deno.FileInfo = Deno.lstatSync(targetPath);
		if (!targetStatL.isSymlink) {
			throw new Error(`Unable to ensure the symlink \`${targetPath}\` exist, path is type of ${getEntityTypeString(targetStatL)}!`);
		}
		if (sourcePathFmt !== Deno.readLinkSync(targetPath)) {
			throw undefined;
		}
	} catch (error) {
		if (!(
			typeof error === "undefined" ||
			error instanceof Deno.errors.NotFound
		)) {
			throw error;
		}
		ensureDirSync(getPathDirname(targetPathFmt));
		Deno.symlinkSync(sourcePath, targetPath, {
			type: sourceStatL.isDirectory ? "dir" : "file"
		});
	}
}
