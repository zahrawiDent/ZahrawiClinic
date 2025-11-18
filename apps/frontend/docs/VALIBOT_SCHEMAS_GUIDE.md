# Valibot Schema-Based Type System

## 🎯 Overview

Your PocketBase types have been refactored to use **Valibot schemas** as the single source of truth. This gives you:

✅ **Runtime Validation** - Validate API responses from PocketBase  
✅ **Type Safety** - TypeScript types automatically derived from schemas  
✅ **Form Validation** - Use same schemas in Modular Forms  
✅ **Single Source of Truth** - Define once, use everywhere  
✅ **Better DX** - Autocomplete works perfectly everywhere  

---

## 📋 What Changed?

### **Before (Manual Interfaces):**
```typescript
export interface TodoRecord extends BaseRecord {
  title: string
  description?: string
  completed: boolean
}
```

### **After (Valibot Schemas):**
```typescript
export const TodoSchema = v.intersect([
  BaseRecordSchema,
  v.object({
    title: v.pipe(v.string(), v.nonEmpty("Title is required")),
    description: v.optional(v.string()),
    completed: v.boolean(),
  }),
])

export type TodoRecord = v.InferOutput<typeof TodoSchema>
```

---

## 💡 Benefits

### 1. **Runtime Validation**
Catch invalid data from PocketBase at runtime:

```typescript
import * as v from 'valibot'
import { TodoSchema } from '@/types/pocketbase-types'

// Validate API response
try {
  const validTodo = v.parse(TodoSchema, apiResponse)
  // ✅ Data is guaranteed to match TodoRecord type
} catch (error) {
  // ❌ Invalid data - handle error
  console.error('Invalid todo data:', error)
}
```

### 2. **Form Validation** (Modular Forms)
Use the same schema for forms - no duplication!

```typescript
import { createForm } from '@modular-forms/solid'
import { valiForm } from '@modular-forms/solid/validation'
import { TodoSchema } from '@/types/pocketbase-types'

const [form, { Form, Field }] = createForm({
  validate: valiForm(TodoSchema),
  validateOn: 'blur',
  revalidateOn: 'input',
})
```

The form will automatically validate using the schema's rules:
- `title` must be non-empty ✅
- `description` is optional ✅
- `completed` must be boolean ✅

### 3. **Type Inference**
Types are automatically inferred everywhere:

```typescript
import { TodoSchema, type TodoRecord } from '@/types/pocketbase-types'

// Type is inferred from schema
type Todo = v.InferOutput<typeof TodoSchema>

// Or use the exported type
const todo: TodoRecord = {
  id: '123',
  created: '2024-01-01',
  updated: '2024-01-01',
  title: 'My todo',
  completed: false,
}
```

### 4. **Validation Messages**
Built-in validation messages from the schema:

```typescript
firstName: v.pipe(v.string(), v.nonEmpty("First name is required"))
email: v.optional(v.pipe(v.string(), v.email("Invalid email format")))
```

These messages automatically appear in forms when validation fails!

---

## 🎨 Schema Patterns

### Required String with Validation
```typescript
firstName: v.pipe(
  v.string(),
  v.nonEmpty("First name is required"),
  v.minLength(2, "Must be at least 2 characters")
)
```

### Optional Email
```typescript
email: v.optional(v.pipe(
  v.string(),
  v.email("Invalid email format")
))
```

### Enum/Picklist (Select Options)
```typescript
status: v.picklist(
  ["active", "inactive", "archived"],
  "Invalid status"
)
```

### Number with Range
```typescript
age: v.pipe(
  v.number(),
  v.minValue(0, "Age cannot be negative"),
  v.maxValue(150, "Invalid age")
)
```

### Array of Strings
```typescript
tags: v.array(v.string())
allergies: v.optional(v.array(v.string()))
```

### Nested Object
```typescript
workingHours: v.optional(v.object({
  start: v.string(),
  end: v.string(),
}))
```

---

## 📦 Complete Example: Patient Form

```typescript
import { createForm } from '@modular-forms/solid'
import { valiForm } from '@modular-forms/solid/validation'
import { PatientsSchema } from '@/types/pocketbase-types'
import { TextInput, Select, FormCard, FormActions, Button } from '@/components/forms'

export default function PatientForm() {
  const createPatient = useCreateRecord("patients")
  
  const [form, { Form, Field }] = createForm({
    validate: valiForm(PatientsSchema),
    validateOn: 'blur',
    revalidateOn: 'input',
  })

  const handleSubmit = (values: v.InferOutput<typeof PatientsSchema>) => {
    // ✅ Values are fully typed and validated!
    createPatient.mutate(values)
  }

  return (
    <Form onSubmit={handleSubmit}>
      <FormCard title="New Patient" description="Add a new patient to the system">
        
        {/* First Name - required, validates on blur */}
        <Field name="firstName">
          {(field, props) => (
            <TextInput
              {...props}
              label="First Name"
              value={field.value}
              error={field.error}
              required
            />
          )}
        </Field>

        {/* Last Name - required */}
        <Field name="lastName">
          {(field, props) => (
            <TextInput
              {...props}
              label="Last Name"
              value={field.value}
              error={field.error}
              required
            />
          )}
        </Field>

        {/* Email - optional, but validates email format */}
        <Field name="email">
          {(field, props) => (
            <TextInput
              {...props}
              type="email"
              label="Email"
              value={field.value}
              error={field.error}
            />
          )}
        </Field>

        {/* Gender - picklist/select */}
        <Field name="gender">
          {(field, props) => (
            <Select
              {...props}
              label="Gender"
              value={field.value}
              error={field.error}
              options={[
                { value: "male", label: "Male" },
                { value: "female", label: "Female" },
              ]}
            />
          )}
        </Field>

        <FormActions align="right">
          <Button type="button" variant="secondary">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={form.submitting}
            disabled={form.submitting || !form.dirty}
          >
            Create Patient
          </Button>
        </FormActions>
      </FormCard>
    </Form>
  )
}
```

**What happens:**
1. ✅ Form validates on blur
2. ✅ Re-validates on input after first blur
3. ✅ `firstName` and `lastName` show error if empty
4. ✅ `email` validates email format if provided
5. ✅ `gender` ensures valid selection
6. ✅ Submit button disabled until form is valid and dirty
7. ✅ All types inferred automatically from schema!

---

## 🔄 Adding a New Collection

### Step 1: Create the Schema
```typescript
// In pocketbase-types.ts

export const PostsSchema = v.intersect([
  BaseRecordSchema,
  v.object({
    title: v.pipe(v.string(), v.nonEmpty("Title is required")),
    content: v.pipe(v.string(), v.minLength(10, "Content too short")),
    published: v.boolean(),
    tags: v.optional(v.array(v.string())),
  }),
])
```

### Step 2: Export the Type
```typescript
export type PostsRecord = v.InferOutput<typeof PostsSchema>
```

### Step 3: Add to AppCollections
```typescript
interface AppCollections {
  patients: PatientsRecord
  todos: TodoRecord
  posts: PostsRecord  // ← Add this line!
}
```

### Step 4: Use Everywhere!
```typescript
// ✅ Type inference
const posts = useCollection("posts")

// ✅ Runtime validation
const validPost = v.parse(PostsSchema, apiData)

// ✅ Form validation
const [form] = createForm({
  validate: valiForm(PostsSchema)
})
```

---

## 🛠️ Advanced Patterns

### Custom Validation
```typescript
import * as v from 'valibot'

// Custom phone number validator
const phoneSchema = v.pipe(
  v.string(),
  v.regex(/^\d{10}$/, "Phone must be 10 digits")
)

// Use in schema
phone: v.optional(phoneSchema)
```

### Conditional Validation
```typescript
const PatientInsuranceSchema = v.pipe(
  v.intersect([
    BaseRecordSchema,
    v.object({
      provider: v.string(),
      policyNumber: v.string(),
      coverageType: v.picklist(["primary", "secondary", "tertiary"]),
      // Only required if coverage type is not "self"
      policyHolderName: v.optional(v.string()),
    }),
  ]),
  v.forward(
    v.check((input) => {
      if (input.relationshipToPolicyHolder !== 'self') {
        return !!input.policyHolderName
      }
      return true
    }, "Policy holder name required"),
    ['policyHolderName']
  )
)
```

### Partial Schema (for Updates)
```typescript
import * as v from 'valibot'

// Only update changed fields
const UpdatePatientSchema = v.partial(PatientsSchema)

// Or pick specific fields
const PatientNameSchema = v.pick(PatientsSchema, ['firstName', 'lastName'])
```

---

## 🎯 Common Use Cases

### 1. Validate API Response
```typescript
const fetchPatient = async (id: string) => {
  const response = await pb.collection('patients').getOne(id)
  
  // Validate response matches schema
  try {
    const validPatient = v.parse(PatientsSchema, response)
    return validPatient
  } catch (error) {
    console.error('Invalid patient data from API:', error)
    throw error
  }
}
```

### 2. Form with Default Values
```typescript
const [form, { Form, Field }] = createForm({
  validate: valiForm(PatientsSchema),
  initialValues: {
    firstName: '',
    lastName: '',
    gender: 'male',
    status: 'active',
  },
})
```

### 3. Dirty Value Tracking (Edit Forms)
```typescript
const EditPatientForm = (props: { patientId: string }) => {
  const patient = useRecord("patients", () => props.patientId)
  
  const [form, { Form, Field }] = createForm({
    validate: valiForm(PatientsSchema),
    shouldDirty: true, // Track dirty fields
  })

  // Only send changed values
  const handleSubmit = (values: v.InferOutput<typeof PatientsSchema>) => {
    const updates: Partial<PatientsRecord> = {}
    
    if (values.firstName !== patient.data?.firstName) {
      updates.firstName = values.firstName
    }
    if (values.lastName !== patient.data?.lastName) {
      updates.lastName = values.lastName
    }
    
    // ... check other fields
    
    updatePatient.mutate({ id: props.patientId, ...updates })
  }

  return <Form onSubmit={handleSubmit}>...</Form>
}
```

---

## 📚 All Available Schemas

Your `pocketbase-types.ts` now exports these schemas:

### Patient Management
- `PatientsSchema` → `PatientsRecord`
- `MedicalHistorySchema` → `MedicalHistoryRecord`
- `EmergencyContactsSchema` → `EmergencyContactsRecord`
- `PatientInsuranceSchema` → `PatientInsuranceRecord`

### Scheduling
- `AppointmentsSchema` → `AppointmentsRecord`

### Clinical
- `TreatmentsSchema` → `TreatmentsRecord`
- `TreatmentsCatalogSchema` → `TreatmentsCatalogRecord`
- `TreatmentPlansSchema` → `TreatmentPlansRecord`
- `TreatmentPlanItemsSchema` → `TreatmentPlanItemsRecord`
- `PrescriptionsSchema` → `PrescriptionsRecord`
- `DentalChartSchema` → `DentalChartRecord`

### Financial
- `InvoicesSchema` → `InvoicesRecord`
- `InvoiceItemsSchema` → `InvoiceItemsRecord`
- `PaymentsSchema` → `PaymentsRecord`
- `InsuranceClaimsSchema` → `InsuranceClaimsRecord`

### Operations
- `TodoSchema` → `TodoRecord`
- `InventorySchema` → `InventoryRecord`

### Supporting Data
- `AddressesSchema` → `AddressesRecord`

### Staff
- `StaffSchema` → `StaffRecord`

---

## ✅ Best Practices

### 1. **Always Validate API Responses**
```typescript
const response = await pb.collection('patients').getList()
const validPatients = response.items.map(item => 
  v.parse(PatientsSchema, item)
)
```

### 2. **Use Schema for Forms**
```typescript
// ✅ Good - single source of truth
const [form] = createForm({
  validate: valiForm(PatientsSchema)
})

// ❌ Bad - duplicating validation logic
const [form] = createForm({
  validate: (values) => {
    const errors = {}
    if (!values.firstName) errors.firstName = "Required"
    // ... duplicating schema rules
    return errors
  }
})
```

### 3. **Export Both Schema and Type**
```typescript
// ✅ Export schema for validation
export const TodoSchema = v.object({ ... })

// ✅ Export type for TypeScript
export type TodoRecord = v.InferOutput<typeof TodoSchema>
```

### 4. **Use Partial for Updates**
```typescript
// For updates, use partial schema (all fields optional)
const UpdateTodoSchema = v.partial(TodoSchema)
```

---

## 🚀 Next Steps

1. **Update Existing Forms** - Replace manual validation with schema-based validation
2. **Add Runtime Validation** - Validate PocketBase responses in your hooks
3. **Create New Collections** - Follow the schema pattern for new collections
4. **Explore Valibot** - Check out [Valibot docs](https://valibot.dev/) for more patterns

---

## 📖 Additional Resources

- [Valibot Documentation](https://valibot.dev/)
- [Modular Forms + Valibot](https://modularforms.dev/solid/guides/add-validation)
- [PocketBase TypeScript SDK](https://github.com/pocketbase/js-sdk)

---

## ❓ FAQ

**Q: Can I still use the old `TodoRecord` type?**  
A: Yes! The type is still exported and works exactly the same. It's just derived from the schema now instead of being manually defined.

**Q: Do I need to validate every API call?**  
A: It's recommended for production apps, but not strictly required. TypeScript still gives you compile-time safety even without runtime validation.

**Q: What if validation fails in a form?**  
A: Modular Forms automatically displays error messages from the schema in the `field.error` property.

**Q: Can I customize validation messages?**  
A: Yes! Just pass custom messages to Valibot validators:
```typescript
firstName: v.pipe(
  v.string(),
  v.nonEmpty("Hey! First name is required 👋")
)
```

**Q: Is this better than manual interfaces?**  
A: **YES!** You get:
- Runtime safety ✅
- Form validation ✅  
- Single source of truth ✅
- Better DX ✅
- Same TypeScript types ✅

---

**🎉 You're all set! Your type system is now more powerful, safer, and easier to use!**
