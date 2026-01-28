import { invoke } from "@tauri-apps/api/core";
import type { UsageData, AuthStatus } from "./types";

export async function checkCredentials(): Promise<AuthStatus> {
  return invoke("check_credentials");
}

export async function fetchUsageData(): Promise<UsageData> {
  return invoke("fetch_usage_data");
}

export async function getCredentialsPath(): Promise<string> {
  return invoke("get_credentials_path_cmd");
}

export async function launchClaudeCli(): Promise<void> {
  return invoke("launch_claude_cli");
}

export async function closeClaudeTerminal(): Promise<void> {
  return invoke("close_claude_terminal");
}

export async function setWindowSize(width: number, height: number): Promise<void> {
  return invoke("set_window_size", { width, height });
}
