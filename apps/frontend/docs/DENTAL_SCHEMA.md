# Dental Clinic Management Schema

This document provides an overview of the database schema for the dental clinic management system.

## 📊 Collections Overview

### Patient Management

#### **patients**
Core patient information and demographics.

**Key Fields:**
- `firstName`, `lastName` - Patient name
- `email`, `phone`, `mobile` - Contact information
- `dateOfBirth`, `gender` - Demographics
- `address`, `city`, `state`, `zipCode` - Location
- `bloodType`, `allergies`, `medicalConditions`, `medications` - Medical info
- `insuranceProvider`, `insuranceNumber` - Insurance
- `primaryDentist` - Relation to users (dentist assigned)
- `status` - `active`, `inactive`, `archived`

#### **medical_history**
Detailed medical history records for patients.

**Key Fields:**
- `patient` - Relation to patients
- `recordedBy` - Relation to users (staff member)
- `conditions`, `allergies`, `medications` - Medical arrays
- `previousDentalWork`, `dentalConcerns` - Dental history
- `smoking`, `alcohol` - Lifestyle factors
- `recordDate` - When recorded

---

### Scheduling

#### **appointments**
Scheduling and appointment management.

**Key Fields:**
- `patient` - Relation to patients (required)
- `dentist` - Relation to users (required)
- `appointmentDate` - ISO datetime
- `duration` - Minutes
- `status` - `scheduled`, `confirmed`, `completed`, `cancelled`, `no_show`
- `type` - `checkup`, `cleaning`, `filling`, `extraction`, `root_canal`, `crown`, `consultation`, `emergency`, `other`
- `room` - Appointment room/chair
- `reminderSent`, `reminderSentAt` - Reminder tracking
- `completedAt`, `cancelledAt`, `cancellationReason` - Status tracking

---

### Clinical

#### **treatments**
Individual treatment records performed during appointments.

**Key Fields:**
- `patient` - Relation to patients
- `appointment` - Relation to appointments
- `performedBy` - Relation to users (dentist)
- `treatmentType` - e.g., "Filling", "Extraction", "Crown"
- `toothNumber` - Dental notation (e.g., "18", "2.1")
- `surface` - e.g., "occlusal", "mesial"
- `diagnosis`, `procedure`, `notes` - Clinical details
- `cost`, `insuranceCovered`, `patientPaid` - Billing
- `treatmentDate`, `completedAt` - Dates

#### **treatment_plans**
Multi-step treatment plans for patients.

**Key Fields:**
- `patient` - Relation to patients
- `createdBy` - Relation to users (dentist)
- `title`, `description`, `diagnosis` - Plan details
- `status` - `proposed`, `accepted`, `in_progress`, `completed`, `cancelled`
- `proposedDate`, `acceptedDate`, `completedDate` - Timeline
- `estimatedCost` - Financial estimate
- `treatments` - Array of treatment IDs

#### **prescriptions**
Medication prescriptions issued to patients.

**Key Fields:**
- `patient` - Relation to patients
- `prescribedBy` - Relation to users (dentist)
- `appointment` - Relation to appointments
- `medicationName`, `dosage`, `frequency`, `duration` - Medication details
- `instructions` - Usage instructions
- `prescribedDate`, `startDate`, `endDate` - Timeline
- `status` - `active`, `completed`, `cancelled`

---

### Financial

#### **invoices**
Billing and payment tracking.

**Key Fields:**
- `patient` - Relation to patients
- `appointment` - Relation to appointments
- `invoiceNumber`, `invoiceDate`, `dueDate` - Invoice details
- `items` - JSON array of line items:
  ```typescript
  {
    description: string
    quantity: number
    unitPrice: number
    total: number
    treatmentId?: string
  }[]
  ```
- `subtotal`, `tax`, `discount`, `total` - Calculations
- `status` - `draft`, `sent`, `paid`, `partial`, `overdue`, `cancelled`
- `paidAmount`, `paymentMethod`, `paidAt` - Payment tracking
- `insuranceClaim`, `insurancePaid` - Insurance

#### **payments**
Individual payment transactions.

**Key Fields:**
- `patient` - Relation to patients
- `invoice` - Relation to invoices
- `amount`, `paymentDate` - Payment details
- `paymentMethod` - `cash`, `card`, `insurance`, `check`, `transfer`
- `transactionId`, `reference` - Transaction tracking
- `processedBy` - Relation to users (staff)

---

### Operations

#### **todos**
Task management for office and clinical tasks.

**Key Fields:**
- `title`, `description` - Task details
- `completed` - Status
- `priority` - `low`, `medium`, `high`, `urgent`
- `dueDate` - Deadline
- `assignedTo` - Relation to users
- `relatedPatient` - Relation to patients
- `category` - `administrative`, `clinical`, `follow_up`, `billing`, `other`

#### **inventory**
Dental supplies and equipment inventory management.

**Key Fields:**
- `name`, `category` - Item identification
- `sku`, `barcode` - Product codes
- `quantity`, `unit` - Stock levels
- `minQuantity`, `maxQuantity` - Reorder thresholds
- `supplier`, `supplierSku` - Supplier info
- `costPrice`, `sellingPrice` - Pricing
- `location`, `expiryDate` - Storage
- `status` - `in_stock`, `low_stock`, `out_of_stock`, `discontinued`

---

### Staff & Users

#### **users** (Built-in PocketBase auth collection)
Basic user authentication.

**Key Fields:**
- `email`, `username` - Authentication
- `verified`, `emailVisibility` - Account status
- `name`, `avatar` - Profile

#### **staff**
Extended user information for staff/dentists.

**Key Fields:**
- All fields from `users` plus:
- `role` - `dentist`, `hygienist`, `assistant`, `receptionist`, `admin`, `other`
- `licenseNumber`, `specialization` - Professional info
- `employmentType` - `full_time`, `part_time`, `contract`
- `hireDate` - Employment start
- `workingDays`, `workingHours` - Schedule
- `phone`, `emergencyContact`, `emergencyPhone` - Contact
- `isActive` - Employment status

---

## 🔗 Relationships

```
users (staff)
  ↓
  ├─→ appointments (as dentist)
  ├─→ treatments (as performedBy)
  ├─→ treatment_plans (as createdBy)
  ├─→ prescriptions (as prescribedBy)
  ├─→ medical_history (as recordedBy)
  └─→ todos (as assignedTo)

patients
  ↓
  ├─→ appointments
  ├─→ treatments
  ├─→ treatment_plans
  ├─→ prescriptions
  ├─→ medical_history
  ├─→ invoices
  ├─→ payments
  └─→ todos (as relatedPatient)

appointments
  ↓
  ├─→ treatments
  ├─→ invoices
  └─→ prescriptions

invoices
  ↓
  └─→ payments
```

---

## 🚀 Usage Examples

### Creating Records

```typescript
// Create a patient
const createPatient = useCreateRecord("patients")
createPatient.mutate({
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  phone: "555-0100",
  dateOfBirth: "1985-06-15",
  status: "active"
})

// Create an appointment
const createAppt = useCreateRecord("appointments")
createAppt.mutate({
  patient: "patient_id_here",
  dentist: "dentist_id_here",
  appointmentDate: "2025-11-20T10:00:00Z",
  duration: 60,
  type: "checkup",
  status: "scheduled"
})

// Create an invoice
const createInvoice = useCreateRecord("invoices")
createInvoice.mutate({
  patient: "patient_id_here",
  invoiceNumber: "INV-2025-001",
  invoiceDate: "2025-11-17",
  items: [
    {
      description: "Dental Cleaning",
      quantity: 1,
      unitPrice: 120,
      total: 120
    }
  ],
  subtotal: 120,
  total: 120,
  status: "sent",
  paidAmount: 0
})
```

### Querying with Relations

```typescript
// Get patient with expanded relations
const patient = useRecord("patients", () => patientId, {
  expand: "primaryDentist,appointments,invoices"
})

// Get appointments for today
const appointments = useCollection("appointments", {
  filter: `appointmentDate >= "${today}" && appointmentDate < "${tomorrow}"`,
  expand: "patient,dentist",
  sort: "appointmentDate"
})

// Get unpaid invoices
const unpaidInvoices = useCollection("invoices", {
  filter: 'status != "paid"',
  expand: "patient",
  sort: "-invoiceDate"
})
```

---

## 📝 Next Steps

1. **Create PocketBase Collections**: Use the PocketBase admin UI to create these collections with the appropriate field types.

2. **Set Up Relations**: Configure relation fields in PocketBase to link collections.

3. **Add Validation Rules**: Set up validation rules in PocketBase for required fields, email formats, etc.

4. **Create Collection Routes**: Build pages for each collection (appointments, invoices, treatments, etc.)

5. **Add Business Logic**: Implement features like:
   - Appointment scheduling with conflict detection
   - Automatic invoice generation from treatments
   - Inventory low-stock alerts
   - Appointment reminders
   - Patient portal access

6. **Generate Types Automatically**: Use `pocketbase-typegen` to keep types in sync:
   ```bash
   npx pocketbase-typegen --db ./pb_data/data.db --out ./src/types/pocketbase-types.ts
   ```
