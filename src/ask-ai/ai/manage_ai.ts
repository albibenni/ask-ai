export function openClaude(): void {
  // Spawn xdg-open detached so it doesn't block
  Bun.spawn(["xdg-open", "https://claude.ai/new"], {
    stdout: "ignore",
    stderr: "ignore",
    stdin: "ignore",
  });
}
