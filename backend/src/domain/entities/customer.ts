/**
 * Propiedades necesarias para construir un {@link Customer}.
 */
export interface CustomerProps {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  documentType: string;
  documentNumber: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Entidad de dominio que representa al cliente que realiza la compra.
 *
 * La validación de formato (email, teléfono) se realiza en los DTO de entrada;
 * aquí solo se modela la identidad del cliente dentro del dominio.
 */
export class Customer {
  readonly id: string;
  readonly fullName: string;
  readonly email: string;
  readonly phone: string;
  readonly documentType: string;
  readonly documentNumber: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: CustomerProps) {
    this.id = props.id;
    this.fullName = props.fullName;
    this.email = props.email;
    this.phone = props.phone;
    this.documentType = props.documentType;
    this.documentNumber = props.documentNumber;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
