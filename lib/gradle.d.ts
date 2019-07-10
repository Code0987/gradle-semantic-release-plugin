/// <reference types="node" />
import { Signale } from "signale";
/**
 * @param {string} cwd the path of current working directory
 * @return A promise that resolves name of command to trigger Gradle
 */
export declare function getCommand(cwd: string, pd: string): Promise<string>;
/**
 * @param {string} cwd the path of current working directory
 * @return A promise that resolves name of task to publish artifact
 */
export declare function getTaskToPublish(cwd: string, pd: string, t: string, env: NodeJS.ProcessEnv, logger: Signale): Promise<string>;
/**
 * @param {string} cwd the path of current working directory
 * @return A promise that resolves version of the target project
 */
export declare function getVersion(cwd: string, pd: string, env: NodeJS.ProcessEnv): Promise<string>;
export declare function publishArtifact(cwd: string, pd: string, t: string, env: NodeJS.ProcessEnv, logger: Signale): Promise<unknown>;
