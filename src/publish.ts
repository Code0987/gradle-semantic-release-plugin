import { IContext } from "./definition";
import { publishArtifact } from "./gradle";

module.exports = async function publish(
  pluginConfig: object,
  context: IContext
) {
  const { cwd, env, logger } = context;  
  const wd = (pluginConfig as any).wd ||cwd;
  await publishArtifact(wd, env as NodeJS.ProcessEnv, logger);
};
