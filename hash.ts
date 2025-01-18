import { FNV1a } from "https://raw.githubusercontent.com/hugoalh/fnv-es/v0.1.0/1a.ts";
import { sortCollectionByKeys } from "https://raw.githubusercontent.com/hugoalh/sort-es/v0.1.1/collection.ts";
import { walk } from "./walk.ts";
async function getFileHash(path: string | URL): Promise<string> {
	using file: Deno.FsFile = await Deno.open(path);
	return (await FNV1a.fromStream(256, file.readable)).hashHexPadding();
}
async function getSymlinkHash(path: string | URL): Promise<string> {
	const link: string = await Deno.readLink(path);
	return new FNV1a(256, link).hashHexPadding();
}
async function getDirectoryHash(path: string | URL): Promise<string> {
	const bin: Map<string, string> = new Map<string, string>();
	for await (const {
		isDirectory,
		isFile,
		isSymlinkDirectory,
		isSymlinkFile,
		pathAbsolute,
		pathRelative
	} of await walk(path)) {
		if (bin.has(pathRelative)) {
			throw new ReferenceError(`Path \`${pathRelative}\` of the root \`${path}\` process again, last result is \`${bin.get(pathRelative)}\`!`);
		}
		if (isDirectory) {
			bin.set(pathRelative, "-".repeat(64));
		} else if (isFile) {
			bin.set(pathRelative, await getFileHash(pathAbsolute));
		} else if (
			isSymlinkDirectory ||
			isSymlinkFile
		) {
			bin.set(pathRelative, await getSymlinkHash(pathAbsolute));
		} else {
			throw new Error(`Unable to get the hash of the path \`${pathRelative}\` of the root \`${path}\`, path is type of unknown!`);
		}
	}
	const raw: string = Array.from(sortCollectionByKeys(bin).entries(), ([key, value]: [string, string]): string => {
		return `${key}=${value}`;
	}).join("\n");
	return new FNV1a(256, raw).hashHexPadding();
}
/**
 * Get the hash of the path.
 * 
 * > **🛡️ Runtime Permissions**
 * > 
 * > - File System - Read \[Deno: `read`; NodeJS 🧪: `fs-read`\]
 * >   - *Resources*
 * @param {string | URL} path Path.
 * @returns {Promise<string>} Hash of the path, 256 bits.
 * @example
 * ```ts
 * await getHash(Deno.cwd());
 * //=> "B88A58267C52D8190C154BD3241D84EE3698F84AA2443D87B97F20D272795260"
 * ```
 */
export async function getHash(path: string | URL): Promise<string> {
	const {
		isDirectory,
		isFile,
		isSymlink
	}: Deno.FileInfo = await Deno.lstat(path);
	if (isDirectory) {
		return getDirectoryHash(path);
	}
	if (isFile) {
		return getFileHash(path);
	}
	if (isSymlink) {
		return getSymlinkHash(path);
	}
	throw new Error(`Unable to get the hash of the path \`${path}\`, path is type of unknown!`);
}
