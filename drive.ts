import {
	isJSONArray,
	isJSONObject,
	type JSONValue
} from "https://raw.githubusercontent.com/hugoalh/is-json-es/v1.0.4/mod.ts";
export interface FSDriveInfo {
	/**
	 * Description of the drive; Maybe empty.
	 */
	description: string;
	/**
	 * Free size of the drive, in bytes.
	 */
	free: bigint;
	/**
	 * Maximum size of the drive, in bytes.
	 */
	maximum: bigint;
	/**
	 * Name of the drive.
	 */
	name: string;
	/**
	 * Root path of the drive.
	 */
	root: string;
	/**
	 * Used size of the drive, in bytes.
	 */
	used: bigint;
	/**
	 * Whether the drive root relative paths on this drive are separated by a colon. This is `true` on all of the platforms except for file systems on non Windows platforms.
	 */
	volumeSeparatedByColon: boolean;
}
export interface FSGetDriveInfoOptions {
	/**
	 * Specify the path of the PowerShell executable. By default, this looks for `pwsh` in the environment variable `PATH`.
	 * @default {"pwsh"}
	 */
	powershellPath?: string | URL;
}
function resolvePSDriveCommand(options: FSGetDriveInfoOptions = {}): Deno.Command {
	const { powershellPath = "pwsh" }: FSGetDriveInfoOptions = options;
	const args: string[] = ["-NoLogo", "-NonInteractive", "-NoProfile", "-NoProfileLoadTime"];
	if (Deno.build.os === "windows") {
		args.push("-WindowStyle", "Hidden");
	}
	args.push("-Command", `
#Requires -PSEdition Core
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
$WarningPreference = 'SilentlyContinue'
[PSCustomObject[]]$Result = @()
ForEach ($Drive In (Get-PSDrive -PSProvider 'FileSystem')) {
	If ($Drive.Name -iin @('Temp')) {
		Continue
	}
	$Result += [PSCustomObject]@{
		description = $Drive.Description ?? ''
		free = ($Drive.Free ?? 0).ToString()
		name = $Drive.Name
		root = $Drive.Root
		used = ($Drive.Used ?? 0).ToString()
		volumeSeparatedByColon = $Drive.VolumeSeparatedByColon
	}
}
Write-Host -Object (ConvertTo-Json -InputObject $Result -Depth 100 -Compress)
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
		throw new Error(`Unable to get the drive info: Invalid subprocess output.`);
	}
	return raw.map((entity: JSONValue, index: number): FSDriveInfo => {
		if (!isJSONObject(entity)) {
			throw new Error(`Unable to get the drive info: Invalid subprocess output \`[${index}]\`.`);
		}
		for (const key of Object.keys(entity)) {
			switch (key) {
				case "description":
				case "free":
				case "name":
				case "root":
				case "used":
					if (typeof entity[key] !== "string") {
						throw new Error(`Unable to get the drive info: Invalid subprocess output \`[${index}].${key}\`.`);
					}
					break;
				case "volumeSeparatedByColon":
					if (typeof entity[key] !== "boolean") {
						throw new Error(`Unable to get the drive info: Invalid subprocess output \`[${index}].${key}\`.`);
					}
					break;
				default:
					throw new Error(`Unable to get the drive info: Invalid subprocess output \`[${index}].${key}\`.`);
			}
		}
		const free: bigint = BigInt(entity.free as string);
		const used: bigint = BigInt(entity.used as string);
		return {
			description: entity.description as string,
			free,
			maximum: free + used,
			name: entity.name as string,
			root: entity.root as string,
			used,
			volumeSeparatedByColon: entity.volumeSeparatedByColon as boolean
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
