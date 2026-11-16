import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface SelectWithOtherProps {
  label?: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  allowNone?: boolean;
  noneLabel?: string;
  placeholder?: string;
  className?: string;
  onCustomSave?: (val: string) => void;
}

export const SelectWithOther: React.FC<SelectWithOtherProps> = ({
  label,
  options,
  value,
  onChange,
  allowNone = false,
  noneLabel = 'None',
  placeholder = '-- Select --',
  className = '',
  onCustomSave,
}) => {
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customText, setCustomText] = useState('');

  // Sync state on external value changes
  useEffect(() => {
    if (value && !options.includes(value) && (!allowNone || value !== noneLabel)) {
      setIsCustomMode(true);
      setCustomText(value);
    } else if (options.includes(value) || (allowNone && value === noneLabel)) {
      setIsCustomMode(false);
      setCustomText('');
    }
  }, [value, options, allowNone, noneLabel]);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === '__OTHERS__') {
      setIsCustomMode(true);
      setCustomText('');
      onChange('');
    } else {
      setIsCustomMode(false);
      setCustomText('');
      onChange(val);
    }
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setCustomText(text);
    onChange(text);
  };

  const handleCustomBlur = () => {
    const trimmed = customText.trim();
    if (trimmed && onCustomSave) {
      onCustomSave(trimmed);
    }
  };

  const handleCancelCustom = () => {
    setIsCustomMode(false);
    setCustomText('');
    const fallback = options[0] || (allowNone ? noneLabel : '');
    onChange(fallback);
  };

  return (
    <div className={`space-y-1 w-full min-w-0 ${className}`}>
      {label && (
        <label className="block text-xs font-semibold text-stone-600 dark:text-stone-300">
          {label}
        </label>
      )}

      {!isCustomMode ? (
        <select
          value={options.includes(value) || (allowNone && value === noneLabel) ? value : isCustomMode ? '__OTHERS__' : ''}
          onChange={handleSelectChange}
          className="w-full px-2.5 py-2 text-xs sm:text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl font-medium focus:bg-white dark:focus:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-[#d9532f]/40 transition-colors"
        >
          {placeholder && <option value="">{placeholder}</option>}
          {allowNone && <option value={noneLabel}>{noneLabel}</option>}
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
          <option value="__OTHERS__" className="font-semibold text-[#d9532f] bg-amber-50 dark:bg-stone-900">
            ➕ Others...
          </option>
        </select>
      ) : (
        <div className="flex items-center gap-1.5 w-full min-w-0">
          <input
            type="text"
            autoFocus
            placeholder="Type custom..."
            value={customText}
            onChange={handleCustomChange}
            onBlur={handleCustomBlur}
            className="flex-1 min-w-0 w-full px-2.5 py-1.5 text-xs sm:text-sm bg-amber-50/70 dark:bg-stone-800 border-2 border-amber-500/80 dark:border-amber-600 rounded-xl font-medium text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <button
            type="button"
            onClick={handleCancelCustom}
            title="Cancel custom input"
            className="p-1.5 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 bg-stone-200 dark:bg-stone-700 rounded-xl shrink-0 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
