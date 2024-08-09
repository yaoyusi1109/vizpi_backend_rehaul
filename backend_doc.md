

## Codes

| URL                  | Request Method | Description               | Path Parameters | Request Body Parameters | Expected Return Value             |
| -------------------- | -------------- | ------------------------- | --------------- | ----------------------- | --------------------------------- |
| `/api/v1/codes`      | GET            | List all codes            | -               | -                       | Array of code objects             |
| `/api/v1/codes/{id}` | GET            | Get a specific code by ID | `id`            | -                       | Code object with the specified ID |
| `/api/v1/codes`      | POST           | Create a new code         | -               | Code data               | Newly created code object         |
| `/api/v1/codes/{id}` | PUT            | Update an existing code   | `id`            | Code update data        | Updated code object               |
| `/api/v1/codes/{id}` | DELETE         | Delete a code by ID       | `id`            | -                       | Confirmation of deletion          |



## Instructors

| URL                                           | Request Method | Description                               | Path Parameters | Request Body Parameters                          | Expected Return Value                              |
| --------------------------------------------- | -------------- | ----------------------------------------- | --------------- | ------------------------------------------------ | -------------------------------------------------- |
| `/api/v1/instructors`                         | GET            | List all instructors                      | -               | -                                                | Array of instructor objects                        |
| `/api/v1/instructors/{instructorId}`          | GET            | Get a specific instructor by ID           | `instructorId`  | -                                                | Instructor object for the given ID                 |
| `/api/v1/instructors`                         | POST           | Create a new instructor                   | -               | Instructor details (e.g., `name`, `email`, etc.) | Newly created instructor object                    |
| `/api/v1/instructors/{instructorId}`          | PUT            | Update a specific instructor              | `instructorId`  | Updated instructor details                       | Updated instructor object                          |
| `/api/v1/instructors/{instructorId}`          | DELETE         | Delete a specific instructor              | `instructorId`  | -                                                | Confirmation of deletion                           |
| `/api/v1/instructors/{instructorId}/sessions` | GET            | Get all sessions created by an instructor | `instructorId`  | -                                                | Array of session objects created by the instructor |



## Session

| URL                                     | Request Method | Description                           | Path Parameters | Request Body Parameters                             | Expected Return Value                           |
| --------------------------------------- | -------------- | ------------------------------------- | --------------- | --------------------------------------------------- | ----------------------------------------------- |
| `/api/v1/sessions`                      | POST           | Create a new session                  | -               | Session details (e.g., `creater_id`, `title`, etc.) | Newly created session object                    |
| `/api/v1/sessions/{sessionId}`          | GET            | Get a specific session by ID          | `sessionId`     | -                                                   | Session object for the given ID                 |
| `/api/v1/sessions/{sessionId}`          | PUT            | Update a specific session             | `sessionId`     | Updated session details                             | Updated session object                          |
| `/api/v1/sessions/{sessionId}`          | DELETE         | Delete a specific session             | `sessionId`     | -                                                   | Confirmation of deletion                        |
| `/api/v1/sessions/{sessionId}/register` | POST           | Register a user in a session          | `sessionId`     | User data (e.g., `name`, `email`, etc.)             | Newly registered user object                    |
| `/api/v1/sessions/{sessionId}/groups`   | GET            | Get all groups in a session           | `sessionId`     | -                                                   | Array of group objects in the specified session |
| `/api/v1/sessions/{sessionId}/groups`   | DELETE         | Delete all groups in a session        | `sessionId`     | -                                                   | Confirmation of deletion                        |
| `/api/v1/sessions/{sessionId}/grouping` | get            | Group users by pass rate in a session | `sessionId`     | `groupSize`: number                                 | Array of created groups with member IDs         |



## Submission

| URL                                  | Request Method | Description                                                  | Path Parameters | Request Body Parameters                                      |
| ------------------------------------ | -------------- | ------------------------------------------------------------ | --------------- | ------------------------------------------------------------ |
| `/api/v1/submissions`                | GET            | List all submissions. Returns an array of submission objects. | -               | -                                                            |
| `/api/v1/submissions`                | POST           | Create a new submission. Returns the created submission object. | -               | Submission details (e.g., `userId`, `sessionId`, `content`, etc.) |
| `/api/v1/submissions/{submissionId}` | GET            | Get a specific submission by ID. Returns the submission object for the given ID. | `submissionId`  | -                                                            |
| `/api/v1/submissions/{submissionId}` | PUT            | Update a specific submission. Returns the updated submission object. | `submissionId`  | Updated submission details                                   |



## User

| URL                            | Request Method | Description                      | Path Parameters | Request Body Parameters                                |
| ------------------------------ | -------------- | -------------------------------- | --------------- | ------------------------------------------------------ |
| `/api/v1/users`                | GET            | List all users                   | -               | -                                                      |
| `/api/v1/users`                | POST           | Create a new user                | -               | User details (e.g., `name`, `email`, `group_id`, etc.) |
| `/api/v1/users/{userId}`       | GET            | Get details of a specific user   | `userId`        | -                                                      |
| `/api/v1/users/{userId}`       | PUT            | Update a specific user           | `userId`        | Updated user details (e.g., `name`, `email`, etc.)     |
| `/api/v1/users/{userId}`       | DELETE         | Delete a specific user           | `userId`        | -                                                      |
| `/api/v1/users/{userId}/codes` | GET            | Get codes created by a user      | `userId`        | -                                                      |
| `/api/v1/users/{userId}/group` | GET            | Get the group of a specific user | `userId`        | -                                                      |



## Groups

| URL                              | Request Method | Description                        | Path Parameters | Request Body Parameters | Expected Return Value                        |
| -------------------------------- | -------------- | ---------------------------------- | --------------- | ----------------------- | -------------------------------------------- |
| `/api/v1/groups/{groupId}/users` | GET            | Get all users in a specified group | `groupId`       | -                       | Array of user objects in the specified group |

## Chat

| URL                                          | Request Method | Description                             | Parameters                                              |
| -------------------------------------------- | -------------- | --------------------------------------- | ------------------------------------------------------- |
| `/api/v1/chat`                               | POST           | Send a new message                      | `message`: JSON object,  `code`: JSON object (optional) |
| `/api/v1/chat/group/{groupId}/user/{userId}` | GET            | Retrieve messages for a user in a group | `groupId`, `userId`                                     |





