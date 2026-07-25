import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Navigate, useNavigate } from "react-router-dom";
import { CHECKOUT_STEPS } from "../../shared/constants/checkout-steps";
import { Button } from "../../shared/ui/button";
import { Card } from "../../shared/ui/card";
import { Stepper } from "../../shared/ui/stepper";
import { onlyDigits } from "../../shared/utils/card";
import {
  checkoutFormSchema,
  type CheckoutFormValues,
} from "../forms/checkout-form-schema";
import { DeliveryForm } from "../forms/delivery-form";
import { PaymentCardForm } from "../forms/payment-card-form";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  setCustomer,
  setDelivery,
  setStep,
} from "../store/slices/checkout-slice";
import { setCard } from "../store/slices/payment-slice";

/**
 * Página de pago y entrega (paso 2). Captura la tarjeta (transitoria) y los
 * datos de cliente/entrega (persistidos), valida con Zod y avanza al resumen.
 */
export function PaymentAndDeliveryPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { productId, customer, delivery } = useAppSelector(
    (state) => state.checkout,
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      cardHolder: "",
      number: "",
      expMonth: "",
      expYear: "",
      cvc: "",
      installments: 1,
      fullName: customer?.fullName ?? "",
      email: customer?.email ?? "",
      phone: customer?.phone ?? "",
      documentType:
        (customer?.documentType as CheckoutFormValues["documentType"]) ?? "CC",
      documentNumber: customer?.documentNumber ?? "",
      address: delivery?.address ?? "",
      city: delivery?.city ?? "",
      department: delivery?.department ?? "",
      postalCode: delivery?.postalCode ?? "",
    },
  });

  // Guarda de flujo: sin producto seleccionado no tiene sentido esta página.
  if (productId === null) {
    return <Navigate to="/product" replace />;
  }

  const onSubmit = (values: CheckoutFormValues) => {
    dispatch(
      setCard({
        number: onlyDigits(values.number),
        cvc: values.cvc,
        expMonth: values.expMonth,
        expYear: values.expYear,
        cardHolder: values.cardHolder,
        installments: values.installments,
      }),
    );
    dispatch(
      setCustomer({
        fullName: values.fullName,
        email: values.email,
        phone: values.phone,
        documentType: values.documentType,
        documentNumber: values.documentNumber,
      }),
    );
    dispatch(
      setDelivery({
        address: values.address,
        city: values.city,
        department: values.department,
        postalCode: values.postalCode,
      }),
    );
    dispatch(setStep(3));
    navigate("/checkout/summary");
  };

  return (
    <section className="mx-auto max-w-3xl">
      <Stepper steps={[...CHECKOUT_STEPS]} current={1} />

      <form
        className="mt-6 space-y-6"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <Card className="p-4 sm:p-6">
          <PaymentCardForm
            register={register}
            errors={errors}
            watch={watch}
            setValue={setValue}
          />
        </Card>

        <Card className="p-4 sm:p-6">
          <DeliveryForm register={register} errors={errors} />
        </Card>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate("/product")}
          >
            Volver
          </Button>
          <Button type="submit">Continuar al resumen</Button>
        </div>
      </form>
    </section>
  );
}
