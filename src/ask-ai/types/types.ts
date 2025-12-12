import { z } from "zod/v4";

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
