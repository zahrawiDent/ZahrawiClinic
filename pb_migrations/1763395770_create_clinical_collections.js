/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // ============================================================================
  // STEP 3: Create clinical collections (appointments, treatments, etc.)
  // ============================================================================

  const patients = app.findCollectionByNameOrId("patients")
  const users = app.findCollectionByNameOrId("users")
  const treatmentsCatalog = app.findCollectionByNameOrId("treatments_catalog")

  // Create treatment_plans collection
  const treatmentPlans = new Collection({
    name: "treatment_plans",
    type: "base",
    schema: [
      { name: "patient", type: "relation", required: true, options: { collectionId: patients.id, cascadeDelete: false, maxSelect: 1 } },
      { name: "createdBy", type: "relation", required: true, options: { collectionId: users.id, cascadeDelete: false, maxSelect: 1 } },
      { name: "title", type: "text", required: true },
      { name: "description", type: "text" },
      { name: "diagnosis", type: "text" },
      { name: "status", type: "select", required: true, options: { maxSelect: 1, values: ["proposed", "accepted", "in_progress", "completed", "cancelled"] } },
      { name: "proposedDate", type: "date" },
      { name: "acceptedDate", type: "date" },
      { name: "completedDate", type: "date" },
      { name: "estimatedCost", type: "number" }
    ]
  })
  app.save(treatmentPlans)

  // Create or update appointments collection
  let appointments
  try {
    appointments = app.findCollectionByNameOrId("appointments")
    // Update existing
    appointments.schema = [
      { name: "patient", type: "relation", required: true, options: { collectionId: patients.id, cascadeDelete: false, maxSelect: 1 } },
      { name: "dentist", type: "relation", required: true, options: { collectionId: users.id, cascadeDelete: false, maxSelect: 1 } },
      { name: "appointmentDate", type: "date", required: true },
      { name: "duration", type: "number", required: true },
      { name: "status", type: "select", required: true, options: { maxSelect: 1, values: ["scheduled", "confirmed", "completed", "cancelled", "no_show"] } },
      { name: "type", type: "select", required: true, options: { maxSelect: 1, values: ["checkup", "cleaning", "filling", "extraction", "root_canal", "crown", "consultation", "emergency", "other"] } },
      { name: "treatmentPlan", type: "relation", options: { collectionId: treatmentPlans.id, cascadeDelete: false, maxSelect: 1 } },
      { name: "room", type: "text" },
      { name: "notes", type: "text" },
      { name: "reminderSent", type: "bool" },
      { name: "reminderSentAt", type: "date" },
      { name: "completedAt", type: "date" },
      { name: "cancelledAt", type: "date" },
      { name: "cancellationReason", type: "text" }
    ]
    app.save(appointments)
  } catch (e) {
    // Create new
    appointments = new Collection({
      name: "appointments",
      type: "base",
      schema: [
        { name: "patient", type: "relation", required: true, options: { collectionId: patients.id, cascadeDelete: false, maxSelect: 1 } },
        { name: "dentist", type: "relation", required: true, options: { collectionId: users.id, cascadeDelete: false, maxSelect: 1 } },
        { name: "appointmentDate", type: "date", required: true },
        { name: "duration", type: "number", required: true },
        { name: "status", type: "select", required: true, options: { maxSelect: 1, values: ["scheduled", "confirmed", "completed", "cancelled", "no_show"] } },
        { name: "type", type: "select", required: true, options: { maxSelect: 1, values: ["checkup", "cleaning", "filling", "extraction", "root_canal", "crown", "consultation", "emergency", "other"] } },
        { name: "treatmentPlan", type: "relation", options: { collectionId: treatmentPlans.id, cascadeDelete: false, maxSelect: 1 } },
        { name: "room", type: "text" },
        { name: "notes", type: "text" },
        { name: "reminderSent", type: "bool" },
        { name: "reminderSentAt", type: "date" },
        { name: "completedAt", type: "date" },
        { name: "cancelledAt", type: "date" },
        { name: "cancellationReason", type: "text" }
      ]
    })
    app.save(appointments)
  }

  // Create treatments collection
  const treatments = new Collection({
    name: "treatments",
    type: "base",
    schema: [
      { name: "patient", type: "relation", required: true, options: { collectionId: patients.id, cascadeDelete: false, maxSelect: 1 } },
      { name: "appointment", type: "relation", options: { collectionId: appointments.id, cascadeDelete: false, maxSelect: 1 } },
      { name: "performedBy", type: "relation", required: true, options: { collectionId: users.id, cascadeDelete: false, maxSelect: 1 } },
      { name: "treatmentType", type: "relation", required: true, options: { collectionId: treatmentsCatalog.id, cascadeDelete: false, maxSelect: 1 } },
      { name: "toothNumber", type: "text" },
      { name: "surface", type: "text" },
      { name: "diagnosis", type: "text" },
      { name: "procedure", type: "text" },
      { name: "notes", type: "text" },
      { name: "actualCost", type: "number" },
      { name: "treatmentDate", type: "date", required: true },
      { name: "completedAt", type: "date" }
    ]
  })
  app.save(treatments)

  // Create treatment_plan_items collection
  const treatmentPlanItems = new Collection({
    name: "treatment_plan_items",
    type: "base",
    schema: [
      { name: "treatmentPlan", type: "relation", required: true, options: { collectionId: treatmentPlans.id, cascadeDelete: true, maxSelect: 1 } },
      { name: "treatmentType", type: "relation", required: true, options: { collectionId: treatmentsCatalog.id, cascadeDelete: false, maxSelect: 1 } },
      { name: "toothNumber", type: "text" },
      { name: "surface", type: "text" },
      { name: "description", type: "text" },
      { name: "priority", type: "select", required: true, options: { maxSelect: 1, values: ["low", "medium", "high", "urgent"] } },
      { name: "estimatedCost", type: "number" },
      { name: "estimatedDuration", type: "number" },
      { name: "status", type: "select", required: true, options: { maxSelect: 1, values: ["pending", "scheduled", "in_progress", "completed", "cancelled"] } },
      { name: "scheduledDate", type: "date" },
      { name: "completedDate", type: "date" },
      { name: "completedTreatment", type: "relation", options: { collectionId: treatments.id, cascadeDelete: false, maxSelect: 1 } },
      { name: "sequenceNumber", type: "number" },
      { name: "notes", type: "text" }
    ]
  })
  app.save(treatmentPlanItems)

  // Create prescriptions collection
  const prescriptions = new Collection({
    name: "prescriptions",
    type: "base",
    schema: [
      { name: "patient", type: "relation", required: true, options: { collectionId: patients.id, cascadeDelete: false, maxSelect: 1 } },
      { name: "prescribedBy", type: "relation", required: true, options: { collectionId: users.id, cascadeDelete: false, maxSelect: 1 } },
      { name: "appointment", type: "relation", options: { collectionId: appointments.id, cascadeDelete: false, maxSelect: 1 } },
      { name: "medicationName", type: "text", required: true },
      { name: "dosage", type: "text", required: true },
      { name: "frequency", type: "text", required: true },
      { name: "duration", type: "text", required: true },
      { name: "quantity", type: "text" },
      { name: "instructions", type: "text" },
      { name: "prescribedDate", type: "date", required: true },
      { name: "startDate", type: "date" },
      { name: "endDate", type: "date" },
      { name: "status", type: "select", required: true, options: { maxSelect: 1, values: ["active", "completed", "cancelled"] } },
      { name: "notes", type: "text" }
    ]
  })
  app.save(prescriptions)

  console.log("✅ Step 3 complete: Clinical collections created")

}, (app) => {
  // Rollback
  const collections = ["prescriptions", "treatment_plan_items", "treatments", "appointments", "treatment_plans"]
  collections.forEach(name => {
    try {
      const collection = app.findCollectionByNameOrId(name)
      app.delete(collection)
    } catch (e) {
      console.log(`Collection ${name} not found`)
    }
  })
})
