import {
	isAbsolute as isPathAbsolute,
	join as joinPath,
	resolve as resolvePath
} from "node:path";
import { fileURLToPath as getPathFromFileURL } from "node:url";
export function convertToPathString(path: string | URL): string {
	return ((path instanceof URL) ? getPathFromFileURL(path) : path);
}
export function resolvePathAbsolute(path: string | URL): string {
	const pathFmt: string = convertToPathString(path);
	return (isPathAbsolute(pathFmt) ? pathFmt : joinPath(Deno.cwd(), pathFmt));
}
export function isSamePath(pathA: string | URL, pathB: string | URL): boolean {
	return (resolvePath(resolvePathAbsolute(pathA)) === resolvePath(resolvePathAbsolute(pathB)));
}
