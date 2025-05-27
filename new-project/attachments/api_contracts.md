# API Contracts (v0)

## Auth
| Verb | Path | Body | Success Response |
|------|------|------|------------------|
| POST | /api/auth/register | `{ email, password }` | 201 `{ token }` |
| POST | /api/auth/login    | `{ email, password }` | 200 `{ token }` |
| POST | /api/auth/forgot   | `{ email }`           | 204 (no body)   |
| POST | /api/auth/reset    | `{ token, password }` | 200 `{ token }` |

## Projects
| Verb | Path | Body | Response |
|------|------|------|----------|
| POST   | /api/projects            | `{ name }`                          | 201 `{ project }` |
| GET    | /api/projects            | –                                   | 200 `[projects]`  |
| PATCH  | /api/projects/:id        | `{ name }`                          | 200 `{ project }` |
| DELETE | /api/projects/:id        | –                                   | 204 |

## Tasks
| Verb | Path | Body | Response |
|------|------|------|----------|
| POST   | /api/projects/:id/tasks | `{ title }` | 201 `{ task }` |
| PATCH  | /api/tasks/:id          | `{ title?, status?, ownerId?, visibility? }` | 200 `{ task }` |
| DELETE | /api/tasks/:id          | – | 204 |

## Admin – Success Factors
| Verb | Path | Body | Response |
|------|------|------|----------|
| GET  | /api/admin/factors        | –                     | 200 `[factors]` |
| POST | /api/admin/factors        | `{ name, description }` | 201 `{ factor }` |
| PATCH| /api/admin/factors/:id    | `{ name?, description? }` | 200 `{ factor }` |
| DELETE| /api/admin/factors/:id   | –                     | 204 |