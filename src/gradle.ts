import { spawn } from "child_process";
import { access, constants } from "fs";
import { join } from "path";
import { Signale } from "signale";
import split = require("split2");

const INFO_ARTIFACTORY = `Two publishing plugins have found: Gradle Artifactory and Maven Publish.
Gradle Artifactory is used for release.`;

/**
 * @param {string} cwd the path of current working directory
 * @return A promise that resolves name of command to trigger Gradle
 */
export function getCommand(cwd: string, pd: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    access(join(cwd, join(pd, "gradlew")), constants.F_OK, err => {
      if (err) {
        if (err.code === "ENOENT") {
          resolve("gradle");
        } else {
          reject(err);
        }
      } else {
        if (process.platform === 'win32') {
          resolve(join(pd, "gradlew.bat"));
        } else {
          resolve("./" + join(pd, "gradlew"));
        }
      }
    });
  });
}

/**
 * @param {string} cwd the path of current working directory
 * @return A promise that resolves name of task to publish artifact
 */
export function getTaskToPublish(
  cwd: string,
  pd: string,
  t: string,
  env: NodeJS.ProcessEnv,
  logger: Signale
): Promise<string> {
  return new Promise(async (resolve, reject) => {
    const command = await getCommand(cwd, pd);
    const child = spawn(command, ["-p " + pd, "tasks --all", "-q"], {
      cwd,
      env,
      shell: process.platform === 'win32',
      stdio: ["inherit", "pipe"],
    });
    if (child.stdout === null) {
      reject(new Error("Unexpected error: stdout of subprocess is null"));
    } else {
      let task = "";
      child.stdout.pipe(split()).on("data", (line: string) => {
        if (t && t.length > 0 && line.trim() === t) {
          if (task !== "") {
            reject(new Error("Found multiple tasks to publish"));
          }
          task = t;
        } else if (line.startsWith("artifactoryDeploy -")) {
          // Plugins Gradle Artifactory Plugin and Maven Publish Plugin are often used together
          if (task !== "" && task !== "publish") {
            reject(new Error("Found multiple tasks to publish"));
          }
          if (task === "publish") {
            logger.info(INFO_ARTIFACTORY);
          }
          task = "artifactoryDeploy";
        } else if (line.startsWith("publish -")) {
          // Plugins Gradle Artifactory Plugin and Maven Publish Plugin are often used together
          if (task !== "" && task !== "artifactoryDeploy") {
            reject(new Error("Found multiple tasks to publish"));
          }
          if (task === "artifactoryDeploy") {
            logger.info(INFO_ARTIFACTORY);
          } else {
            task = "publish";
          }
        } else if (line.startsWith("uploadArchives -")) {
          if (task !== "") {
            reject(new Error("Found multiple tasks to publish"));
          }
          task = "uploadArchives";
        }
      });
      child.on("close", (code: number) => {
        if (code !== 0) {
          reject(
            new Error(
              `Unexpected error: Gradle failed with status code ${code}`
            )
          );
        }
        resolve(task);
      });
      child.stdout.on('data', (data: string) => {
        logger.info(data);
      });
      if (child.stderr) {
        child.stderr.on('data', (data: string) => {
          logger.info(data);
        });
      }
      child.on("error", err => {
        reject(err);
      });
    }
  });
}

/**
 * @param {string} cwd the path of current working directory
 * @return A promise that resolves version of the target project
 */
export function getVersion(
  cwd: string,
  pd: string,
  env: NodeJS.ProcessEnv
): Promise<string> {
  return new Promise(async (resolve, reject) => {
    const command = await getCommand(cwd, pd);
    const child = spawn(command, ["-p " + pd, "properties", "-q"], {
      cwd,
      env,
      shell: process.platform === 'win32',
      stdio: ["inherit", "pipe"],
    });
    if (child.stdout === null) {
      reject(new Error("Unexpected error: stdout of subprocess is null"));
    } else {
      let version = "";
      child.stdout.pipe(split()).on("data", (line: string) => {
        if (line.startsWith("version:")) {
          version = line.substring("version:".length).trim();
        }
      });
      child.on("close", (code: number) => {
        if (code !== 0) {
          reject(
            new Error(
              `Unexpected error: Gradle failed with status code ${code}`
            )
          );
        }
        resolve(version);
      });
      child.on("error", err => {
        reject(err);
      });
    }
  });
}

export function publishArtifact(
  cwd: string,
  pd: string,
  t: string,
  env: NodeJS.ProcessEnv,
  logger: Signale
) {
  return new Promise(async (resolve, reject) => {
    const command = getCommand(cwd, pd);
    const task = getTaskToPublish(cwd, pd, t, env, logger);
    const child = spawn(await command, ["-p " + pd, await task, "-q"], { cwd, env, shell: process.platform === 'win32' });
    child.stdout.on('data', (data: string) => {
      logger.info(data);
    });
    if (child.stderr) {
      child.stderr.on('data', (data: string) => {
        logger.info(data);
      });
    }
    child.on("close", code => {
      if (code !== 0) {
        reject(`Failed to publish: Gradle failed with status code ${code}.`);
      } else {
        resolve();
      }
    });
  });
}
