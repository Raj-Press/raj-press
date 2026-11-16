import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface SelectWithOtherProps {
  label?: string;
  labelEn?: string;
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
  const [isOtherSelected, setIsOtherSelected] = useState(false);
  const [customText, setCustomText] = useState('');

  // Check if current value is custom (not in options and not none)
  useEffect(() => {
    if (value && !options.includes(value) && value !== noneLabel && value !== '') {
      setIsOtherSelected(true);
      setCustomText(value);
    } else {
      setIsOtherSelected(false);
      setCustomText('');
    }
  }, [value, options, noneLabel]);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === '__OTHERS__') {
      setIsOtherSelected(true);
      setCustomText('');
      onChange('');
    } else {
      setIsOtherSelected(false);
      setCustomText('');
      onChange(val);
    }
  };

  const handleCustomBlur = () => {
    const trimmed = customText.trim();
    if (trimmed) {
      onChange(trimmed);
      if (onCustomSave) {
        onCustomSave(trimmed);
      }
    }
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-xs font-semibold text-stone-600 dark:text-stone-300">
          {label}
        </label>
      )}

      {!isOtherSelected ? (
        <select
          value={options.includes(value) || (allowNone && value === noneLabel) ? value : isOtherSelected ? '__OTHERS__' : ''}
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
            ➕ Others (नवीन टाईप करा)...
          </option>
        </select>
      ) : (
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            autoFocus
            placeholder="Type custom option..."
            value={customText}
            onChange={(e) => {
              setCustomText(e.target.value);
              onChange(e.target.value);
            }}
            onBlur={handleCustomBlur}
            className="flex-1 px-3 py-1.5 text-xs sm:text-sm bg-amber-50/60 dark:bg-stone-800 border-2 border-amber-400 dark:border-amber-600 rounded-xl font-medium text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <button
            type="button"
            onClick={() => {
              setIsOtherSelected(false);
              setCustomText('');
              onChange(options[0] || (allowNone ? noneLabel : ''));
            }}
            title="Cancel custom"
            className="p-2 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 bg-stone-200 dark:bg-stone-700 rounded-xl transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
