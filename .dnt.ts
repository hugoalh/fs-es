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
