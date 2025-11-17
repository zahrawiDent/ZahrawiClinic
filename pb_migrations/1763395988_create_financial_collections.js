/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  // =============================================================================
  // Financial Collections Migration
  // =============================================================================
  // Creates: invoices, invoice_items, payments, insurance_claims
  // Dependencies: patients, treatments, treatment_plans, patient_insurance
  // =============================================================================

  const Collection = require("daos/Collection");
  const Schema = require("daos/Schema");
  const SchemaField = require("daos/SchemaField");

  // ---------------------------------------------------------------------------
  // 1. invoices - Main billing records
  // ---------------------------------------------------------------------------
  const invoices = new Collection({
    name: "invoices",
    type: "base",
    listRule: "@request.auth.id != ''",
    viewRule: "@request.auth.id != ''",
    createRule: "@request.auth.id != ''",
    updateRule: "@request.auth.id != ''",
    deleteRule: "@request.auth.id != ''",
    schema: new Schema([
      new SchemaField({
        name: "invoice_number",
        type: "text",
        required: true,
        options: { min: 1, max: 50 }
      }),
      new SchemaField({
        name: "patient",
        type: "relation",
        required: true,
        options: {
          collectionId: "patients",
          cascadeDelete: false,
          minSelect: 1,
          maxSelect: 1,
          displayFields: ["first_name", "last_name"]
        }
      }),
      new SchemaField({
        name: "issue_date",
        type: "date",
        required: true
      }),
      new SchemaField({
        name: "due_date",
        type: "date",
        required: false
      }),
      new SchemaField({
        name: "status",
        type: "select",
        required: true,
        options: {
          maxSelect: 1,
          values: ["draft", "sent", "partially_paid", "paid", "overdue", "cancelled"]
        }
      }),
      new SchemaField({
        name: "subtotal",
        type: "number",
        required: true,
        options: { min: 0 }
      }),
      new SchemaField({
        name: "tax",
        type: "number",
        required: false,
        options: { min: 0 }
      }),
      new SchemaField({
        name: "discount",
        type: "number",
        required: false,
        options: { min: 0 }
      }),
      new SchemaField({
        name: "total",
        type: "number",
        required: true,
        options: { min: 0 }
      }),
      new SchemaField({
        name: "amount_paid",
        type: "number",
        required: false,
        options: { min: 0 }
      }),
      new SchemaField({
        name: "notes",
        type: "text",
        required: false,
        options: { min: null, max: 1000 }
      })
    ])
  });

  // ---------------------------------------------------------------------------
  // 2. invoice_items - Line items for invoices
  // ---------------------------------------------------------------------------
  const invoiceItems = new Collection({
    name: "invoice_items",
    type: "base",
    listRule: "@request.auth.id != ''",
    viewRule: "@request.auth.id != ''",
    createRule: "@request.auth.id != ''",
    updateRule: "@request.auth.id != ''",
    deleteRule: "@request.auth.id != ''",
    schema: new Schema([
      new SchemaField({
        name: "invoice",
        type: "relation",
        required: true,
        options: {
          collectionId: "invoices",
          cascadeDelete: true,
          minSelect: 1,
          maxSelect: 1,
          displayFields: ["invoice_number"]
        }
      }),
      new SchemaField({
        name: "treatment",
        type: "relation",
        required: false,
        options: {
          collectionId: "treatments",
          cascadeDelete: false,
          minSelect: null,
          maxSelect: 1,
          displayFields: ["notes"]
        }
      }),
      new SchemaField({
        name: "description",
        type: "text",
        required: true,
        options: { min: 1, max: 500 }
      }),
      new SchemaField({
        name: "quantity",
        type: "number",
        required: true,
        options: { min: 0 }
      }),
      new SchemaField({
        name: "unit_price",
        type: "number",
        required: true,
        options: { min: 0 }
      }),
      new SchemaField({
        name: "total",
        type: "number",
        required: true,
        options: { min: 0 }
      }),
      new SchemaField({
        name: "tax_rate",
        type: "number",
        required: false,
        options: { min: 0, max: 100 }
      })
    ])
  });

  // ---------------------------------------------------------------------------
  // 3. payments - Payment records
  // ---------------------------------------------------------------------------
  const payments = new Collection({
    name: "payments",
    type: "base",
    listRule: "@request.auth.id != ''",
    viewRule: "@request.auth.id != ''",
    createRule: "@request.auth.id != ''",
    updateRule: "@request.auth.id != ''",
    deleteRule: "@request.auth.id != ''",
    schema: new Schema([
      new SchemaField({
        name: "invoice",
        type: "relation",
        required: true,
        options: {
          collectionId: "invoices",
          cascadeDelete: false,
          minSelect: 1,
          maxSelect: 1,
          displayFields: ["invoice_number"]
        }
      }),
      new SchemaField({
        name: "patient",
        type: "relation",
        required: true,
        options: {
          collectionId: "patients",
          cascadeDelete: false,
          minSelect: 1,
          maxSelect: 1,
          displayFields: ["first_name", "last_name"]
        }
      }),
      new SchemaField({
        name: "payment_date",
        type: "date",
        required: true
      }),
      new SchemaField({
        name: "amount",
        type: "number",
        required: true,
        options: { min: 0 }
      }),
      new SchemaField({
        name: "payment_method",
        type: "select",
        required: true,
        options: {
          maxSelect: 1,
          values: ["cash", "credit_card", "debit_card", "check", "bank_transfer", "insurance", "other"]
        }
      }),
      new SchemaField({
        name: "reference_number",
        type: "text",
        required: false,
        options: { min: null, max: 100 }
      }),
      new SchemaField({
        name: "notes",
        type: "text",
        required: false,
        options: { min: null, max: 500 }
      })
    ])
  });

  // ---------------------------------------------------------------------------
  // 4. insurance_claims - Insurance claim tracking
  // ---------------------------------------------------------------------------
  const insuranceClaims = new Collection({
    name: "insurance_claims",
    type: "base",
    listRule: "@request.auth.id != ''",
    viewRule: "@request.auth.id != ''",
    createRule: "@request.auth.id != ''",
    updateRule: "@request.auth.id != ''",
    deleteRule: "@request.auth.id != ''",
    schema: new Schema([
      new SchemaField({
        name: "claim_number",
        type: "text",
        required: true,
        options: { min: 1, max: 50 }
      }),
      new SchemaField({
        name: "patient",
        type: "relation",
        required: true,
        options: {
          collectionId: "patients",
          cascadeDelete: false,
          minSelect: 1,
          maxSelect: 1,
          displayFields: ["first_name", "last_name"]
        }
      }),
      new SchemaField({
        name: "patient_insurance",
        type: "relation",
        required: true,
        options: {
          collectionId: "patient_insurance",
          cascadeDelete: false,
          minSelect: 1,
          maxSelect: 1,
          displayFields: ["policy_number"]
        }
      }),
      new SchemaField({
        name: "treatment",
        type: "relation",
        required: false,
        options: {
          collectionId: "treatments",
          cascadeDelete: false,
          minSelect: null,
          maxSelect: 1,
          displayFields: ["notes"]
        }
      }),
      new SchemaField({
        name: "invoice",
        type: "relation",
        required: false,
        options: {
          collectionId: "invoices",
          cascadeDelete: false,
          minSelect: null,
          maxSelect: 1,
          displayFields: ["invoice_number"]
        }
      }),
      new SchemaField({
        name: "submission_date",
        type: "date",
        required: true
      }),
      new SchemaField({
        name: "status",
        type: "select",
        required: true,
        options: {
          maxSelect: 1,
          values: ["submitted", "processing", "approved", "partially_approved", "rejected", "appealing", "paid"]
        }
      }),
      new SchemaField({
        name: "claim_amount",
        type: "number",
        required: true,
        options: { min: 0 }
      }),
      new SchemaField({
        name: "approved_amount",
        type: "number",
        required: false,
        options: { min: 0 }
      }),
      new SchemaField({
        name: "paid_amount",
        type: "number",
        required: false,
        options: { min: 0 }
      }),
      new SchemaField({
        name: "rejection_reason",
        type: "text",
        required: false,
        options: { min: null, max: 1000 }
      }),
      new SchemaField({
        name: "notes",
        type: "text",
        required: false,
        options: { min: null, max: 1000 }
      })
    ])
  });

  // Save all collections
  db.saveCollection(invoices);
  db.saveCollection(invoiceItems);
  db.saveCollection(payments);
  db.saveCollection(insuranceClaims);

}, (db) => {
  // Rollback: Delete collections in reverse order
  db.deleteCollection("insurance_claims");
  db.deleteCollection("payments");
  db.deleteCollection("invoice_items");
  db.deleteCollection("invoices");
})
