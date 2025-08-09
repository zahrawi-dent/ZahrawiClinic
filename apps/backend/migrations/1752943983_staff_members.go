package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		collection := core.NewBaseCollection("staff_members")

		usersCollection, err := app.FindCollectionByNameOrId("users")
		if err != nil {
			return err
		}
		orgsCollection, err := app.FindCollectionByNameOrId("organizations")
		if err != nil {
			return err
		}
		clinicsCollection, err := app.FindCollectionByNameOrId("clinics")
		if err != nil {
			return err
		}
		collection.Fields.Add(
			&core.RelationField{
				Name:         "user",
				Required:     true,
				CollectionId: usersCollection.Id,
			},
			&core.RelationField{
				Name:         "organization",
				Required:     true,
				CollectionId: orgsCollection.Id,
			},
			&core.RelationField{
				Name:         "clinic",
				Required:     true,
				CollectionId: clinicsCollection.Id,
			},
			&core.SelectField{
				Name:        "role",
				Required:    true,
				Presentable: true,
				Values: []string{
					"org_admin",
					"clinic_manager",
					"dentist",
					"receptionist",
				},
			},
			&core.BoolField{
				Name:     "is_active",
				Required: true,
			},
		)
		return app.Save(collection)
	}, func(app core.App) error {
		// add down queries...

		return nil
	})
}
