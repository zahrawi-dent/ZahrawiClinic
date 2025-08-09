package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		// add up queries...
		collection := core.NewBaseCollection("clinics")
		orgCollection, err := app.FindCollectionByNameOrId("organizations")
		if err != nil {
			return err
		}

		collection.Fields.Add(
			&core.TextField{
				Name:     "clinic_name",
				Required: true,
				Max:      100,
			},
			&core.RelationField{
				Name:         "organization",
				Required:     true,
				CollectionId: orgCollection.Id,
			},
			&core.TextField{
				Name:     "address",
				Required: true,
				Max:      100,
			},
			&core.GeoPointField{
				Name: "geo_address",
			},
			&core.TextField{
				Name:     "phone",
				Required: true,
				Max:      100,
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
