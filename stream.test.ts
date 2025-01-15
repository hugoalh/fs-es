import { readFileAsChunksSync } from "./stream.ts";
Deno.test("ReadFileAsChunks 64 Standard", {
	permissions: {
		read: true
	}
}, () => {
	let bytes = 0n;
	let chunks = 0n;
	for (const chunk of readFileAsChunksSync("./README.md", { chunkSize: 64 })) {
		bytes += BigInt(chunk.length);
		chunks += 1n;
	}
	console.debug(`Bytes: ${bytes}; Chunks: ${chunks}`);
});
Deno.test("ReadFileAsChunks 64 Reduce", {
	permissions: {
		read: true
	}
}, () => {
	let bytes = 0n;
	let chunks = 0n;
	for (const chunk of readFileAsChunksSync("./README.md", {
		chunkSize: 64,
		reduceChunks: true
	})) {
		bytes += BigInt(chunk.length);
		chunks += 1n;
	}
	console.debug(`Bytes: ${bytes}; Chunks: ${chunks}`);
});
Deno.test("ReadFileAsChunks 1024 Standard", {
	permissions: {
		read: true
	}
}, () => {
	let bytes = 0n;
	let chunks = 0n;
	for (const chunk of readFileAsChunksSync("./README.md", { chunkSize: 1024 })) {
		bytes += BigInt(chunk.length);
		chunks += 1n;
	}
	console.debug(`Bytes: ${bytes}; Chunks: ${chunks}`);
});
Deno.test("ReadFileAsChunks 1024 Reduce", {
	permissions: {
		read: true
	}
}, () => {
	let bytes = 0n;
	let chunks = 0n;
	for (const chunk of readFileAsChunksSync("./README.md", {
		chunkSize: 1024,
		reduceChunks: true
	})) {
		bytes += BigInt(chunk.length);
		chunks += 1n;
	}
	console.debug(`Bytes: ${bytes}; Chunks: ${chunks}`);
});
