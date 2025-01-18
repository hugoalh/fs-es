import {
	getMetadataFromConfig,
	invokeDenoNodeJSTransformer
} from "DNT";
const configJSR = await getMetadataFromConfig("jsr.jsonc");
await invokeDenoNodeJSTransformer({
	copyAssets: [
		"LICENSE.md",
		"README.md"
	],
	entrypoints: configJSR.getExports(),
	generateDeclarationMap: true,
	mappings: {
		"https://raw.githubusercontent.com/hugoalh/fnv-es/v0.1.0/1a.ts": {
			name: "@hugoalh/fnv",
			version: "^0.1.0",
			subPath: "1a"
		},
		"https://raw.githubusercontent.com/hugoalh/is-json-es/v1.0.4/mod.ts": {
			name: "@hugoalh/is-json",
			version: "^1.0.4"
		},
		"https://raw.githubusercontent.com/hugoalh/sort-es/v0.1.1/collection.ts": {
			name: "@hugoalh/sort",
			version: "^0.1.1",
			subPath: "collection"
		}
	},
	metadata: {
		name: configJSR.getName(),
		version: configJSR.getVersion(),
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
		scripts: {
		},
		engines: {
			node: ">=16.13.0"
		},
		private: false,
		publishConfig: {
			access: "public"
		}
	},
	outputDirectory: "npm",
	outputDirectoryPreEmpty: true
});
