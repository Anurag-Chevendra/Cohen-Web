# Cohen API reference

Base URL: `https://api.snappyfeet.org`. Every request carries `Authorization: Bearer <key>`. Get a key at https://console.snappyfeet.org.
Human version: https://cohen.snappyfeet.org/api.html

Every version on npm has one address. `GET` reads whatever is known. `POST` puts it in the sandbox queue. Same path, both directions.

## Quickstart

Sign in with Google, create a key, read a verdict. No card, no waiting.

THREE STEPS 60 SECONDS:
```
# 1. Get a key at https://console.snappyfeet.org
export COHEN_KEY=cohen_live_...

# 2. Check it works. This endpoint is free and never metered.
curl -H "Authorization: Bearer $COHEN_KEY" \
  https://api.snappyfeet.org/api/key

# 3. Read a verdict.
curl -H "Authorization: Bearer $COHEN_KEY" \
  https://api.snappyfeet.org/api/package/npm/left-pad/1.3.0
```

## Authentication

Every request carries a key. Keys begin `cohen_live_`.

| Property | Behaviour |
|---|---|
| Lifetime | Seven days on Free, ninety on Individual. Extend at any time from the console. |
| Grace | After expiry a key keeps reading verdicts for 48 hours, then stops. Queueing stops immediately. |
| Storage | Shown once, stored as a hash. Lost keys cannot be recovered, only revoked and replaced. |
| Revocation | Takes effect within one minute. |

> **Keys are secrets.** Keep them out of public repositories and client side code. Give CI its own key so it can be revoked alone.

HEADER REQUIRED:
```
Authorization: Bearer cohen_live_1WbwMTf2vx0t2NUWuZYSS3oQP26mU4JL...

# the scheme is optional, so this also works
Authorization: cohen_live_1WbwMTf2vx0t2NUWuZYSS3oQP26mU4JL...
```

## Conventions

| Item | Value |
|---|---|
| Base URL | `https://api.snappyfeet.org`. HTTPS only. Plain HTTP is refused rather than redirected. |
| Content type | `application/json` on any request with a body. Every response is JSON, errors included. |
| Timestamps | `analyzed_at` is epoch seconds. |
| Scoped names | Both spellings work. `@types/node` and `@types%2Fnode` resolve to the same package. |
| Ecosystems | `npm` today. The path carries the ecosystem so others can be added without a new shape. |

## Plans and limits

| Plan | Scopes | Lookups | Analyses | Keys |
|---|---|---|---|---|
| Free | `read` | 100 per day | none | 1 |
| Demo | `read queue evidence feed` | unmetered | 250 per month | 3 |
| Individual | `read queue evidence` | unmetered | 150 per month | 5 |

Reading is free. Only a version nobody has analysed costs an analysis. Demo access is by invitation; redeem a code at [console.snappyfeet.org/demo](https://console.snappyfeet.org/demo).

## Packages

**GET `/api/package/npm/{name}/{version}`**  (free, live)

One verdict. Never costs an analysis.

200 OK:
```
curl -H "Authorization: Bearer $COHEN_KEY" \
  https://api.snappyfeet.org/api/package/npm/@agimon-ai/doompi-help/0.0.1-alpha.26

{
  "ecosystem": "npm",
  "name": "@agimon-ai/doompi-help",
  "version": "0.0.1-alpha.26",
  "verdict": "clean",
  "analyzed_at": 1788180250
}

// 404 when nobody has run it. Yours to decide whether to spend an analysis.
{ "verdict": "unknown", "name": "left-pad", "version": "1.3.0" }
```

**GET `/api/package/npm/{name}`**  (free, live)

Every analysed version of a package, newest first.

**GET `/api/package/npm/{name}/{version}/evidence`**  (evidence scope, soon)

The full trace: syscalls, process tree, connections, file hashes, entropy. Large, so it is a second request rather than a bloated first one.

**POST `/api/package/npm/{name}/{version}`**  (queue scope, soon)

Queue a deep analysis. Charged only when the version is genuinely unknown. Posting something already analysed returns `200` and the cached verdict. Posting something already queued returns the existing job. You cannot pay twice for the same version.

202 ACCEPTED:
```
curl -X POST -H "Authorization: Bearer $COHEN_KEY" \
  https://api.snappyfeet.org/api/package/npm/tiny-parse/0.2.1

{
  "job": "job_01HXY5K9PNQE3",
  "state": "queued",
  "queue_position": 4,
  "eta_seconds": 180,
  "poll": "/api/job/job_01HXY5K9PNQE3",
  "allowance": { "used": 137, "limit": 150 }
}
```

## Bulk submit

**POST `/api/package/npm`**  (read scope, queue scope to queue, live)

Send a whole dependency tree in one call. The response splits it into what is already known and what had to be queued, so you can act on the known part immediately. This is what Mantis uses.

Any key can check a tree with `queue_unknown: false`. On Free, each package in the request counts as one lookup, charged all at once and only when the whole tree fits in what is left today; otherwise nothing is charged and the request returns `429 daily_cap`. Queueing unknown versions needs the `queue` scope.

| Field or header | Effect |
|---|---|
| versions[] | Up to 5,000 per request, as `name@version`. |
| queue_unknown | `false` gives a pure read. You are told what is unknown and no analysis is charged. Free keys must send `false`. |
| skip_private | Names that do not resolve on the public registry are counted as skipped and never leave your side of the wire. |
| Idempotency‑Key | A retried request reuses the original reservation instead of charging twice. |
| X‑Project | Labels the run in your console history. |
| X‑Client | Set to `mantis` to mark the source. |

Every bulk submit becomes one scan in [your history](https://console.snappyfeet.org/scans), with its counts and findings kept.

207 MULTI STATUS:
```
curl -X POST -H "Authorization: Bearer $COHEN_KEY" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: build-4471" \
  -H "X-Project: checkout-api" \
  -d @tree.json https://api.snappyfeet.org/api/package/npm

// body
{
  "versions": [ "left-pad@1.3.0", "@types/node@20.11.5" ],
  "queue_unknown": true,
  "skip_private": true
}

// response
{
  "scan": "1f9c0a2e...",
  "counts": { "clean": 1271, "review": 2, "queued": 11, "skipped": 0 },
  "review": [ { "name": "polymarket-stake-mathss", "version": "3.5.2" } ],
  "queued": [ { "name": "tiny-parse", "version": "0.2.1", "job": "job_01HXY..." } ],
  "allowance": { "used": 148, "limit": 150 }
}
```

## Jobs

**GET `/api/job/{job}`**  (free)

State of one queued analysis: queued, running, done or failed. Polling is free.

## Observability

A different product on a different meter: requests, not analyses. It reads the same records the scanner writes, so nothing is recomputed for it. Access needs the `feed` scope, which is sold separately.

**GET `/api/observatory/records`**  (feed scope, soon)

| Query | Meaning |
|---|---|
| ?since= | Opaque cursor from the previous page. Stable across reruns and will not skip a record written out of order. |
| ?verdict= | `clean`, `review` or `unknown`. Omit to get everything, which is what makes the feed usable as a baseline. |
| ?limit= | 1 to 1,000. Defaults to 100. |

**GET `/api/observatory/indicator/{type}/{value}`**  (feed scope, soon)

Reverse lookup. Give it a C2 host or a file hash, get every package version that touched it. Types are `host`, `domain`, `sha256` and `path`.

200 OK:
```
curl -H "Authorization: Bearer $COHEN_KEY" \
  "https://api.snappyfeet.org/api/observatory/indicator/host/45.61.136.12"

{
  "indicator": { "type": "host", "value": "45.61.136.12" },
  "first_seen": "2026-08-31T09:14:22Z",
  "packages": [
    { "name": "polymarket-stake-mathss", "version": "3.5.2", "by": "node postinstall.js" }
  ]
}
```

## Webhooks

**POST `/api/webhook`**  (queue scope, soon)

Register a callback for when a package you watch flips to review. The response carries a signing secret, shown once. HTTPS URLs only.

201 CREATED:
```
curl -X POST -H "Authorization: Bearer $COHEN_KEY" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com/hooks/cohen"}' \
  https://api.snappyfeet.org/api/webhook

{
  "id": "9f2c...",
  "url": "https://example.com/hooks/cohen",
  "events": [ "verdict.review" ],
  "secret": "whsec_..."
}
```

## Account

**GET `/api/key`**  (free, live)

Your plan, usage and reset date. Never counted against anything, so it is safe as a health check in scripts.

200 OK:
```
curl -H "Authorization: Bearer $COHEN_KEY" https://api.snappyfeet.org/api/key

{
  "tier": "individual",
  "analyses": { "used": 137, "limit": 150, "resets": "2026-10-01" },
  "lookups_today": { "used": 42, "limit": null },
  "key": { "scopes": ["read","queue","evidence"], "in_grace": false }
}
```

**GET `/api/plans`**  (no key, live)

The current price list. Unauthenticated, because it is public information.

## Verdict object

REVIEW The sandbox saw behaviour a human should look at. Never a claim of malice, always a pointer to evidence. CLEAN It ran, and nothing correlated. Recorded with a timestamp, because clean in August is not clean in October if the version was republished.

| Field | Meaning |
|---|---|
| verdict | `clean`, `review` or `unknown`. Never a score. A number would imply a confidence nobody can honestly give. |
| analyzed_at | Epoch seconds. When the sandbox ran, not when you asked. |
| ecosystem | `npm`. |
| name, version | As analysed. A scoped name comes back with its slash decoded. |

## Errors

Every error is JSON with a stable `error` code and a message written for a person. Branch on the code, never the message.

| Code | Status | Meaning |
|---|---|---|
| missing_key | 401 | No `Authorization` header. |
| invalid_key | 401 | Malformed or unrecognised. Checked before any lookup, so a typo never reaches the database. |
| key_expired | 401 | Past its grace window. Extend it in the console. |
| key_expired_grace | 403 | Expired but still reading. Queueing is refused. |
| account_suspended | 403 | Contact support. |
| scope_required | 403 | Your key cannot do this. Free keys read only. |
| paid_key_required | 403 | Evidence traces need a paid plan. |
| allowance_spent | 403 | Monthly analyses used. Nothing auto upgrades. |
| bad_path | 400 | The path is not a name and a version. |
| bad_json | 400 | Body is not valid JSON. |
| empty_body | 400 | `versions` is missing or empty. |
| too_many | 400 | Over 5,000 versions in one request. |
| bad_url | 400 | Webhook URL is not HTTPS. |
| bad_indicator | 400 | Type is not host, domain, sha256 or path. |
| unknown | 404 | Not an error code but a verdict. Nobody has analysed it. |
| not_in_registry | 404 | npm has never heard of it either. |
| no_such_job | 404 | No job with that id. |
| daily_cap | 429 | Free keys read 100 verdicts a day. `Retry‑After` is set. |
| rate_limited | 429 | Too many requests. Back off rather than retrying tightly. |
| sandbox_saturated | 503 | Queueing is unavailable. Reads keep working and nothing is charged. |
| verdict_store_unavailable | 503 | We could not reach the verdict store. This is not a statement about the package. |

> **Do not treat 503 as clean.** `verdict_store_unavailable` means we could not check, which is different from checking and finding nothing. Caching it as a pass is the wrong way to fail.

SHAPE ALL ERRORS:
```
{ "error": "scope_required",
  "message": "This endpoint needs the 'queue' scope." }
```

## Status

| Surface | State |
|---|---|
| Reading verdicts | live Free and paid keys. |
| Bulk submit, read only | live With `queue_unknown: false`. |
| Account and plans | live |
| Queueing analyses | soon Returns `503` until the sandbox queue is connected. |
| Evidence traces | soon |
| Observability feed | soon |
| Webhooks | soon Registration works, delivery does not. |
