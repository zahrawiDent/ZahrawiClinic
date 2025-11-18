package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
	"github.com/pocketbase/pocketbase/tools/types"
)

func init() {
	m.Register(func(app core.App) error {
		// =============================================================================
		// Scheduling Collections
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
		// appointments - Appointment scheduling
		// ---------------------------------------------------------------------------
		appointments := core.NewBaseCollection("appointments")

		appointments.ListRule = types.Pointer("@request.auth.id != ''")
		appointments.ViewRule = types.Pointer("@request.auth.id != ''")
		appointments.CreateRule = types.Pointer("@request.auth.id != ''")
		appointments.UpdateRule = types.Pointer("@request.auth.id != ''")
		appointments.DeleteRule = types.Pointer("@request.auth.id != ''")

		appointments.Fields.Add(
			&core.RelationField{
				Name:          "patient",
				Required:      true,
				CollectionId:  patients.Id,
				CascadeDelete: true,
			},
			&core.RelationField{
				Name:         "dentist",
				Required:     true,
				CollectionId: users.Id,
			},
			&core.DateField{
				Name:     "start_time",
				Required: true,
			},
			&core.NumberField{
				Name:     "duration",
				Required: true,
				Min:      types.Pointer(float64(1)),
			},
			&core.SelectField{
				Name:      "status",
				Required:  true,
				Values:    []string{"scheduled", "confirmed", "completed", "cancelled", "no_show"},
				MaxSelect: 1,
			},
			&core.SelectField{
				Name:      "type",
				Required:  true,
				Values:    []string{"checkup", "cleaning", "filling", "extraction", "root_canal", "crown", "consultation", "emergency", "other"},
				MaxSelect: 1,
			},
			&core.TextField{
				Name: "room",
				Max:  50,
			},
			&core.TextField{
				Name: "notes",
				Max:  2000,
			},
			&core.DateField{
				Name: "completedAt",
			},
			&core.DateField{
				Name: "cancelledAt",
			},
			&core.TextField{
				Name: "cancellationReason",
				Max:  500,
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

		return app.Save(appointments)
	}, func(app core.App) error {
		// Rollback
		return app.Delete(core.NewBaseCollection("appointments"))
	})
}
