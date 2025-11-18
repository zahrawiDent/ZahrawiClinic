# Migration to Valibot Schema-Based Types

## 🎯 What Changed

Your PocketBase types in `types/pocketbase-types.ts` have been refactored from manual TypeScript interfaces to **Valibot schemas** with automatic type inference.

---

## ✅ Benefits

| Before | After |
|--------|-------|
| Manual TypeScript interfaces | Valibot schemas |
| No runtime validation | ✅ Runtime validation |
| Duplicate validation in forms | ✅ Single source of truth |
| Manual type definitions | ✅ Automatic type inference |
| Type safety only | ✅ Type safety + validation |

---

## 📝 Migration Steps

### Step 1: Update Imports

**Before:**
```typescript
import type { TodoRecord } from "@/types/pocketbase-types"
```

**After (if you need the schema for validation):**
```typescript
import { TodoSchema, type TodoRecord } from "@/types/pocketbase-types"
```

**After (if you only need the type):**
```typescript
import type { TodoRecord } from "@/types/pocketbase-types"
```

✅ **The `TodoRecord` type still works exactly the same!**

---

### Step 2: Update Forms to Use Centralized Schema

**Before (local schema in component):**
```typescript
// In your component file
const TodoSchema = v.object({
  title: v.pipe(v.string(), v.nonEmpty('Title is required')),
  completed: v.boolean(),
})

const [form] = createForm({
  validate: valiForm(TodoSchema)
})
```

**After (use centralized schema):**
```typescript
import { TodoSchema } from "@/types/pocketbase-types"

// Same usage - just import instead of define!
const [form] = createForm({
  validate: valiForm(TodoSchema)
})
```

✅ **Benefits:**
- Single source of truth
- Consistent validation everywhere
- Less code duplication
- Easier to update validation rules

---

### Step 3: Add Runtime Validation (Optional but Recommended)

**Before:**
```typescript
const response = await pb.collection('patients').getOne(id)
// No validation - trust the API
return response
```

**After:**
```typescript
import * as v from 'valibot'
import { PatientsSchema } from "@/types/pocketbase-types"

const response = await pb.collection('patients').getOne(id)
// Validate at runtime
const validPatient = v.parse(PatientsSchema, response)
return validPatient
```

✅ **Benefits:**
- Catch invalid API data at runtime
- Better error messages
- Safer application

---

## 🔄 Updated Files

### ✅ Already Migrated

1. **`types/pocketbase-types.ts`**
   - All collections now have Valibot schemas
   - Types automatically inferred from schemas
   - All schemas exported for use

2. **`routes/_authenticated/todos/new.tsx`**
   - Now imports `TodoSchema` from central location
   - Removed local schema definition

3. **`routes/_authenticated/todos/$id.tsx`**
   - Now imports `TodoSchema` from central location
   - Removed local schema definition

---

## 📦 All Available Schemas

You can now import and use these schemas in any component:

```typescript
import {
  // Auth
  UsersSchema,
  
  // Patient Management
  PatientsSchema,
  MedicalHistorySchema,
  EmergencyContactsSchema,
  PatientInsuranceSchema,
  
  // Scheduling
  AppointmentsSchema,
  
  // Clinical
  TreatmentsSchema,
  TreatmentsCatalogSchema,
  TreatmentPlansSchema,
  TreatmentPlanItemsSchema,
  PrescriptionsSchema,
  DentalChartSchema,
  
  // Financial
  InvoicesSchema,
  InvoiceItemsSchema,
  PaymentsSchema,
  InsuranceClaimsSchema,
  
  // Operations
  TodoSchema,
  InventorySchema,
  
  // Supporting
  AddressesSchema,
  StaffSchema,
} from "@/types/pocketbase-types"
```

---

## 🎨 Example: Creating a Patient Form

```typescript
import { createForm, valiForm, type SubmitHandler } from '@modular-forms/solid'
import * as v from 'valibot'
import { PatientsSchema } from '@/types/pocketbase-types'
import { TextInput, Select, Button, FormCard, FormActions } from '@/components/forms'

type PatientFormData = v.InferOutput<typeof PatientsSchema>

function CreatePatientForm() {
  const createPatient = useCreateRecord("patients")

  const [form, { Form, Field }] = createForm<PatientFormData>({
    validate: valiForm(PatientsSchema),
    validateOn: 'blur',
    revalidateOn: 'input',
  })

  const handleSubmit: SubmitHandler<PatientFormData> = async (values) => {
    try {
      await createPatient.mutateAsync(values)
      toast.success('Patient created successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to create patient')
    }
  }

  return (
    <Form onSubmit={handleSubmit}>
      <FormCard title="New Patient">
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

**What you get:**
- ✅ First name validation (required, non-empty)
- ✅ Last name validation (required, non-empty)
- ✅ Email validation (valid email format)
- ✅ Gender validation (must be "male" or "female")
- ✅ Automatic error messages
- ✅ Validate on blur, revalidate on input
- ✅ All types inferred automatically!

---

## 🚀 Next Steps for Your Codebase

### 1. Update Patient Forms
Replace any patient form validation with `PatientsSchema`:

```typescript
import { PatientsSchema } from '@/types/pocketbase-types'

const [form] = createForm({
  validate: valiForm(PatientsSchema)
})
```

### 2. Update Appointment Forms
Replace any appointment form validation with `AppointmentsSchema`:

```typescript
import { AppointmentsSchema } from '@/types/pocketbase-types'

const [form] = createForm({
  validate: valiForm(AppointmentsSchema)
})
```

### 3. Add Runtime Validation to API Calls
Update your custom hooks to validate responses:

```typescript
// In lib/queries.ts or custom hooks
import * as v from 'valibot'
import { PatientsSchema } from '@/types/pocketbase-types'

export function usePatient(id: string) {
  return useQuery({
    queryKey: ['patients', id],
    queryFn: async () => {
      const response = await pb.collection('patients').getOne(id)
      // Validate at runtime
      return v.parse(PatientsSchema, response)
    },
  })
}
```

---

## ❓ FAQ

**Q: Do I need to change all my code immediately?**  
A: No! The types still work exactly the same. You can migrate gradually.

**Q: What if I have custom validation logic?**  
A: You can extend the schemas or create custom validators with Valibot.

**Q: Will this break my existing code?**  
A: No! The exported types (`TodoRecord`, `PatientsRecord`, etc.) are identical. Only the internal implementation changed.

**Q: Do I need to validate every API call?**  
A: It's recommended for production, but not required. TypeScript still provides compile-time safety.

**Q: Can I still use TypeScript interfaces?**  
A: Yes, but you'll miss out on runtime validation and single source of truth benefits.

---

## 📚 Additional Resources

- [Valibot Schema Guide](./VALIBOT_SCHEMAS_GUIDE.md) - Complete guide to using schemas
- [Valibot Documentation](https://valibot.dev/) - Official Valibot docs
- [Modular Forms + Valibot](https://modularforms.dev/solid/guides/add-validation) - Form integration

---

## ✅ Checklist

- [x] ✅ Types refactored to Valibot schemas
- [x] ✅ Todo forms updated to use centralized schema
- [x] ✅ Documentation created
- [ ] ⏳ Update patient forms to use centralized schemas
- [ ] ⏳ Update appointment forms to use centralized schemas
- [ ] ⏳ Add runtime validation to API calls
- [ ] ⏳ Update other forms as needed

---

**🎉 Migration complete! Your type system is now more powerful and safer!**
