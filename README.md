# File System (ES)

[**⚖️** MIT](./LICENSE.md)

[![GitHub: hugoalh/fs-es](https://img.shields.io/github/v/release/hugoalh/fs-es?label=hugoalh/fs-es&labelColor=181717&logo=github&logoColor=ffffff&sort=semver&style=flat "GitHub: hugoalh/fs-es")](https://github.com/hugoalh/fs-es)
[![JSR: @hugoalh/fs](https://img.shields.io/jsr/v/@hugoalh/fs?label=@hugoalh/fs&labelColor=F7DF1E&logo=jsr&logoColor=000000&style=flat "JSR: @hugoalh/fs")](https://jsr.io/@hugoalh/fs)
[![NPM: @hugoalh/fs](https://img.shields.io/npm/v/@hugoalh/fs?label=@hugoalh/fs&labelColor=CB3837&logo=npm&logoColor=ffffff&style=flat "NPM: @hugoalh/fs")](https://www.npmjs.com/package/@hugoalh/fs)

An ES (JavaScript & TypeScript) module for enhanced file system operation.

## 🔰 Begin

### 🎯 Targets

|  | **Remote** | **JSR** | **NPM** |
|:--|:--|:--|:--|
| **[Bun](https://bun.sh/)** >= v1.1.0 | ❌ | ❓ | ✔️ |
| **[Deno](https://deno.land/)** >= v2.1.0 | ✔️ | ✔️ | ✔️ |
| **[NodeJS](https://nodejs.org/)** >= v22.11.0 | ❌ | ❓ | ✔️ |

> [!NOTE]
> - It is possible to use this module in other methods/ways which not listed in here, however those methods/ways are not officially supported, and should beware maybe cause security issues.

### #️⃣ Resources Identifier

- **Remote - GitHub Raw:**
  ```
  https://raw.githubusercontent.com/hugoalh/fs-es/{Tag}/mod.ts
  ```
- **JSR:**
  ```
  [jsr:]@hugoalh/fs[@{Tag}]
  ```
- **NPM:**
  ```
  [npm:]@hugoalh/fs[@{Tag}]
  ```

> [!NOTE]
> - For usage of remote resources, it is recommended to import the entire module with the main path `mod.ts`, however it is also able to import part of the module with sub path if available, but do not import if:
>
>   - it's path has an underscore prefix (e.g.: `_foo.ts`, `_util/bar.ts`), or
>   - it is a benchmark or test file (e.g.: `foo.bench.ts`, `foo.test.ts`), or
>   - it's symbol has an underscore prefix (e.g.: `_bar`, `_foo`).
>
>   These elements are not considered part of the public API, thus no stability is guaranteed for them.
> - For usage of JSR or NPM resources, it is recommended to import the entire module with the main entrypoint, however it is also able to import part of the module with sub entrypoint if available, please visit the [file `jsr.jsonc`](./jsr.jsonc) property `exports` for available sub entrypoints.
> - It is recommended to use this module with tag for immutability.

### 🛡️ Runtime Permissions

- File System - Read \[Deno: `read`; NodeJS 🧪: `fs-read`\]
  - *Resources*
- File System - Write \[Deno: `write`; NodeJS 🧪: `fs-write`\]
  - *Resources* (Optional)
- Subprocesses \[Deno: `run`\]
  - `pwsh` (Optional)
- System Information \[Deno: `sys`\]
  - `gid` (Optional, POSIX/UNIX Platforms)
  - `uid` (Optional, POSIX/UNIX Platforms)

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
  function getDriveInfo(options?: FSGetDriveInfoOptions): Promise<FSDriveInfo[]>;
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
>   - [Deno CLI `deno doc`](https://docs.deno.com/runtime/reference/cli/documentation_generator/)
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
