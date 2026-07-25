import { Customer } from '../../domain/entities/customer';
import { CustomerView } from '../dto/customer-view';

/**
 * Construye la vista de lectura de un cliente a partir de la entidad.
 */
export class CustomerViewMapper {
  static toView(customer: Customer): CustomerView {
    return {
      id: customer.id,
      fullName: customer.fullName,
      email: customer.email,
      phone: customer.phone,
      documentType: customer.documentType,
      documentNumber: customer.documentNumber,
    };
  }
}
