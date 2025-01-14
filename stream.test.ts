import { readFileAsChunksSync } from "./stream.ts";
Deno.test("ReadFileAsChunks Standard", {
	permissions: {
		read: true
	}
}, () => {
	let chunksCount = 0n;
	for (const chunk of readFileAsChunksSync("./README.md", { chunkSize: 64 })) {
		chunksCount += 1n;
		console.log(chunk);
	}
	console.debug(`Chunks: ${chunksCount}`);
});
Deno.test("ReadFileAsChunks Reduce", {
	permissions: {
		read: true
	}
}, () => {
	let chunksCount = 0n;
	for (const chunk of readFileAsChunksSync("./README.md", {
		chunkSize: 64,
		reduceChunks: true
	})) {
		chunksCount += 1n;
		console.log(chunk);
	}
	console.debug(`Chunks: ${chunksCount}`);
});
