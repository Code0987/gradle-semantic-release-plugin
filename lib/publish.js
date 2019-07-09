"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gradle_1 = require("./gradle");
module.exports = async function publish(pluginConfig, context) {
    const { cwd, env, logger } = context;
    const pd = pluginConfig.pd || '';
    await gradle_1.publishArtifact(cwd, pd, env, logger);
};
