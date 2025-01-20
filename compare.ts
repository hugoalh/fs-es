import { readFileAsChunks } from "./stream.ts";
import {
	walk,
	type FSWalkEntryExtra
} from "./walk.ts";
export interface FSCompareResult {
	created: string[];
	modified: string[];
	removed: string[];
}
async function compareFileIsModified(oldInfo: FSWalkEntryExtra, newInfo: FSWalkEntryExtra): Promise<boolean> {
	if (oldInfo.size !== newInfo.size) {
		return true;
	}
	const oldFile: AsyncGenerator<Uint8Array> = readFileAsChunks(oldInfo.pathAbsolute, { reduceChunks: true });
	const newFile: AsyncGenerator<Uint8Array> = readFileAsChunks(newInfo.pathAbsolute, { reduceChunks: true });
	let done: boolean = false;
	while (!done) {
		const oldChunkInfo: IteratorResult<Uint8Array> = await oldFile.next();
		const newChunkInfo: IteratorResult<Uint8Array> = await newFile.next();
		if (
			(oldChunkInfo.done && !newChunkInfo.done) ||
			(!oldChunkInfo.done && newChunkInfo.done) ||
			(oldChunkInfo.value?.length !== newChunkInfo.value?.length)
		) {
			await oldFile.return(undefined);
			await newFile.return(undefined);
			return true;
		}
		const indexLength: number = Math.max(oldChunkInfo.value?.length ?? 0, newChunkInfo.value?.length ?? 0);
		for (let index: number = 0; index < indexLength; index += 1) {
			if ((oldChunkInfo.value as Uint8Array)[index] !== (newChunkInfo.value as Uint8Array)[index]) {
				await oldFile.return(undefined);
				await newFile.return(undefined);
				return true;
			}
		}
		done = (oldChunkInfo.done ?? false) && (newChunkInfo.done ?? false);
	}
	await oldFile.return(undefined);
	await newFile.return(undefined);
	return false;
}
async function compareSymlinkIsModified(oldInfo: FSWalkEntryExtra, newInfo: FSWalkEntryExtra): Promise<boolean> {
	const [
		oldLink,
		newLink
	]: [string, string] = await Promise.all([
		Deno.readLink(oldInfo.pathAbsolute),
		Deno.readLink(newInfo.pathAbsolute)
	]);
	return (oldLink === newLink);
}
/**
 * Compare directories.
 * @param {string | URL} oldPath Path of the old directory.
 * @param {string | URL} newPath Path of the new directory.
 * @returns {Promise<FSCompareResult>} Result of the compare.
 */
export async function compare(oldPath: string | URL, newPath: string | URL): Promise<FSCompareResult> {
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
	]: [FSWalkEntryExtra[], FSWalkEntryExtra[]] = await Promise.all([
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
				if (await compareFileIsModified(oldEntry, newEntryFound)) {
					modified.push(newEntryFound);
				}
			} else if (
				(oldEntry.isSymlinkDirectory && newEntryFound.isSymlinkDirectory) ||
				(oldEntry.isSymlinkFile && newEntryFound.isSymlinkFile)
			) {
				if (await compareSymlinkIsModified(oldEntry, newEntryFound)) {
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
