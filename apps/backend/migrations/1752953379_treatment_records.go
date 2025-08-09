package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		// add up queries...

		collection := core.NewBaseCollection("treatment_records")
		patientsCollection, err := app.FindCollectionByNameOrId("patients")
		if err != nil {
			return err
		}
		dentistsCollection, err := app.FindCollectionByNameOrId("staff_members")
		if err != nil {
			return err
		}
		clinicsCollection, err := app.FindCollectionByNameOrId("clinics")
		if err != nil {
			return err
		}
		appointmentsCollection, err := app.FindCollectionByNameOrId("appointments")
		collection.Fields.Add(
			&core.RelationField{
				Name:         "patient",
				Required:     true,
				CollectionId: patientsCollection.Id,
			},
			&core.RelationField{
				Name:         "doctor",
				Required:     true,
				CollectionId: dentistsCollection.Id,
			},
			&core.RelationField{
				Name:         "clinic",
				Required:     true,
				CollectionId: clinicsCollection.Id,
			},
			&core.RelationField{
				Name:         "appointment",
				Required:     true,
				CollectionId: appointmentsCollection.Id,
			},
			&core.NumberField{
				Name:     "price_charged",
				Required: true,
			},
			&core.JSONField{
				// Universal
				Name: "tooth_numbers",
			},
			&core.TextField{
				Name: "clinical_notes",
			},
		)

		return app.Save(collection)
	}, func(app core.App) error {
		// add down queries...

		return nil
	})
}
