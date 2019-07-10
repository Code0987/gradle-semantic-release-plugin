import { IContext } from "./definition";
import { getCommand, getTaskToPublish } from "./gradle";

module.exports = async function verifyConditions(
  pluginConfig: object,
  context: IContext
) {
  const { cwd, env, logger } = context;
  const pd = (pluginConfig as any).pd || '';
  const t = (pluginConfig as any).t || '';
  const command = await getCommand(cwd, pd);
  if (!command.endsWith(process.platform === 'win32' ? 'gradlew.bat' : 'gradlew')) {
    throw new Error(`Gradle wrapper not found at ${pd}`);
  }
  logger.info(`Gradle wrapper found at ${pd}. Using ${command}.`);
  const task = await getTaskToPublish(cwd, pd, t, env as NodeJS.ProcessEnv, logger);
  if (task === "") {
    throw new Error("No task found that can publish artifacts");
  }
  logger.debug("Verified conditions, and found no problem");
};
