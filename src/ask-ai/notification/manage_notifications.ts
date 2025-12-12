export function notify(title: string, message: string): void {
  try {
    Bun.spawn(["notify-send", title, message], {
      stdout: "ignore",
      stderr: "ignore",
      stdin: "ignore",
    });
  } catch {
    console.log(`${title}: ${message}`);
  }
}
