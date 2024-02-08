import { z } from "zod";

export const imageUploadedSchema = z.object({
  imageId: z.string(),
  url: z.string(),
  fileName: z.string(),
});

export type ImageUploaded = z.infer<typeof imageUploadedSchema>;
