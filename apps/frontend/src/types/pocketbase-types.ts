/**
 * PocketBase Collection Type Mappings
 * 
 * This file maps collection names to their corresponding record types.
 * Used by the query hooks for automatic type inference.
 * 
 * @example
 * useCollection('patients') // → PatientsRecord[]
 * useCollection('appointments') // → AppointmentsRecord[]
 */

import type {
  AddressesRecord,
  AppointmentsRecord,
  DentalChartRecord,
  EmergencyContactsRecord,
  InsuranceClaimsRecord,
  InventoryRecord,
  InvoiceItemsRecord,
  InvoicesRecord,
  MedicalHistoryRecord,
  PatientInsuranceRecord,
  PatientsRecord,
  PaymentsRecord,
  PrescriptionsRecord,
  StaffRecord,
  TaskRecord,
  TreatmentPlanItemsRecord,
  TreatmentPlansRecord,
  TreatmentsCatalogRecord,
  TreatmentsRecord,
  UsersRecord,
} from './schemas'

/**
 * Maps PocketBase collection names to their TypeScript types
 * 
 * Add new collections here to get autocomplete and type safety in query hooks
 */
export interface CollectionRecords {
  // Auth & Users
  users: UsersRecord

  // Patient Management
  patients: PatientsRecord
  addresses: AddressesRecord
  emergency_contacts: EmergencyContactsRecord
  patient_insurance: PatientInsuranceRecord
  medical_history: MedicalHistoryRecord

  // Appointments & Scheduling
  appointments: AppointmentsRecord

  // Clinical
  treatments: TreatmentsRecord
  treatments_catalog: TreatmentsCatalogRecord
  treatment_plans: TreatmentPlansRecord
  treatment_plan_items: TreatmentPlanItemsRecord
  dental_chart: DentalChartRecord
  prescriptions: PrescriptionsRecord

  // Financial
  invoices: InvoicesRecord
  invoice_items: InvoiceItemsRecord
  payments: PaymentsRecord
  insurance_claims: InsuranceClaimsRecord

  // Operations
  inventory: InventoryRecord
  staff: StaffRecord

  // Task Management
  tasks: TaskRecord
}
