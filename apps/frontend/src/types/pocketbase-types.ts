/**
 * PocketBase Collection Types
 * 
 * This file contains TypeScript interfaces for your PocketBase collections.
 * Update these types to match your actual collection schemas for better type safety.
 * 
 * 🎯 HOW IT WORKS:
 * ================
 * 
 * 1. Define your record types (what fields each collection has)
 * 2. Add them to the CollectionRecords interface (the mapping)
 * 3. All query hooks automatically infer the correct types!
 * 
 * EXAMPLE:
 * --------
 * // 1. Define the record type
 * export interface PostsRecord extends BaseRecord {
 *   title: string
 *   content: string
 * }
 * 
 * // 2. Add to CollectionRecords
 * export interface CollectionRecords {
 *   posts: PostsRecord  // ← Add this line
 * }
 * 
 * // 3. Use anywhere with automatic types!
 * const posts = useCollection("posts")  // ← Automatically typed as PostsRecord[]
 * 
 * You can generate types automatically using pocketbase-typegen:
 * https://github.com/patmood/pocketbase-typegen
 */

import type { RecordModel } from 'pocketbase'

// Alias types for improved usability
export type IsoDateString = string
export type RecordIdString = string

/**
 * Base interface for all records
 * 
 * Every PocketBase record has these fields by default.
 * All your custom record types should extend this.
 */
export interface BaseRecord extends RecordModel {
  id: string        // Unique identifier
  created: string   // ISO timestamp when created
  updated: string   // ISO timestamp when last updated
}

/**
 * Users collection (auth collection)
 * 
 * This is the built-in PocketBase users/auth collection.
 * Extend this interface with your custom user fields.
 * 
 * @example
 * export interface UsersRecord extends BaseRecord {
 *   email?: string
 *   username?: string
 *   verified?: boolean
 *   // Add your custom fields:
 *   displayName?: string
 *   bio?: string
 *   avatarUrl?: string
 * }
 */
export interface UsersRecord extends BaseRecord {
  email?: string
  username?: string
  verified?: boolean
  emailVisibility?: boolean
  name?: string
  avatar?: string
  // Add your custom fields here
}

/**
 * Appointments collection
 * 
 * Scheduling and appointment management.
 */

export const APPOINTMENT_STATUS = {
  scheduled: "scheduled",
  confirmed: "confirmed",
  completed: "completed",
  cancelled: "cancelled",
  no_show: "no_show",
} as const


export type AppointmentStatus =
  (typeof APPOINTMENT_STATUS)[keyof typeof APPOINTMENT_STATUS]

export const APPOINTMENT_TYPE = {
  checkup: "checkup",
  cleaning: "cleaning",
  filling: "filling",
  extraction: "extraction",
  root_canal: "root_canal",
  crown: "crown",
  consultation: "consultation",
  emergency: "emergency",
  other: "other",
}
export type AppointmentType = (typeof APPOINTMENT_TYPE)[keyof typeof APPOINTMENT_TYPE]

export interface AppointmentsRecord extends BaseRecord {
  patient: string  // relation to patients (required)
  dentist: string  // relation to users (required)

  //   // Scheduling
  start_time: IsoDateString
  duration: number  // in minutes
  status: AppointmentStatus

  //   // Appointment Details
  type: AppointmentType
  treatmentPlan?: string  // relation to treatment_plans
  room?: string
  notes?: string

  //   // Reminders
  //   reminderSent?: boolean
  //   reminderSentAt?: string
  //
  //   // Completion
  completedAt?: string
  cancelledAt?: string
  cancellationReason?: string
}


/**
 * Patients collection
 * 
 * Core patient information for the dental practice.
 * Normalized for better data integrity.
 */
export interface PatientsRecord extends BaseRecord {
  // Basic Information
  firstName: string
  lastName: string
  dateOfBirth?: IsoDateString
  gender: "male" | "female"

  // Contact Information
  email?: string
  phone?: string
  mobile?: string

  // Address (normalized - relation)
  primaryAddress?: RecordIdString // relation to addresses

  // Practice Management
  primaryDentist?: RecordIdString // relation to users
  status?: "active" | "inactive" | "archived"
  notes?: string

  // Insurance (normalized - relation)
  primaryInsurance?: RecordIdString // relation to patient_insurance

  // Emergency Contact (normalized - relation)
  emergencyContact?: RecordIdString // relation to emergency_contacts

  // Reverse relations (populated via expand):
  // - medical_history (via medical_history.patient)
  // - appointments (via appointments.patient)
  // - treatments (via treatments.patient)
  // - invoices (via invoices.patient)
}


/**
 * Treatments collection
 * 
 * Individual treatment records performed during appointments.
 * Treatment catalog referenced for standardization.
 */
export interface TreatmentsRecord extends BaseRecord {
  patient: RecordIdString // relation to patients
  appointment?: RecordIdString // relation to appointments
  performedBy: RecordIdString // relation to users (dentist)

  // Treatment Details (normalized)
  treatmentType: RecordIdString // relation to treatments_catalog
  toothNumber?: string // dental notation (e.g., "18", "2.1")
  surface?: string // e.g., "occlusal", "mesial"

  // Clinical Notes
  diagnosis?: string
  procedure?: string
  notes?: string

  // Billing (removed redundant payment tracking - use invoice_items instead)
  // Cost comes from treatments_catalog, can be overridden
  actualCost?: number // if different from catalog price

  // Link to invoice item for payment tracking
  invoiceItem?: RecordIdString // relation to invoice_items

  // Date
  treatmentDate: IsoDateString
  completedAt?: IsoDateString
}

export interface TreatmentsCatalogRecord extends BaseRecord {
  name: string
  description?: string
  default_price: number
  category?: string // e.g., "preventive", "restorative", "surgical"
  code?: string // procedure code (CPT, CDT, etc.)
  insuranceCoverage?: number // typical insurance coverage percentage
  estimatedDuration?: number // in minutes
}


/**
 * Todos collection
 * 
 * Task management for office and clinical tasks.
 */
export interface TodoRecord extends BaseRecord {
  title: string
  description?: string
  completed: boolean
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  dueDate?: string
  assignedTo?: string  // relation to users
  relatedPatient?: string  // relation to patients
  category?: 'administrative' | 'clinical' | 'follow_up' | 'billing' | 'other'
}



/**
 * Treatment Plans collection
 * 
 * Multi-step treatment plans for patients.
 * Individual plan items stored in treatment_plan_items for normalization.
 */
export interface TreatmentPlansRecord extends BaseRecord {
  patient: RecordIdString // relation to patients
  createdBy: RecordIdString // relation to users (dentist)

  // Plan Details
  title: string
  description?: string
  diagnosis?: string

  // Status
  status: "proposed" | "accepted" | "in_progress" | "completed" | "cancelled"

  // Dates
  proposedDate?: IsoDateString
  acceptedDate?: IsoDateString
  completedDate?: IsoDateString

  // Financial (calculated from plan items)
  estimatedCost?: number

  // Reverse relations (populated via expand):
  // - treatment_plan_items (via treatment_plan_items.treatmentPlan)
}

/**
 * Invoices collection
 * 
 * Billing header - line items stored separately in invoice_items.
 * Payment tracking done via payments collection.
 */
export interface InvoicesRecord extends BaseRecord {
  patient: RecordIdString // relation to patients
  appointment?: RecordIdString // relation to appointments

  // Invoice Details
  invoiceNumber: string // indexed, unique
  invoiceDate: IsoDateString
  dueDate?: IsoDateString

  // Totals (calculated from invoice_items)
  subtotal: number
  tax?: number
  discount?: number
  total: number

  // Status
  status: "draft" | "sent" | "paid" | "partial" | "overdue" | "cancelled"

  // Insurance
  insuranceClaim?: RecordIdString // relation to insurance_claims
  insuranceAmount?: number

  notes?: string

  // Reverse relations (populated via expand):
  // - invoice_items (via invoice_items.invoice)
  // - payments (via payments.invoice)
}

/**
 * Payments collection
 * 
 * Individual payment transactions.
 */
export interface PaymentsRecord extends BaseRecord {
  patient: string  // relation to patients
  invoice: string  // relation to invoices

  // Payment Details
  amount: number
  paymentDate: string
  paymentMethod: 'cash' | 'card' | 'insurance' | 'check' | 'transfer'

  // Transaction Details
  transactionId?: string
  reference?: string
  notes?: string

  // Processing
  processedBy?: string  // relation to users
}

/**
 * Medical History collection
 * 
 * Detailed medical history records for patients.
 */
export interface MedicalHistoryRecord extends BaseRecord {
  patient: string  // relation to patients
  recordedBy: string  // relation to users

  // Medical Conditions
  conditions?: string[]
  allergies?: string[]
  medications?: string[]

  // Dental History
  previousDentalWork?: string
  dentalConcerns?: string

  // Lifestyle
  smoking?: boolean
  smokingFrequency?: string
  alcohol?: boolean
  alcoholFrequency?: string

  // Other
  notes?: string
  recordDate: string
}

/**
 * Prescriptions collection
 * 
 * Medication prescriptions issued to patients.
 */
export interface PrescriptionsRecord extends BaseRecord {
  patient: string  // relation to patients
  prescribedBy: string  // relation to users (dentist)
  appointment?: string  // relation to appointments

  // Medication Details
  medicationName: string
  dosage: string
  frequency: string
  duration: string  // e.g., "7 days"
  quantity?: string

  // Instructions
  instructions?: string

  // Dates
  prescribedDate: string
  startDate?: string
  endDate?: string

  // Status
  status: 'active' | 'completed' | 'cancelled'

  notes?: string
}

/**
 * Inventory collection
 * 
 * Dental supplies and equipment inventory management.
 */
export interface InventoryRecord extends BaseRecord {
  // Item Details
  name: string
  category: 'dental_supplies' | 'medication' | 'equipment' | 'consumables' | 'other'
  sku?: string
  barcode?: string

  // Stock
  quantity: number
  unit: string  // e.g., "pieces", "boxes", "bottles"
  minQuantity?: number  // reorder threshold
  maxQuantity?: number

  // Supplier
  supplier?: string
  supplierSku?: string

  // Pricing
  costPrice?: number
  sellingPrice?: number

  // Storage
  location?: string
  expiryDate?: string

  // Status
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'discontinued'

  notes?: string
}

/**
 * Staff/Dentists collection extension
 * 
 * Additional fields for users who are staff/dentists.
 * This extends the base users collection.
 */
export interface StaffRecord extends UsersRecord {
  // Professional Information
  role: 'dentist' | 'hygienist' | 'assistant' | 'receptionist' | 'admin' | 'other'
  licenseNumber?: string
  specialization?: string[]

  // Employment
  employmentType?: 'full_time' | 'part_time' | 'contract'
  hireDate?: string

  // Schedule
  workingDays?: string[]  // e.g., ["monday", "tuesday", "wednesday"]
  workingHours?: {
    start: string
    end: string
  }

  // Contact
  phone?: string
  emergencyContact?: string
  emergencyPhone?: string

  // Status
  isActive: boolean
}

/**
 * Invoice Items collection
 * 
 * Normalized invoice line items - separates line items from invoice header.
 * Better for querying, reporting, and data integrity.
 */
export interface InvoiceItemsRecord extends BaseRecord {
  invoice: RecordIdString // relation to invoices (required)

  // Item Details
  description: string
  quantity: number
  unitPrice: number
  total: number // quantity * unitPrice

  // Optional Relations
  treatment?: RecordIdString // relation to treatments
  inventoryItem?: RecordIdString // relation to inventory

  // Discounts
  discount?: number
  discountType?: "percentage" | "fixed"

  // Tax
  taxable?: boolean
  taxAmount?: number

  // Insurance
  insuranceCoverage?: number // amount covered by insurance

  // Ordering
  lineNumber?: number // for display ordering
}

/**
 * Treatment Plan Items collection
 * 
 * Normalized treatment plan steps - better than storing array in treatment_plans.
 * Allows independent tracking of each step's status and completion.
 */
export interface TreatmentPlanItemsRecord extends BaseRecord {
  treatmentPlan: RecordIdString // relation to treatment_plans (required)

  // Treatment Details
  treatmentType: RecordIdString // relation to treatments_catalog
  toothNumber?: string
  surface?: string

  // Planning
  description?: string
  priority: "low" | "medium" | "high" | "urgent"
  estimatedCost?: number
  estimatedDuration?: number // minutes

  // Status
  status: "pending" | "scheduled" | "in_progress" | "completed" | "cancelled"

  // Scheduling
  scheduledDate?: IsoDateString
  completedDate?: IsoDateString

  // Link to actual treatment when performed
  completedTreatment?: RecordIdString // relation to treatments

  // Ordering
  sequenceNumber?: number // order in treatment plan

  notes?: string
}

/**
 * Addresses collection
 * 
 * Normalized address storage - reusable for patients, staff, suppliers.
 * Enables better validation, geocoding, and address history.
 */
export interface AddressesRecord extends BaseRecord {
  // Address Type
  addressType?: "home" | "work" | "billing" | "shipping" | "other"

  // Address Components
  street1: string
  street2?: string
  city: string
  state: string
  zipCode: string
  country: string

  // Geocoding (optional)
  latitude?: number
  longitude?: number

  // Validation
  isVerified?: boolean
  verifiedAt?: IsoDateString

  // Metadata
  isPrimary?: boolean
  label?: string // custom label like "Summer Home"
}

/**
 * Emergency Contacts collection
 * 
 * Normalized emergency contact storage.
 * Allows multiple emergency contacts per patient.
 */
export interface EmergencyContactsRecord extends BaseRecord {
  // Contact Info
  firstName: string
  lastName: string
  relationship: string // e.g., "spouse", "parent", "sibling", "friend"

  // Phone Numbers
  primaryPhone: string
  secondaryPhone?: string

  // Contact Preferences
  preferredContactMethod?: "phone" | "sms" | "email"
  email?: string

  // Address (optional relation)
  address?: RecordIdString // relation to addresses

  // Priority
  isPrimary?: boolean
  priority?: number // 1 = first to contact

  notes?: string
}

/**
 * Patient Insurance collection
 * 
 * Normalized insurance information.
 * Allows multiple insurance policies per patient (primary, secondary, etc.)
 */
export interface PatientInsuranceRecord extends BaseRecord {
  patient: RecordIdString // relation to patients (required)

  // Insurance Details
  provider: string
  policyNumber: string
  groupNumber?: string

  // Coverage Type
  coverageType: "primary" | "secondary" | "tertiary"

  // Policy Holder (if different from patient)
  policyHolderName?: string
  policyHolderDOB?: IsoDateString
  relationshipToPolicyHolder?: "self" | "spouse" | "child" | "other"

  // Coverage Details
  effectiveDate?: IsoDateString
  expirationDate?: IsoDateString

  // Contact
  insurancePhone?: string
  insuranceAddress?: RecordIdString // relation to addresses

  // Coverage Limits
  annualMaximum?: number
  deductible?: number
  deductibleMet?: number

  // Status
  isActive: boolean

  notes?: string
}

/**
 * Insurance Claims collection
 * 
 * Track insurance claims separately from invoices.
 * Enables proper claim management workflow.
 */
export interface InsuranceClaimsRecord extends BaseRecord {
  patient: RecordIdString // relation to patients
  insurance: RecordIdString // relation to patient_insurance
  invoice?: RecordIdString // relation to invoices

  // Claim Details
  claimNumber?: string
  claimDate: IsoDateString

  // Amounts
  claimedAmount: number
  approvedAmount?: number
  paidAmount?: number
  deniedAmount?: number
  patientResponsibility?: number

  // Status
  status: "pending" | "submitted" | "approved" | "partial" | "denied" | "paid"

  // Tracking
  submittedDate?: IsoDateString
  processedDate?: IsoDateString
  paidDate?: IsoDateString

  // Denial Info
  denialReason?: string
  appealDate?: IsoDateString
  appealStatus?: "pending" | "approved" | "denied"

  notes?: string
}

/**
 * Dental Chart collection
 * 
 * Track tooth-specific conditions and history.
 * Enables visual dental charts and treatment planning.
 */
export interface DentalChartRecord extends BaseRecord {
  patient: RecordIdString // relation to patients (required)
  toothNumber: string // dental notation (FDI, Universal, Palmer)

  // Tooth Status
  status: "healthy" | "decayed" | "filled" | "missing" | "implant" | "crown" | "bridge" | "root_canal" | "extracted" | "other"

  // Condition Details
  conditions?: string[] // e.g., ["cavity", "sensitivity", "wear"]
  surfaces?: string[] // affected surfaces: ["occlusal", "mesial", "distal", "buccal", "lingual"]

  // Date tracking
  conditionDate?: IsoDateString
  lastExamDate?: IsoDateString

  // Links to treatments
  relatedTreatments?: RecordIdString[] // can expand to get full history

  notes?: string
}

/**
 * 📋 All normalized collections added for proper relational design
 */

// =============================================================================
// 🎯 COLLECTION TABLES - Organize your collections into logical groups
// =============================================================================

/**
 * Auth-related collections
 */
interface AuthCollections {
  users: UsersRecord
}

/**
 * Application collections - Dental Clinic Management
 * 
 * Properly normalized collections following relational DB best practices.
 * All collections organized by functional domain.
 */
interface AppCollections {
  // Patient Management
  patients: PatientsRecord
  medical_history: MedicalHistoryRecord
  emergency_contacts: EmergencyContactsRecord
  patient_insurance: PatientInsuranceRecord

  // Scheduling
  appointments: AppointmentsRecord

  // Clinical
  treatments: TreatmentsRecord
  treatments_catalog: TreatmentsCatalogRecord
  treatment_plans: TreatmentPlansRecord
  treatment_plan_items: TreatmentPlanItemsRecord
  prescriptions: PrescriptionsRecord
  dental_chart: DentalChartRecord

  // Financial
  invoices: InvoicesRecord
  invoice_items: InvoiceItemsRecord
  payments: PaymentsRecord
  insurance_claims: InsuranceClaimsRecord

  // Operations
  todos: TodoRecord
  inventory: InventoryRecord

  // Supporting Data
  addresses: AddressesRecord

  // Staff (extends users)
  staff: StaffRecord
}

/**
 * 🎯 COLLECTION TYPE MAPPING
 * ==========================
 * 
 * This is THE MOST IMPORTANT part for automatic type inference!
 * 
 * This interface combines ALL your collection tables using TypeScript's
 * spread operator (&). This keeps things organized while maintaining
 * a single source of truth for type inference.
 * 
 * ⚠️  WORKFLOW: When adding a new collection
 * -------------------------------------------
 * 1. Define your record type above (e.g., PostsRecord)
 * 2. Add it to the appropriate collection table (e.g., AppCollections)
 * 3. That's it! It's automatically included here via spreading
 * 
 * 📊 ORGANIZATION:
 * ----------------
 * Collections are organized into logical tables:
 * - AuthCollections: users and auth-related collections
 * - AppCollections: your application-specific collections
 * - Add more tables as needed for organization
 * 
 * ❓ Why use tables?
 * ------------------
 * - Better organization (group related collections)
 * - Easier to scan and find collections
 * - Still get all the automatic type inference benefits
 * - No duplication - define once, spread here
 * 
 * 💡 TIP: If you forget to add a collection to a table, TypeScript will
 * remind you when you try to access custom fields (they won't exist on BaseRecord).
 * 
 * HOW IT WORKS:
 * -------------
 * When you write:
 *   const todos = useCollection("todos")
 * 
 * TypeScript:
 * 1. Sees you passed the string "todos"
 * 2. Looks up "todos" in this CollectionRecords interface
 * 3. Finds it via AppCollections (spread with &)
 * 4. Returns TodoRecord
 * 5. You get full autocomplete for todo.title, todo.completed, etc.!
 * 
 * @example Adding a new collection
 * // 1. Define your type above
 * export interface PostsRecord extends BaseRecord {
 *   title: string
 *   content: string
 * }
 * 
 * // 2. Add to AppCollections table
 * interface AppCollections {
 *   patients: PatientsRecord
 *   todos: TodoRecord
 *   posts: PostsRecord  // ← Add this line!
 * }
 * 
 * // 3. Now it works everywhere automatically:
 * const posts = useCollection("posts")  // Typed as PostsRecord[]! ✨
 * const createPost = useCreateRecord("posts")  // Knows PostsRecord fields! ✨
 */
export interface CollectionRecords extends AuthCollections, AppCollections {
  // All collections from AuthCollections and AppCollections are included here
  // via TypeScript's intersection (&) - no need to list them again!
  // 
  // Add one-off collections here if they don't fit in a table:
  // oneOffCollection: OneOffRecord
}
