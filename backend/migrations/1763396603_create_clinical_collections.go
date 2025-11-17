package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
	"github.com/pocketbase/pocketbase/tools/types"
)

func init() {
	m.Register(func(app core.App) error {
		// =============================================================================
		// Clinical Collections - Treatments, Treatment Plans, Prescriptions, Dental Chart
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

		appointments, err := app.FindCollectionByNameOrId("appointments")
		if err != nil {
			return err
		}

		// ---------------------------------------------------------------------------
		// 1. treatments_catalog - Standard treatment types and pricing
		// ---------------------------------------------------------------------------
		treatmentsCatalog := core.NewBaseCollection("treatments_catalog")

		treatmentsCatalog.ListRule = types.Pointer("@request.auth.id != ''")
		treatmentsCatalog.ViewRule = types.Pointer("@request.auth.id != ''")
		treatmentsCatalog.CreateRule = types.Pointer("@request.auth.id != ''")
		treatmentsCatalog.UpdateRule = types.Pointer("@request.auth.id != ''")
		treatmentsCatalog.DeleteRule = types.Pointer("@request.auth.id != ''")

		treatmentsCatalog.Fields.Add(
			&core.TextField{
				Name:     "name",
				Required: true,
				Max:      200,
			},
			&core.TextField{
				Name: "description",
				Max:  1000,
			},
			&core.NumberField{
				Name:     "default_price",
				Required: true,
				Min:      types.Pointer(float64(0)),
			},
			&core.TextField{
				Name: "category",
				Max:  100,
			},
			&core.TextField{
				Name: "code",
				Max:  50,
			},
			&core.NumberField{
				Name: "insuranceCoverage",
				Min:  types.Pointer(float64(0)),
				Max:  types.Pointer(float64(100)),
			},
			&core.NumberField{
				Name: "estimatedDuration",
				Min:  types.Pointer(float64(0)),
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

		if err := app.Save(treatmentsCatalog); err != nil {
			return err
		}

		// ---------------------------------------------------------------------------
		// 2. treatments - Individual treatment records
		// ---------------------------------------------------------------------------
		treatments := core.NewBaseCollection("treatments")

		treatments.ListRule = types.Pointer("@request.auth.id != ''")
		treatments.ViewRule = types.Pointer("@request.auth.id != ''")
		treatments.CreateRule = types.Pointer("@request.auth.id != ''")
		treatments.UpdateRule = types.Pointer("@request.auth.id != ''")
		treatments.DeleteRule = types.Pointer("@request.auth.id != ''")

		treatments.Fields.Add(
			&core.RelationField{
				Name:          "patient",
				Required:      true,
				CollectionId:  patients.Id,
				CascadeDelete: true,
			},
			&core.RelationField{
				Name:         "appointment",
				CollectionId: appointments.Id,
			},
			&core.RelationField{
				Name:         "performedBy",
				Required:     true,
				CollectionId: users.Id,
			},
			&core.RelationField{
				Name:         "treatmentType",
				Required:     true,
				CollectionId: treatmentsCatalog.Id,
			},
			&core.TextField{
				Name: "toothNumber",
				Max:  10,
			},
			&core.TextField{
				Name: "surface",
				Max:  100,
			},
			&core.TextField{
				Name: "diagnosis",
				Max:  1000,
			},
			&core.TextField{
				Name: "procedure",
				Max:  2000,
			},
			&core.TextField{
				Name: "notes",
				Max:  2000,
			},
			&core.NumberField{
				Name: "actualCost",
				Min:  types.Pointer(float64(0)),
			},
			&core.DateField{
				Name:     "treatmentDate",
				Required: true,
			},
			&core.DateField{
				Name: "completedAt",
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

		if err := app.Save(treatments); err != nil {
			return err
		}

		// ---------------------------------------------------------------------------
		// 3. treatment_plans - Multi-step treatment planning
		// ---------------------------------------------------------------------------
		treatmentPlans := core.NewBaseCollection("treatment_plans")

		treatmentPlans.ListRule = types.Pointer("@request.auth.id != ''")
		treatmentPlans.ViewRule = types.Pointer("@request.auth.id != ''")
		treatmentPlans.CreateRule = types.Pointer("@request.auth.id != ''")
		treatmentPlans.UpdateRule = types.Pointer("@request.auth.id != ''")
		treatmentPlans.DeleteRule = types.Pointer("@request.auth.id != ''")

		treatmentPlans.Fields.Add(
			&core.RelationField{
				Name:          "patient",
				Required:      true,
				CollectionId:  patients.Id,
				CascadeDelete: true,
			},
			&core.RelationField{
				Name:         "createdBy",
				Required:     true,
				CollectionId: users.Id,
			},
			&core.TextField{
				Name:     "title",
				Required: true,
				Max:      200,
			},
			&core.TextField{
				Name: "description",
				Max:  2000,
			},
			&core.TextField{
				Name: "diagnosis",
				Max:  2000,
			},
			&core.SelectField{
				Name:      "status",
				Required:  true,
				Values:    []string{"proposed", "accepted", "in_progress", "completed", "cancelled"},
				MaxSelect: 1,
			},
			&core.DateField{
				Name: "proposedDate",
			},
			&core.DateField{
				Name: "acceptedDate",
			},
			&core.DateField{
				Name: "completedDate",
			},
			&core.NumberField{
				Name: "estimatedCost",
				Min:  types.Pointer(float64(0)),
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

		if err := app.Save(treatmentPlans); err != nil {
			return err
		}

		// ---------------------------------------------------------------------------
		// 4. treatment_plan_items - Individual steps in treatment plans
		// ---------------------------------------------------------------------------
		treatmentPlanItems := core.NewBaseCollection("treatment_plan_items")

		treatmentPlanItems.ListRule = types.Pointer("@request.auth.id != ''")
		treatmentPlanItems.ViewRule = types.Pointer("@request.auth.id != ''")
		treatmentPlanItems.CreateRule = types.Pointer("@request.auth.id != ''")
		treatmentPlanItems.UpdateRule = types.Pointer("@request.auth.id != ''")
		treatmentPlanItems.DeleteRule = types.Pointer("@request.auth.id != ''")

		treatmentPlanItems.Fields.Add(
			&core.RelationField{
				Name:          "treatmentPlan",
				Required:      true,
				CollectionId:  treatmentPlans.Id,
				CascadeDelete: true,
			},
			&core.RelationField{
				Name:         "treatmentType",
				Required:     true,
				CollectionId: treatmentsCatalog.Id,
			},
			&core.TextField{
				Name: "toothNumber",
				Max:  10,
			},
			&core.TextField{
				Name: "surface",
				Max:  100,
			},
			&core.TextField{
				Name: "description",
				Max:  1000,
			},
			&core.SelectField{
				Name:      "priority",
				Required:  true,
				Values:    []string{"low", "medium", "high", "urgent"},
				MaxSelect: 1,
			},
			&core.NumberField{
				Name: "estimatedCost",
				Min:  types.Pointer(float64(0)),
			},
			&core.NumberField{
				Name: "estimatedDuration",
				Min:  types.Pointer(float64(0)),
			},
			&core.SelectField{
				Name:      "status",
				Required:  true,
				Values:    []string{"pending", "scheduled", "in_progress", "completed", "cancelled"},
				MaxSelect: 1,
			},
			&core.DateField{
				Name: "scheduledDate",
			},
			&core.DateField{
				Name: "completedDate",
			},
			&core.RelationField{
				Name:         "completedTreatment",
				CollectionId: treatments.Id,
			},
			&core.NumberField{
				Name: "sequenceNumber",
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

		if err := app.Save(treatmentPlanItems); err != nil {
			return err
		}

		// ---------------------------------------------------------------------------
		// 5. prescriptions - Medication prescriptions
		// ---------------------------------------------------------------------------
		prescriptions := core.NewBaseCollection("prescriptions")

		prescriptions.ListRule = types.Pointer("@request.auth.id != ''")
		prescriptions.ViewRule = types.Pointer("@request.auth.id != ''")
		prescriptions.CreateRule = types.Pointer("@request.auth.id != ''")
		prescriptions.UpdateRule = types.Pointer("@request.auth.id != ''")
		prescriptions.DeleteRule = types.Pointer("@request.auth.id != ''")

		prescriptions.Fields.Add(
			&core.RelationField{
				Name:          "patient",
				Required:      true,
				CollectionId:  patients.Id,
				CascadeDelete: true,
			},
			&core.RelationField{
				Name:         "prescribedBy",
				Required:     true,
				CollectionId: users.Id,
			},
			&core.RelationField{
				Name:         "appointment",
				CollectionId: appointments.Id,
			},
			&core.TextField{
				Name:     "medicationName",
				Required: true,
				Max:      200,
			},
			&core.TextField{
				Name:     "dosage",
				Required: true,
				Max:      100,
			},
			&core.TextField{
				Name:     "frequency",
				Required: true,
				Max:      100,
			},
			&core.TextField{
				Name:     "duration",
				Required: true,
				Max:      100,
			},
			&core.TextField{
				Name: "quantity",
				Max:  50,
			},
			&core.TextField{
				Name: "instructions",
				Max:  1000,
			},
			&core.DateField{
				Name:     "prescribedDate",
				Required: true,
			},
			&core.DateField{
				Name: "startDate",
			},
			&core.DateField{
				Name: "endDate",
			},
			&core.SelectField{
				Name:      "status",
				Required:  true,
				Values:    []string{"active", "completed", "cancelled"},
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

		if err := app.Save(prescriptions); err != nil {
			return err
		}

		// ---------------------------------------------------------------------------
		// 6. dental_chart - Tooth-specific tracking
		// ---------------------------------------------------------------------------
		dentalChart := core.NewBaseCollection("dental_chart")

		dentalChart.ListRule = types.Pointer("@request.auth.id != ''")
		dentalChart.ViewRule = types.Pointer("@request.auth.id != ''")
		dentalChart.CreateRule = types.Pointer("@request.auth.id != ''")
		dentalChart.UpdateRule = types.Pointer("@request.auth.id != ''")
		dentalChart.DeleteRule = types.Pointer("@request.auth.id != ''")

		dentalChart.Fields.Add(
			&core.RelationField{
				Name:          "patient",
				Required:      true,
				CollectionId:  patients.Id,
				CascadeDelete: true,
			},
			&core.TextField{
				Name:     "toothNumber",
				Required: true,
				Max:      10,
			},
			&core.SelectField{
				Name:      "status",
				Required:  true,
				Values:    []string{"healthy", "decayed", "filled", "missing", "implant", "crown", "bridge", "root_canal", "extracted", "other"},
				MaxSelect: 1,
			},
			&core.JSONField{
				Name: "conditions",
			},
			&core.JSONField{
				Name: "surfaces",
			},
			&core.DateField{
				Name: "conditionDate",
			},
			&core.DateField{
				Name: "lastExamDate",
			},
			&core.JSONField{
				Name: "relatedTreatments",
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

		return app.Save(dentalChart)
	}, func(app core.App) error {
		// Rollback: delete collections in reverse order
		collections := []string{
			"dental_chart",
			"prescriptions",
			"treatment_plan_items",
			"treatment_plans",
			"treatments",
			"treatments_catalog",
		}
		for _, name := range collections {
			if err := app.Delete(core.NewBaseCollection(name)); err != nil {
				return err
			}
		}
		return nil
	})
}
