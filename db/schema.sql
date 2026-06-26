-- Synesthetic Minds — Neon schema
-- Eén algemene gebeurtenissenstroom. Niet één tabel per ding dat we toevallig
-- meten, maar één tabel waar elke actie in landt, onderscheiden door `event`.
-- Een UTM is een label dat op elke URL of actie past, dus de logging is ook
-- algemeen: een nieuwe meting is een nieuwe `event`-naam of een nieuwe getrackte
-- link, geen nieuwe tabel en geen migratie.
--
-- Gevoed door:
--   middleware.ts          -> event 'visit'  (paginabezoek met UTM)
--   POST /api/event        -> on-page acties (bv. 'save'), via sendBeacon
--   GET  /api/go           -> getrackte links/downloads, logt en redirect
--   submitScan (action)    -> event 'submit' (met email + consent in de rij)
--
-- Uitvoeren in de Neon SQL Editor, of via:
--   psql "$DATABASE_URL" -f db/schema.sql

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS events (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ts           TIMESTAMPTZ NOT NULL DEFAULT now(),
  event        TEXT NOT NULL,          -- 'visit' | 'save' | 'submit' | wat je morgen verzint
  path         TEXT,                   -- waar het gebeurde
  locale       TEXT,
  utm_source   TEXT,
  utm_medium   TEXT,
  utm_campaign TEXT,
  utm_content  TEXT,
  referer      TEXT,
  ua_hash      TEXT,                    -- korte UA-vingerafdruk, geen cookie
  email        TEXT,                    -- alleen op lead-dragende events
  consent      BOOLEAN,                 -- alleen op 'submit'
  meta         JSONB                    -- alles wat je later wilt vastleggen
);

CREATE INDEX IF NOT EXISTS events_event_ts_idx ON events (event, ts DESC);
CREATE INDEX IF NOT EXISTS events_utm_idx      ON events (utm_campaign, utm_content);
CREATE INDEX IF NOT EXISTS events_email_idx    ON events (email) WHERE email IS NOT NULL;
