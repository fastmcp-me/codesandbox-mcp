import { CodeSandbox } from "@codesandbox/sdk";
import type { AppConfig } from "../config";

// Pure factory for CodeSandbox SDK client
export const createSdk = (cfg: AppConfig) => new CodeSandbox(cfg.token);

