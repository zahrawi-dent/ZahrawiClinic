package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		// add up queries...
		collection := core.NewBaseCollection("treatments_catalog")

		collection.Fields.Add(
			&core.TextField{
				Name:     "name",
				Required: true,
				Max:      100,
			},
			&core.TextField{
				Name:     "description",
				Required: false,
				Max:      300,
			},
			&core.NumberField{
				Name:     "default_price",
				Required: true,
			},
		)
		return app.Save(collection)
		return nil
	}, func(app core.App) error {
		// add down queries...

		return nil
	})
}
