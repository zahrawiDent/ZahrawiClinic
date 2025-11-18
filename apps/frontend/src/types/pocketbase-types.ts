/**
 * PocketBase Collection Schemas & Types
 * 
 * This file uses Valibot schemas as the single source of truth for:
 * - Runtime validation
 * - TypeScript type inference
 * - Form validation
 * - API response validation
 * 
 * 🎯 WHY VALIBOT SCHEMAS?
 * =======================
 * 1. ✅ Single source of truth - one schema defines validation AND types
 * 2. ✅ Runtime safety - validate PocketBase responses at runtime
 * 3. ✅ Type inference - TypeScript types automatically derived
 * 4. ✅ Form validation - direct integration with Modular Forms
 * 5. ✅ Reusable - same schemas everywhere in the app
 * 
 * 🔄 WORKFLOW:
 * ============
 * 1. Define Valibot schema for collection
 * 2. Type is automatically inferred via v.InferOutput<>
 * 3. Use schema for validation, forms, and type checking
 * 
 * @example
 * // Use for validation
 * const validPatient = v.parse(PatientSchema, apiData)
 * 
 * // Use for forms
 * const [form] = createForm({
 *   validate: valiForm(PatientSchema)
 * })
 * 
 * // Use for types
 * type Patient = v.InferOutput<typeof PatientSchema>
 * 
 * You can also generate schemas from PocketBase using tools like:
 * https://github.com/patmood/pocketbase-typegen (then convert to Valibot)
 */

import * as v from 'valibot'
import type { RecordModel } from 'pocketbase'

// Alias types for improved usability
export type IsoDateString = string
export type RecordIdString = string

/**
 * Base schema for all PocketBase records
 * Every record has these fields by default
 */
export const BaseRecordSchema = v.object({
  id: v.string(),
  created: v.string(), // ISO timestamp
  updated: v.string(), // ISO timestamp
})

export type BaseRecord = v.InferOutput<typeof BaseRecordSchema> & RecordModel

/**
 * Users collection (auth collection)
 * Built-in PocketBase auth collection with custom fields
 */
const UsersDataSchema = v.object({
  email: v.optional(v.string()),
  username: v.optional(v.string()),
  verified: v.optional(v.boolean()),
  emailVisibility: v.optional(v.boolean()),
  name: v.optional(v.string()),
  avatar: v.optional(v.string()),
  // Add your custom fields here
})

export const UsersSchema = v.intersect([BaseRecordSchema, UsersDataSchema])
export const UsersFormSchema = UsersDataSchema

export type UsersRecord = v.InferOutput<typeof UsersSchema>
export type UsersFormData = v.InferOutput<typeof UsersFormSchema>

/**
 * Appointments collection
 * Scheduling and appointment management
 */
export const APPOINTMENT_STATUS = {
  scheduled: "scheduled",
  confirmed: "confirmed",
  completed: "completed",
  cancelled: "cancelled",
  no_show: "no_show",
} as const

export type AppointmentStatus = (typeof APPOINTMENT_STATUS)[keyof typeof APPOINTMENT_STATUS]

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
} as const

export type AppointmentType = (typeof APPOINTMENT_TYPE)[keyof typeof APPOINTMENT_TYPE]

const AppointmentsDataSchema = v.object({
  patient: v.string(), // relation to patients (required)
  dentist: v.string(), // relation to users (required)

  // Scheduling
  start_time: v.string(), // ISO date
  duration: v.number(), // in minutes
  status: v.picklist(Object.values(APPOINTMENT_STATUS)),

  // Appointment Details
  type: v.picklist(Object.values(APPOINTMENT_TYPE)),
  treatmentPlan: v.optional(v.string()), // relation to treatment_plans
  room: v.optional(v.string()),
  notes: v.optional(v.string()),

  // Completion
  completedAt: v.optional(v.string()),
  cancelledAt: v.optional(v.string()),
  cancellationReason: v.optional(v.string()),
})

export const AppointmentsSchema = v.intersect([BaseRecordSchema, AppointmentsDataSchema])
export const AppointmentsFormSchema = AppointmentsDataSchema

export type AppointmentsRecord = v.InferOutput<typeof AppointmentsSchema>
export type AppointmentsFormData = v.InferOutput<typeof AppointmentsFormSchema>


/**
 * Patients collection
 * Core patient information for the dental practice
 * Normalized for better data integrity
 */
const PatientsDataSchema = v.object({
  // Basic Information
  firstName: v.pipe(v.string(), v.nonEmpty("First name is required")),
  lastName: v.pipe(v.string(), v.nonEmpty("Last name is required")),
  dateOfBirth: v.optional(v.string()), // ISO date
  gender: v.picklist(["male", "female"]),

  // Contact Information
  email: v.optional(v.pipe(v.string(), v.email())),
  phone: v.optional(v.string()),
  mobile: v.optional(v.string()),

  // Address (normalized - relation)
  primaryAddress: v.optional(v.string()), // relation to addresses

  // Practice Management
  primaryDentist: v.optional(v.string()), // relation to users
  status: v.optional(v.picklist(["active", "inactive", "archived"])),
  notes: v.optional(v.string()),

  // Insurance (normalized - relation)
  primaryInsurance: v.optional(v.string()), // relation to patient_insurance

  // Emergency Contact (normalized - relation)
  emergencyContact: v.optional(v.string()), // relation to emergency_contacts
})

export const PatientsSchema = v.intersect([BaseRecordSchema, PatientsDataSchema])
export const PatientsFormSchema = PatientsDataSchema

export type PatientsRecord = v.InferOutput<typeof PatientsSchema>
export type PatientsFormData = v.InferOutput<typeof PatientsFormSchema>


/**
 * Treatments collection
 * Individual treatment records performed during appointments
 * Treatment catalog referenced for standardization
 */
const TreatmentsDataSchema = v.object({
  patient: v.string(), // relation to patients
  appointment: v.optional(v.string()), // relation to appointments
  performedBy: v.string(), // relation to users (dentist)

  // Treatment Details (normalized)
  treatmentType: v.string(), // relation to treatments_catalog
  toothNumber: v.optional(v.string()), // dental notation (e.g., "18", "2.1")
  surface: v.optional(v.string()), // e.g., "occlusal", "mesial"

  // Clinical Notes
  diagnosis: v.optional(v.string()),
  procedure: v.optional(v.string()),
  notes: v.optional(v.string()),

  // Billing
  actualCost: v.optional(v.number()), // if different from catalog price

  // Link to invoice item for payment tracking
  invoiceItem: v.optional(v.string()), // relation to invoice_items

  // Date
  treatmentDate: v.string(), // ISO date
  completedAt: v.optional(v.string()), // ISO date
})

export const TreatmentsSchema = v.intersect([BaseRecordSchema, TreatmentsDataSchema])
export const TreatmentsFormSchema = TreatmentsDataSchema

export type TreatmentsRecord = v.InferOutput<typeof TreatmentsSchema>
export type TreatmentsFormData = v.InferOutput<typeof TreatmentsFormSchema>

/**
 * Treatments Catalog collection
 * Standardized treatment definitions
 */
const TreatmentsCatalogDataSchema = v.object({
  name: v.pipe(v.string(), v.nonEmpty("Treatment name is required")),
  description: v.optional(v.string()),
  default_price: v.number(),
  category: v.optional(v.string()), // e.g., "preventive", "restorative", "surgical"
  code: v.optional(v.string()), // procedure code (CPT, CDT, etc.)
  insuranceCoverage: v.optional(v.number()), // typical insurance coverage percentage
  estimatedDuration: v.optional(v.number()), // in minutes
})

export const TreatmentsCatalogSchema = v.intersect([BaseRecordSchema, TreatmentsCatalogDataSchema])
export const TreatmentsCatalogFormSchema = TreatmentsCatalogDataSchema

export type TreatmentsCatalogRecord = v.InferOutput<typeof TreatmentsCatalogSchema>
export type TreatmentsCatalogFormData = v.InferOutput<typeof TreatmentsCatalogFormSchema>


/**
 * Todos collection
 * Task management for office and clinical tasks
 */

// Data fields (without base record fields)
const TodoDataSchema = v.object({
  title: v.pipe(v.string(), v.nonEmpty("Title is required")),
  description: v.optional(v.string()),
  completed: v.boolean(),
  priority: v.optional(v.picklist(['low', 'medium', 'high', 'urgent'])),
  dueDate: v.optional(v.string()),
  assignedTo: v.optional(v.string()), // relation to users
  relatedPatient: v.optional(v.string()), // relation to patients
  category: v.optional(v.picklist(['administrative', 'clinical', 'follow_up', 'billing', 'other'])),
})

// Full schema with base record fields (for API responses)
export const TodoSchema = v.intersect([
  BaseRecordSchema,
  TodoDataSchema,
])

// Schema for creating/updating (without base record fields)
export const TodoFormSchema = TodoDataSchema

export type TodoRecord = v.InferOutput<typeof TodoSchema>
export type TodoFormData = v.InferOutput<typeof TodoFormSchema>



/**
 * Treatment Plans collection
 * Multi-step treatment plans for patients
 * Individual plan items stored in treatment_plan_items for normalization
 */
const TreatmentPlansDataSchema = v.object({
  patient: v.string(), // relation to patients
  createdBy: v.string(), // relation to users (dentist)

  // Plan Details
  title: v.pipe(v.string(), v.nonEmpty("Title is required")),
  description: v.optional(v.string()),
  diagnosis: v.optional(v.string()),

  // Status
  status: v.picklist(["proposed", "accepted", "in_progress", "completed", "cancelled"]),

  // Dates
  proposedDate: v.optional(v.string()), // ISO date
  acceptedDate: v.optional(v.string()),
  completedDate: v.optional(v.string()),

  // Financial (calculated from plan items)
  estimatedCost: v.optional(v.number()),
})

export const TreatmentPlansSchema = v.intersect([BaseRecordSchema, TreatmentPlansDataSchema])
export const TreatmentPlansFormSchema = TreatmentPlansDataSchema

export type TreatmentPlansRecord = v.InferOutput<typeof TreatmentPlansSchema>
export type TreatmentPlansFormData = v.InferOutput<typeof TreatmentPlansFormSchema>

/**
 * Invoices collection
 * Billing header - line items stored separately in invoice_items
 * Payment tracking done via payments collection
 */
export const InvoicesSchema = v.intersect([
  BaseRecordSchema,
  v.object({
    patient: v.string(), // relation to patients
    appointment: v.optional(v.string()), // relation to appointments

    // Invoice Details
    invoiceNumber: v.pipe(v.string(), v.nonEmpty("Invoice number is required")), // indexed, unique
    invoiceDate: v.string(), // ISO date
    dueDate: v.optional(v.string()),

    // Totals (calculated from invoice_items)
    subtotal: v.number(),
    tax: v.optional(v.number()),
    discount: v.optional(v.number()),
    total: v.number(),

    // Status
    status: v.picklist(["draft", "sent", "paid", "partial", "overdue", "cancelled"]),

    // Insurance
    insuranceClaim: v.optional(v.string()), // relation to insurance_claims
    insuranceAmount: v.optional(v.number()),

    notes: v.optional(v.string()),
  }),
])

export type InvoicesRecord = v.InferOutput<typeof InvoicesSchema>

/**
 * Payments collection
 * Individual payment transactions
 */
export const PaymentsSchema = v.intersect([
  BaseRecordSchema,
  v.object({
    patient: v.string(), // relation to patients
    invoice: v.string(), // relation to invoices

    // Payment Details
    amount: v.number(),
    paymentDate: v.string(), // ISO date
    paymentMethod: v.picklist(['cash', 'card', 'insurance', 'check', 'transfer']),

    // Transaction Details
    transactionId: v.optional(v.string()),
    reference: v.optional(v.string()),
    notes: v.optional(v.string()),

    // Processing
    processedBy: v.optional(v.string()), // relation to users
  }),
])

export type PaymentsRecord = v.InferOutput<typeof PaymentsSchema>

/**
 * Medical History collection
 * Detailed medical history records for patients
 */
export const MedicalHistorySchema = v.intersect([
  BaseRecordSchema,
  v.object({
    patient: v.string(), // relation to patients
    recordedBy: v.string(), // relation to users

    // Medical Conditions
    conditions: v.optional(v.array(v.string())),
    allergies: v.optional(v.array(v.string())),
    medications: v.optional(v.array(v.string())),

    // Dental History
    previousDentalWork: v.optional(v.string()),
    dentalConcerns: v.optional(v.string()),

    // Lifestyle
    smoking: v.optional(v.boolean()),
    smokingFrequency: v.optional(v.string()),
    alcohol: v.optional(v.boolean()),
    alcoholFrequency: v.optional(v.string()),

    // Other
    notes: v.optional(v.string()),
    recordDate: v.string(), // ISO date
  }),
])

export type MedicalHistoryRecord = v.InferOutput<typeof MedicalHistorySchema>

/**
 * Prescriptions collection
 * Medication prescriptions issued to patients
 */
export const PrescriptionsSchema = v.intersect([
  BaseRecordSchema,
  v.object({
    patient: v.string(), // relation to patients
    prescribedBy: v.string(), // relation to users (dentist)
    appointment: v.optional(v.string()), // relation to appointments

    // Medication Details
    medicationName: v.pipe(v.string(), v.nonEmpty("Medication name is required")),
    dosage: v.pipe(v.string(), v.nonEmpty("Dosage is required")),
    frequency: v.pipe(v.string(), v.nonEmpty("Frequency is required")),
    duration: v.pipe(v.string(), v.nonEmpty("Duration is required")), // e.g., "7 days"
    quantity: v.optional(v.string()),

    // Instructions
    instructions: v.optional(v.string()),

    // Dates
    prescribedDate: v.string(), // ISO date
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),

    // Status
    status: v.picklist(['active', 'completed', 'cancelled']),

    notes: v.optional(v.string()),
  }),
])

export type PrescriptionsRecord = v.InferOutput<typeof PrescriptionsSchema>

/**
 * Inventory collection
 * Dental supplies and equipment inventory management
 */
export const InventorySchema = v.intersect([
  BaseRecordSchema,
  v.object({
    // Item Details
    name: v.pipe(v.string(), v.nonEmpty("Item name is required")),
    category: v.picklist(['dental_supplies', 'medication', 'equipment', 'consumables', 'other']),
    sku: v.optional(v.string()),
    barcode: v.optional(v.string()),

    // Stock
    quantity: v.number(),
    unit: v.pipe(v.string(), v.nonEmpty("Unit is required")), // e.g., "pieces", "boxes", "bottles"
    minQuantity: v.optional(v.number()), // reorder threshold
    maxQuantity: v.optional(v.number()),

    // Supplier
    supplier: v.optional(v.string()),
    supplierSku: v.optional(v.string()),

    // Pricing
    costPrice: v.optional(v.number()),
    sellingPrice: v.optional(v.number()),

    // Storage
    location: v.optional(v.string()),
    expiryDate: v.optional(v.string()), // ISO date

    // Status
    status: v.picklist(['in_stock', 'low_stock', 'out_of_stock', 'discontinued']),

    notes: v.optional(v.string()),
  }),
])

export type InventoryRecord = v.InferOutput<typeof InventorySchema>

/**
 * Staff/Dentists collection extension
 * Additional fields for users who are staff/dentists
 * This extends the base users collection
 */
export const StaffSchema = v.intersect([
  UsersSchema,
  v.object({
    // Professional Information
    role: v.picklist(['dentist', 'hygienist', 'assistant', 'receptionist', 'admin', 'other']),
    licenseNumber: v.optional(v.string()),
    specialization: v.optional(v.array(v.string())),

    // Employment
    employmentType: v.optional(v.picklist(['full_time', 'part_time', 'contract'])),
    hireDate: v.optional(v.string()), // ISO date

    // Schedule
    workingDays: v.optional(v.array(v.string())), // e.g., ["monday", "tuesday", "wednesday"]
    workingHours: v.optional(v.object({
      start: v.string(),
      end: v.string(),
    })),

    // Contact
    phone: v.optional(v.string()),
    emergencyContact: v.optional(v.string()),
    emergencyPhone: v.optional(v.string()),

    // Status
    isActive: v.boolean(),
  }),
])

export type StaffRecord = v.InferOutput<typeof StaffSchema>

/**
 * Invoice Items collection
 * Normalized invoice line items - separates line items from invoice header
 * Better for querying, reporting, and data integrity
 */
export const InvoiceItemsSchema = v.intersect([
  BaseRecordSchema,
  v.object({
    invoice: v.string(), // relation to invoices (required)

    // Item Details
    description: v.pipe(v.string(), v.nonEmpty("Description is required")),
    quantity: v.number(),
    unitPrice: v.number(),
    total: v.number(), // quantity * unitPrice

    // Optional Relations
    treatment: v.optional(v.string()), // relation to treatments
    inventoryItem: v.optional(v.string()), // relation to inventory

    // Discounts
    discount: v.optional(v.number()),
    discountType: v.optional(v.picklist(["percentage", "fixed"])),

    // Tax
    taxable: v.optional(v.boolean()),
    taxAmount: v.optional(v.number()),

    // Insurance
    insuranceCoverage: v.optional(v.number()), // amount covered by insurance

    // Ordering
    lineNumber: v.optional(v.number()), // for display ordering
  }),
])

export type InvoiceItemsRecord = v.InferOutput<typeof InvoiceItemsSchema>

/**
 * Treatment Plan Items collection
 * Normalized treatment plan steps - better than storing array in treatment_plans
 * Allows independent tracking of each step's status and completion
 */
export const TreatmentPlanItemsSchema = v.intersect([
  BaseRecordSchema,
  v.object({
    treatmentPlan: v.string(), // relation to treatment_plans (required)

    // Treatment Details
    treatmentType: v.string(), // relation to treatments_catalog
    toothNumber: v.optional(v.string()),
    surface: v.optional(v.string()),

    // Planning
    description: v.optional(v.string()),
    priority: v.picklist(["low", "medium", "high", "urgent"]),
    estimatedCost: v.optional(v.number()),
    estimatedDuration: v.optional(v.number()), // minutes

    // Status
    status: v.picklist(["pending", "scheduled", "in_progress", "completed", "cancelled"]),

    // Scheduling
    scheduledDate: v.optional(v.string()), // ISO date
    completedDate: v.optional(v.string()),

    // Link to actual treatment when performed
    completedTreatment: v.optional(v.string()), // relation to treatments

    // Ordering
    sequenceNumber: v.optional(v.number()), // order in treatment plan

    notes: v.optional(v.string()),
  }),
])

export type TreatmentPlanItemsRecord = v.InferOutput<typeof TreatmentPlanItemsSchema>

/**
 * Addresses collection
 * Normalized address storage - reusable for patients, staff, suppliers
 * Enables better validation, geocoding, and address history
 */
export const AddressesSchema = v.intersect([
  BaseRecordSchema,
  v.object({
    // Address Type
    addressType: v.optional(v.picklist(["home", "work", "billing", "shipping", "other"])),

    // Address Components
    street1: v.pipe(v.string(), v.nonEmpty("Street address is required")),
    street2: v.optional(v.string()),
    city: v.pipe(v.string(), v.nonEmpty("City is required")),
    state: v.pipe(v.string(), v.nonEmpty("State is required")),
    zipCode: v.pipe(v.string(), v.nonEmpty("Zip code is required")),
    country: v.pipe(v.string(), v.nonEmpty("Country is required")),

    // Geocoding (optional)
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),

    // Validation
    isVerified: v.optional(v.boolean()),
    verifiedAt: v.optional(v.string()), // ISO date

    // Metadata
    isPrimary: v.optional(v.boolean()),
    label: v.optional(v.string()), // custom label like "Summer Home"
  }),
])

export type AddressesRecord = v.InferOutput<typeof AddressesSchema>

/**
 * Emergency Contacts collection
 * Normalized emergency contact storage
 * Allows multiple emergency contacts per patient
 */
export const EmergencyContactsSchema = v.intersect([
  BaseRecordSchema,
  v.object({
    // Contact Info
    firstName: v.pipe(v.string(), v.nonEmpty("First name is required")),
    lastName: v.pipe(v.string(), v.nonEmpty("Last name is required")),
    relationship: v.pipe(v.string(), v.nonEmpty("Relationship is required")), // e.g., "spouse", "parent", "sibling", "friend"

    // Phone Numbers
    primaryPhone: v.pipe(v.string(), v.nonEmpty("Primary phone is required")),
    secondaryPhone: v.optional(v.string()),

    // Contact Preferences
    preferredContactMethod: v.optional(v.picklist(["phone", "sms", "email"])),
    email: v.optional(v.pipe(v.string(), v.email())),

    // Address (optional relation)
    address: v.optional(v.string()), // relation to addresses

    // Priority
    isPrimary: v.optional(v.boolean()),
    priority: v.optional(v.number()), // 1 = first to contact

    notes: v.optional(v.string()),
  }),
])

export type EmergencyContactsRecord = v.InferOutput<typeof EmergencyContactsSchema>

/**
 * Patient Insurance collection
 * Normalized insurance information
 * Allows multiple insurance policies per patient (primary, secondary, etc.)
 */
export const PatientInsuranceSchema = v.intersect([
  BaseRecordSchema,
  v.object({
    patient: v.string(), // relation to patients (required)

    // Insurance Details
    provider: v.pipe(v.string(), v.nonEmpty("Provider is required")),
    policyNumber: v.pipe(v.string(), v.nonEmpty("Policy number is required")),
    groupNumber: v.optional(v.string()),

    // Coverage Type
    coverageType: v.picklist(["primary", "secondary", "tertiary"]),

    // Policy Holder (if different from patient)
    policyHolderName: v.optional(v.string()),
    policyHolderDOB: v.optional(v.string()), // ISO date
    relationshipToPolicyHolder: v.optional(v.picklist(["self", "spouse", "child", "other"])),

    // Coverage Details
    effectiveDate: v.optional(v.string()), // ISO date
    expirationDate: v.optional(v.string()),

    // Contact
    insurancePhone: v.optional(v.string()),
    insuranceAddress: v.optional(v.string()), // relation to addresses

    // Coverage Limits
    annualMaximum: v.optional(v.number()),
    deductible: v.optional(v.number()),
    deductibleMet: v.optional(v.number()),

    // Status
    isActive: v.boolean(),

    notes: v.optional(v.string()),
  }),
])

export type PatientInsuranceRecord = v.InferOutput<typeof PatientInsuranceSchema>

/**
 * Insurance Claims collection
 * Track insurance claims separately from invoices
 * Enables proper claim management workflow
 */
export const InsuranceClaimsSchema = v.intersect([
  BaseRecordSchema,
  v.object({
    patient: v.string(), // relation to patients
    insurance: v.string(), // relation to patient_insurance
    invoice: v.optional(v.string()), // relation to invoices

    // Claim Details
    claimNumber: v.optional(v.string()),
    claimDate: v.string(), // ISO date

    // Amounts
    claimedAmount: v.number(),
    approvedAmount: v.optional(v.number()),
    paidAmount: v.optional(v.number()),
    deniedAmount: v.optional(v.number()),
    patientResponsibility: v.optional(v.number()),

    // Status
    status: v.picklist(["pending", "submitted", "approved", "partial", "denied", "paid"]),

    // Tracking
    submittedDate: v.optional(v.string()), // ISO date
    processedDate: v.optional(v.string()),
    paidDate: v.optional(v.string()),

    // Denial Info
    denialReason: v.optional(v.string()),
    appealDate: v.optional(v.string()),
    appealStatus: v.optional(v.picklist(["pending", "approved", "denied"])),

    notes: v.optional(v.string()),
  }),
])

export type InsuranceClaimsRecord = v.InferOutput<typeof InsuranceClaimsSchema>

/**
 * Dental Chart collection
 * Track tooth-specific conditions and history
 * Enables visual dental charts and treatment planning
 */
export const DentalChartSchema = v.intersect([
  BaseRecordSchema,
  v.object({
    patient: v.string(), // relation to patients (required)
    toothNumber: v.pipe(v.string(), v.nonEmpty("Tooth number is required")), // dental notation (FDI, Universal, Palmer)

    // Tooth Status
    status: v.picklist(["healthy", "decayed", "filled", "missing", "implant", "crown", "bridge", "root_canal", "extracted", "other"]),

    // Condition Details
    conditions: v.optional(v.array(v.string())), // e.g., ["cavity", "sensitivity", "wear"]
    surfaces: v.optional(v.array(v.string())), // affected surfaces: ["occlusal", "mesial", "distal", "buccal", "lingual"]

    // Date tracking
    conditionDate: v.optional(v.string()), // ISO date
    lastExamDate: v.optional(v.string()),

    // Links to treatments
    relatedTreatments: v.optional(v.array(v.string())), // can expand to get full history

    notes: v.optional(v.string()),
  }),
])

export type DentalChartRecord = v.InferOutput<typeof DentalChartSchema>

/**
 * 📋 All schemas exported for validation and form integration
 * 
 * Use these schemas for:
 * - Runtime validation: v.parse(PatientSchema, data)
 * - Form validation: valiForm(PatientSchema)
 * - Type inference: v.InferOutput<typeof PatientSchema>
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
 * All types derived from Valibot schemas for runtime safety.
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
 * All types are derived from Valibot schemas, giving you:
 * ✅ Runtime validation
 * ✅ Type safety
 * ✅ Form validation
 * ✅ Single source of truth
 * 
 * ⚠️  WORKFLOW: When adding a new collection
 * -------------------------------------------
 * 1. Create Valibot schema (e.g., PostSchema)
 * 2. Export inferred type: export type PostRecord = v.InferOutput<typeof PostSchema>
 * 3. Add to AppCollections interface
 * 4. That's it! Automatic type inference everywhere
 * 
 * 📊 USAGE EXAMPLES:
 * ------------------
 * 
 * // Runtime validation (validate API responses)
 * const validPatient = v.parse(PatientSchema, apiData)
 * 
 * // Form validation with Modular Forms
 * const [form] = createForm({
 *   validate: valiForm(PatientSchema)
 * })
 * 
 * // Type inference (no manual typing needed!)
 * const patients = useCollection("patients") // ✨ Typed as PatientsRecord[]
 * const createPatient = useCreateRecord("patients") // ✨ Knows all patient fields
 * 
 * // Use schema in validation
 * <Field name="firstName">
 *   {(field, props) => (
 *     <TextInput {...props} value={field.value} error={field.error} />
 *   )}
 * </Field>
 * 
 * 💡 BENEFITS:
 * -------------
 * - Schema validates at runtime (catch bad API data)
 * - Types auto-inferred (no manual interface definitions)
 * - Use same schema for forms (one schema, many uses)
 * - Built-in validation messages
 * - Refactor once, update everywhere
 * 
 * 🎨 SCHEMA PATTERNS:
 * -------------------
 * 
 * // Required string with validation
 * firstName: v.pipe(v.string(), v.nonEmpty("First name is required"))
 * 
 * // Optional email
 * email: v.optional(v.pipe(v.string(), v.email()))
 * 
 * // Enum/picklist
 * status: v.picklist(["active", "inactive", "archived"])
 * 
 * // Number with range
 * age: v.pipe(v.number(), v.minValue(0), v.maxValue(150))
 * 
 * // Array of strings
 * tags: v.array(v.string())
 * 
 * @example Adding a new collection with schema
 * 
 * // 1. Create schema
 * export const PostSchema = v.intersect([
 *   BaseRecordSchema,
 *   v.object({
 *     title: v.pipe(v.string(), v.nonEmpty("Title is required")),
 *     content: v.string(),
 *     published: v.boolean(),
 *   }),
 * ])
 * 
 * // 2. Export type
 * export type PostRecord = v.InferOutput<typeof PostSchema>
 * 
 * // 3. Add to AppCollections
 * interface AppCollections {
 *   patients: PatientsRecord
 *   todos: TodoRecord
 *   posts: PostRecord  // ← Add this line!
 * }
 * 
 * // 4. Use everywhere with validation!
 * const posts = useCollection("posts")  // ✨ Typed as PostRecord[]
 * const validPost = v.parse(PostSchema, apiData)  // ✨ Runtime validation
 * const [form] = createForm({ validate: valiForm(PostSchema) })  // ✨ Form validation
 */
export interface CollectionRecords extends AuthCollections, AppCollections {
  // All collections from AuthCollections and AppCollections are included here
  // via TypeScript's intersection (&) - no need to list them again!
  // 
  // Add one-off collections here if they don't fit in a table:
  // oneOffCollection: OneOffRecord
}
