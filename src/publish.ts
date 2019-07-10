import { IContext } from "./definition";
import { publishArtifact } from "./gradle";

module.exports = async function publish(
  pluginConfig: object,
  context: IContext
) {
  const { cwd, env, logger } = context;  
  const pd = (pluginConfig as any).pd || '';
  const t = (pluginConfig as any).t || '';
  await publishArtifact(cwd, pd, t, env as NodeJS.ProcessEnv, logger);
};
