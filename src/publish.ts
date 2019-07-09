import { IContext } from "./definition";
import { publishArtifact } from "./gradle";

module.exports = async function publish(
  pluginConfig: object,
  context: IContext
) {
  const { cwd, env, logger } = context;  
  const pd = (pluginConfig as any).pd || '';
  await publishArtifact(cwd, pd, env as NodeJS.ProcessEnv, logger);
};
