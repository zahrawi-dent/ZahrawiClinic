/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "n7rbgjvx1oe6tk9",
    "created": "2023-09-26 12:19:10.111Z",
    "updated": "2023-09-26 12:19:10.111Z",
    "name": "dental_charts",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "qwzpcjrm",
        "name": "patient",
        "type": "relation",
        "required": true,
        "unique": false,
        "options": {
          "collectionId": "patients",
          "cascadeDelete": true,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": ["firstName", "lastName"]
        }
      },
      {
        "system": false,
        "id": "vmjwqkcu",
        "name": "chartData",
        "type": "json",
        "required": false,
        "unique": false,
        "options": {}
      }
    ],
    "indexes": [
      {
        "name": "unique_patient_chart",
        "type": "unique",
        "columns": ["patient"]
      }
    ],
    "listRule": "",
    "viewRule": "",
    "createRule": "",
    "updateRule": "",
    "deleteRule": "",
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("n7rbgjvx1oe6tk9");

  return dao.deleteCollection(collection);
}); 