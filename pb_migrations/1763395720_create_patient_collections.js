/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // ============================================================================
  // STEP 2: Create patient-related collections
  // ============================================================================

  const addresses = app.findCollectionByNameOrId("addresses")
  const emergencyContacts = app.findCollectionByNameOrId("emergency_contacts")
  const users = app.findCollectionByNameOrId("users")

  // Create or update patients collection
  let patients
  try {
    patients = app.findCollectionByNameOrId("patients")
    // Update existing
    patients.schema = [
      { name: "firstName", type: "text", required: true },
      { name: "lastName", type: "text", required: true },
      { name: "dateOfBirth", type: "date" },
      { name: "gender", type: "select", options: { maxSelect: 1, values: ["male", "female", "other", "prefer_not_to_say"] } },
      { name: "email", type: "email" },
      { name: "phone", type: "text" },
      { name: "mobile", type: "text" },
      { name: "primaryAddress", type: "relation", options: { collectionId: addresses.id, cascadeDelete: false, maxSelect: 1 } },
      { name: "primaryDentist", type: "relation", options: { collectionId: users.id, cascadeDelete: false, maxSelect: 1 } },
      { name: "status", type: "select", options: { maxSelect: 1, values: ["active", "inactive", "archived"] } },
      { name: "notes", type: "text" },
      { name: "emergencyContact", type: "relation", options: { collectionId: emergencyContacts.id, cascadeDelete: false, maxSelect: 1 } }
    ]
    app.save(patients)
  } catch (e) {
    // Create new
    patients = new Collection({
      name: "patients",
      type: "base",
      schema: [
        { name: "firstName", type: "text", required: true },
        { name: "lastName", type: "text", required: true },
        { name: "dateOfBirth", type: "date" },
        { name: "gender", type: "select", options: { maxSelect: 1, values: ["male", "female", "other", "prefer_not_to_say"] } },
        { name: "email", type: "email" },
        { name: "phone", type: "text" },
        { name: "mobile", type: "text" },
        { name: "primaryAddress", type: "relation", options: { collectionId: addresses.id, cascadeDelete: false, maxSelect: 1 } },
        { name: "primaryDentist", type: "relation", options: { collectionId: users.id, cascadeDelete: false, maxSelect: 1 } },
        { name: "status", type: "select", options: { maxSelect: 1, values: ["active", "inactive", "archived"] } },
        { name: "notes", type: "text" },
        { name: "emergencyContact", type: "relation", options: { collectionId: emergencyContacts.id, cascadeDelete: false, maxSelect: 1 } }
      ]
    })
    app.save(patients)
  }

  // Create patient_insurance collection
  const patientInsurance = new Collection({
    name: "patient_insurance",
    type: "base",
    schema: [
      { name: "patient", type: "relation", required: true, options: { collectionId: patients.id, cascadeDelete: true, maxSelect: 1 } },
      { name: "provider", type: "text", required: true },
      { name: "policyNumber", type: "text", required: true },
      { name: "groupNumber", type: "text" },
      { name: "coverageType", type: "select", required: true, options: { maxSelect: 1, values: ["primary", "secondary", "tertiary"] } },
      { name: "policyHolderName", type: "text" },
      { name: "policyHolderDOB", type: "date" },
      { name: "relationshipToPolicyHolder", type: "select", options: { maxSelect: 1, values: ["self", "spouse", "child", "other"] } },
      { name: "effectiveDate", type: "date" },
      { name: "expirationDate", type: "date" },
      { name: "insurancePhone", type: "text" },
      { name: "insuranceAddress", type: "relation", options: { collectionId: addresses.id, cascadeDelete: false, maxSelect: 1 } },
      { name: "annualMaximum", type: "number" },
      { name: "deductible", type: "number" },
      { name: "deductibleMet", type: "number" },
      { name: "isActive", type: "bool", required: true },
      { name: "notes", type: "text" }
    ]
  })
  app.save(patientInsurance)

  // Update patients to add primaryInsurance relation
  const patientsUpdated = app.findCollectionByNameOrId("patients")
  patientsUpdated.schema.addAt(11, { name: "primaryInsurance", type: "relation", options: { collectionId: patientInsurance.id, cascadeDelete: false, maxSelect: 1 } })
  app.save(patientsUpdated)

  // Create medical_history collection
  const medicalHistory = new Collection({
    name: "medical_history",
    type: "base",
    schema: [
      { name: "patient", type: "relation", required: true, options: { collectionId: patients.id, cascadeDelete: true, maxSelect: 1 } },
      { name: "recordedBy", type: "relation", required: true, options: { collectionId: users.id, cascadeDelete: false, maxSelect: 1 } },
      { name: "conditions", type: "json" },
      { name: "allergies", type: "json" },
      { name: "medications", type: "json" },
      { name: "previousDentalWork", type: "text" },
      { name: "dentalConcerns", type: "text" },
      { name: "smoking", type: "bool" },
      { name: "smokingFrequency", type: "text" },
      { name: "alcohol", type: "bool" },
      { name: "alcoholFrequency", type: "text" },
      { name: "notes", type: "text" },
      { name: "recordDate", type: "date", required: true }
    ]
  })
  app.save(medicalHistory)

  // Create dental_chart collection
  const dentalChart = new Collection({
    name: "dental_chart",
    type: "base",
    schema: [
      { name: "patient", type: "relation", required: true, options: { collectionId: patients.id, cascadeDelete: true, maxSelect: 1 } },
      { name: "toothNumber", type: "text", required: true },
      { name: "status", type: "select", required: true, options: { maxSelect: 1, values: ["healthy", "decayed", "filled", "missing", "implant", "crown", "bridge", "root_canal", "extracted", "other"] } },
      { name: "conditions", type: "json" },
      { name: "surfaces", type: "json" },
      { name: "conditionDate", type: "date" },
      { name: "lastExamDate", type: "date" },
      { name: "relatedTreatments", type: "json" },
      { name: "notes", type: "text" }
    ]
  })
  app.save(dentalChart)

  console.log("✅ Step 2 complete: Patient collections created")

}, (app) => {
  // Rollback
  const collections = ["dental_chart", "medical_history", "patient_insurance", "patients"]
  collections.forEach(name => {
    try {
      const collection = app.findCollectionByNameOrId(name)
      app.delete(collection)
    } catch (e) {
      console.log(`Collection ${name} not found`)
    }
  })
})
