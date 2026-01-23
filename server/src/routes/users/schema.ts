import z from "zod";

export const updatedProfileSchema = z.object({
  body: z.object({
    address: z.string().optional(),
    phone: z.string().optional(),
    vehicleType: z.string().optional(),
  }),
});
