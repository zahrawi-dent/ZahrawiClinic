package migrations

import (
    "github.com/pocketbase/pocketbase/core"
    m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
    m.Register(func(app core.App) error {
        // add up queries...
        collection := core.NewBaseCollection("dental_charts")

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
        if err != nil {
            // appointments may not exist in early migrations; ignore if not found
            appointmentsCollection = nil
        }

        collection.Fields.Add(
            &core.RelationField{
                Name:         "patient",
                Required:     true,
                CollectionId: patientsCollection.Id,
            },
            &core.RelationField{
                Name:         "doctor",
                Required:     false,
                CollectionId: dentistsCollection.Id,
            },
            &core.RelationField{
                Name:         "clinic",
                Required:     true,
                CollectionId: clinicsCollection.Id,
            },
        )

        if appointmentsCollection != nil {
            collection.Fields.Add(
                &core.RelationField{
                    Name:         "appointment",
                    Required:     false,
                    CollectionId: appointmentsCollection.Id,
                },
            )
        }

        collection.Fields.Add(
            &core.SelectField{
                Name:     "chart_type",
                Required: true,
                Values:   []string{"initial", "progress", "recall", "pre_op", "post_op"},
            },
            &core.SelectField{
                Name:     "notation_system",
                Required: true,
                Values:   []string{"universal", "fdi", "palmer"},
            },
            &core.SelectField{
                Name:     "dentition",
                Required: true,
                Values:   []string{"permanent", "primary", "mixed"},
            },
            &core.JSONField{
                Name:     "chart_state",
                Required: true,
            },
            &core.TextField{
                Name:     "notes",
                Required: false,
                Max:      2000,
            },
            &core.FileField{
                Name:         "images",
                Required:     false,
                MaxSelect:    10,
                MaxSize:      10 * 1024 * 1024, // 10MB per file
                MimeTypes:    []string{"image/png", "image/jpeg", "image/webp"},
                Thumbs:       []string{"100x100", "800x800"},
                Protected:    false,
                WithoutAuth:  false,
            },
        )

        return app.Save(collection)
    }, func(app core.App) error {
        // add down queries...
        // PocketBase migratecmd doesn't support automatic down for collection removal here; no-op
        return nil
    })
}


