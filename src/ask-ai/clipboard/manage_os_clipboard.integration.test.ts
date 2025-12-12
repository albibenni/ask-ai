import { describe, it, expect } from "vitest";
import { setClipboard, getClipboard } from "./manage_os_clipboard.ts";

describe("clipboard integration", () => {
  it("should write and read from clipboard", async () => {
    const testText = `Test clipboard content ${Date.now()}`;

    // Write to clipboard
    await setClipboard(testText);

    // Read back from clipboard
    const result = await getClipboard();

    // Verify
    expect(result).toBe(testText);
  });

  it("should handle special characters", async () => {
    const specialText = "Hello\n\"World\"\t'Test'";

    await setClipboard(specialText);
    const result = await getClipboard();

    expect(result).toBe(specialText);
  });

  it("should handle large text", async () => {
    const largeText = "x".repeat(100000); // 100KB

    await setClipboard(largeText);
    const result = await getClipboard();

    expect(result).toBe(largeText);
  });
});
