import { $ } from "bun";

export async function getFileContent(
  filepath: string,
  startLine?: number,
  endLine?: number,
): Promise<{ code: string; context: string }> {
  const file = Bun.file(filepath);
  const content = await file.text();
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
    const result =
      await $`fd -t f | fzf --prompt='Select file: ' --preview='bat --color=always {}'`.text();
    return result.trim();
  } catch {
    return null;
  }
}
