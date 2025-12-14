import { readFile } from "node:fs/promises";
import { spawn, type ChildProcessByStdio } from "node:child_process";
import { ChunkSchema, CommandSchema } from "../types/types.ts";
import type Stream from "node:stream";

/**
 * Reads the content of a file, optionally extracting specific lines.
 * @param {string} filepath - The path to the file.
 * @param {number} [startLine] - The starting line number (1-based).
 * @param {number} [endLine] - The ending line number (1-based).
 * @returns {Promise<{ code: string; context: string }>} An object containing the extracted code and context.
 */
export async function getFileContent(
  filepath: string,
  startLine?: number,
  endLine?: number,
): Promise<{ code: string; context: string }> {
  const content = await readFile(filepath, "utf-8");
  const lines = content.split("\n");

  const start = startLine ?? 1;
  const end = endLine ?? lines.length;

  const code = lines.slice(start - 1, end).join("\n");

  const context = endLine
    ? `File: ${filepath} (lines ${start}-${end})`
    : `File: ${filepath}`;

  return { code, context };
}

/**
 * Allows the user to interactively select a file using fzf.
 * Requires 'fd', 'fzf', and 'bat' to be installed.
 * @returns {Promise<string | null>} The selected file path or null if none selected.
 */
export async function selectFileInteractive(): Promise<string | null> {
  const fzfAvailable = CommandSchema.parse("fzf");
  const fdAvailable = CommandSchema.parse("fzf");
  let proc: ChildProcessByStdio<null, Stream.Readable, null>;

  if (!fzfAvailable) {
    console.error("fzf is not available in PATH");
    console.error("Please install fzf to use interactive file selection.");
    return null;
  }

  if (fdAvailable) {
    // Use fzf to select file
    proc = spawn(
      "sh",
      [
        "-c",
        "fd -t f | fzf --prompt='Select file: ' --preview='bat --color=always {}'",
      ],
      { stdio: ["inherit", "pipe", "inherit"] },
    );
  } else {
    // Fallback to find command
    proc = spawn(
      "sh",
      [
        "-c",
        "find . -type f | fzf --prompt='Select file: ' --preview='bat --color=always {}'",
      ],
      { stdio: ["inherit", "pipe", "inherit"] },
    );
  }

  // Collect stdout chunks
  const chunks: Buffer[] = [];
  for await (const chunk of proc.stdout) {
    const validatedChunk = ChunkSchema.parse(chunk);
    chunks.push(validatedChunk);
  }

  // Wait for process to complete
  await new Promise<void>((resolve, reject) => {
    proc.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Process exited with code ${code}`));
    });
    proc.on("error", reject);
  });

  const result = Buffer.concat(chunks).toString("utf-8");
  return result.trim();
}
