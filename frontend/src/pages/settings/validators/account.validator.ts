import { z } from "zod";

const optionalEmail = z.union([
  z.string().trim().email({ error: "Please enter a valid email." }),
  z.literal(""),
]);

const optionalUrl = z.union([
  z.string().trim().url({ error: "Please enter a valid URL." }),
  z.literal(""),
]);

export const accountValidator = z.object({
  username: z.string().optional(),
  nickname: z
    .string({
      error: "Required.",
    })
    .min(2, {
      error: "Nickname must be at least 2 characters.",
    })
    .max(30, {
      error: "Nickname must not be longer than 30 characters.",
    }),
  avatar: optionalUrl,
  email: optionalEmail,
  captcha: z.string().optional(),
});
