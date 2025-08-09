package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		// add up queries...
		collection := core.NewBaseCollection("patient_transfers")

		patientsCollection, err := app.FindCollectionByNameOrId("patients")
		if err != nil {
			return err
		}

		clinicsCollection, err := app.FindCollectionByNameOrId("clinics")
		if err != nil {
			return err
		}

		collection.Fields.Add(
			&core.RelationField{
				Name:         "patient",
				Required:     true,
				CollectionId: patientsCollection.Id,
			},
			&core.RelationField{
				Name:         "from_clinic",
				Required:     true,
				CollectionId: clinicsCollection.Id,
			},
			&core.RelationField{
				Name:         "to_clinic",
				Required:     true,
				CollectionId: clinicsCollection.Id,
			},
			&core.DateField{
				Name:     "transfer_date",
				Required: true,
			},
			&core.TextField{
				Name: "reason",
			},
		)

		return app.Save(collection)
	}, func(app core.App) error {
		// add down queries...

		return nil
	})
}
