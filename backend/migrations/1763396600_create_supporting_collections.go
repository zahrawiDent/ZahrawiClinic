package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
	"github.com/pocketbase/pocketbase/tools/types"
)

func init() {
	m.Register(func(app core.App) error {
		// =============================================================================
		// Supporting Collections - Addresses & Emergency Contacts
		// =============================================================================
		// These are foundational collections used by patients and other entities

		// ---------------------------------------------------------------------------
		// 1. addresses - Normalized address storage
		// ---------------------------------------------------------------------------
		addresses := core.NewBaseCollection("addresses")

		addresses.ListRule = types.Pointer("@request.auth.id != ''")
		addresses.ViewRule = types.Pointer("@request.auth.id != ''")
		addresses.CreateRule = types.Pointer("@request.auth.id != ''")
		addresses.UpdateRule = types.Pointer("@request.auth.id != ''")
		addresses.DeleteRule = types.Pointer("@request.auth.id != ''")

		addresses.Fields.Add(
			&core.SelectField{
				Name:      "addressType",
				Values:    []string{"home", "work", "billing", "shipping", "other"},
				MaxSelect: 1,
			},
			&core.TextField{
				Name:     "street1",
				Required: true,
				Max:      255,
			},
			&core.TextField{
				Name: "street2",
				Max:  255,
			},
			&core.TextField{
				Name:     "city",
				Required: true,
				Max:      100,
			},
			&core.TextField{
				Name:     "state",
				Required: true,
				Max:      100,
			},
			&core.TextField{
				Name:     "zipCode",
				Required: true,
				Max:      20,
			},
			&core.TextField{
				Name:     "country",
				Required: true,
				Max:      100,
			},
			&core.NumberField{
				Name: "latitude",
			},
			&core.NumberField{
				Name: "longitude",
			},
			&core.BoolField{
				Name: "isVerified",
			},
			&core.DateField{
				Name: "verifiedAt",
			},
			&core.BoolField{
				Name: "isPrimary",
			},
			&core.TextField{
				Name: "label",
				Max:  100,
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

		if err := app.Save(addresses); err != nil {
			return err
		}

		// ---------------------------------------------------------------------------
		// 2. emergency_contacts - Emergency contact information
		// ---------------------------------------------------------------------------
		emergencyContacts := core.NewBaseCollection("emergency_contacts")

		emergencyContacts.ListRule = types.Pointer("@request.auth.id != ''")
		emergencyContacts.ViewRule = types.Pointer("@request.auth.id != ''")
		emergencyContacts.CreateRule = types.Pointer("@request.auth.id != ''")
		emergencyContacts.UpdateRule = types.Pointer("@request.auth.id != ''")
		emergencyContacts.DeleteRule = types.Pointer("@request.auth.id != ''")

		emergencyContacts.Fields.Add(
			&core.TextField{
				Name:     "firstName",
				Required: true,
				Max:      100,
			},
			&core.TextField{
				Name:     "lastName",
				Required: true,
				Max:      100,
			},
			&core.TextField{
				Name:     "relationship",
				Required: true,
				Max:      100,
			},
			&core.TextField{
				Name:     "primaryPhone",
				Required: true,
				Max:      50,
			},
			&core.TextField{
				Name: "secondaryPhone",
				Max:  50,
			},
			&core.SelectField{
				Name:      "preferredContactMethod",
				Values:    []string{"phone", "sms", "email"},
				MaxSelect: 1,
			},
			&core.EmailField{
				Name: "email",
			},
			&core.RelationField{
				Name:         "address",
				CollectionId: addresses.Id,
			},
			&core.BoolField{
				Name: "isPrimary",
			},
			&core.NumberField{
				Name: "priority",
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

		return app.Save(emergencyContacts)
	}, func(app core.App) error {
		// Rollback: delete collections in reverse order
		if err := app.Delete(core.NewBaseCollection("emergency_contacts")); err != nil {
			return err
		}
		return app.Delete(core.NewBaseCollection("addresses"))
	})
}
