import { spawn } from "node:child_process";

export function notify(title: string, message: string): void {
  try {
    spawn("notify-send", [title, message], {
      stdio: "ignore",
      detached: true,
    });
  } catch {
    console.log(`${title}: ${message}`);
  }
}
