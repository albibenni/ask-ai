/**
 * This module provides functions to read from and write to the system Clipboard
 * across different operating systems (macOS, Linux with Wayland, Linux with X11).
 * It uses platform-specific commands to interact with the Clipboard.
 */

import { spawn } from "node:child_process";
import { writeFile, unlink } from "node:fs/promises";
import { ChunkSchema, type ClipboardCommands } from "../types/types.ts";
import z from "zod/v4";

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
    // Spawn process and capture stdout
    const clipboard = z.string("Clipboard cannot be empty").parse(read[0]);
    const proc = spawn(clipboard, read.slice(1), {
      stdio: ["ignore", "pipe", "ignore"],
    });

    // Collect stdout chunks
    const chunks: Buffer[] = [];
    for await (const chunk of proc.stdout) {
      chunks.push(ChunkSchema.parse(chunk));
    }

    // Wait for process to complete
    await new Promise<void>((resolve, reject) => {
      proc.on("close", (code) => {
        if (code === 0) resolve();
        else reject(new Error(`Process exited with code ${code}`));
      });
      proc.on("error", reject);
    });

    const text = Buffer.concat(chunks).toString("utf-8");
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
    // Write to temp file and pipe to clipboard - more reliable
    const tempFile = `/tmp/ai-clipboard-${Date.now()}`;
    await writeFile(tempFile, text, "utf-8");

    //sh -c "cat /tmp/ai-clipboard-123456 | pbcopy"
    const proc = spawn("sh", ["-c", `cat ${tempFile} | ${write.join(" ")}`], {
      stdio: ["ignore", "pipe", "pipe"],
    });

    // Wait for process to complete
    await new Promise<void>((resolve, reject) => {
      proc.on("close", (code) => {
        if (code === 0) resolve();
        else reject(new Error(`Process exited with code ${code}`));
      });
      proc.on("error", reject);
    });

    // Clean up temp file
    await unlink(tempFile);
  } catch (error) {
    console.error(`Failed to write to clipboard using: ${write.join(" ")}`);
    console.error(error);
    process.exit(1);
  }
}
