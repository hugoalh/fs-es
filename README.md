# File System (ES)

[**⚖️** MIT](./LICENSE.md)

🔗
[GitHub](https://github.com/hugoalh/fs-es)
[JSR](https://jsr.io/@hugoalh/fs)
[NPM](https://www.npmjs.com/package/@hugoalh/fs)

An ECMAScript module for enhanced file system operation.

## 🎯 Targets

| **Runtime \\ Source** | **GitHub Raw** | **JSR** | **NPM** |
|:--|:-:|:-:|:-:|
| **[Bun](https://bun.sh/)** >= v1.1.0 | ❌ | ❓ | ✔️ |
| **[Deno](https://deno.land/)** >= v2.1.0 | ✔️ | ✔️ | ✔️ |
| **[NodeJS](https://nodejs.org/)** >= v20.9.0 | ❌ | ❓ | ✔️ |

## 🛡️ Runtime Permissions

- File System - Read (Deno: `read`; NodeJS: `fs-read`)
  - *Resources*
- File System - Write (Deno: `write`; NodeJS: `fs-write`)
  - *Resources* (Optional)
- Subprocesses (Deno: `run`)
  - `pwsh` (Optional)
- System Information (Deno: `sys`)
  - `gid` (Optional, POSIX/UNIX Platforms)
  - `uid` (Optional, POSIX/UNIX Platforms)

## #️⃣ Sources

- GitHub Raw
  ```
  https://raw.githubusercontent.com/hugoalh/fs-es/{Tag}/mod.ts
  ```
- JSR
  ```
  jsr:@hugoalh/fs[@{Tag}]
  ```
- NPM
  ```
  npm:@hugoalh/fs[@{Tag}]
  ```

> [!NOTE]
> - It is recommended to include tag for immutability.
> - These are not part of the public APIs hence should not be used:
>   - Benchmark/Test file (e.g.: `example.bench.ts`, `example.test.ts`).
>   - Entrypoint name or path include any underscore prefix (e.g.: `_example.ts`, `foo/_example.ts`).
>   - Identifier/Namespace/Symbol include any underscore prefix (e.g.: `_example`, `Foo._example`).

## ⤵️ Entrypoints

| **Name** | **Path** | **Description** |
|:--|:--|:--|
| `.` | `./mod.ts` | Default. |

## 🧩 APIs

- ```ts
  function compareDirectories(oldPath: string | URL, newPath: string | URL): Promise<FSCompareDirectoriesResult>;
  ```
- ```ts
  function emptyDir(path: string | URL): Promise<void>;
  ```
- ```ts
  function ensureDir(path: string | URL): Promise<void>;
  ```
- ```ts
  function ensureFile(path: string | URL): Promise<void>;
  ```
- ```ts
  function ensureLink(sourcePath: string | URL, targetPath: string | URL): Promise<void>;
  ```
- ```ts
  function ensureSymlink(sourcePath: string | URL, targetPath: string | URL): Promise<void>;
  ```
- ```ts
  function exist(path: string | URL, options?: FSExistOptions): Promise<boolean>;
  ```
- ```ts
  function getHash(path: string | URL, options?: FSGetHashOptions): Promise<string>;
  ```
- ```ts
  function getSize(path: string | URL): Promise<bigint>;
  ```
- ```ts
  function walk(root: string | URL, options?: FSWalkOptions & { extraInfo?: false; }): Promise<AsyncGenerator<FSWalkEntry>>;
  function walk(root: string | URL, options: FSWalkOptions & { extraInfo: true; }): Promise<AsyncGenerator<FSWalkEntryExtra>>;
  ```

> [!NOTE]
> - For the full or prettier documentation, can visit via:
>   - [Deno CLI `deno doc`](https://docs.deno.com/runtime/reference/cli/doc/)
>   - [JSR](https://jsr.io/@hugoalh/fs)

## ✍️ Examples

- ```ts
  await emptyDir("./foo");
  ```
- ```ts
  await ensureDir("./foo");
  ```
- ```ts
  await ensureFile("./foo.dat");
  ```
- ```ts
  await ensureLink("./path/to/source.dat", "./path/to/link.dat");
  ```
- ```ts
  await ensureSymlink("./path/to/source.dat", "./path/to/link.dat");
  ```
- ```ts
  await exist("./exist");
  //=> true
  ```
- ```ts
  await getHash(Deno.cwd());
  //=> "87C77A27D4779AB3078B941B86FF07CA0929A4E9D9581F6BAE380F3194287E3ADF4863355711426E79D4B673B71E9DE5F2A3E3F9D12C93FF2BDBD376DE93065D"
  ```
