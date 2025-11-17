package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
	"github.com/pocketbase/pocketbase/tools/types"
)

func init() {
	m.Register(func(app core.App) error {
		// =============================================================================
		// Patient Management Collections
		// =============================================================================

		// Get dependencies
		addresses, err := app.FindCollectionByNameOrId("addresses")
		if err != nil {
			return err
		}

		emergencyContacts, err := app.FindCollectionByNameOrId("emergency_contacts")
		if err != nil {
			return err
		}

		users, err := app.FindCollectionByNameOrId("users")
		if err != nil {
			return err
		}

		// ---------------------------------------------------------------------------
		// 1. patients - Core patient information
		// ---------------------------------------------------------------------------
		patients := core.NewBaseCollection("patients")

		patients.ListRule = types.Pointer("@request.auth.id != ''")
		patients.ViewRule = types.Pointer("@request.auth.id != ''")
		patients.CreateRule = types.Pointer("@request.auth.id != ''")
		patients.UpdateRule = types.Pointer("@request.auth.id != ''")
		patients.DeleteRule = types.Pointer("@request.auth.id != ''")

		patients.Fields.Add(
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
			&core.DateField{
				Name: "dateOfBirth",
			},
			&core.SelectField{
				Name:      "gender",
				Values:    []string{"male", "female", "other", "prefer_not_to_say"},
				MaxSelect: 1,
			},
			&core.EmailField{
				Name: "email",
			},
			&core.TextField{
				Name: "phone",
				Max:  50,
			},
			&core.TextField{
				Name: "mobile",
				Max:  50,
			},
			&core.RelationField{
				Name:         "primaryAddress",
				CollectionId: addresses.Id,
			},
			&core.RelationField{
				Name:         "primaryDentist",
				CollectionId: users.Id,
			},
			&core.SelectField{
				Name:      "status",
				Values:    []string{"active", "inactive", "archived"},
				MaxSelect: 1,
			},
			&core.TextField{
				Name: "notes",
				Max:  2000,
			},
			&core.RelationField{
				Name:         "emergencyContact",
				CollectionId: emergencyContacts.Id,
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

		if err := app.Save(patients); err != nil {
			return err
		}

		// ---------------------------------------------------------------------------
		// 2. patient_insurance - Insurance policies
		// ---------------------------------------------------------------------------
		patientInsurance := core.NewBaseCollection("patient_insurance")

		patientInsurance.ListRule = types.Pointer("@request.auth.id != ''")
		patientInsurance.ViewRule = types.Pointer("@request.auth.id != ''")
		patientInsurance.CreateRule = types.Pointer("@request.auth.id != ''")
		patientInsurance.UpdateRule = types.Pointer("@request.auth.id != ''")
		patientInsurance.DeleteRule = types.Pointer("@request.auth.id != ''")

		patientInsurance.Fields.Add(
			&core.RelationField{
				Name:          "patient",
				Required:      true,
				CollectionId:  patients.Id,
				CascadeDelete: true,
			},
			&core.TextField{
				Name:     "provider",
				Required: true,
				Max:      200,
			},
			&core.TextField{
				Name:     "policyNumber",
				Required: true,
				Max:      100,
			},
			&core.TextField{
				Name: "groupNumber",
				Max:  100,
			},
			&core.SelectField{
				Name:      "coverageType",
				Required:  true,
				Values:    []string{"primary", "secondary", "tertiary"},
				MaxSelect: 1,
			},
			&core.TextField{
				Name: "policyHolderName",
				Max:  200,
			},
			&core.DateField{
				Name: "policyHolderDOB",
			},
			&core.SelectField{
				Name:      "relationshipToPolicyHolder",
				Values:    []string{"self", "spouse", "child", "other"},
				MaxSelect: 1,
			},
			&core.DateField{
				Name: "effectiveDate",
			},
			&core.DateField{
				Name: "expirationDate",
			},
			&core.TextField{
				Name: "insurancePhone",
				Max:  50,
			},
			&core.RelationField{
				Name:         "insuranceAddress",
				CollectionId: addresses.Id,
			},
			&core.NumberField{
				Name: "annualMaximum",
			},
			&core.NumberField{
				Name: "deductible",
			},
			&core.NumberField{
				Name: "deductibleMet",
			},
			&core.BoolField{
				Name: "isActive",
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

		if err := app.Save(patientInsurance); err != nil {
			return err
		}

		// ---------------------------------------------------------------------------
		// 3. medical_history - Patient medical records
		// ---------------------------------------------------------------------------
		medicalHistory := core.NewBaseCollection("medical_history")

		medicalHistory.ListRule = types.Pointer("@request.auth.id != ''")
		medicalHistory.ViewRule = types.Pointer("@request.auth.id != ''")
		medicalHistory.CreateRule = types.Pointer("@request.auth.id != ''")
		medicalHistory.UpdateRule = types.Pointer("@request.auth.id != ''")
		medicalHistory.DeleteRule = types.Pointer("@request.auth.id != ''")

		medicalHistory.Fields.Add(
			&core.RelationField{
				Name:         "patient",
				Required:     true,
				CollectionId: patients.Id,
			},
			&core.RelationField{
				Name:         "recordedBy",
				Required:     true,
				CollectionId: users.Id,
			},
			&core.JSONField{
				Name: "conditions",
			},
			&core.JSONField{
				Name: "allergies",
			},
			&core.JSONField{
				Name: "medications",
			},
			&core.TextField{
				Name: "previousDentalWork",
				Max:  2000,
			},
			&core.TextField{
				Name: "dentalConcerns",
				Max:  2000,
			},
			&core.BoolField{
				Name: "smoking",
			},
			&core.TextField{
				Name: "smokingFrequency",
				Max:  100,
			},
			&core.BoolField{
				Name: "alcohol",
			},
			&core.TextField{
				Name: "alcoholFrequency",
				Max:  100,
			},
			&core.TextField{
				Name: "notes",
				Max:  2000,
			},
			&core.DateField{
				Name:     "recordDate",
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

		return app.Save(medicalHistory)
	}, func(app core.App) error {
		// Rollback: delete collections in reverse order
		collections := []string{"medical_history", "patient_insurance", "patients"}
		for _, name := range collections {
			if err := app.Delete(core.NewBaseCollection(name)); err != nil {
				return err
			}
		}
		return nil
	})
}
