package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		// add up queries...
		collection := core.NewBaseCollection("patients")
		clinicsCollection, err := app.FindCollectionByNameOrId("clinics")
		if err != nil {
			return err
		}

		collection.Fields.Add(
			&core.TextField{
				Name:     "first_name",
				Required: true,
				Max:      100,
			},
			&core.TextField{
				Name:     "last_name",
				Required: true,
				Max:      100,
			},
			&core.SelectField{
				Name:     "sex",
				Required: true,
				Values:   []string{"male", "female"},
			},
			&core.RelationField{
				Name:         "primary_clinic",
				Required:     true,
				CollectionId: clinicsCollection.Id,
			},
			&core.DateField{
				Name:     "dob",
				Required: true,
			},
			&core.TextField{
				Name:     "phone",
				Required: true,
			},
			&core.EmailField{
				Name: "email",
			},
			&core.TextField{
				Name: "address",
			},
			&core.TextField{
				Name: "medical_history",
			},
		)

		return app.Save(collection)
	}, func(app core.App) error {
		// add down queries...

		return nil
	})
}
