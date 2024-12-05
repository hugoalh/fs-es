function isEntityReadable(stat: Deno.FileInfo): boolean {
	if (stat.mode === null) {
		return true;
	}
	if (Deno.uid() === stat.uid) {
		// Whether user is the owner and can read.
		return (stat.mode & 0o400) === 0o400;
	}
	if (Deno.gid() === stat.gid) {
		// Whether user group is the owner and can read.
		return (stat.mode & 0o040) === 0o040;
	}
	// Whether others can read.
	return (stat.mode & 0o004) === 0o004;
}
export interface FSExistOptions {
	/**
	 * Whether to check the path is a directory as well. Symlink directory are included.
	 * @default {false}
	 */
	isDirectory?: boolean;
	/**
	 * Whether to check the path is a file as well. Symlink file are included.
	 * @default {false}
	 */
	isFile?: boolean;
	/**
	 * Whether to check the path is readable by the user as well.
	 * 
	 * > **🛡️ Runtime Permissions**
	 * > 
	 * > - System Information \[Deno: `sys`\]
	 * >   - `gid` (POSIX/UNIX Platforms)
	 * >   - `uid` (POSIX/UNIX Platforms)
	 * @default {false}
	 */
	isReadable?: boolean;
}
/**
 * Test whether the path is exist, asynchronously.
 * 
 * Should not use this function to perform the check and then the operation on the same path, which creates a race condition; Should perform the operation directly.
 * 
 * > **🛡️ Runtime Permissions**
 * > 
 * > - File System - Read \[Deno: `read`; NodeJS 🧪: `fs-read`\]
 * >   - *Resources*
 * > - System Information \[Deno: `sys`\]
 * >   - `gid` (Optional, POSIX/UNIX Platforms)
 * >   - `uid` (Optional, POSIX/UNIX Platforms)
 * @param {string | URL} path Path.
 * @param {FSExistOptions} [options={}] Options.
 * @returns {Promise<boolean>} Determine result.
 * @example Test a path
 * ```ts
 * await exist("./exist");
 * //=> true
 * 
 * await exist("./not_exist");
 * //=> false
 * ```
 * @example Test the path whether is readable
 * ```ts
 * await exist("./readable", { isReadable: true });
 * //=> true
 * 
 * await exist("./not_readable", { isReadable: true });
 * //=> false
 * ```
 * @example Test the path whether is a directory
 * ```ts
 * await exist("./directory", { isDirectory: true });
 * //=> true
 * 
 * await exist("./file", { isDirectory: true });
 * //=> false
 * ```
 * @example Test the path whether is a file
 * ```ts
 * await exist("./file", { isFile: true });
 * //=> true
 * 
 * await exist("./directory", { isFile: true });
 * //=> false
 * ```
 * @example Test the path whether is a readable directory
 * ```ts
 * await exist("./readable_directory", { isReadable: true, isDirectory: true });
 * //=> true
 * 
 * await exist("./not_readable_directory", { isReadable: true, isDirectory: true });
 * //=> false
 * ```
 * @example Test the path whether is a readable file
 * ```ts
 * await exist("./readable_file", { isReadable: true, isFile: true });
 * //=> true
 * 
 * await exist("./not_readable_file", { isReadable: true, isFile: true });
 * //=> false
 * ```
 */
export async function exist(path: string | URL, options: FSExistOptions = {}): Promise<boolean> {
	const {
		isDirectory = false,
		isFile = false,
		isReadable = false
	}: FSExistOptions = options;
	if (isDirectory && isFile) {
		throw new Error(`Parameters \`options.isDirectory\` and \`options.isFile\` are mutually exclusive!`);
	}
	try {
		const entityStat: Deno.FileInfo = await Deno.stat(path);
		if (
			(isDirectory && !entityStat.isDirectory) ||
			(isFile && !entityStat.isFile)
		) {
			return false;
		}
		if (isReadable) {
			return isEntityReadable(entityStat);
		}
		return true;
	} catch (error) {
		if (error instanceof Deno.errors.NotFound) {
			return false;
		}
		if (error instanceof Deno.errors.NotCapable) {
			if ((await Deno.permissions.query({
				name: "read",
				path
			})).state === "granted") {
				// The entity is exist but cannot read.
				return !isReadable;
			}
		}
		throw error;
	}
}
/**
 * Test whether the path is exist, synchronously.
 * 
 * Should not use this function to perform the check and then the operation on the same path, which creates a race condition; Should perform the operation directly.
 * 
 * > **🛡️ Runtime Permissions**
 * > 
 * > - File System - Read \[Deno: `read`; NodeJS 🧪: `fs-read`\]
 * >   - *Resources*
 * > - System Information \[Deno: `sys`\]
 * >   - `gid` (Optional, POSIX/UNIX Platforms)
 * >   - `uid` (Optional, POSIX/UNIX Platforms)
 * @param {string | URL} path Path.
 * @param {FSExistOptions} [options={}] Options.
 * @returns {boolean} Determine result.
 * @example Test a path
* ```ts
* existSync("./exist");
* //=> true
* 
* existSync("./not_exist");
* //=> false
* ```
* @example Test the path whether is readable
* ```ts
* existSync("./readable", { isReadable: true });
* //=> true
* 
* existSync("./not_readable", { isReadable: true });
* //=> false
* ```
* @example Test the path whether is a directory
* ```ts
* existSync("./directory", { isDirectory: true });
* //=> true
* 
* existSync("./file", { isDirectory: true });
* //=> false
* ```
* @example Test the path whether is a file
* ```ts
* existSync("./file", { isFile: true });
* //=> true
* 
* existSync("./directory", { isFile: true });
* //=> false
* ```
* @example Test the path whether is a readable directory
* ```ts
* existSync("./readable_directory", { isReadable: true, isDirectory: true });
* //=> true
* 
* existSync("./not_readable_directory", { isReadable: true, isDirectory: true });
* //=> false
* ```
* @example Test the path whether is a readable file
* ```ts
* existSync("./readable_file", { isReadable: true, isFile: true });
* //=> true
* 
* existSync("./not_readable_file", { isReadable: true, isFile: true });
* //=> false
* ```
*/
export function existSync(path: string | URL, options: FSExistOptions = {}): boolean {
	const {
		isDirectory = false,
		isFile = false,
		isReadable = false
	}: FSExistOptions = options;
	if (isDirectory && isFile) {
		throw new Error(`Parameters \`options.isDirectory\` and \`options.isFile\` are mutually exclusive!`);
	}
	try {
		const entityStat: Deno.FileInfo = Deno.statSync(path);
		if (
			(isDirectory && !entityStat.isDirectory) ||
			(isFile && !entityStat.isFile)
		) {
			return false;
		}
		if (isReadable) {
			return isEntityReadable(entityStat);
		}
		return true;
	} catch (error) {
		if (error instanceof Deno.errors.NotFound) {
			return false;
		}
		if (error instanceof Deno.errors.NotCapable) {
			if (Deno.permissions.querySync({
				name: "read",
				path
			}).state === "granted") {
				// The entity is exist but cannot read.
				return !isReadable;
			}
		}
		throw error;
	}
}
