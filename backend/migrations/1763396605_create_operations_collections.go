package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
	"github.com/pocketbase/pocketbase/tools/types"
)

func init() {
	m.Register(func(app core.App) error {
		// =============================================================================
		// Operations Collections - Todos & Inventory
		// =============================================================================

		// Get dependencies
		patients, err := app.FindCollectionByNameOrId("patients")
		if err != nil {
			return err
		}

		users, err := app.FindCollectionByNameOrId("users")
		if err != nil {
			return err
		}

		// ---------------------------------------------------------------------------
		// 1. todos - Task management
		// ---------------------------------------------------------------------------
		todos := core.NewBaseCollection("todos")

		todos.ListRule = types.Pointer("@request.auth.id != ''")
		todos.ViewRule = types.Pointer("@request.auth.id != ''")
		todos.CreateRule = types.Pointer("@request.auth.id != ''")
		todos.UpdateRule = types.Pointer("@request.auth.id != ''")
		todos.DeleteRule = types.Pointer("@request.auth.id != ''")

		todos.Fields.Add(
			&core.TextField{
				Name:     "title",
				Required: true,
				Max:      200,
			},
			&core.TextField{
				Name: "description",
				Max:  2000,
			},
			&core.BoolField{
				Name:     "completed",
				Required: true,
			},
			&core.SelectField{
				Name:      "priority",
				Values:    []string{"low", "medium", "high", "urgent"},
				MaxSelect: 1,
			},
			&core.DateField{
				Name: "dueDate",
			},
			&core.RelationField{
				Name:         "assignedTo",
				CollectionId: users.Id,
			},
			&core.RelationField{
				Name:         "relatedPatient",
				CollectionId: patients.Id,
			},
			&core.SelectField{
				Name:      "category",
				Values:    []string{"administrative", "clinical", "follow_up", "billing", "other"},
				MaxSelect: 1,
			},

			&core.DateField{
				Name:   "created",
				System: true,
			},
			&core.DateField{
				Name:   "updated",
				System: true,
			},
		)

		if err := app.Save(todos); err != nil {
			return err
		}

		// ---------------------------------------------------------------------------
		// 2. inventory - Supplies and equipment management
		// ---------------------------------------------------------------------------
		inventory := core.NewBaseCollection("inventory")

		inventory.ListRule = types.Pointer("@request.auth.id != ''")
		inventory.ViewRule = types.Pointer("@request.auth.id != ''")
		inventory.CreateRule = types.Pointer("@request.auth.id != ''")
		inventory.UpdateRule = types.Pointer("@request.auth.id != ''")
		inventory.DeleteRule = types.Pointer("@request.auth.id != ''")

		inventory.Fields.Add(
			&core.TextField{
				Name:     "name",
				Required: true,
				Max:      200,
			},
			&core.SelectField{
				Name:      "category",
				Required:  true,
				Values:    []string{"dental_supplies", "medication", "equipment", "consumables", "other"},
				MaxSelect: 1,
			},
			&core.TextField{
				Name: "sku",
				Max:  100,
			},
			&core.TextField{
				Name: "barcode",
				Max:  100,
			},
			&core.NumberField{
				Name:     "quantity",
				Required: true,
				Min:      types.Pointer(float64(0)),
			},
			&core.TextField{
				Name:     "unit",
				Required: true,
				Max:      50,
			},
			&core.NumberField{
				Name: "minQuantity",
				Min:  types.Pointer(float64(0)),
			},
			&core.NumberField{
				Name: "maxQuantity",
				Min:  types.Pointer(float64(0)),
			},
			&core.TextField{
				Name: "supplier",
				Max:  200,
			},
			&core.TextField{
				Name: "supplierSku",
				Max:  100,
			},
			&core.NumberField{
				Name: "costPrice",
				Min:  types.Pointer(float64(0)),
			},
			&core.NumberField{
				Name: "sellingPrice",
				Min:  types.Pointer(float64(0)),
			},
			&core.TextField{
				Name: "location",
				Max:  100,
			},
			&core.DateField{
				Name: "expiryDate",
			},
			&core.SelectField{
				Name:      "status",
				Required:  true,
				Values:    []string{"in_stock", "low_stock", "out_of_stock", "discontinued"},
				MaxSelect: 1,
			},
			&core.TextField{
				Name: "notes",
				Max:  1000,
			},

			&core.DateField{
				Name:   "created",
				System: true,
			},
			&core.DateField{
				Name:   "updated",
				System: true,
			},
		)

		return app.Save(inventory)
	}, func(app core.App) error {
		// Rollback: delete collections in reverse order
		collections := []string{"inventory", "todos"}
		for _, name := range collections {
			if err := app.Delete(core.NewBaseCollection(name)); err != nil {
				return err
			}
		}
		return nil
	})
}
