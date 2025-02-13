"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const fs_1 = require("fs");
const path_1 = require("path");
const split = require("split2");
const INFO_ARTIFACTORY = `Two publishing plugins have found: Gradle Artifactory and Maven Publish.
Gradle Artifactory is used for release.`;
/**
 * @param {string} cwd the path of current working directory
 * @return A promise that resolves name of command to trigger Gradle
 */
function getCommand(cwd, pd) {
    return new Promise((resolve, reject) => {
        fs_1.access(path_1.join(cwd, path_1.join(pd, "gradlew")), fs_1.constants.F_OK, err => {
            if (err) {
                if (err.code === "ENOENT") {
                    resolve("gradle");
                }
                else {
                    reject(err);
                }
            }
            else {
                if (process.platform === 'win32') {
                    resolve("gradlew.bat");
                }
                else {
                    resolve("./gradlew");
                }
            }
        });
    });
}
exports.getCommand = getCommand;
/**
 * @param {string} cwd the path of current working directory
 * @return A promise that resolves name of task to publish artifact
 */
function getTaskToPublish(cwd, pd, t, env, logger) {
    return new Promise(async (resolve, reject) => {
        const command = await getCommand(cwd, pd);
        const child = child_process_1.spawn(command, ['-q', 'tasks', '--all'], {
            cwd: path_1.join(cwd, pd),
            env,
            shell: process.platform === 'win32',
            stdio: ["inherit", "pipe"],
        });
        if (child.stdout === null) {
            reject(new Error("Unexpected error: stdout of subprocess is null"));
        }
        else {
            let task = "";
            child.stdout.pipe(split()).on("data", (line) => {
                if (t && t.length > 0 && line.startsWith(t)) {
                    task = t;
                }
                else if (line.startsWith("artifactoryDeploy -")) {
                    // Plugins Gradle Artifactory Plugin and Maven Publish Plugin are often used together
                    if (task !== "" && task !== "publish") {
                        reject(new Error("Found multiple tasks to publish"));
                    }
                    if (task === "publish") {
                        logger.info(INFO_ARTIFACTORY);
                    }
                    task = "artifactoryDeploy";
                }
                else if (line.startsWith("publish -")) {
                    // Plugins Gradle Artifactory Plugin and Maven Publish Plugin are often used together
                    if (task !== "" && task !== "artifactoryDeploy") {
                        reject(new Error("Found multiple tasks to publish"));
                    }
                    if (task === "artifactoryDeploy") {
                        logger.info(INFO_ARTIFACTORY);
                    }
                    else {
                        task = "publish";
                    }
                }
                else if (line.startsWith("uploadArchives -")) {
                    if (task !== "") {
                        reject(new Error("Found multiple tasks to publish"));
                    }
                    task = "uploadArchives";
                }
            });
            child.on("close", (code) => {
                if (code !== 0) {
                    reject(new Error(`Unexpected error: Gradle failed with status code ${code}`));
                }
                resolve(task);
            });
            child.stdout.on('data', (data) => {
                logger.info(data.toString());
            });
            if (child.stderr) {
                child.stderr.on('data', (data) => {
                    logger.info(data.toString());
                });
            }
            child.on("error", err => {
                reject(err);
            });
        }
    });
}
exports.getTaskToPublish = getTaskToPublish;
/**
 * @param {string} cwd the path of current working directory
 * @return A promise that resolves version of the target project
 */
function getVersion(cwd, pd, env) {
    return new Promise(async (resolve, reject) => {
        const command = await getCommand(cwd, pd);
        const child = child_process_1.spawn(command, ['-q', 'properties'], {
            cwd: path_1.join(cwd, pd),
            env,
            shell: process.platform === 'win32',
            stdio: ["inherit", "pipe"],
        });
        if (child.stdout === null) {
            reject(new Error("Unexpected error: stdout of subprocess is null"));
        }
        else {
            let version = "";
            child.stdout.pipe(split()).on("data", (line) => {
                if (line.startsWith("version:")) {
                    version = line.substring("version:".length).trim();
                }
            });
            child.on("close", (code) => {
                if (code !== 0) {
                    reject(new Error(`Unexpected error: Gradle failed with status code ${code}`));
                }
                resolve(version);
            });
            child.on("error", err => {
                reject(err);
            });
        }
    });
}
exports.getVersion = getVersion;
function publishArtifact(cwd, pd, t, env, logger) {
    return new Promise(async (resolve, reject) => {
        const command = getCommand(cwd, pd);
        const task = getTaskToPublish(cwd, pd, t, env, logger);
        const child = child_process_1.spawn(await command, ['-q', await task], {
            cwd: path_1.join(cwd, pd),
            env,
            shell: process.platform === 'win32'
        });
        child.stdout.on('data', (data) => {
            logger.info(data.toString());
        });
        if (child.stderr) {
            child.stderr.on('data', (data) => {
                logger.info(data.toString());
            });
        }
        child.on("close", code => {
            if (code !== 0) {
                reject(`Failed to publish: Gradle failed with status code ${code}.`);
            }
            else {
                resolve();
            }
        });
    });
}
exports.publishArtifact = publishArtifact;
