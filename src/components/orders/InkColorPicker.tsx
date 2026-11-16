import React from 'react';
import { INK_COLORS } from '../../lib/constants';
import { Check } from 'lucide-react';

interface InkColorPickerProps {
  selectedColors: string[];
  onChange: (colors: string[]) => void;
}

export const InkColorPicker: React.FC<InkColorPickerProps> = ({
  selectedColors,
  onChange,
}) => {
  const toggleColor = (colorId: string) => {
    if (colorId === 'F/C') {
      // If Full Colour is picked, select it alone or toggle
      if (selectedColors.includes('F/C')) {
        onChange([]);
      } else {
        onChange(['F/C']);
      }
      return;
    }

    // If other color clicked while F/C was active, remove F/C
    let updated = selectedColors.filter((c) => c !== 'F/C');

    if (updated.includes(colorId)) {
      updated = updated.filter((c) => c !== colorId);
    } else {
      updated.push(colorId);
    }

    onChange(updated);
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-xs font-semibold text-slate-700">
          Ink Colours <span className="text-slate-400 font-normal">(Multi-Select)</span>
          <span className="text-rose-600 ml-1">*</span>
        </label>
        <span className="text-[11px] font-medium text-slate-500">
          Selected: <strong className="text-blue-700">{selectedColors.length > 0 ? selectedColors.join(', ') : 'None'}</strong>
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-lg">
        {INK_COLORS.map((ink) => {
          const isSelected = selectedColors.includes(ink.id);
          const isMulti = ink.id === 'F/C';

          return (
            <button
              key={ink.id}
              type="button"
              onClick={() => toggleColor(ink.id)}
              className={`group flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all shadow-sm border ${
                isSelected
                  ? 'border-blue-600 ring-2 ring-blue-500/30 scale-[1.02] bg-white text-slate-900'
                  : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-700'
              }`}
            >
              {/* Swatch Circle */}
              <span
                className="w-3.5 h-3.5 rounded-full flex items-center justify-center border border-black/10 shrink-0"
                style={{
                  background: isMulti
                    ? 'linear-gradient(135deg, #06b6d4, #ec4899, #eab308, #18181b)'
                    : ink.hex,
                }}
              >
                {isSelected && (
                  <Check
                    className={`w-2.5 h-2.5 ${ink.textDark ? 'text-black' : 'text-white'}`}
                    strokeWidth={3}
                  />
                )}
              </span>

              <span>{ink.nameEn}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
