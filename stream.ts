export interface FSReadFileAsChunksOptions {
	/**
	 * Expected maximum chunk size per read.
	 * 
	 * It is not guaranteed that the chunk will be fully used in a single call, unless the property {@linkcode reduceChunks} is defined to `true`.
	 * @default {1024}
	 */
	chunkSize?: number;
	/**
	 * Whether to reduce number of chunks.
	 * @default {false}
	 */
	reduceChunks?: boolean;
}
/**
 * Read the file as chunks, emulate {@linkcode ReadableStream}, synchronously.
 * 
 * For asynchronously read the file as chunks, use {@linkcode ReadableStream} is more efficiency.
 * 
 * > **🛡️ Runtime Permissions**
 * >
 * > - File System - Read \[Deno: `read`; NodeJS 🧪: `fs-read`\]
 * >   - *Resources*
 * @param {string | URL} filePath Path of the file.
 * @param {FSReadFileAsChunksOptions} [options={}] Options.
 * @returns {Generator<Uint8Array>} The `ReadableStream` emulator.
 */
export function* readFileAsChunksSync(filePath: string | URL, options: FSReadFileAsChunksOptions = {}): Generator<Uint8Array> {
	const {
		chunkSize = 1024,
		reduceChunks = false
	}: FSReadFileAsChunksOptions = options;
	using file: Deno.FsFile = Deno.openSync(filePath);
	let chunkGlobal: Uint8Array = new Uint8Array([]);
	let state: number | null = 0;
	while (state !== null) {
		const chunkCurrent: Uint8Array = new Uint8Array(chunkSize);
		state = file.readSync(chunkCurrent);
		if (
			state === null ||
			state === 0
		) {
			continue;
		}
		if (reduceChunks) {
			chunkGlobal = Uint8Array.from([...chunkGlobal, ...chunkCurrent.slice(0, state)]);
			while (chunkGlobal.length >= chunkSize) {
				yield chunkGlobal.slice(0, chunkSize);
				chunkGlobal = chunkGlobal.slice(chunkSize);
			}
		} else {
			yield chunkCurrent.slice(0, state);
		}
	}
	if (reduceChunks && chunkGlobal.length > 0) {
		yield chunkGlobal;
	}
}
