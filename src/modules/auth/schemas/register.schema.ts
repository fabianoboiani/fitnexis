import { z } from "zod";

export const RegisterSchema = z.object({
  name: z.string().min(3, "Inform? o nome do personal."),
  businessName: z.string().min(2, "Inform? o nome do neg?cio."),
  phone: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined)),
  email: z.string().email("Informe um e-mail valido."),
  password: z.string().min(6, "A senha precisa ter ao menos 6 caracteres.")
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
