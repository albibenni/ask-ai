import { spawn } from "node:child_process";

export function openClaude(): void {
  // Spawn xdg-open detached so it doesn't block
  spawn("xdg-open", ["https://claude.ai/new"], {
    stdio: "ignore",
    detached: true,
  });
}
