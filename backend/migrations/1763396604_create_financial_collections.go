package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
	"github.com/pocketbase/pocketbase/tools/types"
)

func init() {
	m.Register(func(app core.App) error {
		// =============================================================================
		// Financial Collections - Invoices, Payments, Insurance Claims
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

		treatments, err := app.FindCollectionByNameOrId("treatments")
		if err != nil {
			return err
		}

		patientInsurance, err := app.FindCollectionByNameOrId("patient_insurance")
		if err != nil {
			return err
		}

		// ---------------------------------------------------------------------------
		// 1. invoices - Billing header records
		// ---------------------------------------------------------------------------
		invoices := core.NewBaseCollection("invoices")

		invoices.ListRule = types.Pointer("@request.auth.id != ''")
		invoices.ViewRule = types.Pointer("@request.auth.id != ''")
		invoices.CreateRule = types.Pointer("@request.auth.id != ''")
		invoices.UpdateRule = types.Pointer("@request.auth.id != ''")
		invoices.DeleteRule = types.Pointer("@request.auth.id != ''")

		invoices.Fields.Add(
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
			&core.TextField{
				Name:     "invoiceNumber",
				Required: true,
				Max:      50,
			},
			&core.DateField{
				Name:     "invoiceDate",
				Required: true,
			},
			&core.DateField{
				Name: "dueDate",
			},
			&core.NumberField{
				Name:     "subtotal",
				Required: true,
				Min:      types.Pointer(float64(0)),
			},
			&core.NumberField{
				Name: "tax",
				Min:  types.Pointer(float64(0)),
			},
			&core.NumberField{
				Name: "discount",
				Min:  types.Pointer(float64(0)),
			},
			&core.NumberField{
				Name:     "total",
				Required: true,
				Min:      types.Pointer(float64(0)),
			},
			&core.SelectField{
				Name:      "status",
				Required:  true,
				Values:    []string{"draft", "sent", "paid", "partial", "overdue", "cancelled"},
				MaxSelect: 1,
			},
			&core.NumberField{
				Name: "insuranceAmount",
				Min:  types.Pointer(float64(0)),
			},
			&core.TextField{
				Name: "notes",
				Max:  2000,
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

		// Create unique index on invoiceNumber
		invoices.Indexes = []string{
			"CREATE UNIQUE INDEX idx_invoices_invoiceNumber ON invoices (invoiceNumber)",
		}

		if err := app.Save(invoices); err != nil {
			return err
		}

		// ---------------------------------------------------------------------------
		// 2. invoice_items - Line items for invoices
		// ---------------------------------------------------------------------------
		invoiceItems := core.NewBaseCollection("invoice_items")

		invoiceItems.ListRule = types.Pointer("@request.auth.id != ''")
		invoiceItems.ViewRule = types.Pointer("@request.auth.id != ''")
		invoiceItems.CreateRule = types.Pointer("@request.auth.id != ''")
		invoiceItems.UpdateRule = types.Pointer("@request.auth.id != ''")
		invoiceItems.DeleteRule = types.Pointer("@request.auth.id != ''")

		invoiceItems.Fields.Add(
			&core.RelationField{
				Name:          "invoice",
				Required:      true,
				CollectionId:  invoices.Id,
				CascadeDelete: true,
			},
			&core.TextField{
				Name:     "description",
				Required: true,
				Max:      500,
			},
			&core.NumberField{
				Name:     "quantity",
				Required: true,
				Min:      types.Pointer(float64(0)),
			},
			&core.NumberField{
				Name:     "unitPrice",
				Required: true,
				Min:      types.Pointer(float64(0)),
			},
			&core.NumberField{
				Name:     "total",
				Required: true,
				Min:      types.Pointer(float64(0)),
			},
			&core.RelationField{
				Name:         "treatment",
				CollectionId: treatments.Id,
			},
			&core.NumberField{
				Name: "discount",
				Min:  types.Pointer(float64(0)),
			},
			&core.SelectField{
				Name:      "discountType",
				Values:    []string{"percentage", "fixed"},
				MaxSelect: 1,
			},
			&core.BoolField{
				Name: "taxable",
			},
			&core.NumberField{
				Name: "taxAmount",
				Min:  types.Pointer(float64(0)),
			},
			&core.NumberField{
				Name: "insuranceCoverage",
				Min:  types.Pointer(float64(0)),
			},
			&core.NumberField{
				Name: "lineNumber",
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

		if err := app.Save(invoiceItems); err != nil {
			return err
		}

		// Update treatments to link to invoice_items
		treatments.Fields.Add(
			&core.RelationField{
				Name:         "invoiceItem",
				CollectionId: invoiceItems.Id,
			},
		)
		if err := app.Save(treatments); err != nil {
			return err
		}

		// ---------------------------------------------------------------------------
		// 3. payments - Payment transactions
		// ---------------------------------------------------------------------------
		payments := core.NewBaseCollection("payments")

		payments.ListRule = types.Pointer("@request.auth.id != ''")
		payments.ViewRule = types.Pointer("@request.auth.id != ''")
		payments.CreateRule = types.Pointer("@request.auth.id != ''")
		payments.UpdateRule = types.Pointer("@request.auth.id != ''")
		payments.DeleteRule = types.Pointer("@request.auth.id != ''")

		payments.Fields.Add(
			&core.RelationField{
				Name:          "patient",
				Required:      true,
				CollectionId:  patients.Id,
				CascadeDelete: true,
			},
			&core.RelationField{
				Name:         "invoice",
				Required:     true,
				CollectionId: invoices.Id,
			},
			&core.NumberField{
				Name:     "amount",
				Required: true,
				Min:      types.Pointer(float64(0)),
			},
			&core.DateField{
				Name:     "paymentDate",
				Required: true,
			},
			&core.SelectField{
				Name:      "paymentMethod",
				Required:  true,
				Values:    []string{"cash", "card", "insurance", "check", "transfer"},
				MaxSelect: 1,
			},
			&core.TextField{
				Name: "transactionId",
				Max:  100,
			},
			&core.TextField{
				Name: "reference",
				Max:  200,
			},
			&core.TextField{
				Name: "notes",
				Max:  1000,
			},
			&core.RelationField{
				Name:         "processedBy",
				CollectionId: users.Id,
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

		if err := app.Save(payments); err != nil {
			return err
		}

		// ---------------------------------------------------------------------------
		// 4. insurance_claims - Insurance claim tracking
		// ---------------------------------------------------------------------------
		insuranceClaims := core.NewBaseCollection("insurance_claims")

		insuranceClaims.ListRule = types.Pointer("@request.auth.id != ''")
		insuranceClaims.ViewRule = types.Pointer("@request.auth.id != ''")
		insuranceClaims.CreateRule = types.Pointer("@request.auth.id != ''")
		insuranceClaims.UpdateRule = types.Pointer("@request.auth.id != ''")
		insuranceClaims.DeleteRule = types.Pointer("@request.auth.id != ''")

		insuranceClaims.Fields.Add(
			&core.RelationField{
				Name:          "patient",
				Required:      true,
				CollectionId:  patients.Id,
				CascadeDelete: true,
			},
			&core.RelationField{
				Name:         "insurance",
				Required:     true,
				CollectionId: patientInsurance.Id,
			},
			&core.RelationField{
				Name:         "invoice",
				CollectionId: invoices.Id,
			},
			&core.TextField{
				Name: "claimNumber",
				Max:  100,
			},
			&core.DateField{
				Name:     "claimDate",
				Required: true,
			},
			&core.NumberField{
				Name:     "claimedAmount",
				Required: true,
				Min:      types.Pointer(float64(0)),
			},
			&core.NumberField{
				Name: "approvedAmount",
				Min:  types.Pointer(float64(0)),
			},
			&core.NumberField{
				Name: "paidAmount",
				Min:  types.Pointer(float64(0)),
			},
			&core.NumberField{
				Name: "deniedAmount",
				Min:  types.Pointer(float64(0)),
			},
			&core.NumberField{
				Name: "patientResponsibility",
				Min:  types.Pointer(float64(0)),
			},
			&core.SelectField{
				Name:      "status",
				Required:  true,
				Values:    []string{"pending", "submitted", "approved", "partial", "denied", "paid"},
				MaxSelect: 1,
			},
			&core.DateField{
				Name: "submittedDate",
			},
			&core.DateField{
				Name: "processedDate",
			},
			&core.DateField{
				Name: "paidDate",
			},
			&core.TextField{
				Name: "denialReason",
				Max:  500,
			},
			&core.DateField{
				Name: "appealDate",
			},
			&core.SelectField{
				Name:      "appealStatus",
				Values:    []string{"pending", "approved", "denied"},
				MaxSelect: 1,
			},
			&core.TextField{
				Name: "notes",
				Max:  2000,
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

		if err := app.Save(insuranceClaims); err != nil {
			return err
		}

		// Update invoices to link to insurance_claims
		invoices.Fields.Add(
			&core.RelationField{
				Name:         "insuranceClaim",
				CollectionId: insuranceClaims.Id,
			},
		)
		return app.Save(invoices)
	}, func(app core.App) error {
		// Rollback: delete collections in reverse order
		collections := []string{
			"insurance_claims",
			"payments",
			"invoice_items",
			"invoices",
		}
		for _, name := range collections {
			if err := app.Delete(core.NewBaseCollection(name)); err != nil {
				return err
			}
		}
		return nil
	})
}
