/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  // =============================================================================
  // Todos Collection Update Migration
  // =============================================================================
  // Updates existing todos collection with priority, category, patient relation
  // Dependencies: patients collection
  // =============================================================================

  const Collection = require("daos/Collection");
  const Schema = require("daos/Schema");
  const SchemaField = require("daos/SchemaField");

  try {
    // Try to get existing collection
    const todos = db.findCollectionByNameOrId("todos");
    
    // Update schema by adding new fields
    todos.schema.addField(new SchemaField({
      name: "priority",
      type: "select",
      required: false,
      options: {
        maxSelect: 1,
        values: ["low", "medium", "high", "urgent"]
      }
    }));

    todos.schema.addField(new SchemaField({
      name: "category",
      type: "select",
      required: false,
      options: {
        maxSelect: 1,
        values: ["general", "patient_followup", "appointment", "inventory", "billing", "administrative"]
      }
    }));

    todos.schema.addField(new SchemaField({
      name: "patient",
      type: "relation",
      required: false,
      options: {
        collectionId: "patients",
        cascadeDelete: false,
        minSelect: null,
        maxSelect: 1,
        displayFields: ["first_name", "last_name"]
      }
    }));

    todos.schema.addField(new SchemaField({
      name: "due_date",
      type: "date",
      required: false
    }));

    todos.schema.addField(new SchemaField({
      name: "assigned_to",
      type: "relation",
      required: false,
      options: {
        collectionId: "_pb_users_auth_",
        cascadeDelete: false,
        minSelect: null,
        maxSelect: 1,
        displayFields: ["email"]
      }
    }));

    db.saveCollection(todos);

  } catch (e) {
    // If collection doesn't exist, create it with full schema
    const todos = new Collection({
      name: "todos",
      type: "base",
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      schema: new Schema([
        new SchemaField({
          name: "title",
          type: "text",
          required: true,
          options: { min: 1, max: 200 }
        }),
        new SchemaField({
          name: "description",
          type: "text",
          required: false,
          options: { min: null, max: 1000 }
        }),
        new SchemaField({
          name: "completed",
          type: "bool",
          required: false
        }),
        new SchemaField({
          name: "priority",
          type: "select",
          required: false,
          options: {
            maxSelect: 1,
            values: ["low", "medium", "high", "urgent"]
          }
        }),
        new SchemaField({
          name: "category",
          type: "select",
          required: false,
          options: {
            maxSelect: 1,
            values: ["general", "patient_followup", "appointment", "inventory", "billing", "administrative"]
          }
        }),
        new SchemaField({
          name: "patient",
          type: "relation",
          required: false,
          options: {
            collectionId: "patients",
            cascadeDelete: false,
            minSelect: null,
            maxSelect: 1,
            displayFields: ["first_name", "last_name"]
          }
        }),
        new SchemaField({
          name: "due_date",
          type: "date",
          required: false
        }),
        new SchemaField({
          name: "assigned_to",
          type: "relation",
          required: false,
          options: {
            collectionId: "_pb_users_auth_",
            cascadeDelete: false,
            minSelect: null,
            maxSelect: 1,
            displayFields: ["email"]
          }
        })
      ])
    });

    db.saveCollection(todos);
  }

}, (db) => {
  // Rollback: Remove added fields or delete collection
  try {
    const todos = db.findCollectionByNameOrId("todos");
    
    // Remove the fields we added
    todos.schema.removeField("priority");
    todos.schema.removeField("category");
    todos.schema.removeField("patient");
    todos.schema.removeField("due_date");
    todos.schema.removeField("assigned_to");
    
    db.saveCollection(todos);
  } catch (e) {
    // If collection was created fresh, delete it
    db.deleteCollection("todos");
  }
})
