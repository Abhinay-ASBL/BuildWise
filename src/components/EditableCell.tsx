import { useState, useRef, useEffect, useCallback } from 'react';
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
      // Small delay to ensure the input is rendered before focusing
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
      <input
        ref={inputRef}
        type={type === 'text' ? 'text' : 'text'}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={save}
        onKeyDown={handleKeyDown}
        className={`w-full rounded-md border border-blue-300 bg-white px-2 py-1 text-sm
          ring-2 ring-blue-200 outline-none
          ${type !== 'text' ? 'text-right font-[tabular-nums]' : ''}
          ${className}`}
        inputMode={type !== 'text' ? 'decimal' : 'text'}
      />
    );
  }

  return (
    <div
      onClick={() => setEditingCell(cellId)}
      className={`cursor-pointer rounded-md px-2 py-1 text-sm transition-colors hover:bg-blue-50
        ${type !== 'text' ? 'text-right font-[tabular-nums]' : ''}
        ${className}`}
      title="Click to edit"
    >
      {formatDisplay(value)}
    </div>
  );
}
