POST /api/items - {"title":"Lesson Express","description":"Intro to routing","category":"lesson"} - 201 Created - Returns new row with "id": 1
POST /api/items - {"title":"Lesson Postgres"} - 201 Created
POST /api/items - {"description":"x"} - 400 Bad Request
GET /api/items - 200 OK
GET /api/items/1 - 200 OK - Returns item 1
GET /api/items/999 - 404 Not Found
PUT /api/items/1 - {"description":"Updated description"} - 200 OK
PUT /api/items/999 - {"title":"Nope"} - 404 Not Found
DELETE /api/items/1 - 200 OK - Returns the deleted row
DELETE /api/items/1 - 404 Not Found
GET /api/items - 200 OK
Restart server - GET /api/items - 200 OK
