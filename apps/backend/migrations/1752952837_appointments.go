package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		// add up queries...
		collection := core.NewBaseCollection("appointments")
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
			&core.DateField{
				Name:     "start_time",
				Required: true,
			},
			&core.DateField{
				Name: "end_time",
			},
			&core.SelectField{
				Name:     "status",
				Required: true,
				Values:   []string{"scheduled", "confirmed", "completed", "cancelled", "no_show"},
			},
			&core.TextField{
				Name: "reason",
				Max:  300,
			},
			&core.TextField{
				Name: "notes",
				Max:  1000,
			},
		)

		return app.Save(collection)
	}, func(app core.App) error {
		// add down queries...

		return nil
	})
}
