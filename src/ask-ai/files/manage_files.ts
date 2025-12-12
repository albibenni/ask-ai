import { readFile } from "node:fs/promises";
import { spawn } from "node:child_process";

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

export async function selectFileInteractive(): Promise<string | null> {
  try {
    // Use fzf to select file
    const proc = spawn(
      "sh",
      ["-c", "fd -t f | fzf --prompt='Select file: ' --preview='bat --color=always {}'"],
      { stdio: ["inherit", "pipe", "inherit"] },
    );

    // Collect stdout chunks
    const chunks: Buffer[] = [];
    for await (const chunk of proc.stdout) {
      chunks.push(chunk);
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
  } catch {
    return null;
  }
}
