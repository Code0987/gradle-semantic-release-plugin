"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const properties_1 = require("properties");
const util_1 = require("util");
const gradle_1 = require("./gradle");
const parseProperties = util_1.promisify(properties_1.parse);
const writeProperties = util_1.promisify(properties_1.stringify);
async function updateVersion(cwd, pd, vf, version) {
    const path = path_1.join(cwd, path_1.join(pd, vf));
    const prop = (await parseProperties(path, { path: true }));
    prop.version = version;
    await writeProperties(prop, { path });
}
exports.updateVersion = updateVersion;
async function prepare(pluginConfig, context) {
    const { cwd, env, nextRelease } = context;
    const pd = pluginConfig.pd || '';
    const vf = pluginConfig.vf || 'gradle.properties';
    await updateVersion(cwd, pd, vf, nextRelease.version);
    const version = await gradle_1.getVersion(cwd, pd, env);
    if (version !== nextRelease.version) {
        throw new Error(`Failed to update version from ${version} to ${nextRelease.version}. ` +
            "Make sure that you define version not in build.gradle but in gradle.properties.");
    }
}
exports.default = prepare;
