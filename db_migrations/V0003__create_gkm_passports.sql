-- Паспорт ГКМ (государственный кадастр месторождений) для комплекта.
-- Один паспорт на отчёт/комплект. Переменная часть полей — в JSONB data.

CREATE TABLE IF NOT EXISTS gkm_passports (
    report_id TEXT PRIMARY KEY,
    massif TEXT NOT NULL DEFAULT '',        -- код массива: A/B/V/G/D/E/Z/I ...
    data JSONB NOT NULL DEFAULT '{}'::jsonb, -- все поля паспорта
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
