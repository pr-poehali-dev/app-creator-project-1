-- Ручные (пользовательские) пункты содержания.
-- Такой пункт активируется в отчёте и обязателен к заполнению.

CREATE TABLE IF NOT EXISTS report_contents_custom (
    report_id TEXT PRIMARY KEY,
    data JSONB NOT NULL DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
