"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const gradle_1 = require("./gradle");
module.exports = async function verifyConditions(pluginConfig, context) {
    const { cwd, env, logger } = context;
    const wd = path_1.join(cwd, (pluginConfig.wd || ''));
    const command = await gradle_1.getCommand(wd);
    if (command !== "./gradlew") {
        throw new Error(`Gradle wrapper not found at ${wd}`);
    }
    const task = await gradle_1.getTaskToPublish(wd, env, logger);
    if (task === "") {
        throw new Error("No task found that can publish artifacts");
    }
    logger.debug("Verified conditions, and found no problem");
};
