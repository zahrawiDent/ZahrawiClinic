/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // ============================================================================
  // STEP 1: Create base/supporting collections (no dependencies)
  // ============================================================================

  // Create addresses collection
  const addresses = new Collection({
    name: "addresses",
    type: "base",
    schema: [
      { name: "addressType", type: "select", options: { maxSelect: 1, values: ["home", "work", "billing", "shipping", "other"] } },
      { name: "street1", type: "text", required: true },
      { name: "street2", type: "text" },
      { name: "city", type: "text", required: true },
      { name: "state", type: "text", required: true },
      { name: "zipCode", type: "text", required: true },
      { name: "country", type: "text", required: true },
      { name: "latitude", type: "number" },
      { name: "longitude", type: "number" },
      { name: "isVerified", type: "bool" },
      { name: "verifiedAt", type: "date" },
      { name: "isPrimary", type: "bool" },
      { name: "label", type: "text" }
    ]
  })
  app.save(addresses)

  // Create emergency_contacts collection
  const emergencyContacts = new Collection({
    name: "emergency_contacts",
    type: "base",
    schema: [
      { name: "firstName", type: "text", required: true },
      { name: "lastName", type: "text", required: true },
      { name: "relationship", type: "text", required: true },
      { name: "primaryPhone", type: "text", required: true },
      { name: "secondaryPhone", type: "text" },
      { name: "preferredContactMethod", type: "select", options: { maxSelect: 1, values: ["phone", "sms", "email"] } },
      { name: "email", type: "email" },
      { name: "address", type: "relation", options: { collectionId: addresses.id, cascadeDelete: false, maxSelect: 1 } },
      { name: "isPrimary", type: "bool" },
      { name: "priority", type: "number" },
      { name: "notes", type: "text" }
    ]
  })
  app.save(emergencyContacts)

  // Create treatments_catalog collection
  const treatmentsCatalog = new Collection({
    name: "treatments_catalog",
    type: "base",
    schema: [
      { name: "name", type: "text", required: true },
      { name: "description", type: "text" },
      { name: "default_price", type: "number", required: true },
      { name: "category", type: "select", options: { maxSelect: 1, values: ["preventive", "restorative", "surgical", "cosmetic", "orthodontic", "emergency", "other"] } },
      { name: "code", type: "text" },
      { name: "insuranceCoverage", type: "number" },
      { name: "estimatedDuration", type: "number" }
    ]
  })
  app.save(treatmentsCatalog)

  // Create inventory collection
  const inventory = new Collection({
    name: "inventory",
    type: "base",
    schema: [
      { name: "name", type: "text", required: true },
      { name: "category", type: "select", required: true, options: { maxSelect: 1, values: ["dental_supplies", "medication", "equipment", "consumables", "other"] } },
      { name: "sku", type: "text" },
      { name: "barcode", type: "text" },
      { name: "quantity", type: "number", required: true },
      { name: "unit", type: "text", required: true },
      { name: "minQuantity", type: "number" },
      { name: "maxQuantity", type: "number" },
      { name: "supplier", type: "text" },
      { name: "supplierSku", type: "text" },
      { name: "costPrice", type: "number" },
      { name: "sellingPrice", type: "number" },
      { name: "location", type: "text" },
      { name: "expiryDate", type: "date" },
      { name: "status", type: "select", required: true, options: { maxSelect: 1, values: ["in_stock", "low_stock", "out_of_stock", "discontinued"] } },
      { name: "notes", type: "text" }
    ]
  })
  app.save(inventory)

  console.log("✅ Step 1 complete: Base collections created")

}, (app) => {
  // Rollback - delete collections in reverse order
  const collections = ["inventory", "treatments_catalog", "emergency_contacts", "addresses"]
  collections.forEach(name => {
    try {
      const collection = app.findCollectionByNameOrId(name)
      app.delete(collection)
    } catch (e) {
      console.log(`Collection ${name} not found`)
    }
  })
})
