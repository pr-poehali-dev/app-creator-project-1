-- Отчёты (комплекты). Карточка отчёта: поля ReportData хранятся в JSONB data,
-- т.к. модель активно развивается. Блоки отчёта (реферат, изученность, текст и т.д.)
-- будут храниться в отдельных таблицах report_* следующими этапами.

CREATE TABLE IF NOT EXISTS reports (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL DEFAULT '',
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reports_created ON reports(created_at);
