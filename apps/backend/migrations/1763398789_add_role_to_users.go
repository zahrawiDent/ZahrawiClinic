package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
	"github.com/pocketbase/pocketbase/tools/types"
)

func init() {
	m.Register(func(app core.App) error {
		// =============================================================================
		// Add username and role fields to users collection
		// =============================================================================
		// Note: The users collection is an auth collection that includes
		// email, emailVisibility, verified, name, and avatar fields by default.
		// This migration adds username (for login), role, and timestamp fields.

		// Get the users collection
		users, err := app.FindCollectionByNameOrId("users")
		if err != nil {
			return err
		}

		// Set access rules
		// Only superusers can create and delete users
		users.CreateRule = types.Pointer("@request.auth.id != '' && @request.auth.collectionName = '_superusers'")
		users.DeleteRule = types.Pointer("@request.auth.id != '' && @request.auth.collectionName = '_superusers'")
		// Users can update their own account, superusers can update any user
		users.UpdateRule = types.Pointer("@request.auth.id != '' && (@request.auth.id = id || @request.auth.collectionName = '_superusers')")
		// Users can view their own account, superusers can view all
		users.ViewRule = types.Pointer("@request.auth.id != '' && (@request.auth.id = id || @request.auth.collectionName = '_superusers')")
		// Users can list themselves, superusers can list all
		users.ListRule = types.Pointer("@request.auth.id != '' && (@request.auth.id = id || @request.auth.collectionName = '_superusers')")

		// Add custom fields (username, role, timestamps)
		users.Fields.Add(
			&core.TextField{
				Name:     "username",
				Required: true,
				Min:      3,
				Max:      150,
				Pattern:  `^[\w][\w\.\-]*$`, // alphanumeric, dots, hyphens, underscores
			},

			&core.SelectField{
				Name:      "role",
				Required:  true,
				Values:    []string{"Dentist", "Receptionist"},
				MaxSelect: 1,
			},

			&core.AutodateField{
				Name:     "created",
				OnCreate: true,
			},
			&core.AutodateField{
				Name:     "updated",
				OnCreate: true,
				OnUpdate: true,
			},
		)

		// Save the collection
		return app.Save(users)

	}, func(app core.App) error {
		// =============================================================================
		// Rollback: Remove username and role fields from users collection
		// =============================================================================

		// Get the users collection
		users, err := app.FindCollectionByNameOrId("users")
		if err != nil {
			return err
		}

		// Remove the added fields
		users.Fields.RemoveById("username")
		users.Fields.RemoveById("role")
		users.Fields.RemoveById("created")
		users.Fields.RemoveById("updated")

		// Save the collection
		return app.Save(users)
	})
}
