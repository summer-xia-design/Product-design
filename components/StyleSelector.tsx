import React from 'react';
import { DesignStyle } from '../types';

interface StyleSelectorProps {
  selectedStyle: DesignStyle;
  onSelect: (style: DesignStyle) => void;
}

const styles = [
  { label: 'Photorealistic', value: DesignStyle.REALISTIC, color: 'bg-blue-600' },
  { label: 'Minimalist (Braun)', value: DesignStyle.MINIMALIST, color: 'bg-zinc-200 text-zinc-900' },
  { label: 'Cyberpunk', value: DesignStyle.CYBERPUNK, color: 'bg-purple-600' },
  { label: 'Marker Sketch', value: DesignStyle.SKETCHY, color: 'bg-yellow-600' },
  { label: 'Wood & Natural', value: DesignStyle.WOODEN, color: 'bg-amber-700' },
  { label: 'Tech Transparent', value: DesignStyle.TRANSPARENT, color: 'bg-cyan-600' },
];

export const StyleSelector: React.FC<StyleSelectorProps> = ({ selectedStyle, onSelect }) => {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-zinc-400">Render Style</label>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {styles.map((style) => (
          <button
            key={style.label}
            onClick={() => onSelect(style.value)}
            className={`
              p-3 rounded-lg text-sm font-medium transition-all duration-200 border
              ${selectedStyle === style.value 
                ? `${style.color} border-transparent shadow-lg scale-[1.02] ring-2 ring-offset-2 ring-offset-zinc-900 ring-white/20` 
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:border-zinc-700'
              }
            `}
          >
            {style.label}
          </button>
        ))}
      </div>
    </div>
  );
};