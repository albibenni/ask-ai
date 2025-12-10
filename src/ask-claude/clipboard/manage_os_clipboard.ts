/**
 * This module provides functions to read from and write to the system Clipboard
 * across different operating systems (macOS, Linux with Wayland, Linux with X11).
 * It uses platform-specific commands to interact with the Clipboard.
 */
import { $ } from "bun";

type ClipboardCommands = {
  read: string[];
  write: string[];
};

/**
 * Determines the appropriate clipboard commands based on the operating system.
 * @returns {ClipboardCommands} Object containing the read and write command arrays for the clipboard.
 */
function getClipboardCommandsByOS(): ClipboardCommands {
  // macOS
  if (process.platform === "darwin") {
    return {
      read: ["pbpaste"],
      write: ["pbcopy"],
    };
  }

  // Linux - check for Wayland
  const isWayland =
    process.env.WAYLAND_DISPLAY || process.env.XDG_SESSION_TYPE === "wayland";
  if (isWayland) {
    return {
      read: ["wl-paste"],
      write: ["wl-copy"],
    };
  }

  // X11
  return {
    read: ["xclip", "-o", "-selection", "clipboard"],
    write: ["xclip", "-selection", "clipboard"],
  };
}

export async function getClipboard(): Promise<string> {
  const { read } = getClipboardCommandsByOS();
  try {
    const proc = Bun.spawn(read, { stdout: "pipe" });
    const text = await new Response(proc.stdout).text();
    await proc.exited;
    return text.trim();
  } catch (error) {
    console.error(`Failed to read from clipboard using: ${read.join(" ")}`);
    console.error(error);
    process.exit(1);
  }
}

export async function setClipboard(text: string): Promise<void> {
  const { write } = getClipboardCommandsByOS();
  try {
    const proc = Bun.spawn(write, { stdin: "pipe" });
    proc.stdin.write(text);
    proc.stdin.end();
    // Don't wait for process to exit - data is already written
  } catch (error) {
    console.error(`Failed to write to clipboard using: ${write.join(" ")}`);
    console.error(error);
    process.exit(1);
  }
}
