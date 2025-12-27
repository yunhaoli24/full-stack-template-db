import { z } from "zod";

export const notificationsValidator = z.object({
  type: z.enum(["all", "mentions", "none"], {
    error: "You need to select a notification type.",
  }),
  mobile: z.boolean().optional(),
  communication_emails: z.boolean().optional(),
  social_emails: z.boolean().optional(),
  marketing_emails: z.boolean().optional(),
  security_emails: z.boolean(),
});
