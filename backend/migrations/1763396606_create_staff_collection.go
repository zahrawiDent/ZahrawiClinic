package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
	"github.com/pocketbase/pocketbase/tools/types"
)

func init() {
	m.Register(func(app core.App) error {
		// =============================================================================
		// Staff Collection - Extended user information for staff members
		// =============================================================================

		// Get dependencies
		users, err := app.FindCollectionByNameOrId("users")
		if err != nil {
			return err
		}

		// ---------------------------------------------------------------------------
		// staff - Staff/dentist additional information
		// ---------------------------------------------------------------------------
		staff := core.NewBaseCollection("staff")

		staff.ListRule = types.Pointer("@request.auth.id != ''")
		staff.ViewRule = types.Pointer("@request.auth.id != ''")
		staff.CreateRule = types.Pointer("@request.auth.id != ''")
		staff.UpdateRule = types.Pointer("@request.auth.id != ''")
		staff.DeleteRule = types.Pointer("@request.auth.id != ''")

		staff.Fields.Add(
			&core.RelationField{
				Name:         "user",
				Required:     true,
				CollectionId: users.Id,
			},
			&core.SelectField{
				Name:      "role",
				Required:  true,
				Values:    []string{"dentist", "hygienist", "assistant", "receptionist", "admin", "other"},
				MaxSelect: 1,
			},
			&core.TextField{
				Name: "licenseNumber",
				Max:  100,
			},
			&core.JSONField{
				Name: "specialization",
			},
			&core.SelectField{
				Name:      "employmentType",
				Values:    []string{"full_time", "part_time", "contract"},
				MaxSelect: 1,
			},
			&core.DateField{
				Name: "hireDate",
			},
			&core.JSONField{
				Name: "workingDays",
			},
			&core.JSONField{
				Name: "workingHours",
			},
			&core.TextField{
				Name: "phone",
				Max:  50,
			},
			&core.TextField{
				Name: "emergencyContact",
				Max:  200,
			},
			&core.TextField{
				Name: "emergencyPhone",
				Max:  50,
			},
			&core.BoolField{
				Name:     "isActive",
				Required: true,
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

		// Create unique index on user relation
		staff.Indexes = []string{
			"CREATE UNIQUE INDEX idx_staff_user ON staff (user)",
		}

		return app.Save(staff)
	}, func(app core.App) error {
		// Rollback
		return app.Delete(core.NewBaseCollection("staff"))
	})
}
