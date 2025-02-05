import { join as joinPath } from "jsr:@std/path@^1.0.8/join";
import { relative as getPathRelative } from "jsr:@std/path@^1.0.8/relative";
import { resolvePathAbsolute } from "./_path.ts";
export interface FSWalkEntry {
	/**
	 * Whether the entry is a directory.
	 * 
	 * Mutually exclusive to the properties {@linkcode isFile}, {@linkcode isSymlinkDirectory}, and {@linkcode isSymlinkFile}.
	 */
	isDirectory: boolean;
	/**
	 * Whether the entry is a file.
	 * 
	 * Mutually exclusive to the properties {@linkcode isDirectory}, {@linkcode isSymlinkDirectory}, and {@linkcode isSymlinkFile}.
	 */
	isFile: boolean;
	/**
	 * Whether the entry is a symlink directory.
	 * 
	 * Mutually exclusive to the properties {@linkcode isDirectory}, {@linkcode isFile}, and {@linkcode isSymlinkFile}.
	 */
	isSymlinkDirectory: boolean;
	/**
	 * Whether the entry is a symlink file.
	 * 
	 * Mutually exclusive to the properties {@linkcode isDirectory}, {@linkcode isFile}, and {@linkcode isSymlinkDirectory}.
	 */
	isSymlinkFile: boolean;
	/**
	 * Name of the entry, does not include the path.
	 */
	name: string;
	/**
	 * Absolute path of the entry, access with through the symlinks.
	 */
	pathAbsolute: string;
	/**
	 * Real/Regular absolute path of the entry, access without through the symlinks.
	 */
	pathAbsoluteReal: string;
	/**
	 * Relative path of the entry, based from the root, access with through the symlinks.
	 * 
	 * This property maybe equivalent to the property {@linkcode pathAbsolute} if the location is on a different storage unit.
	 */
	pathRelative: string;
	/**
	 * Real/Regular relative path of the entry, based from the root, access without through the symlinks.
	 * 
	 * This property maybe equivalent to the property {@linkcode pathAbsoluteReal} if the real location is on a different storage unit.
	 */
	pathRelativeReal: string;
	/**
	 * Whether the entry is access through the symlink directory.
	 */
	viaSymlinkDirectory: boolean;
}
export interface FSWalkEntryExtra extends Omit<Deno.FileInfo, "isDirectory" | "isFile" | "isSymlink">, FSWalkEntry {
}
export type FSActionOnPermissionDenied =
	| "throw"
	| ((entry: FSWalkEntry) => void);
export interface FSWalkOptions {
	/**
	 * Maximum depth of the entry tree should be walked recursively.
	 * @default {Infinity}
	 */
	depth?: number;
	/**
	 * Include entries by file extensions.
	 * 
	 * If specified, entries which is a file or symlink file, and with any of these file extensions are included.
	 * 
	 * This property is only meaningful when properties {@linkcode includeFiles} or {@linkcode includeSymlinkFiles} are `true`.
	 */
	extensions?: readonly string[];
	/**
	 * Whether to provide extra information of the entries.
	 * @default {false}
	 */
	extraInfo?: boolean;
	/**
	 * Whether to include real/regular directory entries.
	 * @default {true}
	 */
	includeDirectories?: boolean;
	/**
	 * Whether to include real/regular file entries.
	 * @default {true}
	 */
	includeFiles?: boolean;
	/**
	 * Whether to include symlink directory entries.
	 * @default {true}
	 */
	includeSymlinkDirectories?: boolean;
	/**
	 * Whether to include symlink file entries.
	 * @default {true}
	 */
	includeSymlinkFiles?: boolean;
	/**
	 * Include entries by regular expressions.
	 * 
	 * If specified, entries which match any of these regular expressions are included.
	 */
	matches?: readonly RegExp[];
	/**
	 * Handle on permission denied.
	 * @default {"throw"}
	 */
	onPermissionDenied?: FSActionOnPermissionDenied;
	/**
	 * Exclude entries by regular expressions.
	 * 
	 * If specified, entries which match any of these regular expressions are excluded.
	 */
	skips?: readonly RegExp[];
	/**
	 * Whether symlink directory entries should be walked recursively like the real/regular directory entries.
	 * 
	 * If the symlink directory is loop referenced, then the walk also looped until reach the {@linkcode depth} or runtime limit.
	 * @default {false}
	 */
	walkSymlinkDirectories?: boolean;
}
interface FSWalkOptionsInternal extends Required<Omit<FSWalkOptions, "extensions" | "matches" | "skips">>, Pick<FSWalkOptions, "extensions" | "matches" | "skips"> {
}
function isEntryYieldable(entry: FSWalkEntry, options: FSWalkOptionsInternal): boolean {
	const {
		isDirectory,
		isFile,
		isSymlinkDirectory,
		isSymlinkFile,
		name,
		pathRelative
	}: FSWalkEntry = entry;
	const {
		extensions,
		includeDirectories,
		includeFiles,
		includeSymlinkDirectories,
		includeSymlinkFiles,
		matches,
		skips
	}: FSWalkOptionsInternal = options;
	if (
		(isDirectory && !includeDirectories) ||
		(isFile && !includeFiles) ||
		(isSymlinkDirectory && !includeSymlinkDirectories) ||
		(isSymlinkFile && !includeSymlinkFiles)
	) {
		return false;
	}
	if (typeof extensions !== "undefined") {
		if (!(
			isFile ||
			isSymlinkFile
		)) {
			return false;
		}
		const nameLowerCase: string = name.toLowerCase();
		if (
			(extensions.length === 0 && nameLowerCase.includes(".")) ||
			!extensions.some((extension: string): boolean => {
				return nameLowerCase.endsWith(extension);
			})
		) {
			return false;
		}
	}
	if (typeof matches !== "undefined") {
		if (
			matches.length === 0 ||
			!matches.some((match: RegExp): boolean => {
				return match.test(pathRelative);
			})
		) {
			return false;
		}
	}
	if (typeof skips !== "undefined") {
		if (skips.some((pattern: RegExp): boolean => {
			return pattern.test(pathRelative);
		})) {
			return false;
		}
	}
	return true;
}
function resolveEntryExtraInfo(basic: FSWalkEntry, extra: Deno.FileInfo): FSWalkEntryExtra {
	return {
		...basic,
		atime: extra.atime,
		birthtime: extra.birthtime,
		blksize: extra.blksize,
		blocks: extra.blocks,
		ctime: extra.ctime,
		dev: extra.dev,
		gid: extra.gid,
		ino: extra.ino,
		isBlockDevice: extra.isBlockDevice,
		isCharDevice: extra.isCharDevice,
		isFifo: extra.isFifo,
		isSocket: extra.isSocket,
		mode: extra.mode,
		mtime: extra.mtime,
		nlink: extra.nlink,
		rdev: extra.rdev,
		size: extra.size,
		uid: extra.uid
	};
}
interface FSWalkerParameters {
	depthCurrent?: number;
	root: string;
	paths?: readonly string[];
	viaSymlinkDirectory?: boolean;
}
async function* walker(param: FSWalkerParameters, options: FSWalkOptionsInternal): AsyncGenerator<FSWalkEntry | FSWalkEntryExtra> {
	const {
		depthCurrent = 0,
		root,
		paths = [],
		viaSymlinkDirectory = false
	}: FSWalkerParameters = param;
	const {
		depth,
		extraInfo,
		onPermissionDenied,
		walkSymlinkDirectories
	}: FSWalkOptionsInternal = options;
	for await (const {
		isDirectory,
		isFile,
		isSymlink,
		name
	} of Deno.readDir(joinPath(root, ...paths))) {
		const pathRelative: string = joinPath(...paths, name);
		const pathAbsolute: string = joinPath(root, pathRelative);
		const pathAbsoluteReal: string = await Deno.realPath(pathAbsolute);
		const pathRelativeReal: string = getPathRelative(root, pathAbsoluteReal);
		let isSymlinkDirectory: boolean;
		let isSymlinkFile: boolean;
		if (isSymlink) {
			const pathStat: Deno.FileInfo = await Deno.lstat(pathAbsoluteReal);
			isSymlinkDirectory = pathStat.isDirectory;
			isSymlinkFile = pathStat.isFile;
		} else {
			isSymlinkDirectory = false;
			isSymlinkFile = false;
		}
		const result: FSWalkEntry = {
			isDirectory,
			isFile,
			isSymlinkDirectory,
			isSymlinkFile,
			name,
			pathAbsolute,
			pathAbsoluteReal,
			pathRelative,
			pathRelativeReal,
			viaSymlinkDirectory
		};
		if (isEntryYieldable(result, options)) {
			yield (extraInfo ? resolveEntryExtraInfo(result, await Deno.lstat(pathAbsolute)) : result);
		}
		if ((
			isDirectory ||
			(isSymlinkDirectory && walkSymlinkDirectories)
		) && depthCurrent < depth) {
			try {
				yield* walker({
					depthCurrent: depthCurrent + 1,
					paths: [...paths, name],
					root,
					viaSymlinkDirectory: viaSymlinkDirectory || isSymlinkDirectory
				}, options);
			} catch (error) {
				if (!(error instanceof Deno.errors.PermissionDenied && typeof onPermissionDenied === "function")) {
					throw error;
				}
				onPermissionDenied(result);
			}
		}
	}
}
function* walkerSync(param: FSWalkerParameters, options: FSWalkOptionsInternal): Generator<FSWalkEntry | FSWalkEntryExtra> {
	const {
		depthCurrent = 0,
		root,
		paths = [],
		viaSymlinkDirectory = false
	}: FSWalkerParameters = param;
	const {
		depth,
		extraInfo,
		onPermissionDenied,
		walkSymlinkDirectories
	}: FSWalkOptionsInternal = options;
	for (const {
		isDirectory,
		isFile,
		isSymlink,
		name
	} of Deno.readDirSync(joinPath(root, ...paths))) {
		const pathRelative: string = joinPath(...paths, name);
		const pathAbsolute: string = joinPath(root, pathRelative);
		const pathAbsoluteReal: string = Deno.realPathSync(pathAbsolute);
		const pathRelativeReal: string = getPathRelative(root, pathAbsoluteReal);
		let isSymlinkDirectory: boolean;
		let isSymlinkFile: boolean;
		if (isSymlink) {
			const pathStat: Deno.FileInfo = Deno.lstatSync(pathAbsoluteReal);
			isSymlinkDirectory = pathStat.isDirectory;
			isSymlinkFile = pathStat.isFile;
		} else {
			isSymlinkDirectory = false;
			isSymlinkFile = false;
		}
		const result: FSWalkEntry = {
			isDirectory,
			isFile,
			isSymlinkDirectory,
			isSymlinkFile,
			name,
			pathAbsolute,
			pathAbsoluteReal,
			pathRelative,
			pathRelativeReal,
			viaSymlinkDirectory
		};
		if (isEntryYieldable(result, options)) {
			yield (extraInfo ? resolveEntryExtraInfo(result, Deno.lstatSync(pathAbsolute)) : result);
		}
		if ((
			isDirectory ||
			(isSymlinkDirectory && walkSymlinkDirectories)
		) && depthCurrent < depth) {
			try {
				yield* walkerSync({
					depthCurrent: depthCurrent + 1,
					paths: [...paths, name],
					root,
					viaSymlinkDirectory: viaSymlinkDirectory || isSymlinkDirectory
				}, options);
			} catch (error) {
				if (!(error instanceof Deno.errors.PermissionDenied && typeof onPermissionDenied === "function")) {
					throw error;
				}
				onPermissionDenied(result);
			}
		}
	}
}
function resolveWalkOptions(options: FSWalkOptions): FSWalkOptionsInternal {
	const {
		depth = Infinity,
		extensions,
		extraInfo = false,
		includeDirectories = true,
		includeFiles = true,
		includeSymlinkDirectories = true,
		includeSymlinkFiles = true,
		matches,
		onPermissionDenied = "throw",
		skips,
		walkSymlinkDirectories = false
	}: FSWalkOptions = options;
	if (depth !== Infinity && !(Number.isSafeInteger(depth) && depth >= 0)) {
		throw new RangeError(`Parameter \`options.depth\` is not \`Infinity\`, or a number which is integer, positive, and safe!`);
	}
	return {
		depth,
		extensions: extensions?.map((extension: string): string => {
			return (extension.startsWith(".") ? extension : `.${extension}`).toLowerCase();
		}),
		extraInfo,
		includeDirectories,
		includeFiles,
		includeSymlinkDirectories,
		includeSymlinkFiles,
		matches,
		onPermissionDenied,
		skips,
		walkSymlinkDirectories
	};
}
/**
 * Walk through the directory and yield information about each entry encountered, asynchronously.
 * 
 * The order of entries is not guaranteed.
 * 
 * > **🛡️ Runtime Permissions**
 * >
 * > - File System - Read \[Deno: `read`; NodeJS 🧪: `fs-read`\]
 * >   - *Resources*
 * @param {string | URL} root Root directory.
 * @param {FSWalkOptions & { extraInfo?: false; }} [options] Options.
 * @returns {Promise<AsyncGenerator<FSWalkEntry>>} An async iterable iterator that yields the walk entry information.
 */
export async function walk(root: string | URL, options?: FSWalkOptions & { extraInfo?: false; }): Promise<AsyncGenerator<FSWalkEntry>>;
/**
/**
 * Walk through the directory and yield information about each entry encountered, asynchronously.
 * 
 * The order of entries is not guaranteed.
 * 
 * > **🛡️ Runtime Permissions**
 * >
 * > - File System - Read \[Deno: `read`; NodeJS 🧪: `fs-read`\]
 * >   - *Resources*
 * @param {string | URL} root Root directory.
 * @param {FSWalkOptions & { extraInfo: true; }} options Options.
 * @returns {Promise<AsyncGenerator<FSWalkEntryExtra>>} An async iterable iterator that yields the walk entry information.
 */
export async function walk(root: string | URL, options: FSWalkOptions & { extraInfo: true; }): Promise<AsyncGenerator<FSWalkEntryExtra>>;
export async function walk(root: string | URL, options: FSWalkOptions = {}): Promise<AsyncGenerator<FSWalkEntry | FSWalkEntryExtra>> {
	const rootFmt: string = resolvePathAbsolute(root);
	const optionsFmt: FSWalkOptionsInternal = resolveWalkOptions(options);
	const rootStatL: Deno.FileInfo = await Deno.lstat(root);
	if (!rootStatL.isDirectory) {
		if (rootStatL.isSymlink) {
			const rootStat: Deno.FileInfo = await Deno.stat(root);
			if (!(rootStat.isDirectory && options.walkSymlinkDirectories)) {
				throw new Error(`Path \`${rootFmt}\` is a symlink directory but forbid to walk!`);
			}
		} else {
			throw new Deno.errors.NotADirectory(`Path \`${rootFmt}\` is not a directory!`);
		}
	}
	return walker({
		root: rootFmt,
		viaSymlinkDirectory: !rootStatL.isDirectory
	}, optionsFmt);
}
/**
 * Walk through the directory and yield information about each entry encountered, synchronously.
 * 
 * The order of entries is not guaranteed.
 * 
 * > **🛡️ Runtime Permissions**
 * >
 * > - File System - Read \[Deno: `read`; NodeJS 🧪: `fs-read`\]
 * >   - *Resources*
 * @param {string | URL} root Root directory.
 * @param {FSWalkOptions & { extraInfo?: false; }} [options] Options.
 * @returns {Generator<FSWalkEntry>} A sync iterable iterator that yields the walk entry information.
 */
export function walkSync(root: string | URL, options?: FSWalkOptions & { extraInfo?: false; }): Generator<FSWalkEntry>;
/**
/**
 * Walk through the directory and yield information about each entry encountered, synchronously.
 * 
 * The order of entries is not guaranteed.
 * 
 * > **🛡️ Runtime Permissions**
 * >
 * > - File System - Read \[Deno: `read`; NodeJS 🧪: `fs-read`\]
 * >   - *Resources*
 * @param {string | URL} root Root directory.
 * @param {FSWalkOptions & { extraInfo: true; }} options Options.
 * @returns {Generator<FSWalkEntryExtra>} A sync iterable iterator that yields the walk entry information.
 */
export function walkSync(root: string | URL, options: FSWalkOptions & { extraInfo: true; }): Generator<FSWalkEntryExtra>;
export function walkSync(root: string | URL, options: FSWalkOptions = {}): Generator<FSWalkEntry | FSWalkEntryExtra> {
	const rootFmt: string = resolvePathAbsolute(root);
	const optionsFmt: FSWalkOptionsInternal = resolveWalkOptions(options);
	const rootStatL: Deno.FileInfo = Deno.lstatSync(root);
	if (!rootStatL.isDirectory) {
		if (rootStatL.isSymlink) {
			const rootStat: Deno.FileInfo = Deno.statSync(root);
			if (!(rootStat.isDirectory && options.walkSymlinkDirectories)) {
				throw new Error(`Path \`${rootFmt}\` is a symlink directory but forbid to walk!`);
			}
		} else {
			throw new Deno.errors.NotADirectory(`Path \`${rootFmt}\` is not a directory!`);
		}
	}
	return walkerSync({
		root: rootFmt,
		viaSymlinkDirectory: !rootStatL.isDirectory
	}, optionsFmt);
}
