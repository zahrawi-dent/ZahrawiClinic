package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		// add up queries...
		collection := core.NewBaseCollection("organizations")
		usercollection, err := app.FindCollectionByNameOrId("users")
		if err != nil {
			return err
		}

		collection.Fields.Add(
			&core.TextField{
				Name:     "organization_name",
				Required: true,
				Max:      100,
			},
			&core.TextField{
				Name:     "address",
				Required: true,
				Max:      100,
			},
			&core.RelationField{
				Name:         "owners",
				Required:     true,
				CollectionId: usercollection.Id,
				MaxSelect:    20,
			},
		)
		return app.Save(collection)
	}, func(app core.App) error {
		// add down queries...

		return nil
	})
}
