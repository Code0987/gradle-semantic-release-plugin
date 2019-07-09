import { join } from "path";
import { IContext } from "./definition";
import { getCommand, getTaskToPublish } from "./gradle";

module.exports = async function verifyConditions(
  pluginConfig: object,
  context: IContext
) {
  const { cwd, env, logger } = context;
  const wd = join(cwd, ((pluginConfig as any).wd || ''));
  const command = await getCommand(wd);
  if (!command.endsWith('gradlew')) {
    throw new Error(`Gradle wrapper not found at ${wd}`);
  }
  logger.info(`Gradle wrapper found at ${wd}. Using ${command}.`);
  const task = await getTaskToPublish(wd, env as NodeJS.ProcessEnv, logger);
  if (task === "") {
    throw new Error("No task found that can publish artifacts");
  }
  logger.debug("Verified conditions, and found no problem");
};
