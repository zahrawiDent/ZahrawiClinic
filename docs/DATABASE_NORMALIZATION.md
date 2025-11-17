# Database Normalization Guide

## Overview

This document explains the normalized relational database design for the dental clinic management system. The schema follows database normalization best practices (3NF) while maintaining performance and usability.

---

## 🎯 Key Normalization Improvements

### 1. **Separated Address Data** ✅

**Before:**
```typescript
// Denormalized - duplicated fields in patients
patients: {
  address: string
  city: string
  state: string
  zipCode: string
  country: string
}
```

**After:**
```typescript
// Normalized - separate addresses collection
patients: {
  primaryAddress: RecordIdString // relation to addresses
}

addresses: {
  street1: string
  city: string
  state: string
  zipCode: string
  // ... reusable for patients, staff, suppliers
}
```

**Benefits:**
- ✅ Reusable for patients, staff, suppliers, insurance companies
- ✅ Easy to add address history tracking
- ✅ Enables geocoding and address validation
- ✅ Better querying (e.g., "all patients in city X")

---

### 2. **Normalized Emergency Contacts** ✅

**Before:**
```typescript
patients: {
  emergencyContact: string
  emergencyPhone: string
}
```

**After:**
```typescript
patients: {
  emergencyContact: RecordIdString // relation to emergency_contacts
}

emergency_contacts: {
  firstName: string
  lastName: string
  relationship: string
  primaryPhone: string
  isPrimary: boolean
  // ... multiple contacts per patient
}
```

**Benefits:**
- ✅ Support multiple emergency contacts
- ✅ Priority ordering (primary, secondary)
- ✅ Richer contact information
- ✅ Contact method preferences

---

### 3. **Normalized Insurance Information** ✅

**Before:**
```typescript
patients: {
  insuranceProvider: string
  insuranceNumber: string
}
```

**After:**
```typescript
patients: {
  primaryInsurance: RecordIdString // relation to patient_insurance
}

patient_insurance: {
  provider: string
  policyNumber: string
  coverageType: "primary" | "secondary" | "tertiary"
  effectiveDate: string
  expirationDate: string
  // ... complete insurance details
}

insurance_claims: {
  insurance: RecordIdString
  claimNumber: string
  status: "pending" | "submitted" | "approved" | "denied"
  // ... full claim tracking
}
```

**Benefits:**
- ✅ Multiple insurance policies per patient
- ✅ Proper coverage hierarchy (primary/secondary)
- ✅ Insurance claim workflow tracking
- ✅ Historical insurance records

---

### 4. **Separated Invoice Line Items** ✅

**Before:**
```typescript
invoices: {
  items: Array<{
    description: string
    quantity: number
    unitPrice: number
  }> // JSON array - not queryable
}
```

**After:**
```typescript
invoices: {
  subtotal: number
  total: number
  // header only
}

invoice_items: {
  invoice: RecordIdString
  description: string
  quantity: number
  unitPrice: number
  treatment?: RecordIdString
  // ... one row per line item
}
```

**Benefits:**
- ✅ Queryable line items (e.g., "all treatments billed")
- ✅ Better reporting and analytics
- ✅ Links to treatments and inventory
- ✅ Individual item tracking
- ✅ Easier to calculate totals and taxes

---

### 5. **Normalized Treatment Plans** ✅

**Before:**
```typescript
treatment_plans: {
  treatments: RecordIdString[] // array of IDs
}
```

**After:**
```typescript
treatment_plans: {
  title: string
  status: string
  // header only
}

treatment_plan_items: {
  treatmentPlan: RecordIdString
  treatmentType: RecordIdString
  status: "pending" | "scheduled" | "completed"
  sequenceNumber: number
  completedTreatment?: RecordIdString
  // ... one row per planned treatment
}
```

**Benefits:**
- ✅ Individual status tracking per step
- ✅ Sequence ordering
- ✅ Links to completed treatments
- ✅ Better progress tracking
- ✅ Queryable (e.g., "pending items for patient X")

---

### 6. **Treatment Type Normalization** ✅

**Before:**
```typescript
treatments: {
  treatmentType: TreatmentsCatalogRecord // embedded object
  cost: number // duplicated for each treatment
}
```

**After:**
```typescript
treatments: {
  treatmentType: RecordIdString // relation to catalog
  actualCost?: number // only if different from catalog
}

treatments_catalog: {
  name: string
  default_price: number
  category: string
  code: string // CPT/CDT codes
  insuranceCoverage: number
}
```

**Benefits:**
- ✅ Consistent treatment naming
- ✅ Centralized pricing management
- ✅ Easy price updates
- ✅ Standardized procedure codes
- ✅ Typical insurance coverage rates

---

### 7. **Removed Payment Redundancy** ✅

**Before:**
```typescript
invoices: {
  paidAmount: number
  paymentMethod: string
  paidAt: string
  // payment data duplicated
}

payments: {
  amount: number
  paymentDate: string
  // same data in two places
}
```

**After:**
```typescript
invoices: {
  status: "draft" | "paid" | "partial"
  // no payment details
}

payments: {
  invoice: RecordIdString
  amount: number
  paymentDate: string
  paymentMethod: string
  transactionId: string
  // single source of truth
}
```

**Benefits:**
- ✅ No data duplication
- ✅ Multiple payments per invoice
- ✅ Payment history tracking
- ✅ Proper audit trail

---

### 8. **Added Dental Chart Tracking** ✅

**New Collection:**
```typescript
dental_chart: {
  patient: RecordIdString
  toothNumber: string
  status: "healthy" | "decayed" | "filled" | "missing"
  conditions: string[]
  relatedTreatments: RecordIdString[]
}
```

**Benefits:**
- ✅ Visual dental chart support
- ✅ Tooth-specific history
- ✅ Treatment planning
- ✅ Progress tracking over time

---

## 📊 Normalization Level: Third Normal Form (3NF)

### First Normal Form (1NF) ✅
- ✅ No repeating groups (arrays converted to separate tables)
- ✅ Atomic values only
- ✅ Each cell contains single value

### Second Normal Form (2NF) ✅
- ✅ All non-key attributes depend on entire primary key
- ✅ No partial dependencies

### Third Normal Form (3NF) ✅
- ✅ No transitive dependencies
- ✅ Non-key attributes depend only on primary key
- ✅ Lookup data in separate tables (addresses, emergency_contacts, etc.)

---

## 🔗 Relationship Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                        CORE ENTITIES                          │
└──────────────────────────────────────────────────────────────┘

                    ┌─────────────┐
                    │   PATIENTS  │
                    └──────┬──────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
┌───────────────┐  ┌──────────────┐  ┌─────────────────┐
│   ADDRESSES   │  │ EMERGENCY    │  │ PATIENT         │
│               │  │ CONTACTS     │  │ INSURANCE       │
└───────────────┘  └──────────────┘  └────────┬────────┘
                                              │
                                              ▼
                                     ┌─────────────────┐
                                     │ INSURANCE       │
                                     │ CLAIMS          │
                                     └─────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                   CLINICAL WORKFLOW                           │
└──────────────────────────────────────────────────────────────┘

    ┌─────────────┐         ┌──────────────┐
    │   PATIENTS  │◄────────│ APPOINTMENTS │
    └──────┬──────┘         └──────┬───────┘
           │                       │
           └───────────┬───────────┘
                       ▼
              ┌─────────────────┐
              │   TREATMENTS    │◄──────┐
              └────────┬────────┘       │
                       │                │
                       ▼                │
            ┌──────────────────┐   ┌────────────────────┐
            │   TREATMENTS     │   │ TREATMENT PLANS    │
            │   CATALOG        │   └─────────┬──────────┘
            └──────────────────┘             │
                                             ▼
                                  ┌──────────────────────┐
                                  │ TREATMENT PLAN       │
                                  │ ITEMS                │
                                  └──────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                    BILLING WORKFLOW                           │
└──────────────────────────────────────────────────────────────┘

    ┌─────────────┐         ┌──────────────┐
    │   PATIENTS  │◄────────│   INVOICES   │
    └─────────────┘         └──────┬───────┘
                                   │
                    ┌──────────────┼──────────────┐
                    ▼              ▼              ▼
         ┌──────────────┐  ┌─────────────┐  ┌──────────┐
         │ INVOICE      │  │  PAYMENTS   │  │ INSURANCE│
         │ ITEMS        │  │             │  │ CLAIMS   │
         └──────┬───────┘  └─────────────┘  └──────────┘
                │
                ▼
         ┌──────────────┐
         │  TREATMENTS  │
         └──────────────┘
```

---

## 🎯 Index Recommendations

### High Priority Indexes

```sql
-- Patients
CREATE INDEX idx_patients_email ON patients(email)
CREATE INDEX idx_patients_status ON patients(status)
CREATE INDEX idx_patients_primary_dentist ON patients(primaryDentist)

-- Appointments
CREATE INDEX idx_appointments_date ON appointments(appointmentDate)
CREATE INDEX idx_appointments_patient ON appointments(patient)
CREATE INDEX idx_appointments_dentist ON appointments(dentist)
CREATE INDEX idx_appointments_status ON appointments(status)

-- Treatments
CREATE INDEX idx_treatments_patient ON treatments(patient)
CREATE INDEX idx_treatments_date ON treatments(treatmentDate)
CREATE INDEX idx_treatments_type ON treatments(treatmentType)

-- Invoices
CREATE UNIQUE INDEX idx_invoices_number ON invoices(invoiceNumber)
CREATE INDEX idx_invoices_patient ON invoices(patient)
CREATE INDEX idx_invoices_status ON invoices(status)
CREATE INDEX idx_invoices_date ON invoices(invoiceDate)

-- Invoice Items
CREATE INDEX idx_invoice_items_invoice ON invoice_items(invoice)
CREATE INDEX idx_invoice_items_treatment ON invoice_items(treatment)

-- Payments
CREATE INDEX idx_payments_invoice ON payments(invoice)
CREATE INDEX idx_payments_date ON payments(paymentDate)

-- Insurance Claims
CREATE INDEX idx_claims_patient ON insurance_claims(patient)
CREATE INDEX idx_claims_status ON insurance_claims(status)
```

---

## 🚀 Query Examples with Normalized Schema

### Get Patient with All Related Data

```typescript
const patient = useRecord("patients", () => patientId, {
  expand: "primaryAddress,emergencyContact,primaryInsurance,primaryDentist"
})

// Access normalized data:
patient.data.expand.primaryAddress.city
patient.data.expand.emergencyContact.primaryPhone
patient.data.expand.primaryInsurance.provider
```

### Get Invoice with Line Items and Payments

```typescript
const invoice = useRecord("invoices", () => invoiceId)

const lineItems = useCollection("invoice_items", {
  filter: `invoice = "${invoiceId}"`,
  expand: "treatment"
})

const payments = useCollection("payments", {
  filter: `invoice = "${invoiceId}"`,
  sort: "-paymentDate"
})
```

### Get Treatment Plan with All Items

```typescript
const plan = useRecord("treatment_plans", () => planId)

const planItems = useCollection("treatment_plan_items", {
  filter: `treatmentPlan = "${planId}"`,
  expand: "treatmentType,completedTreatment",
  sort: "sequenceNumber"
})
```

### Get Appointments for Today

```typescript
const today = new Date().toISOString().split('T')[0]
const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]

const appointments = useCollection("appointments", {
  filter: `appointmentDate >= "${today}" && appointmentDate < "${tomorrow}"`,
  expand: "patient.primaryAddress,dentist",
  sort: "appointmentDate"
})

// Access patient address
appointments.data.items[0].expand.patient.expand.primaryAddress.city
```

### Get All Unpaid Invoices with Outstanding Amount

```typescript
const unpaidInvoices = useCollection("invoices", {
  filter: 'status != "paid" && status != "cancelled"',
  expand: "patient"
})

// Calculate outstanding per invoice
unpaidInvoices.data.items.forEach(invoice => {
  const payments = await pb.getList("payments", 1, 50, {
    filter: `invoice = "${invoice.id}"`
  })
  const paidAmount = payments.items.reduce((sum, p) => sum + p.amount, 0)
  const outstanding = invoice.total - paidAmount
})
```

---

## 📝 Migration Checklist

When creating collections in PocketBase:

### 1. Create Base Collections First
- [ ] `addresses`
- [ ] `emergency_contacts`
- [ ] `treatments_catalog`

### 2. Create Main Collections
- [ ] `patients` (with relations to addresses, emergency_contacts)
- [ ] `patient_insurance`
- [ ] `appointments`
- [ ] `treatments`
- [ ] `treatment_plans`

### 3. Create Normalized Line Item Collections
- [ ] `invoice_items`
- [ ] `treatment_plan_items`
- [ ] `dental_chart`

### 4. Create Financial Collections
- [ ] `invoices`
- [ ] `payments`
- [ ] `insurance_claims`

### 5. Set Up Cascade Delete Rules
- Invoice → Invoice Items (cascade)
- Treatment Plan → Treatment Plan Items (cascade)
- Patient → Appointments (restrict or cascade based on policy)
- Patient → Medical History (cascade)

### 6. Set Up Required Fields
Mark these as required in PocketBase:
- `patients.firstName`, `patients.lastName`
- `appointments.patient`, `appointments.dentist`, `appointments.appointmentDate`
- `treatments.patient`, `treatments.performedBy`, `treatments.treatmentType`
- `invoices.invoiceNumber`, `invoices.patient`
- `invoice_items.invoice`, `invoice_items.description`

---

## ✅ Benefits Summary

1. **Data Integrity**
   - No duplicate data
   - Consistent values across system
   - Proper foreign key relationships

2. **Query Performance**
   - Indexed relations
   - Efficient joins
   - Better query planning

3. **Maintainability**
   - Single source of truth
   - Easy schema updates
   - Clear data relationships

4. **Flexibility**
   - Support multiple addresses/contacts/insurance
   - Historical tracking
   - Easy to extend

5. **Reporting**
   - Queryable line items
   - Better analytics
   - Audit trails

---

## 🔄 Denormalization Considerations

While normalized, some calculated fields are acceptable for performance:

### Keep Calculated Fields On:
- `invoices.subtotal`, `invoices.total` (calculated from invoice_items)
- `treatment_plans.estimatedCost` (calculated from plan_items)

### Why?
- Avoids expensive JOINs for common queries
- Updated via triggers/webhooks when items change
- Trade-off: Small redundancy for big performance gain

### Implementation:
```typescript
// When invoice_items change, update invoice totals
const updateInvoiceTotals = async (invoiceId: string) => {
  const items = await pb.getList("invoice_items", 1, 100, {
    filter: `invoice = "${invoiceId}"`
  })
  
  const subtotal = items.items.reduce((sum, item) => sum + item.total, 0)
  const total = subtotal + (invoice.tax || 0) - (invoice.discount || 0)
  
  await pb.update("invoices", invoiceId, { subtotal, total })
}
```

---

## 📚 Additional Resources

- [Database Normalization](https://en.wikipedia.org/wiki/Database_normalization)
- [PocketBase Relations](https://pocketbase.io/docs/collections/#relation-fields)
- [SQL Indexing Best Practices](https://use-the-index-luke.com/)
