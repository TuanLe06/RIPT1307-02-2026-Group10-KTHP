import { useState } from 'react';

export type ColumnConfigOption = {
  key: string;
  label: string;
};

export const loadColumnConfig = (
  storageKey: string,
  defaultKeys: string[],
): string[] => {
  try {
    const raw = localStorage.getItem(storageKey);
    const parsed = raw ? JSON.parse(raw) : null;
    if (Array.isArray(parsed) && parsed.some((key) => defaultKeys.includes(key))) {
      return parsed.filter((key) => defaultKeys.includes(key));
    }
  } catch {
    // Fall back to defaults.
  }
  return defaultKeys;
};

export const orderColumnsByKeys = <T extends { key?: string | number }>(
  columns: T[],
  keys: string[],
): T[] =>
  keys
    .map((key) => columns.find((column) => String(column.key) === key))
    .filter((column): column is T => Boolean(column));

interface ColumnConfigProps {
  storageKey: string;
  options: ColumnConfigOption[];
  defaultKeys: string[];
  visibleKeys: string[];
  onChange: (keys: string[]) => void;
}

const ColumnConfig = ({
  storageKey,
  options,
  defaultKeys,
  visibleKeys,
  onChange,
}: ColumnConfigProps) => {
  const [open, setOpen] = useState(false);
  const [draftKeys, setDraftKeys] = useState<string[]>(visibleKeys);
  const [draftOrder, setDraftOrder] = useState<string[]>(defaultKeys);
  const [draggingKey, setDraggingKey] = useState<string | null>(null);

  const normalizeOrder = (keys: string[]) => [
    ...keys.filter((key) => defaultKeys.includes(key)),
    ...defaultKeys.filter((key) => !keys.includes(key)),
  ];

  const toggleOpen = () => {
    setDraftKeys(visibleKeys);
    setDraftOrder(normalizeOrder(visibleKeys));
    setOpen((value) => !value);
  };

  const toggleColumn = (key: string) => {
    setDraftKeys((prev) => {
      if (prev.includes(key)) {
        return prev.length > 1 ? prev.filter((item) => item !== key) : prev;
      }
      return [...prev, key];
    });
  };

  const reset = () => {
    setDraftKeys(defaultKeys);
    setDraftOrder(defaultKeys);
    onChange(defaultKeys);
    localStorage.removeItem(storageKey);
  };

  const apply = () => {
    const orderedVisibleKeys = draftOrder.filter((key) => draftKeys.includes(key));
    onChange(orderedVisibleKeys);
    localStorage.setItem(storageKey, JSON.stringify(orderedVisibleKeys));
    setOpen(false);
  };

  const moveColumn = (targetKey: string) => {
    if (!draggingKey || draggingKey === targetKey) {
      return;
    }

    setDraftOrder((prev) => {
      const next = [...prev];
      const fromIndex = next.indexOf(draggingKey);
      const toIndex = next.indexOf(targetKey);
      if (fromIndex < 0 || toIndex < 0) {
        return prev;
      }
      next.splice(fromIndex, 1);
      next.splice(toIndex, 0, draggingKey);
      return next;
    });
  };

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Cấu hình cột"
        onClick={toggleOpen}
        className={`h-10 w-10 rounded-lg border border-hairline bg-surface-container-lowest text-text-primary shadow-sm transition-all hover:border-primary hover:bg-surface-container-high hover:text-primary ${
          open ? 'border-primary bg-surface-container-high text-primary shadow-[0_8px_20px_rgba(1,67,181,0.12)]' : ''
        }`}
      >
        <span className="material-symbols-outlined text-[21px] leading-10">settings</span>
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-40 w-[340px] overflow-hidden rounded-xl border border-hairline-soft bg-surface-container-lowest shadow-[0_20px_50px_rgba(15,23,42,0.22)]">
          <div className="flex items-center justify-between border-b border-hairline-soft px-md py-sm">
            <h3 className="text-base font-extrabold text-text-primary">Cấu hình cột</h3>
            <button
              type="button"
              onClick={reset}
              className="text-sm font-bold text-primary hover:text-primary-deep"
            >
              Khôi phục
            </button>
          </div>

          <div className="space-y-xs px-md py-md">
            {draftOrder.map((key) => {
              const column = options.find((item) => item.key === key);
              if (!column) {
                return null;
              }
              const checked = draftKeys.includes(column.key);
              return (
                <label
                  key={column.key}
                  draggable
                  onDragStart={() => setDraggingKey(column.key)}
                  onDragEnd={() => setDraggingKey(null)}
                  onDragOver={(event) => {
                    event.preventDefault();
                    moveColumn(column.key);
                  }}
                  className={`flex cursor-grab items-center gap-sm rounded-lg px-xs py-xs text-text-primary transition-colors active:cursor-grabbing ${
                    draggingKey === column.key ? 'bg-primary/10 text-primary' : 'hover:bg-surface-container-low'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px] text-outline">drag_indicator</span>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleColumn(column.key)}
                    className="h-5 w-5 accent-primary"
                  />
                  <span className="text-[15px] font-medium">{column.label}</span>
                </label>
              );
            })}
          </div>

          <div className="flex justify-end gap-sm border-t border-hairline-soft bg-surface-container-low px-md py-sm">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg border border-hairline bg-surface-container-lowest px-md py-sm text-sm font-bold text-text-primary transition-colors hover:bg-surface-container-high"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={apply}
              className="rounded-lg bg-primary px-md py-sm text-sm font-bold text-on-primary transition-all hover:brightness-110"
            >
              Áp dụng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColumnConfig;
