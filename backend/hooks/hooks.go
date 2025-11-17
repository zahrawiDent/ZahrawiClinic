package hooks

import (
	"fmt"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/core"
)

func RegisterPatientDeleteHook(app core.App) {
	app.OnRecordDelete("patients").BindFunc(func(e *core.RecordEvent) error {
		patientID := e.Record.Id
		fmt.Println("Deleting patient:", patientID)

		// collections that reference the patient
		related := []string{"appointments", "patient_transfers", "treatment_records"}

		// wrap everything in a transaction so it’s all-or-nothing
		return e.App.RunInTransaction(func(txApp core.App) error {
			for _, col := range related {
				// fetch all records with patient = patientID
				records, err := txApp.FindRecordsByFilter(
					col,
					"patient = {:pid}",
					"", // sort
					0,  // limit (0 = no limit)
					0,  // offset
					dbx.Params{"pid": patientID},
				)
				if err != nil {
					return err
				}
				fmt.Println("Deleting", len(records), "records from", col)

				// delete each related record
				for _, r := range records {
					if err := txApp.Delete(r); err != nil {
						return err
					}
				}
			}

			// finally delete the patient itself
			// NOTE: e.Next() performs the actual patient delete,
			// but we must call it inside the same transaction.
			fmt.Println("Deleting patient:", patientID)
			return e.Next()
		})
		// return e.Next()
	})
}
