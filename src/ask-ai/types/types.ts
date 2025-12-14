import { z } from "zod/v4";
import { isCommandAvailable } from "../utils/utils.ts";

export const ChunkSchema = z
  .instanceof(Buffer)
  .refine((buf) => buf.length > 0, {
    message: "Received empty chunk from clipboard",
  });

export const ClipboardCommandsSchema = z.object({
  read: z.array(z.string()),
  write: z.array(z.string()),
});

export type ClipboardCommands = z.infer<typeof ClipboardCommandsSchema>;
// type ClipboardCommands = {
//   read: string[];
//   write: string[];
// };

export const CommandSchema = z.string().superRefine((cmd, ctx) => {
  if (!isCommandAvailable(cmd)) {
    ctx.addIssue({
      code: "custom",
      message: `Command '${cmd}' is not available in PATH`,
    });
  }
});
