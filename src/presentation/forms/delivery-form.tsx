import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { FormField } from "../../shared/ui/form-field";
import { Input } from "../../shared/ui/input";
import { Select } from "../../shared/ui/select";
import type { CheckoutFormValues } from "./checkout-form-schema";

interface DeliveryFormProps {
  register: UseFormRegister<CheckoutFormValues>;
  errors: FieldErrors<CheckoutFormValues>;
}

const DOCUMENT_TYPES = [
  { value: "CC", label: "Cédula de ciudadanía" },
  { value: "CE", label: "Cédula de extranjería" },
  { value: "NIT", label: "NIT" },
  { value: "PP", label: "Pasaporte" },
];

/**
 * Formulario de datos del cliente y de la dirección de entrega. Estos datos sí
 * se persisten (no son sensibles) para recuperar el progreso al recargar.
 */
export function DeliveryForm({ register, errors }: DeliveryFormProps) {
  return (
    <fieldset className="space-y-4">
      <legend className="text-base font-semibold text-slate-900">
        Datos de entrega
      </legend>

      <FormField
        id="fullName"
        label="Nombre completo"
        error={errors.fullName?.message}
      >
        <Input
          id="fullName"
          autoComplete="name"
          invalid={Boolean(errors.fullName)}
          {...register("fullName")}
        />
      </FormField>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField id="email" label="Correo" error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            invalid={Boolean(errors.email)}
            {...register("email")}
          />
        </FormField>
        <FormField id="phone" label="Teléfono" error={errors.phone?.message}>
          <Input
            id="phone"
            inputMode="tel"
            autoComplete="tel"
            invalid={Boolean(errors.phone)}
            {...register("phone")}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          id="documentType"
          label="Tipo de documento"
          error={errors.documentType?.message}
        >
          <Select
            id="documentType"
            options={DOCUMENT_TYPES}
            invalid={Boolean(errors.documentType)}
            {...register("documentType")}
          />
        </FormField>
        <FormField
          id="documentNumber"
          label="Número de documento"
          error={errors.documentNumber?.message}
        >
          <Input
            id="documentNumber"
            inputMode="numeric"
            invalid={Boolean(errors.documentNumber)}
            {...register("documentNumber")}
          />
        </FormField>
      </div>

      <FormField id="address" label="Dirección" error={errors.address?.message}>
        <Input
          id="address"
          autoComplete="street-address"
          invalid={Boolean(errors.address)}
          {...register("address")}
        />
      </FormField>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <FormField id="city" label="Ciudad" error={errors.city?.message}>
          <Input
            id="city"
            invalid={Boolean(errors.city)}
            {...register("city")}
          />
        </FormField>
        <FormField
          id="department"
          label="Departamento"
          error={errors.department?.message}
        >
          <Input
            id="department"
            invalid={Boolean(errors.department)}
            {...register("department")}
          />
        </FormField>
        <FormField
          id="postalCode"
          label="Código postal"
          error={errors.postalCode?.message}
        >
          <Input
            id="postalCode"
            inputMode="numeric"
            invalid={Boolean(errors.postalCode)}
            {...register("postalCode")}
          />
        </FormField>
      </div>
    </fieldset>
  );
}
