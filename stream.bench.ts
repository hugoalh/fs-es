import {
	readFileAsChunks,
	readFileAsChunksSync
} from "./stream.ts";
Deno.bench("ReadFileAsChunks Async 64 Standard", {
	permissions: {
		read: true
	}
}, async () => {
	for await (const chunk of readFileAsChunks("./README.md", { chunkSize: 64 })) {
		void chunk;
	}
});
Deno.bench("ReadFileAsChunks Sync 64 Standard", {
	permissions: {
		read: true
	}
}, () => {
	for (const chunk of readFileAsChunksSync("./README.md", { chunkSize: 64 })) {
		void chunk;
	}
});
Deno.bench("ReadFileAsChunks Async 64 Reduce", {
	permissions: {
		read: true
	}
}, async () => {
	for await (const chunk of readFileAsChunks("./README.md", {
		chunkSize: 64,
		reduceChunks: true
	})) {
		void chunk;
	}
});
Deno.bench("ReadFileAsChunks Sync 64 Reduce", {
	permissions: {
		read: true
	}
}, () => {
	for (const chunk of readFileAsChunksSync("./README.md", {
		chunkSize: 64,
		reduceChunks: true
	})) {
		void chunk;
	}
});
Deno.bench("ReadFileAsChunks Async 1024 Standard", {
	permissions: {
		read: true
	}
}, async () => {
	for await (const chunk of readFileAsChunks("./README.md", { chunkSize: 1024 })) {
		void chunk;
	}
});
Deno.bench("ReadFileAsChunks Sync 1024 Standard", {
	permissions: {
		read: true
	}
}, () => {
	for (const chunk of readFileAsChunksSync("./README.md", { chunkSize: 1024 })) {
		void chunk;
	}
});
Deno.bench("ReadFileAsChunks Async 1024 Reduce", {
	permissions: {
		read: true
	}
}, async () => {
	for await (const chunk of readFileAsChunks("./README.md", {
		chunkSize: 1024,
		reduceChunks: true
	})) {
		void chunk;
	}
});
Deno.bench("ReadFileAsChunks Sync 1024 Reduce", {
	permissions: {
		read: true
	}
}, () => {
	for (const chunk of readFileAsChunksSync("./README.md", {
		chunkSize: 1024,
		reduceChunks: true
	})) {
		void chunk;
	}
});
