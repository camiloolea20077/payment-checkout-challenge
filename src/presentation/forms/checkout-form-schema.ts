import { z } from "zod";
import { isValidExpiry, luhnCheck, onlyDigits } from "../../shared/utils/card";

/**
 * Esquema del formulario de pago y entrega.
 *
 * Valida la tarjeta (longitud + Luhn + vencimiento futuro + CVV) y los datos de
 * cliente y entrega. La tarjeta es transitoria: no se persiste en ninguna parte.
 */
export const checkoutFormSchema = z
  .object({
    // Tarjeta (datos sensibles, no persistidos).
    cardHolder: z.string().trim().min(1, "Ingresa el nombre de la tarjeta"),
    number: z
      .string()
      .refine((value) => {
        const digits = onlyDigits(value);
        return digits.length >= 13 && digits.length <= 19;
      }, "El número debe tener entre 13 y 19 dígitos")
      .refine((value) => luhnCheck(value), "El número de tarjeta no es válido"),
    expMonth: z.string().regex(/^(0[1-9]|1[0-2])$/, "Mes inválido (MM)"),
    expYear: z.string().regex(/^\d{2}$/, "Año inválido (YY)"),
    cvc: z.string().regex(/^\d{3,4}$/, "CVV de 3 o 4 dígitos"),
    installments: z.number().int().min(1).max(36),

    // Cliente y entrega (no sensibles, persistibles).
    fullName: z.string().trim().min(1, "Nombre completo obligatorio"),
    email: z.email("Correo inválido"),
    phone: z.string().trim().min(7, "Teléfono inválido"),
    documentType: z.enum(["CC", "CE", "NIT", "PP"]),
    documentNumber: z.string().trim().min(4, "Documento inválido"),
    address: z.string().trim().min(1, "Dirección obligatoria"),
    city: z.string().trim().min(1, "Ciudad obligatoria"),
    department: z.string().trim().min(1, "Departamento obligatorio"),
    postalCode: z
      .string()
      .trim()
      .min(1, "Código postal obligatorio")
      .max(20, "Máximo 20 caracteres"),
  })
  .refine((data) => isValidExpiry(data.expMonth, data.expYear), {
    message: "La tarjeta está vencida",
    path: ["expYear"],
  });

export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;
