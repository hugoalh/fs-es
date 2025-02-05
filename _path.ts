import { fromFileUrl as getPathFromFileUrl } from "jsr:@std/path@^1.0.8/from-file-url";
import { isAbsolute as isPathAbsolute } from "jsr:@std/path@^1.0.8/is-absolute";
import { join as joinPath } from "jsr:@std/path@^1.0.8/join";
import { resolve as resolvePath } from "jsr:@std/path@^1.0.8/resolve";
export function convertToPathString(path: string | URL): string {
	return ((path instanceof URL) ? getPathFromFileUrl(path) : path);
}
export function resolvePathAbsolute(path: string | URL): string {
	const pathFmt: string = convertToPathString(path);
	return (isPathAbsolute(pathFmt) ? pathFmt : joinPath(Deno.cwd(), pathFmt));
}
export function isSamePath(a: string | URL, b: string | URL): boolean {
	return (resolvePath(resolvePathAbsolute(a)) === resolvePath(resolvePathAbsolute(b)));
}
