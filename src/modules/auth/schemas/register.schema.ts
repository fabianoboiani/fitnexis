import { z } from "zod";

export const RegisterSchema = z.object({
  name: z.string().min(3, "Informe o nome do personal."),
  businessName: z.string().min(2, "Informe o nome do negócio."),
  phone: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined)),
  email: z.string().email("Informe um e-mail válido."),
  password: z.string().min(6, "A senha precisa ter ao menos 6 caracteres.")
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
