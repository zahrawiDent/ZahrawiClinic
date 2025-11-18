# Valibot Schema Architecture Guide

## Overview

All PocketBase collection schemas are now organized in `/src/types/schemas/` with one file per collection. This architecture separates editable data fields from read-only base record fields, preventing form submission errors.

## File Structure

```
src/types/schemas/
├── index.ts                    # Central exports
├── base.ts                     # BaseRecordSchema (id, created, updated)
│
├── users.ts                    # Authentication
│
├── patients.ts                 # Patient management
├── addresses.ts
├── emergency-contacts.ts
├── patient-insurance.ts
├── medical-history.ts
│
├── appointments.ts             # Scheduling
│
├── treatments.ts               # Clinical
├── treatments-catalog.ts
├── treatment-plans.ts
├── treatment-plan-items.ts
├── dental-chart.ts
├── prescriptions.ts
│
├── invoices.ts                 # Financial
├── invoice-items.ts
├── payments.ts
├── insurance-claims.ts
│
├── inventory.ts                # Operations
├── staff.ts
│
└── todos.ts                    # Task management
```

## Schema Pattern

Every collection schema file follows this pattern:

```typescript
import * as v from 'valibot'
import { BaseRecordSchema } from './base'

// 1. Data Schema - EDITABLE fields only (no id, created, updated)
export const TodoDataSchema = v.object({
  title: v.pipe(v.string(), v.nonEmpty("Title is required")),
  completed: v.boolean(),
  // ... other editable fields
})

// 2. Full Schema - for API responses (includes base fields)
export const TodoSchema = v.intersect([BaseRecordSchema, TodoDataSchema])

// 3. Form Schema - for create/update operations (same as DataSchema)
export const TodoFormSchema = TodoDataSchema

// 4. Types
export type TodoRecord = v.InferOutput<typeof TodoSchema>
export type TodoFormData = v.InferOutput<typeof TodoFormSchema>
```

## Why This Separation?

### The Problem
PocketBase automatically manages `id`, `created`, and `updated` fields. Sending these fields in create/update requests causes errors:

```typescript
// ❌ This fails - includes read-only fields
const badSchema = v.object({
  id: v.string(),          // read-only!
  created: v.string(),     // read-only!
  updated: v.string(),     // read-only!
  title: v.string(),
})
```

### The Solution
- **DataSchema**: Only editable fields → use for forms
- **FullSchema**: DataSchema + BaseRecordSchema → use for API responses
- **FormSchema**: Alias for DataSchema (makes intent clear)

## Usage Examples

### Creating Forms

```typescript
import { TodoFormSchema, type TodoFormData } from '@/types/schemas'

const [form, { Form, Field }] = createForm<TodoFormData>({
  validate: valiForm(TodoFormSchema), // ✅ No read-only fields
  initialValues: {
    completed: false,
    // Only editable fields here
  }
})
```

### API Responses

```typescript
import { TodoSchema, type TodoRecord } from '@/types/schemas'

// TanStack Query returns full records with id, created, updated
const todo = useRecord<TodoRecord>("todos", id)
//    ^? TodoRecord includes all fields
```

### Type Inference

```typescript
import { TodoFormData } from '@/types/schemas'

const handleSubmit: SubmitHandler<TodoFormData> = async (values) => {
  //                                ^? Only editable fields
  await createTodo.mutateAsync(values)
}
```

## Import Patterns

### Recommended: Import from index
```typescript
// ✅ Clean and simple
import { TodoSchema, TodoFormSchema, type TodoRecord, type TodoFormData } from '@/types/schemas'
```

### Alternative: Import from specific file
```typescript
// ✅ Also valid, more explicit
import { TodoSchema, TodoFormSchema } from '@/types/schemas/todos'
```

### Import everything from one collection
```typescript
// ✅ Useful when working extensively with one collection
import * as TodoSchemas from '@/types/schemas/todos'
```

## Available Collections (21 total)

### Auth
- `users` - User accounts and authentication

### Patient Management (5)
- `patients` - Patient demographics
- `addresses` - Patient addresses
- `emergency-contacts` - Emergency contact persons
- `patient-insurance` - Insurance policies
- `medical-history` - Medical history records

### Scheduling (1)
- `appointments` - Appointments and scheduling

### Clinical (6)
- `treatments` - Treatment records
- `treatments-catalog` - Standard treatment definitions
- `treatment-plans` - Multi-step treatment plans
- `treatment-plan-items` - Individual plan steps
- `dental-chart` - Tooth-level charting
- `prescriptions` - Medication prescriptions

### Financial (4)
- `invoices` - Billing headers
- `invoice-items` - Invoice line items
- `payments` - Payment records
- `insurance-claims` - Insurance claim tracking

### Operations (2)
- `inventory` - Supplies and equipment
- `staff` - Staff members

### Task Management (1)
- `todos` - Tasks and todos

## Schema Features

### Validation
All schemas include Valibot validation:

```typescript
// Required fields
title: v.pipe(v.string(), v.nonEmpty("Title is required"))

// Email validation
email: v.pipe(v.string(), v.email("Invalid email format"))

// Number constraints
amount: v.pipe(v.number(), v.minValue(0, "Amount must be positive"))

// Enums
status: v.picklist(["draft", "sent", "paid"])
```

### Optional Fields
```typescript
description: v.optional(v.string())
dueDate: v.optional(v.string())
```

### Arrays
```typescript
allergies: v.optional(v.array(v.string()))
```

### Exported Enums
Some schemas export enums for use in components:

```typescript
// In appointments.ts
export const APPOINTMENT_STATUS = ["scheduled", "confirmed", "completed", "cancelled"] as const
export const APPOINTMENT_TYPE = ["checkup", "cleaning", "procedure"] as const

// In dental-chart.ts
export const TOOTH_SURFACES = ["occlusal", "mesial", "distal", "buccal", "lingual"] as const
```

## Adding New Collections

1. Create new schema file:
```typescript
// src/types/schemas/my-collection.ts
import * as v from 'valibot'
import { BaseRecordSchema } from './base'

export const MyCollectionDataSchema = v.object({
  // Only editable fields
  name: v.pipe(v.string(), v.nonEmpty("Name is required")),
})

export const MyCollectionSchema = v.intersect([BaseRecordSchema, MyCollectionDataSchema])
export const MyCollectionFormSchema = MyCollectionDataSchema

export type MyCollectionRecord = v.InferOutput<typeof MyCollectionSchema>
export type MyCollectionFormData = v.InferOutput<typeof MyCollectionFormSchema>
```

2. Export in `index.ts`:
```typescript
export * from './my-collection'
```

## Migration from Old Code

### Before (pocketbase-types.ts)
```typescript
import { TodoSchema, type TodoRecord } from '@/types/pocketbase-types'

// ❌ TodoSchema includes id, created, updated
const [form] = createForm({
  validate: valiForm(TodoSchema), // This causes bugs!
})
```

### After (schemas/)
```typescript
import { TodoFormSchema, type TodoFormData } from '@/types/schemas'

// ✅ TodoFormSchema only includes editable fields
const [form] = createForm<TodoFormData>({
  validate: valiForm(TodoFormSchema), // Perfect!
})
```

## Best Practices

1. **Always use FormSchema for forms**: Never use full Schema with forms
2. **Use FullSchema for API responses**: TanStack Query data typing
3. **Import from index.ts**: Cleaner imports
4. **Add validation messages**: All required fields should have custom messages
5. **Document relations**: Comment which collection relations point to
6. **Export enums**: Make picklists available to components
7. **Keep schemas focused**: One collection per file

## TypeScript Integration

All types are automatically inferred from Valibot schemas:

```typescript
// No manual type definitions needed!
type TodoFormData = v.InferOutput<typeof TodoFormSchema>
//   ^? { title: string; completed: boolean; ... }

type TodoRecord = v.InferOutput<typeof TodoSchema>
//   ^? { id: string; created: string; updated: string; title: string; ... }
```

## Related Documentation

- [FORMS_GUIDE.md](./FORMS_GUIDE.md) - Form components and patterns
- [TYPE_INFERENCE_GUIDE.md](./TYPE_INFERENCE_GUIDE.md) - Advanced type inference
- [SCHEMA_QUICK_REFERENCE.md](./SCHEMA_QUICK_REFERENCE.md) - All collections at a glance

## Troubleshooting

### Form not submitting
**Issue**: Form doesn't submit, no errors

**Solution**: Check if you're using `FormSchema` instead of full `Schema`:
```typescript
// ❌ Wrong
validate: valiForm(TodoSchema)

// ✅ Correct
validate: valiForm(TodoFormSchema)
```

### Type errors on form values
**Issue**: TypeScript complains about missing `id` field

**Solution**: Use `FormData` type instead of `Record` type:
```typescript
// ❌ Wrong
const [form] = createForm<TodoRecord>({ ... })

// ✅ Correct
const [form] = createForm<TodoFormData>({ ... })
```

### Import errors
**Issue**: Cannot find schema import

**Solution**: Import from central index:
```typescript
// ❌ May not work
import { TodoSchema } from '@/types/schemas/todos'

// ✅ Guaranteed to work
import { TodoSchema } from '@/types/schemas'
```
