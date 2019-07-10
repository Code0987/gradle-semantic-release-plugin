"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gradle_1 = require("./gradle");
module.exports = async function verifyConditions(pluginConfig, context) {
    const { cwd, env, logger } = context;
    const pd = pluginConfig.pd || '';
    const t = pluginConfig.t || '';
    const command = await gradle_1.getCommand(cwd, pd);
    if (!command.endsWith(process.platform === 'win32' ? 'gradlew.bat' : 'gradlew')) {
        throw new Error(`Gradle wrapper not found at ${pd}`);
    }
    logger.info(`Gradle wrapper found at ${pd}. Using ${command}.`);
    const task = await gradle_1.getTaskToPublish(cwd, pd, t, env, logger);
    if (task === "") {
        throw new Error("No task found that can publish artifacts");
    }
    logger.debug("Verified conditions, and found no problem");
};
