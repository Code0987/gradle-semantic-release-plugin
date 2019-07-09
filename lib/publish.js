"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gradle_1 = require("./gradle");
module.exports = async function publish(pluginConfig, context) {
    const { cwd, env, logger } = context;
    const wd = pluginConfig.wd || cwd;
    await gradle_1.publishArtifact(wd, env, logger);
};
