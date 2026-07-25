import type {
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import { Badge } from "../../shared/ui/badge";
import { FormField } from "../../shared/ui/form-field";
import { Input } from "../../shared/ui/input";
import { detectCardBrand, formatCardNumber } from "../../shared/utils/card";
import type { CheckoutFormValues } from "./checkout-form-schema";

interface PaymentCardFormProps {
  register: UseFormRegister<CheckoutFormValues>;
  errors: FieldErrors<CheckoutFormValues>;
  watch: UseFormWatch<CheckoutFormValues>;
  setValue: UseFormSetValue<CheckoutFormValues>;
}

const BRAND_LABEL: Record<string, string> = {
  visa: "Visa",
  mastercard: "Mastercard",
};

/**
 * Formulario de datos de tarjeta.
 *
 * Formatea el número en grupos de 4 y detecta la marca (Visa/Mastercard) en
 * vivo. Los datos son transitorios: se envían para el cobro y no se persisten.
 */
export function PaymentCardForm({
  register,
  errors,
  watch,
  setValue,
}: PaymentCardFormProps) {
  const brand = detectCardBrand(watch("number") ?? "");

  return (
    <fieldset className="space-y-4">
      <legend className="text-base font-semibold text-slate-900">
        Datos de la tarjeta
      </legend>

      <FormField
        id="cardHolder"
        label="Nombre en la tarjeta"
        error={errors.cardHolder?.message}
      >
        <Input
          id="cardHolder"
          autoComplete="cc-name"
          invalid={Boolean(errors.cardHolder)}
          {...register("cardHolder")}
        />
      </FormField>

      <FormField
        id="number"
        label="Número de tarjeta"
        error={errors.number?.message}
      >
        <div className="relative">
          <Input
            id="number"
            inputMode="numeric"
            autoComplete="cc-number"
            placeholder="1234 5678 9012 3456"
            invalid={Boolean(errors.number)}
            {...register("number")}
            onChange={(event) =>
              setValue("number", formatCardNumber(event.target.value), {
                shouldValidate: true,
              })
            }
          />
          {brand !== "unknown" && (
            <span className="absolute right-2 top-1/2 -translate-y-1/2">
              <Badge tone="info">{BRAND_LABEL[brand]}</Badge>
            </span>
          )}
        </div>
      </FormField>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <FormField
          id="expMonth"
          label="Mes (MM)"
          error={errors.expMonth?.message}
        >
          <Input
            id="expMonth"
            inputMode="numeric"
            maxLength={2}
            placeholder="08"
            autoComplete="cc-exp-month"
            invalid={Boolean(errors.expMonth)}
            {...register("expMonth")}
          />
        </FormField>
        <FormField
          id="expYear"
          label="Año (YY)"
          error={errors.expYear?.message}
        >
          <Input
            id="expYear"
            inputMode="numeric"
            maxLength={2}
            placeholder="28"
            autoComplete="cc-exp-year"
            invalid={Boolean(errors.expYear)}
            {...register("expYear")}
          />
        </FormField>
        <FormField id="cvc" label="CVV" error={errors.cvc?.message}>
          <Input
            id="cvc"
            inputMode="numeric"
            maxLength={4}
            placeholder="123"
            autoComplete="cc-csc"
            invalid={Boolean(errors.cvc)}
            {...register("cvc")}
          />
        </FormField>
        <FormField
          id="installments"
          label="Cuotas"
          error={errors.installments?.message}
        >
          <Input
            id="installments"
            type="number"
            min={1}
            max={36}
            defaultValue={1}
            invalid={Boolean(errors.installments)}
            {...register("installments", { valueAsNumber: true })}
          />
        </FormField>
      </div>
    </fieldset>
  );
}
