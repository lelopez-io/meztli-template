import { z } from "zod";

export const CreatePostSchema = z.object({
    coverImage: z.string().min(1),
  title: z.string().min(1),
  content: z.string().min(1),
});
