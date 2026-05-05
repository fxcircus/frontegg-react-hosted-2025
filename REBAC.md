# ReBAC Demo Guide

Relationship-Based Access Control (ReBAC) lets you grant access by modeling
relationships between users and resources rather than assigning static roles.
This guide covers how the demo is built, how to set it up, and a short
walkthrough script you can use when presenting it.

> 📚 **Frontegg ReBAC documentation:** <https://developers.frontegg.com/guides/authorization/rebac>
>
> **Looking for general setup?** See the main [README](README.md). This file
> only covers ReBAC-specific configuration and demo flow.

---

## What this demo shows

A document management app where every document has owners, editors, and
viewers. Permissions are evaluated by Frontegg's local **Entitlements Agent**
(an OPA-based PDP) against relationships you define in your Frontegg
workspace.

| Concept           | In this demo                                                |
| ----------------- | ----------------------------------------------------------- |
| **Subject**       | A logged-in Frontegg user                                   |
| **Resource**      | A `document` (5 seeded examples: `doc-001`–`doc-005`)       |
| **Relations**     | `owner`, `editor`, `viewer`                                 |
| **Actions**       | `read`, `write`, `share`, `delete`                          |
| **PDP**           | `frontegg/entitlements-agent` Docker container on `:8181`   |

Action → relation mapping:

| Action   | Granted to                   |
| -------- | ---------------------------- |
| `read`   | `owner` + `editor` + `viewer` |
| `write`  | `owner` + `editor`            |
| `share`  | `owner`                      |
| `delete` | `owner`                      |

---

## Setup

You can provision the schema in Frontegg either way:

### Option A — Automated (recommended)

The repo ships with a script that creates entity types, relations, and
actions via the Frontegg API. It reads credentials from `backend/.env`
(no secrets passed on the command line).

Required vars in `backend/.env`:

```env
FRONTEGG_BASE_URL=https://app-xxx.<region>.frontegg.com
FRONTEGG_REGION=us  # or eu, au, ca
FRONTEGG_API_TOKEN_CLIENT_ID=<vendor M2M client id>
FRONTEGG_API_TOKEN_SECRET=<vendor M2M secret>
FRONTEGG_APP_ID=<your app id — must match REACT_APP_APP_ID in frontend/.env>
```

Get the M2M credentials from **Frontegg Portal → Settings → API Tokens →
Environment**. Get `FRONTEGG_APP_ID` from your application's settings page.

Then from `backend/`:

```bash
npm run rebac:setup     # creates user + document entities, relations, actions
npm run rebac:teardown  # removes them
```

After setup, restart the agent so it picks up the new schema:

```bash
npm run docker:down && npm run docker:up
```

### Option B — Manual via Frontegg Portal

1. Log in to **[portal.frontegg.com](https://portal.frontegg.com)**.
2. Navigate to **[ENVIRONMENT] → Entitlements → ReBAC → Entity tab**.
3. Click **Add entity** and create two entities:

   | Entity key  | Description                              |
   | ----------- | ---------------------------------------- |
   | `user`      | Subject of relations                     |
   | `document`  | Sample document for ReBAC demo           |

4. On the `document` entity, add three relations (subject = `user`):

   | Relation key | Subject |
   | ------------ | ------- |
   | `owner`      | `user`  |
   | `editor`     | `user`  |
   | `viewer`     | `user`  |

5. On the `document` entity, add four actions:

   | Action key | Granted to                       |
   | ---------- | -------------------------------- |
   | `read`     | `owner`, `editor`, `viewer`      |
   | `write`    | `owner`, `editor`                |
   | `share`    | `owner`                          |
   | `delete`   | `owner`                          |

6. Save, then restart the agent: `npm run docker:down && npm run docker:up`.

---

## Bundle propagation

> **Heads up:** when you create a brand-new ReBAC schema or add new relation
> assignments, Frontegg's bundle service can take **several minutes** to
> regenerate the bundle the local agent pulls. During that window the agent
> may return `MISSING_RELATION` even though your relations exist (visible in
> the Associations tab of the portal).
>
> The backend handles this gracefully by falling back to local ownership
> checks. Look for these lines in the backend log:
>
> ```
> [ReBAC] Agent says MISSING_RELATION for doc=doc-001 ... — falling back to ownership
> [ReBAC] Fallback GRANTED (ownership: match)
> ```
>
> Once the bundle propagates, you'll see clean `[ReBAC] Permission result: GRANTED` lines instead.

---

## Demo script (~3 minutes)

Use this when presenting. Each step builds on the previous one.

### 0. Setup (off-camera)

Have the app running (`npm start`) and be logged in. Open two tabs side by
side:

- **Tab 1:** the running app at `http://localhost:4500/` on the **ReBAC (FGA)**
  page.
- **Tab 2:** Frontegg portal at **Entitlements → ReBAC** on the **Entity** tab.

### 1. "Here's the model" (~30 sec)

Switch to **Tab 2 (portal)** and walk through the schema:

> "Frontegg's ReBAC lets us define our domain in declarative terms. We have a
> `document` entity with three relations — owner, editor, viewer — and four
> actions: read, write, share, delete. The action-to-relation mapping is
> right there: owner can do everything, editor can read and write, viewer
> can only read. This is the policy. It lives in Frontegg, not in our app
> code."

Click into the `document` entity to show the relations and actions.

### 2. "Here are the live relationships" (~20 sec)

Click the **Associations** tab in the portal.

> "Each row here is a real relationship between a user and a document. When
> our app calls `assign`, this is what gets created. Five rows here are from
> the seed I just ran — I'm the owner of all five test documents."

### 3. "Here's the user experience" (~45 sec)

Switch to **Tab 1 (app)** on the ReBAC page.

> "On the left we have all the documents in the database — this view bypasses
> permissions, just to show what exists. The middle column is what *I* see —
> filtered by the agent based on my relationships. Right now I own all five,
> so I see all five."

Click a document to open the detail panel:

> "Notice the permissions panel — read, write, share, delete are all
> available because I'm the owner. If I were a viewer, only read would be
> shown. These badges aren't from a hardcoded role — they're real-time
> entitlement checks against the agent."

### 4. "Here's how sharing works" (~30 sec)

Click the **Share** icon (🔗) on a document, then close the dialog without
sharing (or share with a real second user if you have one ready).

> "Sharing is just creating a new relationship — `user X is editor of
> document Y`. The backend hits Frontegg's relation API, which writes the
> association you saw in the portal earlier. The Entitlements Agent picks
> it up on its next bundle sync, and from that moment the second user can
> read or write the doc."

### 5. "Here's why this matters" (~30 sec)

Open `backend/src/middleware/rebac.js` (split-screen if comfortable):

> "From the application's perspective, the permission check is one call.
> The agent runs locally as a sidecar, so checks are sub-millisecond — no
> round-trip to Frontegg on the hot path. Policy lives in Frontegg, data
> lives in the agent's bundle, decisions happen at the edge. That's the
> ReBAC value prop in three lines."

### 6. (Optional) "What if Frontegg is unreachable?" (~15 sec)

Stop the agent (`docker stop frontegg-entitlements-agent`) and refresh:

> "The backend falls back to local ownership data so users keep working.
> Production systems would tune this differently — fail closed for some
> actions, fail open for read on owned resources, etc. The point is the
> integration gives you the hooks to make that decision."

Restart the agent before moving on (`docker start frontegg-entitlements-agent`).

---

## How the code is organized

| File                                          | Role                                                    |
| --------------------------------------------- | ------------------------------------------------------- |
| `backend/src/middleware/rebac.js`             | Calls the agent; falls back to local ownership          |
| `backend/src/services/frontegg.js`            | Talks to Frontegg API to assign / revoke relations      |
| `backend/src/controllers/documents.js`        | CRUD + seed; calls `assignOwner` after document create  |
| `backend/scripts/setup-rebac.js`              | Provisions schema via Frontegg API                      |
| `backend/scripts/teardown-rebac.js`           | Removes schema via Frontegg API                         |
| `frontend/src/components/DocumentManager/`    | UI: list, detail, share dialog                          |

---

## API endpoints

### Documents
| Method | Path                                | Permission required |
| ------ | ----------------------------------- | ------------------- |
| `POST` | `/api/documents`                    | (creates as owner)  |
| `GET`  | `/api/documents`                    | filtered by `read`  |
| `GET`  | `/api/documents/:id`                | `read`              |
| `PUT`  | `/api/documents/:id`                | `write`             |
| `DELETE` | `/api/documents/:id`              | `delete`            |
| `POST` | `/api/documents/:id/share`          | `share`             |
| `DELETE` | `/api/documents/:id/share/:userId` | `share`           |

### Permission introspection
- `POST /api/permissions/check` — single permission check (used by the detail panel)
- `POST /api/permissions/check-all` — bulk check across all docs

### Demo / admin (bypass entitlements)
- `GET /api/documents/admin/all` — list all docs
- `DELETE /api/documents/admin/all` — wipe
- `POST /api/documents/admin/seed` — re-seed `doc-001`–`doc-005`

---

## Troubleshooting

**"You don't have access to any documents" but the agent is up**
The bundle hasn't propagated relations yet. Look for `MISSING_RELATION` in
the backend log — that confirms the schema is live but assignments aren't.
Wait a few minutes and reload, or restart the agent
(`npm run docker:down && npm run docker:up`).

**`ECONNREFUSED ::1:8181` flood in the backend log**
The agent container died. Run `docker ps` — if `frontegg-entitlements-agent`
isn't there, `cd backend && docker-compose up -d`. The backend's catch
block falls back to local ownership, so the UI keeps working, but the
log noise comes from the e10s-client library logging the error before it
re-throws.

**Setup script returns 403 "WAF blocked"**
The schema endpoints live on the regional API host
(`api.<region>.frontegg.com`), not on the workspace URL. The script handles
this — make sure `FRONTEGG_REGION` is set correctly in `backend/.env`.

**JWT verification fails with "audience invalid"**
`FRONTEGG_APP_ID` in `backend/.env` must match the `REACT_APP_APP_ID` in
`frontend/.env`. Frontegg user JWTs carry the app ID in the `aud` claim,
not the client ID.
