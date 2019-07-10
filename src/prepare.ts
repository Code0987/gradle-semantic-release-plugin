import { join } from "path";
import { parse, stringify } from "properties";
import { promisify } from "util";
import { IContext } from "./definition";
import { getVersion } from "./gradle";
const parseProperties = promisify(parse);
const writeProperties = promisify(stringify);

export async function updateVersion(
  cwd: string,
  pd: string,
  vf: string,
  version: string
): Promise<void> {
  const path = join(cwd, join(pd, vf));
  const prop = (await parseProperties(path, { path: true })) as {
    version: string;
    versionCode: number;
  };
  prop.version = version;
  const digits = version.trim().split('.').map(x => parseInt(x, 10));
  const code = (Math.pow(10, 10 - 2) * digits[0]) + (Math.pow(10, 5 - 1) * digits[1]) + (digits[2]);
  prop.versionCode = code;
  await writeProperties(prop, { path });
}

export default async function prepare(pluginConfig: object, context: IContext) {
  const { cwd, env, nextRelease } = context;
  const pd = (pluginConfig as any).pd || '';
  const vf = (pluginConfig as any).vf || 'gradle.properties';
  await updateVersion(cwd, pd, vf, nextRelease.version);
  const version = await getVersion(cwd, pd, env as NodeJS.ProcessEnv);
  if (version !== nextRelease.version) {
    throw new Error(
      `Failed to update version from ${version} to ${nextRelease.version}. ` +
      "Make sure that you define version not in build.gradle but in gradle.properties."
    );
  }
}
