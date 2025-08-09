package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		// add up queries...
		superusers, err := app.FindCollectionByNameOrId(core.CollectionNameSuperusers)
		if err != nil {
			return err
		}
		record := core.NewRecord(superusers)
		record.Set("email", "admin@zahrawiclinic.com")
		record.Set("password", "changeme123")
		return app.Save(record)

	}, func(app core.App) error {
		// add down queries...

		return nil
	})
}
