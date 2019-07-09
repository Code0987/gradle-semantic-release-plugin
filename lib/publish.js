"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const gradle_1 = require("./gradle");
module.exports = async function publish(pluginConfig, context) {
    const { cwd, env, logger } = context;
    const wd = path_1.join(cwd, (pluginConfig.wd || ''));
    await gradle_1.publishArtifact(wd, env, logger);
};
