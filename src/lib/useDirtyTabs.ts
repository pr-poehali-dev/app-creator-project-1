import { useEffect, useState } from "react";
import { dirtyKeys, dirtyTabs, subscribeDrafts } from "./draftRegistry";

// Ключи разделов (черновиков) с несохранёнными правками.
export function useDirtyKeys(): Set<string> {
  const [keys, setKeys] = useState<Set<string>>(() => new Set(dirtyKeys()));

  useEffect(() => {
    const update = () => setKeys(new Set(dirtyKeys()));
    update();
    return subscribeDrafts(update);
  }, []);

  return keys;
}

// Отдаёт вкладки отчёта с несохранёнными правками и обновляется,
// когда любой раздел меняет состояние черновика.
export function useDirtyTabs(): Set<string> {
  const [tabs, setTabs] = useState<Set<string>>(() => dirtyTabs());

  useEffect(() => {
    const update = () => setTabs(dirtyTabs());
    update();
    return subscribeDrafts(update);
  }, []);

  return tabs;
}