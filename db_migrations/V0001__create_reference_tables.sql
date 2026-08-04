-- Общая база справочников: заказчики, исполнители, лицензии, контракты

CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL DEFAULT '',
    director TEXT NOT NULL DEFAULT '',
    inn TEXT NOT NULL DEFAULT '',
    address TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contractors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL DEFAULT '',
    director TEXT NOT NULL DEFAULT '',
    chief_geologist TEXT NOT NULL DEFAULT '',
    responsible TEXT NOT NULL DEFAULT '',
    executors JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS licenses (
    id TEXT PRIMARY KEY,
    number TEXT NOT NULL DEFAULT '',
    issue_date TEXT NOT NULL DEFAULT '',
    owner_id TEXT NOT NULL DEFAULT '',
    site_name TEXT NOT NULL DEFAULT '',
    use_type TEXT NOT NULL DEFAULT 'search_eval',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contracts (
    id TEXT PRIMARY KEY,
    number TEXT NOT NULL DEFAULT '',
    date TEXT NOT NULL DEFAULT '',
    name TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_licenses_number ON licenses(number);
CREATE INDEX IF NOT EXISTS idx_licenses_owner ON licenses(owner_id);
CREATE INDEX IF NOT EXISTS idx_customers_inn ON customers(inn);
