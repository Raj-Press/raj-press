import React, { useState, useEffect } from 'react';
import { PlusCircle } from 'lucide-react';

interface DynamicSelectProps {
  label: string;
  labelEn: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  onCustomAdd?: (val: string) => void;
}

export const DynamicSelect: React.FC<DynamicSelectProps> = ({
  label,
  labelEn,
  options,
  value,
  onChange,
  required = false,
  placeholder = '-- निवडा (Select) --',
  onCustomAdd
}) => {
  const [isOther, setIsOther] = useState(false);
  const [customVal, setCustomVal] = useState('');

  // Determine if the current value is custom (not in predefined options)
  useEffect(() => {
    if (value && !options.includes(value)) {
      setIsOther(true);
      setCustomVal(value);
    } else {
      setIsOther(false);
      setCustomVal('');
    }
  }, [value, options]);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    if (selected === '__OTHERS__') {
      setIsOther(true);
      setCustomVal('');
      onChange('');
    } else {
      setIsOther(false);
      setCustomVal('');
      onChange(selected);
    }
  };

  const handleCustomBlur = () => {
    if (customVal.trim()) {
      onChange(customVal.trim());
      if (onCustomAdd) {
        onCustomAdd(customVal.trim());
      }
    }
  };

  return (
    <div className="w-full">
      <label className="block text-xs font-semibold text-slate-700 mb-1">
        {label} <span className="text-slate-400 font-normal">({labelEn})</span>
        {required && <span className="text-rose-600 ml-1">*</span>}
      </label>

      {!isOther ? (
        <select
          value={options.includes(value) ? value : isOther ? '__OTHERS__' : ''}
          onChange={handleSelectChange}
          required={required && !isOther}
          className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors"
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
          <option value="__OTHERS__" className="font-semibold text-blue-700 bg-blue-50">
            ➕ इतर (Others - नवीन टाईप करा)...
          </option>
        </select>
      ) : (
        <div className="space-y-1.5">
          <div className="flex gap-1.5">
            <input
              type="text"
              autoFocus
              placeholder="नवीन पर्याय टाईप करा (Enter custom option)..."
              value={customVal}
              onChange={(e) => {
                setCustomVal(e.target.value);
                onChange(e.target.value);
              }}
              onBlur={handleCustomBlur}
              required={required}
              className="flex-1 px-3 py-2 text-sm bg-amber-50/50 border-2 border-amber-400 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors"
            />
            <button
              type="button"
              onClick={() => {
                setIsOther(false);
                setCustomVal('');
                onChange('');
              }}
              title="मागे या (Cancel custom input)"
              className="px-2.5 py-1 text-xs font-medium bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors"
            >
              रद्द
            </button>
          </div>
          <p className="text-[11px] text-amber-700 flex items-center gap-1 font-medium">
            <PlusCircle className="w-3.5 h-3.5" /> हा पर्याय आपोआप भविष्यासाठी सेव्ह केला जाईल.
          </p>
        </div>
      )}
    </div>
  );
};
