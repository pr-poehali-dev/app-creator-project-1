import { useCallback, useEffect, useState } from "react";
import type { Customer, Contractor, License, Contract } from "@/types/geo";
import {
  fetchReferences, upsertReference, deleteReference,
  type ReferencesData, type RefKind,
} from "./referencesApi";

const EMPTY: ReferencesData = { customers: [], contractors: [], licenses: [], contracts: [] };

// Загружает общую базу справочников и даёт методы сохранения/удаления.
// Обновление оптимистичное: сразу меняем локальный state, затем пишем в БД.
export function useReferences() {
  const [data, setData] = useState<ReferencesData>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetchReferences()
      .then((d) => { if (alive) setData(d); })
      .catch((e) => { if (alive) setError(String(e?.message || e)); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  const save = useCallback(async <T extends { id: string }>(kind: RefKind, item: T) => {
    setData((prev) => {
      const list = prev[kind] as T[];
      const exists = list.some((x) => x.id === item.id);
      const next = exists ? list.map((x) => (x.id === item.id ? item : x)) : [...list, item];
      return { ...prev, [kind]: next };
    });
    try {
      await upsertReference(kind, item);
    } catch (e) {
      setError(String((e as Error)?.message || e));
    }
  }, []);

  const remove = useCallback(async (kind: RefKind, id: string) => {
    setData((prev) => ({ ...prev, [kind]: (prev[kind] as { id: string }[]).filter((x) => x.id !== id) }));
    try {
      await deleteReference(kind, id);
    } catch (e) {
      setError(String((e as Error)?.message || e));
    }
  }, []);

  return {
    customers: data.customers as Customer[],
    contractors: data.contractors as Contractor[],
    licenses: data.licenses as License[],
    contracts: data.contracts as Contract[],
    loading,
    error,
    save,
    remove,
  };
}
