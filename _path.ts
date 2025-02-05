import { fromFileUrl as getPathFromFileUrl } from "jsr:@std/path@^1.0.8/from-file-url";
import { isAbsolute as isPathAbsolute } from "jsr:@std/path@^1.0.8/is-absolute";
import { join as joinPath } from "jsr:@std/path@^1.0.8/join";
export function resolvePathAbsolute(path: string | URL): string {
	const pathFmt: string = (path instanceof URL) ? getPathFromFileUrl(path) : path;
	return (isPathAbsolute(pathFmt) ? pathFmt : joinPath(Deno.cwd(), pathFmt));
}
