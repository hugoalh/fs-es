import {
	walk,
	walkSync
} from "./walk.ts";
/**
 * Get the size of the path, asynchronously.
 * 
 * > **🛡️ Runtime Permissions**
 * > 
 * > - File System - Read \[Deno: `read`; NodeJS 🧪: `fs-read`\]
 * >   - *Resources*
 * @param {string | URL} path Path.
 * @returns {Promise<bigint>} Size of the path, in bytes.
 */
export async function getSize(path: string | URL): Promise<bigint> {
	let result: bigint = 0n;
	const pathStatL: Deno.FileInfo = await Deno.lstat(path);
	result += BigInt(pathStatL.size);
	if (pathStatL.isDirectory) {
		for await (const { size } of await walk(path, { extraInfo: true })) {
			result += BigInt(size);
		}
	}
	return result;
}
/**
 * Get the size of the path, synchronously.
 * 
 * > **🛡️ Runtime Permissions**
 * > 
 * > - File System - Read \[Deno: `read`; NodeJS 🧪: `fs-read`\]
 * >   - *Resources*
 * @param {string | URL} path Path.
 * @returns {bigint} Size of the path, in bytes.
 */
export function getSizeSync(path: string | URL): bigint {
	let result: bigint = 0n;
	const pathStatL: Deno.FileInfo = Deno.lstatSync(path);
	result += BigInt(pathStatL.size);
	if (pathStatL.isDirectory) {
		for (const { size } of walkSync(path, { extraInfo: true })) {
			result += BigInt(size);
		}
	}
	return result;
}
