import { useState, useRef, useEffect, useCallback } from 'react';
import { Pencil } from 'lucide-react';
import { useBudgetStore } from '../store';
import type { BudgetLineItem } from '../types';

interface EditableCellProps {
  value: string | number;
  itemId: string;
  field: keyof BudgetLineItem;
  type: 'text' | 'currency' | 'number';
  formatDisplay: (value: string | number) => string;
  className?: string;
}

export default function EditableCell({
  value,
  itemId,
  field,
  type,
  formatDisplay,
  className = '',
}: EditableCellProps) {
  const updateLineItem = useBudgetStore((s) => s.updateLineItem);
  const editingCellId = useBudgetStore((s) => s.editingCellId);
  const setEditingCell = useBudgetStore((s) => s.setEditingCell);

  const cellId = `${itemId}-${field}`;
  const isEditing = editingCellId === cellId;

  const [draft, setDraft] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      setDraft(String(value));
      requestAnimationFrame(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      });
    }
  }, [isEditing, value]);

  const save = useCallback(() => {
    setEditingCell(null);
    let parsed: string | number = draft.trim();

    if (type === 'currency' || type === 'number') {
      const cleaned = String(parsed).replace(/[^0-9.\-]/g, '');
      parsed = parseFloat(cleaned);
      if (isNaN(parsed)) parsed = 0;
    }

    if (parsed !== value) {
      updateLineItem(itemId, { [field]: parsed });
    }
  }, [draft, value, itemId, field, type, updateLineItem, setEditingCell]);

  const cancel = useCallback(() => {
    setDraft(String(value));
    setEditingCell(null);
  }, [value, setEditingCell]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        save();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        cancel();
      } else if (e.key === 'Tab') {
        save();
      }
    },
    [save, cancel]
  );

  if (isEditing) {
    return (
      <div className="relative">
        {type === 'currency' && (
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-[tabular-nums]">
            ₹
          </span>
        )}
        <input
          ref={inputRef}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={save}
          onKeyDown={handleKeyDown}
          className={`w-full rounded-lg border border-teal-300 bg-white px-2.5 py-1.5 text-sm
            shadow-sm ring-2 ring-teal-500/20 outline-none transition-all duration-200
            ${type === 'currency' ? 'pl-6' : ''}
            ${type !== 'text' ? 'text-right font-[tabular-nums]' : ''}
            ${className}`}
          inputMode={type !== 'text' ? 'decimal' : 'text'}
        />
      </div>
    );
  }

  return (
    <div
      onClick={() => setEditingCell(cellId)}
      className={`group/cell relative cursor-pointer rounded-lg px-2.5 py-1.5 text-sm
        transition-all duration-200 hover:bg-teal-50/50
        ${type !== 'text' ? 'text-right font-[tabular-nums]' : ''}
        ${className}`}
      title="Click to edit"
    >
      {type === 'currency' && (
        <span className="mr-0.5 text-slate-300 font-[tabular-nums]">₹</span>
      )}
      <span>{type === 'currency' ? formatDisplay(value).replace(/^₹\s*/, '') : formatDisplay(value)}</span>
      <Pencil className="absolute right-1 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-300
        opacity-0 transition-opacity duration-200 group-hover/cell:opacity-100" />
    </div>
  );
}
