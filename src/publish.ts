import { join } from "path";
import { IContext } from "./definition";
import { publishArtifact } from "./gradle";

module.exports = async function publish(
  pluginConfig: object,
  context: IContext
) {
  const { cwd, env, logger } = context;  
  const wd = join(cwd, ((pluginConfig as any).wd || ''));
  await publishArtifact(wd, env as NodeJS.ProcessEnv, logger);
};
