import {
	readFileAsChunks,
	readFileAsChunksSync
} from "./stream.ts";
import {
	walk,
	walkSync,
	type FSWalkEntryExtra
} from "./walk.ts";
/**
 * Compare the files whether are different, asynchronously.
 * 
 * > **🛡️ Runtime Permissions**
 * > 
 * > - File System - Read \[Deno: `read`; NodeJS 🧪: `fs-read`\]
 * >   - *Resources*
 * @param {string | URL} filePathA Path of the file A.
 * @param {string | URL} filePathB Path of the file B.
 * @returns {Promise<boolean>} Determine result.
 */
export async function compareFilesAreDifferent(filePathA: string | URL, filePathB: string | URL): Promise<boolean> {
	const fileA: AsyncGenerator<Uint8Array> = readFileAsChunks(filePathA, { reduceChunks: true });
	const fileB: AsyncGenerator<Uint8Array> = readFileAsChunks(filePathB, { reduceChunks: true });
	let done: boolean = false;
	let result: boolean = false;
	while (!done) {
		const [
			fileAChunkInfo,
			fileBChunkInfo
		]: [IteratorResult<Uint8Array>, IteratorResult<Uint8Array>] = await Promise.all([
			fileA.next(),
			fileB.next()
		]);
		if (
			(fileAChunkInfo.done && !fileBChunkInfo.done) ||
			(!fileAChunkInfo.done && fileBChunkInfo.done) ||
			(fileAChunkInfo.value?.length !== fileBChunkInfo.value?.length)
		) {
			result = true;
			break;
		}
		const indexLength: number = Math.max(fileAChunkInfo.value?.length ?? 0, fileBChunkInfo.value?.length ?? 0);
		for (let index: number = 0; index < indexLength; index += 1) {
			if ((fileAChunkInfo.value as Uint8Array)[index] !== (fileBChunkInfo.value as Uint8Array)[index]) {
				result = true;
				break;
			}
		}
		done = (fileAChunkInfo.done ?? false) && (fileBChunkInfo.done ?? false);
	}
	await Promise.all([
		fileA.return(undefined),
		fileB.return(undefined)
	]);
	return result;
}
/**
 * Compare the files whether are different, synchronously.
 * 
 * > **🛡️ Runtime Permissions**
 * > 
 * > - File System - Read \[Deno: `read`; NodeJS 🧪: `fs-read`\]
 * >   - *Resources*
 * @param {string | URL} filePathA Path of the file A.
 * @param {string | URL} filePathB Path of the file B.
 * @returns {boolean} Determine result.
 */
export function compareFilesAreDifferentSync(filePathA: string | URL, filePathB: string | URL): boolean {
	const fileA: Generator<Uint8Array> = readFileAsChunksSync(filePathA, { reduceChunks: true });
	const fileB: Generator<Uint8Array> = readFileAsChunksSync(filePathB, { reduceChunks: true });
	let done: boolean = false;
	let result: boolean = false;
	while (!done) {
		const fileAChunkInfo: IteratorResult<Uint8Array> = fileA.next();
		const fileBChunkInfo: IteratorResult<Uint8Array> = fileB.next();
		if (
			(fileAChunkInfo.done && !fileBChunkInfo.done) ||
			(!fileAChunkInfo.done && fileBChunkInfo.done) ||
			(fileAChunkInfo.value?.length !== fileBChunkInfo.value?.length)
		) {
			result = true;
			break;
		}
		const indexLength: number = Math.max(fileAChunkInfo.value?.length ?? 0, fileBChunkInfo.value?.length ?? 0);
		for (let index: number = 0; index < indexLength; index += 1) {
			if ((fileAChunkInfo.value as Uint8Array)[index] !== (fileBChunkInfo.value as Uint8Array)[index]) {
				result = true;
				break;
			}
		}
		done = (fileAChunkInfo.done ?? false) && (fileBChunkInfo.done ?? false);
	}
	fileA.return(undefined);
	fileB.return(undefined);
	return result;
}
/**
 * Compare the symlinks whether are different, asynchronously.
 * 
 * > **🛡️ Runtime Permissions**
 * > 
 * > - File System - Read \[Deno: `read`; NodeJS 🧪: `fs-read`\]
 * >   - *Resources*
 * @param {string | URL} symlinkPathA Path of the symlink A.
 * @param {string | URL} symlinkPathB Path of the symlink B.
 * @returns {Promise<boolean>} Determine result.
 */
export async function compareSymlinksAreDifferent(symlinkPathA: string | URL, symlinkPathB: string | URL): Promise<boolean> {
	const [
		symlinkA,
		symlinkB
	]: [string, string] = await Promise.all([
		Deno.readLink(symlinkPathA),
		Deno.readLink(symlinkPathB)
	]);
	return (symlinkA !== symlinkB);
}
/**
 * Compare the symlinks whether are different, synchronously.
 * 
 * > **🛡️ Runtime Permissions**
 * > 
 * > - File System - Read \[Deno: `read`; NodeJS 🧪: `fs-read`\]
 * >   - *Resources*
 * @param {string | URL} symlinkPathA Path of the symlink A.
 * @param {string | URL} symlinkPathB Path of the symlink B.
 * @returns {boolean} Determine result.
 */
export function compareSymlinksAreDifferentSync(symlinkPathA: string | URL, symlinkPathB: string | URL): boolean {
	return ((Deno.readLinkSync(symlinkPathA)) !== (Deno.readLinkSync(symlinkPathB)));
}
export interface FSCompareDirectoriesResult {
	created: string[];
	modified: string[];
	removed: string[];
}
/**
 * Compare the differences between the directories, asynchronously.
 * 
 * > **🛡️ Runtime Permissions**
 * > 
 * > - File System - Read \[Deno: `read`; NodeJS 🧪: `fs-read`\]
 * >   - *Resources*
 * @param {string | URL} oldPath Path of the old directory.
 * @param {string | URL} newPath Path of the new directory.
 * @returns {Promise<FSCompareDirectoriesResult>} Result of the compare.
 */
export async function compareDirectories(oldPath: string | URL, newPath: string | URL): Promise<FSCompareDirectoriesResult> {
	const [
		oldStatL,
		newStatL
	]: [Deno.FileInfo, Deno.FileInfo] = await Promise.all([
		Deno.lstat(oldPath),
		Deno.lstat(newPath)
	]);
	if (!oldStatL.isDirectory) {
		throw new Deno.errors.NotADirectory(`Path \`${oldPath}\` (parameter \`oldPath\`) is not a directory!`);
	}
	if (!newStatL.isDirectory) {
		throw new Deno.errors.NotADirectory(`Path \`${newPath}\` (parameter \`newPath\`) is not a directory!`);
	}
	const [
		oldEntries,
		newEntries
	]: [readonly FSWalkEntryExtra[], readonly FSWalkEntryExtra[]] = await Promise.all([
		Array.fromAsync(await walk(oldPath, { extraInfo: true })),
		Array.fromAsync(await walk(newPath, { extraInfo: true }))
	]);
	const created: FSWalkEntryExtra[] = [];
	const modified: FSWalkEntryExtra[] = [];
	const removed: FSWalkEntryExtra[] = [];
	for (const oldEntry of oldEntries) {
		const newEntryFound: FSWalkEntryExtra | undefined = newEntries.find((newEntry: FSWalkEntryExtra): boolean => {
			return (oldEntry.pathRelative === newEntry.pathRelative);
		});
		if (typeof newEntryFound === "undefined") {
			removed.push(oldEntry);
		} else {
			if (oldEntry.isDirectory && newEntryFound.isDirectory) {
				// Do nothing.
			} else if (oldEntry.isFile && newEntryFound.isFile) {
				if (await compareFilesAreDifferent(oldEntry.pathAbsolute, newEntryFound.pathAbsolute)) {
					modified.push(newEntryFound);
				}
			} else if (
				(oldEntry.isSymlinkDirectory && newEntryFound.isSymlinkDirectory) ||
				(oldEntry.isSymlinkFile && newEntryFound.isSymlinkFile)
			) {
				if (await compareSymlinksAreDifferent(oldEntry.pathAbsolute, newEntryFound.pathAbsolute)) {
					modified.push(newEntryFound);
				}
			} else {
				modified.push(newEntryFound);
			}
		}
	}
	for (const newEntry of newEntries) {
		if (oldEntries.findIndex((oldEntry: FSWalkEntryExtra): boolean => {
			return (newEntry.pathRelative === oldEntry.pathRelative);
		}) === -1) {
			created.push(newEntry);
		}
	}
	return {
		created: created.map(({ pathRelative }: FSWalkEntryExtra): string => {
			return pathRelative;
		}),
		modified: modified.map(({ pathRelative }: FSWalkEntryExtra): string => {
			return pathRelative;
		}),
		removed: removed.map(({ pathRelative }: FSWalkEntryExtra): string => {
			return pathRelative;
		})
	};
}
/**
 * Compare the differences between the directories, synchronously.
 * 
 * > **🛡️ Runtime Permissions**
 * > 
 * > - File System - Read \[Deno: `read`; NodeJS 🧪: `fs-read`\]
 * >   - *Resources*
 * @param {string | URL} oldPath Path of the old directory.
 * @param {string | URL} newPath Path of the new directory.
 * @returns {FSCompareDirectoriesResult} Result of the compare.
 */
export function compareDirectoriesSync(oldPath: string | URL, newPath: string | URL): FSCompareDirectoriesResult {
	const oldStatL: Deno.FileInfo = Deno.lstatSync(oldPath);
	const newStatL: Deno.FileInfo = Deno.lstatSync(newPath);
	if (!oldStatL.isDirectory) {
		throw new Deno.errors.NotADirectory(`Path \`${oldPath}\` (parameter \`oldPath\`) is not a directory!`);
	}
	if (!newStatL.isDirectory) {
		throw new Deno.errors.NotADirectory(`Path \`${newPath}\` (parameter \`newPath\`) is not a directory!`);
	}
	const oldEntries: readonly FSWalkEntryExtra[] = Array.from(walkSync(oldPath, { extraInfo: true }));
	const newEntries: readonly FSWalkEntryExtra[] = Array.from(walkSync(newPath, { extraInfo: true }));
	const created: FSWalkEntryExtra[] = [];
	const modified: FSWalkEntryExtra[] = [];
	const removed: FSWalkEntryExtra[] = [];
	for (const oldEntry of oldEntries) {
		const newEntryFound: FSWalkEntryExtra | undefined = newEntries.find((newEntry: FSWalkEntryExtra): boolean => {
			return (oldEntry.pathRelative === newEntry.pathRelative);
		});
		if (typeof newEntryFound === "undefined") {
			removed.push(oldEntry);
		} else {
			if (oldEntry.isDirectory && newEntryFound.isDirectory) {
				// Do nothing.
			} else if (oldEntry.isFile && newEntryFound.isFile) {
				if (compareFilesAreDifferentSync(oldEntry.pathAbsolute, newEntryFound.pathAbsolute)) {
					modified.push(newEntryFound);
				}
			} else if (
				(oldEntry.isSymlinkDirectory && newEntryFound.isSymlinkDirectory) ||
				(oldEntry.isSymlinkFile && newEntryFound.isSymlinkFile)
			) {
				if (compareSymlinksAreDifferentSync(oldEntry.pathAbsolute, newEntryFound.pathAbsolute)) {
					modified.push(newEntryFound);
				}
			} else {
				modified.push(newEntryFound);
			}
		}
	}
	for (const newEntry of newEntries) {
		if (oldEntries.findIndex((oldEntry: FSWalkEntryExtra): boolean => {
			return (newEntry.pathRelative === oldEntry.pathRelative);
		}) === -1) {
			created.push(newEntry);
		}
	}
	return {
		created: created.map(({ pathRelative }: FSWalkEntryExtra): string => {
			return pathRelative;
		}),
		modified: modified.map(({ pathRelative }: FSWalkEntryExtra): string => {
			return pathRelative;
		}),
		removed: removed.map(({ pathRelative }: FSWalkEntryExtra): string => {
			return pathRelative;
		})
	};
}
