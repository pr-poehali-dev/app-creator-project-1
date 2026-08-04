-- Подписи разделов отчёта (авторы/составители по каждой вкладке).
-- Ключ: отчёт + идентификатор вкладки.

CREATE TABLE IF NOT EXISTS report_section_meta (
    report_id TEXT NOT NULL,
    tab_id TEXT NOT NULL,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (report_id, tab_id)
);
