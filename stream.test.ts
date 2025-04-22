import { deepStrictEqual } from "node:assert";
import { readFileAsChunks } from "./stream.ts";
Deno.test("ReadFileAsChunks 64 Standard", {
	permissions: {
		read: true
	}
}, async () => {
	const filePath = "./README.md";
	const bytesExpected = (await Deno.stat(filePath)).size;
	let bytes = 0;
	let chunks = 0;
	for await (const chunk of readFileAsChunks(filePath, { chunkSize: 64 })) {
		bytes += chunk.length;
		chunks += 1;
	}
	deepStrictEqual(bytes, bytesExpected);
	console.debug(`Chunks: ${chunks}`);
});
Deno.test("ReadFileAsChunks 64 Reduce", {
	permissions: {
		read: true
	}
}, async () => {
	const filePath = "./README.md";
	const bytesExpected = (await Deno.stat(filePath)).size;
	let bytes = 0;
	let chunks = 0;
	for await (const chunk of readFileAsChunks(filePath, {
		chunkSize: 64,
		reduceChunks: true
	})) {
		bytes += chunk.length;
		chunks += 1;
	}
	deepStrictEqual(bytes, bytesExpected);
	console.debug(`Chunks: ${chunks}`);
});
Deno.test("ReadFileAsChunks 1024 Standard", {
	permissions: {
		read: true
	}
}, async () => {
	const filePath = "./README.md";
	const bytesExpected = (await Deno.stat(filePath)).size;
	let bytes = 0;
	let chunks = 0;
	for await (const chunk of readFileAsChunks(filePath, { chunkSize: 1024 })) {
		bytes += chunk.length;
		chunks += 1;
	}
	deepStrictEqual(bytes, bytesExpected);
	console.debug(`Chunks: ${chunks}`);
});
Deno.test("ReadFileAsChunks 1024 Reduce", {
	permissions: {
		read: true
	}
}, async () => {
	const filePath = "./README.md";
	const bytesExpected = (await Deno.stat(filePath)).size;
	let bytes = 0;
	let chunks = 0;
	for await (const chunk of readFileAsChunks(filePath, {
		chunkSize: 1024,
		reduceChunks: true
	})) {
		bytes += chunk.length;
		chunks += 1;
	}
	deepStrictEqual(bytes, bytesExpected);
	console.debug(`Chunks: ${chunks}`);
});
