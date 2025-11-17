# Quick Reference: Normalized Schema Usage

## Common Queries

### Get Patient with All Details
```typescript
const patient = useRecord("patients", () => patientId, {
  expand: "primaryAddress,emergencyContact,primaryInsurance,primaryDentist"
})

// Access data
const address = patient.data?.expand?.primaryAddress
const emergency = patient.data?.expand?.emergencyContact
const insurance = patient.data?.expand?.primaryInsurance
```

### Get Appointments for Today with Patient Info
```typescript
const today = new Date().toISOString().split('T')[0]
const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]

const appointments = useCollection("appointments", {
  filter: `appointmentDate >= "${today}" && appointmentDate < "${tomorrow}"`,
  expand: "patient.primaryAddress,dentist",
  sort: "appointmentDate"
})
```

### Get Invoice with Line Items and Payments
```typescript
// Get invoice header
const invoice = useRecord("invoices", () => invoiceId, {
  expand: "patient,insuranceClaim"
})

// Get line items
const lineItems = useCollection("invoice_items", {
  filter: `invoice = "${invoiceId}"`,
  expand: "treatment",
  sort: "lineNumber"
})

// Get payments
const payments = useCollection("payments", {
  filter: `invoice = "${invoiceId}"`,
  sort: "-paymentDate"
})

// Calculate outstanding
const totalPaid = payments.data?.items.reduce((sum, p) => sum + p.amount, 0) || 0
const outstanding = (invoice.data?.total || 0) - totalPaid
```

### Get Treatment Plan with All Items
```typescript
const plan = useRecord("treatment_plans", () => planId, {
  expand: "patient,createdBy"
})

const planItems = useCollection("treatment_plan_items", {
  filter: `treatmentPlan = "${planId}"`,
  expand: "treatmentType,completedTreatment",
  sort: "sequenceNumber"
})
```

### Get Patient's Complete Medical History
```typescript
const histories = useCollection("medical_history", {
  filter: `patient = "${patientId}"`,
  expand: "recordedBy",
  sort: "-recordDate"
})
```

### Get Patient's Dental Chart
```typescript
const dentalChart = useCollection("dental_chart", {
  filter: `patient = "${patientId}"`,
  sort: "toothNumber"
})
```

---

## Creating Related Records

### Create Patient with Address
```typescript
// 1. Create address first
const createAddress = useCreateRecord("addresses")
const address = await createAddress.mutateAsync({
  addressType: "home",
  street1: "123 Main St",
  city: "Springfield",
  state: "IL",
  zipCode: "62701",
  country: "USA"
})

// 2. Create emergency contact
const createContact = useCreateRecord("emergency_contacts")
const contact = await createContact.mutateAsync({
  firstName: "Jane",
  lastName: "Doe",
  relationship: "spouse",
  primaryPhone: "555-0100",
  isPrimary: true
})

// 3. Create patient with relations
const createPatient = useCreateRecord("patients")
const patient = await createPatient.mutateAsync({
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  primaryAddress: address.id,
  emergencyContact: contact.id,
  status: "active"
})
```

### Create Appointment
```typescript
const createAppt = useCreateRecord("appointments")
createAppt.mutate({
  patient: patientId,
  dentist: dentistId,
  appointmentDate: "2025-11-20T10:00:00Z",
  duration: 60,
  type: "checkup",
  status: "scheduled"
})
```

### Create Treatment with Invoice Item
```typescript
// 1. Create treatment
const createTreatment = useCreateRecord("treatments")
const treatment = await createTreatment.mutateAsync({
  patient: patientId,
  appointment: appointmentId,
  performedBy: dentistId,
  treatmentType: treatmentCatalogId,
  toothNumber: "18",
  treatmentDate: new Date().toISOString()
})

// 2. Create invoice if needed
const createInvoice = useCreateRecord("invoices")
const invoice = await createInvoice.mutateAsync({
  patient: patientId,
  invoiceNumber: `INV-${Date.now()}`,
  invoiceDate: new Date().toISOString(),
  status: "draft",
  subtotal: 0,
  total: 0
})

// 3. Create invoice item
const createItem = useCreateRecord("invoice_items")
await createItem.mutateAsync({
  invoice: invoice.id,
  treatment: treatment.id,
  description: "Dental Filling - Tooth 18",
  quantity: 1,
  unitPrice: 150,
  total: 150
})

// 4. Update invoice totals
const updateInvoice = useUpdateRecord("invoices")
updateInvoice.mutate({
  id: invoice.id,
  subtotal: 150,
  total: 150
})
```

### Create Treatment Plan with Items
```typescript
// 1. Create plan
const createPlan = useCreateRecord("treatment_plans")
const plan = await createPlan.mutateAsync({
  patient: patientId,
  createdBy: dentistId,
  title: "Full Mouth Restoration",
  status: "proposed",
  proposedDate: new Date().toISOString()
})

// 2. Add plan items
const createPlanItem = useCreateRecord("treatment_plan_items")

await createPlanItem.mutateAsync({
  treatmentPlan: plan.id,
  treatmentType: cleaningCatalogId,
  sequenceNumber: 1,
  priority: "high",
  status: "pending",
  estimatedCost: 120
})

await createPlanItem.mutateAsync({
  treatmentPlan: plan.id,
  treatmentType: fillingCatalogId,
  toothNumber: "18",
  sequenceNumber: 2,
  priority: "medium",
  status: "pending",
  estimatedCost: 150
})
```

---

## Updating Related Records

### Update Patient Address
```typescript
// Option 1: Update existing address
const updateAddress = useUpdateRecord("addresses")
updateAddress.mutate({
  id: addressId,
  street1: "456 Oak Ave"
})

// Option 2: Create new address and link
const newAddress = await createAddress.mutateAsync({...})
const updatePatient = useUpdateRecord("patients")
updatePatient.mutate({
  id: patientId,
  primaryAddress: newAddress.id
})
```

### Update Invoice Totals When Items Change
```typescript
// After adding/updating/deleting invoice items:
const items = await pb.getList("invoice_items", 1, 100, {
  filter: `invoice = "${invoiceId}"`
})

const subtotal = items.items.reduce((sum, item) => sum + item.total, 0)

const updateInvoice = useUpdateRecord("invoices")
updateInvoice.mutate({
  id: invoiceId,
  subtotal,
  total: subtotal // or add tax/discount
})
```

---

## Deleting Related Records

### Delete Patient (Cascade Considerations)
```typescript
// PocketBase will handle cascade deletes if configured
// Otherwise, manually delete related records first:

// 1. Delete medical history
await pb.delete("medical_history", historyId)

// 2. Delete appointments (or set patient to null if you want to keep)
await pb.delete("appointments", appointmentId)

// 3. Delete patient
await pb.delete("patients", patientId)

// 4. Optionally delete address/emergency contact if not shared
await pb.delete("addresses", addressId)
await pb.delete("emergency_contacts", contactId)
```

---

## Statistics and Reporting

### Get Revenue by Treatment Type
```typescript
const items = useCollection("invoice_items", {
  filter: 'invoice.status = "paid"',
  expand: "treatment.treatmentType"
})

// Group by treatment type
const revenueByType = items.data?.items.reduce((acc, item) => {
  const type = item.expand?.treatment?.expand?.treatmentType?.name
  acc[type] = (acc[type] || 0) + item.total
  return acc
}, {})
```

### Get Unpaid Invoice Total
```typescript
const unpaid = useCollection("invoices", {
  filter: 'status != "paid" && status != "cancelled"'
})

const totalUnpaid = unpaid.data?.items.reduce((sum, inv) => {
  // Get payments for this invoice
  const payments = pb.getList("payments", 1, 100, {
    filter: `invoice = "${inv.id}"`
  })
  const paid = payments.items.reduce((s, p) => s + p.amount, 0)
  return sum + (inv.total - paid)
}, 0)
```

### Get Patients by Insurance Provider
```typescript
const patients = useCollection("patients", {
  expand: "primaryInsurance"
})

const byProvider = patients.data?.items.reduce((acc, p) => {
  const provider = p.expand?.primaryInsurance?.provider
  if (provider) {
    acc[provider] = (acc[provider] || 0) + 1
  }
  return acc
}, {})
```

---

## Best Practices

### ✅ DO
- Use `expand` to load related records in one query
- Create indexes on foreign key fields
- Validate relations exist before creating
- Use transactions for multi-step operations
- Calculate totals on the fly when possible

### ❌ DON'T
- Store duplicate data in multiple places
- Use JSON arrays for relational data
- Forget to update calculated fields (invoice totals)
- Delete parent records without handling children
- Query in loops (use expand instead)

---

## Performance Tips

1. **Use expand wisely**
   ```typescript
   // Good: Load all related data in one query
   expand: "patient.primaryAddress,dentist"
   
   // Bad: Multiple queries in a loop
   for (const appt of appointments) {
     const patient = await pb.getOne("patients", appt.patient)
   }
   ```

2. **Index frequently queried fields**
   - Foreign keys (patient, invoice, etc.)
   - Date fields (appointmentDate, invoiceDate)
   - Status fields
   - Email/phone for searches

3. **Limit results with pagination**
   ```typescript
   useCollection("appointments", {
     filter: "...",
     sort: "-created",
   }, {
     perPage: 50  // Don't load all records
   })
   ```

4. **Use filters instead of client-side filtering**
   ```typescript
   // Good
   filter: 'status = "active" && created >= "2025-01-01"'
   
   // Bad
   items.filter(i => i.status === 'active' && new Date(i.created) >= ...)
   ```

---

## Migration Helpers

### Convert Old Patient Data
```typescript
// If you have old patients with embedded address data:
const oldPatients = await pb.getList("patients", 1, 500)

for (const patient of oldPatients.items) {
  // Create address from old fields
  if (patient.address) {
    const address = await pb.create("addresses", {
      addressType: "home",
      street1: patient.address,
      city: patient.city,
      state: patient.state,
      zipCode: patient.zipCode,
      country: patient.country || "USA"
    })
    
    // Update patient with address relation
    await pb.update("patients", patient.id, {
      primaryAddress: address.id
    })
  }
}
```

---

## Quick Reference Table

| Collection | Primary Relations | Reverse Relations |
|------------|------------------|-------------------|
| `patients` | address, emergencyContact, insurance, primaryDentist | appointments, treatments, invoices, medical_history |
| `appointments` | patient, dentist | treatments |
| `treatments` | patient, appointment, treatmentType, performedBy | invoice_items |
| `treatment_plans` | patient, createdBy | treatment_plan_items |
| `invoices` | patient, appointment | invoice_items, payments |
| `invoice_items` | invoice, treatment | - |
| `payments` | invoice, patient | - |
| `patient_insurance` | patient, address | insurance_claims |
| `insurance_claims` | patient, insurance, invoice | - |

---

Happy coding! 🚀
