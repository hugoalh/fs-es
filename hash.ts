import {
	FNV1a,
	type FNVBitsSize
} from "https://raw.githubusercontent.com/hugoalh/fnv-es/v0.1.0/1a.ts";
import { sortCollectionByKeys } from "https://raw.githubusercontent.com/hugoalh/sort-es/v0.1.1/collection.ts";
import { readFileAsChunksSync } from "./stream.ts";
import {
	walk,
	walkSync
} from "./walk.ts";
export interface FSGetHashOptions {
	/**
	 * Bits size of the hash.
	 * @default {512}
	 */
	size?: FNVBitsSize;
}
async function getFileHash(path: string | URL, options: Required<FSGetHashOptions>): Promise<string> {
	const { size }: Required<FSGetHashOptions> = options;
	using file: Deno.FsFile = await Deno.open(path);
	return (await FNV1a.fromStream(size, file.readable)).hashHexPadding();
}
function getFileHashSync(path: string | URL, options: Required<FSGetHashOptions>): string {
	const { size }: Required<FSGetHashOptions> = options;
	const instance: FNV1a = new FNV1a(size);
	for (const chunk of readFileAsChunksSync(path)) {
		instance.update(chunk);
	}
	return instance.hashHexPadding();
}
async function getSymlinkHash(path: string | URL, options: Required<FSGetHashOptions>): Promise<string> {
	const { size }: Required<FSGetHashOptions> = options;
	const link: string = await Deno.readLink(path);
	return new FNV1a(size, link).hashHexPadding();
}
function getSymlinkHashSync(path: string | URL, options: Required<FSGetHashOptions>): string {
	const { size }: Required<FSGetHashOptions> = options;
	const link: string = Deno.readLinkSync(path);
	return new FNV1a(size, link).hashHexPadding();
}
async function getDirectoryHash(path: string | URL, options: Required<FSGetHashOptions>): Promise<string> {
	const { size }: Required<FSGetHashOptions> = options;
	const bin: Map<string, string> = new Map<string, string>();
	for await (const {
		isDirectory,
		isFile,
		isSymlinkDirectory,
		isSymlinkFile,
		pathAbsolute
	} of await walk(path)) {
		if (bin.has(pathAbsolute)) {
			throw new ReferenceError(`Path \`${pathAbsolute}\` process again, last result is \`${bin.get(pathAbsolute)}\`!`);
		}
		if (isDirectory) {
			bin.set(pathAbsolute, "-".repeat(Math.round(size / 4)));
		} else if (isFile) {
			bin.set(pathAbsolute, await getFileHash(pathAbsolute, options));
		} else if (
			isSymlinkDirectory ||
			isSymlinkFile
		) {
			bin.set(pathAbsolute, await getSymlinkHash(pathAbsolute, options));
		} else {
			throw new Error(`Unable to get the hash of the path \`${pathAbsolute}\`, path is type of unknown!`);
		}
	}
	const raw: string = Array.from(sortCollectionByKeys(bin).entries(), ([key, value]: [string, string]): string => {
		return `${key}=${value}`;
	}).join("\n");
	return new FNV1a(size, raw).hashHexPadding();
}
function getDirectoryHashSync(path: string | URL, options: Required<FSGetHashOptions>): string {
	const { size }: Required<FSGetHashOptions> = options;
	const bin: Map<string, string> = new Map<string, string>();
	for (const {
		isDirectory,
		isFile,
		isSymlinkDirectory,
		isSymlinkFile,
		pathAbsolute
	} of walkSync(path)) {
		if (bin.has(pathAbsolute)) {
			throw new ReferenceError(`Path \`${pathAbsolute}\` process again, last result is \`${bin.get(pathAbsolute)}\`!`);
		}
		if (isDirectory) {
			bin.set(pathAbsolute, "-".repeat(Math.round(size / 4)));
		} else if (isFile) {
			bin.set(pathAbsolute, getFileHashSync(pathAbsolute, options));
		} else if (
			isSymlinkDirectory ||
			isSymlinkFile
		) {
			bin.set(pathAbsolute, getSymlinkHashSync(pathAbsolute, options));
		} else {
			throw new Error(`Unable to get the hash of the path \`${pathAbsolute}\`, path is type of unknown!`);
		}
	}
	const raw: string = Array.from(sortCollectionByKeys(bin).entries(), ([key, value]: [string, string]): string => {
		return `${key}=${value}`;
	}).join("\n");
	return new FNV1a(size, raw).hashHexPadding();
}
function resolveGetHashOptions(options: FSGetHashOptions): Required<FSGetHashOptions> {
	const { size = 512 }: FSGetHashOptions = options;
	return { size };
}
/**
 * Get the hash of the path, asynchronously.
 * 
 * > **🛡️ Runtime Permissions**
 * > 
 * > - File System - Read \[Deno: `read`; NodeJS 🧪: `fs-read`\]
 * >   - *Resources*
 * @param {string | URL} path Path.
 * @param {FSGetHashOptions} [options={}] Options.
 * @returns {Promise<string>} Hash of the Path.
 * @example
 * ```ts
 * await getHash(Deno.cwd());
 * //=> "87C77A27D4779AB3078B941B86FF07CA0929A4E9D9581F6BAE380F3194287E3ADF4863355711426E79D4B673B71E9DE5F2A3E3F9D12C93FF2BDBD376DE93065D"
 * ```
 */
export async function getHash(path: string | URL, options: FSGetHashOptions = {}): Promise<string> {
	const optionsFmt: Required<FSGetHashOptions> = resolveGetHashOptions(options);
	const {
		isDirectory,
		isFile,
		isSymlink
	}: Deno.FileInfo = await Deno.lstat(path);
	if (isDirectory) {
		return getDirectoryHash(path, optionsFmt);
	}
	if (isFile) {
		return getFileHash(path, optionsFmt);
	}
	if (isSymlink) {
		return getSymlinkHash(path, optionsFmt);
	}
	throw new Error(`Unable to get the hash of the path \`${path}\`, path is type of unknown!`);
}
/**
 * Get the hash of the path, synchronously.
 * 
 * > **🛡️ Runtime Permissions**
 * > 
 * > - File System - Read \[Deno: `read`; NodeJS 🧪: `fs-read`\]
 * >   - *Resources*
 * @param {string | URL} path Path.
 * @param {FSGetHashOptions} [options={}] Options.
 * @returns {string} Hash of the Path.
 * @example
 * ```ts
 * getHashSync(Deno.cwd());
 * //=> "87C77A27D4779AB3078B941B86FF07CA0929A4E9D9581F6BAE380F3194287E3ADF4863355711426E79D4B673B71E9DE5F2A3E3F9D12C93FF2BDBD376DE93065D"
 * ```
 */
export function getHashSync(path: string | URL, options: FSGetHashOptions = {}): string {
	const optionsFmt: Required<FSGetHashOptions> = resolveGetHashOptions(options);
	const {
		isDirectory,
		isFile,
		isSymlink
	}: Deno.FileInfo = Deno.lstatSync(path);
	if (isDirectory) {
		return getDirectoryHashSync(path, optionsFmt);
	}
	if (isFile) {
		return getFileHashSync(path, optionsFmt);
	}
	if (isSymlink) {
		return getSymlinkHashSync(path, optionsFmt);
	}
	throw new Error(`Unable to get the hash of the path \`${path}\`, path is type of unknown!`);
}
