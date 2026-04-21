import { invokeDenoNodeJSTransformer } from "DNT";
import { parse as parseJSONC } from "STD_JSONC";
const jsrManifest = parseJSONC(await Deno.readTextFile("./jsr.jsonc"));
await invokeDenoNodeJSTransformer({
	copyEntries: [
		"LICENSE.md",
		"README.md"
	],
	//@ts-ignore Lazy type.
	entrypointsScript: jsrManifest.exports,
	generateDeclarationMap: true,
	mappings: {
		"https://raw.githubusercontent.com/hugoalh/sort-es/v0.3.0/collection.ts": {
			name: "@hugoalh/sort",
			version: "^0.3.0",
			subPath: "collection"
		},
		"https://raw.githubusercontent.com/hugoalh/sort-es/v0.3.0/elements.ts": {
			name: "@hugoalh/sort",
			version: "^0.3.0",
			subPath: "elements"
		}
	},
	metadata: {
		//@ts-ignore Lazy type.
		name: jsrManifest.name,
		//@ts-ignore Lazy type.
		version: jsrManifest.version,
		description: "A module for enhanced file system operation.",
		keywords: [
			"file-system",
			"file",
			"fs"
		],
		homepage: "https://github.com/hugoalh/fs-es#readme",
		bugs: {
			url: "https://github.com/hugoalh/fs-es/issues"
		},
		license: "MIT",
		author: "hugoalh",
		repository: {
			type: "git",
			url: "git+https://github.com/hugoalh/fs-es.git"
		},
		private: false,
		publishConfig: {
			access: "public"
		}
	},
	outputDirectory: "dist/npm-npm",
	outputDirectoryPreEmpty: true
});
