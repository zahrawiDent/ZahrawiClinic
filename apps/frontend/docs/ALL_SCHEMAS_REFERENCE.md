# All Schemas Reference

Complete list of all 21 collection schemas with their imports and key fields.

---

## Auth

### users
**Import**: `import { UsersFormSchema, type UsersFormData } from '@/types/schemas'`

**Fields**: `email*`, `password`, `name`, `verified`

---

## Patient Management (5 collections)

### patients
**Import**: `import { PatientsFormSchema, type PatientsFormData } from '@/types/schemas'`

**Fields**: `firstName*`, `lastName*`, `gender*`, `dateOfBirth*`, `email`, `phone`, `status`

### addresses
**Import**: `import { AddressesFormSchema, type AddressesFormData } from '@/types/schemas'`

**Fields**: `patient*`, `street*`, `city*`, `postalCode*`, `country*`, `addressType`, `isPrimary`

### emergency-contacts
**Import**: `import { EmergencyContactsFormSchema, type EmergencyContactsFormData } from '@/types/schemas'`

**Fields**: `patient*`, `name*`, `relationship*`, `primaryPhone*`, `isPrimary`

### patient-insurance
**Import**: `import { PatientInsuranceFormSchema, type PatientInsuranceFormData } from '@/types/schemas'`

**Fields**: `patient*`, `insuranceProvider*`, `policyNumber*`, `policyholderName*`, `policyholderRelationship*`, `isPrimary`, `status`

### medical-history
**Import**: `import { MedicalHistoryFormSchema, type MedicalHistoryFormData } from '@/types/schemas'`

**Fields**: `patient*`, `chronicConditions`, `allergies`, `currentMedications`, `bloodType`, `lastUpdated*`

---

## Scheduling (1 collection)

### appointments
**Import**: `import { AppointmentsFormSchema, type AppointmentsFormData, APPOINTMENT_STATUS, APPOINTMENT_TYPE } from '@/types/schemas'`

**Fields**: `patient*`, `dentist*`, `start_time*`, `duration*`, `status*`, `type*`

**Enums**:
- Status: `scheduled`, `confirmed`, `in_progress`, `completed`, `cancelled`, `no_show`
- Type: `checkup`, `cleaning`, `filling`, `root_canal`, `extraction`, `crown`, `implant`, `emergency`, `consultation`, `followup`, `other`

---

## Clinical (6 collections)

### treatments
**Import**: `import { TreatmentsFormSchema, type TreatmentsFormData } from '@/types/schemas'`

**Fields**: `patient*`, `performedBy*`, `treatmentType*`, `treatmentDate*`, `toothNumber`, `diagnosis`, `procedure`, `outcome`

### treatments-catalog
**Import**: `import { TreatmentsCatalogFormSchema, type TreatmentsCatalogFormData } from '@/types/schemas'`

**Fields**: `name*`, `default_price*`, `category`, `code`, `estimatedDuration`

### treatment-plans
**Import**: `import { TreatmentPlansFormSchema, type TreatmentPlansFormData } from '@/types/schemas'`

**Fields**: `patient*`, `createdBy*`, `title*`, `status*`, `startDate`, `estimatedCost`

### treatment-plan-items
**Import**: `import { TreatmentPlanItemsFormSchema, type TreatmentPlanItemsFormData } from '@/types/schemas'`

**Fields**: `treatmentPlan*`, `treatmentType*`, `priority*`, `status*`, `plannedDate`, `estimatedCost`

### dental-chart
**Import**: `import { DentalChartFormSchema, type DentalChartFormData, TOOTH_NUMBERING_SYSTEMS, TOOTH_SURFACES, TOOTH_CONDITIONS } from '@/types/schemas'`

**Fields**: `patient*`, `toothNumber*`, `condition`, `affectedSurfaces`, `status`, `mobility`, `pocketDepth`

**Enums**:
- Numbering: `universal`, `palmer`, `fdi`
- Surfaces: `occlusal`, `mesial`, `distal`, `buccal`, `lingual`, `incisal`, `facial`
- Conditions: `healthy`, `cavity`, `filling`, `crown`, `root_canal`, `missing`, `extracted`, `implant`, `bridge`, `veneer`, `fracture`, `abscess`, `other`

### prescriptions
**Import**: `import { PrescriptionsFormSchema, type PrescriptionsFormData } from '@/types/schemas'`

**Fields**: `patient*`, `prescribedBy*`, `medicationName*`, `dosage*`, `frequency*`, `duration*`, `prescriptionDate*`, `status`

---

## Financial (4 collections)

### invoices
**Import**: `import { InvoicesFormSchema, type InvoicesFormData } from '@/types/schemas'`

**Fields**: `patient*`, `invoiceNumber*`, `invoiceDate*`, `subtotal*`, `total*`, `status*`, `dueDate`

**Status**: `draft`, `sent`, `paid`, `partial`, `overdue`, `cancelled`

### invoice-items
**Import**: `import { InvoiceItemsFormSchema, type InvoiceItemsFormData } from '@/types/schemas'`

**Fields**: `invoice*`, `description*`, `quantity*`, `unitPrice*`, `total*`, `treatmentType`, `taxRate`

### payments
**Import**: `import { PaymentsFormSchema, type PaymentsFormData } from '@/types/schemas'`

**Fields**: `invoice*`, `patient*`, `amount*`, `paymentDate*`, `paymentMethod*`, `transactionId`

**Methods**: `cash`, `credit_card`, `debit_card`, `bank_transfer`, `insurance`, `check`, `other`

### insurance-claims
**Import**: `import { InsuranceClaimsFormSchema, type InsuranceClaimsFormData } from '@/types/schemas'`

**Fields**: `patient*`, `patientInsurance*`, `claimNumber*`, `claimDate*`, `serviceDate*`, `claimedAmount*`, `status*`

**Status**: `draft`, `submitted`, `pending`, `under_review`, `approved`, `partially_approved`, `denied`, `paid`, `appealed`

---

## Operations (2 collections)

### inventory
**Import**: `import { InventoryFormSchema, type InventoryFormData } from '@/types/schemas'`

**Fields**: `itemName*`, `currentStock*`, `category`, `unitCost`, `supplier`, `status`

**Category**: `consumables`, `instruments`, `equipment`, `medications`, `materials`, `office_supplies`, `other`

**Status**: `in_stock`, `low_stock`, `out_of_stock`, `discontinued`

### staff
**Import**: `import { StaffFormSchema, type StaffFormData } from '@/types/schemas'`

**Fields**: `firstName*`, `lastName*`, `role*`, `email`, `phone`, `licenseNumber`, `status`

**Role**: `dentist`, `hygienist`, `dental_assistant`, `receptionist`, `manager`, `lab_technician`, `other`

**Status**: `active`, `on_leave`, `inactive`, `terminated`

---

## Task Management (1 collection)

### todos
**Import**: `import { TodoFormSchema, type TodoFormData } from '@/types/schemas'`

**Fields**: `title*`, `completed*`, `description`, `priority`, `category`, `dueDate`, `assignedTo`, `relatedPatient`

**Priority**: `low`, `medium`, `high`, `urgent`

**Category**: `administrative`, `clinical`, `financial`, `operational`, `patient_care`, `other`

---

## Form Usage Pattern

```typescript
import { createForm, valiForm, type SubmitHandler } from '@modular-forms/solid'
import { CollectionFormSchema, type CollectionFormData } from '@/types/schemas'

const [form, { Form, Field }] = createForm<CollectionFormData>({
  validate: valiForm(CollectionFormSchema),
  validateOn: 'blur',
  revalidateOn: 'input',
})

const handleSubmit: SubmitHandler<CollectionFormData> = async (values) => {
  await createRecord.mutateAsync(values)
}
```

---

## Related Docs

- **[SCHEMA_ARCHITECTURE.md](./SCHEMA_ARCHITECTURE.md)** - Complete architecture guide
- **[FORMS_GUIDE.md](./FORMS_GUIDE.md)** - Form components and patterns
- **[TYPE_INFERENCE_GUIDE.md](./TYPE_INFERENCE_GUIDE.md)** - Type inference details
