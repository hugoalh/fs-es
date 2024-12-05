export type EntityType = "directory" | "file" | "unknown" | "symlink";
/**
 * Get the entity type as string.
 * @param {Deno.DirEntry | Deno.FileInfo} stat Entity information.
 * @returns {EntityType} Entity type as a string.
 */
export function getEntityTypeString(stat: Deno.DirEntry | Deno.FileInfo): EntityType {
	if (stat.isDirectory) {
		return "directory";
	}
	if (stat.isFile) {
		return "file";
	}
	if (stat.isSymlink) {
		return "symlink";
	}
	return "unknown";
}
