import {
	isJSONArray,
	isJSONObject,
	type JSONValue
} from "https://raw.githubusercontent.com/hugoalh/is-json-es/v1.0.4/mod.ts";
export interface FSDriveInfo {
	description: string;
	free: bigint;
	maximum: bigint;
	name: string;
	root: string;
	used: bigint;
	volumeSeparatedByColon: boolean;
}
export interface FSGetDriveInfoOptions {
	/**
	 * Filter the result with match these names or name of the drives.
	 * 
	 * Type the drive name or letter without a colon (`:`).
	 */
	name?: string | readonly string[];
	/**
	 * Specify the path of the PowerShell executable. By default, this looks for `pwsh` in the environment variable `PATH`.
	 * 
	 * Also accept these values:
	 * 
	 * - `"powershell"`
	 * - `"pwsh"`
	 * @default {"pwsh"}
	 */
	powershellPath?: string | URL;
}
function resolvePSDriveCommand(options: FSGetDriveInfoOptions = {}): Deno.Command {
	const { powershellPath = "pwsh" }: FSGetDriveInfoOptions = options;
	const args: string[] = ["-NoLogo", "-NonInteractive", "-NoProfileLoadTime"];
	if (Deno.build.os === "windows") {
		args.push("-WindowStyle", "Hidden");
	}
	args.push("-Command", `
$ErrorActionPreference = 'Stop'
[System.Management.Automation.PSDriveInfo[]]$Output = Get-PSDrive -PSProvider 'FileSystem'
$Output |
	Where-Object -FilterScript { $_.Name -inotin @('Temp') } |
	ForEach-Object -Process {
		[PSCustomObject]@{
			description = $_.Description ?? '';
			free = $_.Free.ToString()
			name = $_.Name
			root = $_.Root
			used = $_.Used.ToString()
			volumeSeparatedByColon = $_.VolumeSeparatedByColon
		}
	} |
	ConvertTo-Json -Depth 100 |
	Write-Host
`);
	return new Deno.Command(powershellPath, { args });
}
function resolvePSDriveInfo(commandOutput: Deno.CommandOutput): FSDriveInfo[] {
	const {
		code,
		stderr,
		stdout,
		success
	}: Deno.CommandOutput = commandOutput;
	const decoder: TextDecoder = new TextDecoder();
	if (!success) {
		throw new Error(`Unable to get the drive info with exit code \`${code}\`: ${decoder.decode(stderr)}`);
	}
	let raw: JSONValue;
	try {
		raw = JSON.parse(decoder.decode(stdout));
	} catch (error) {
		throw new Error(`Unable to get the drive info: ${error}`);
	}
	if (!isJSONArray(raw)) {
		throw new Error(`Unable to get the drive info: Invalid command output.`);
	}
	return raw.map((entity: JSONValue, index: number): FSDriveInfo => {
		if (!isJSONObject(entity)) {
			throw new Error(`Unable to get the drive info: Invalid command output \`[${index}]\`.`);
		}
		if (typeof entity.description !== "string") {
			throw new Error(`Unable to get the drive info: Invalid command output \`[${index}].description\`.`);
		}
		if (typeof entity.free !== "string") {
			throw new Error(`Unable to get the drive info: Invalid command output \`[${index}].free\`.`);
		}
		if (typeof entity.name !== "string") {
			throw new Error(`Unable to get the drive info: Invalid command output \`[${index}].name\`.`);
		}
		if (typeof entity.root !== "string") {
			throw new Error(`Unable to get the drive info: Invalid command output \`[${index}].root\`.`);
		}
		if (typeof entity.used !== "string") {
			throw new Error(`Unable to get the drive info: Invalid command output \`[${index}].used\`.`);
		}
		if (typeof entity.volumeSeparatedByColon !== "boolean") {
			throw new Error(`Unable to get the drive info: Invalid command output \`[${index}].volumeSeparatedByColon\`.`);
		}
		const free: bigint = BigInt(entity.free);
		const used: bigint = BigInt(entity.used);
		return {
			description: entity.description,
			free,
			maximum: free + used,
			name: entity.name,
			root: entity.root,
			used,
			volumeSeparatedByColon: entity.volumeSeparatedByColon
		};
	});
}
/**
 * Get the info of the drives, asynchronously.
 * 
 * > **🛡️ Runtime Permissions**
 * >
 * > - Subprocesses \[Deno: `run`\]
 * >   - `pwsh`
 * @param {FSGetDriveInfoOptions} [options={}] Options.
 * @returns {Promise<FSDriveInfo[]>} Info of the drives.
 */
export async function getDriveInfo(options?: FSGetDriveInfoOptions): Promise<FSDriveInfo[]> {
	return resolvePSDriveInfo(await resolvePSDriveCommand(options).output());
}
/**
 * Get the info of the drives, synchronously.
 * 
 * > **🛡️ Runtime Permissions**
 * >
 * > - Subprocesses \[Deno: `run`\]
 * >   - `pwsh`
 * @param {FSGetDriveInfoOptions} [options={}] Options.
 * @returns {FSDriveInfo[]} Info of the drives.
 */
export function getDriveInfoSync(options?: FSGetDriveInfoOptions): FSDriveInfo[] {
	return resolvePSDriveInfo(resolvePSDriveCommand(options).outputSync());
}