import { useState } from 'react';
import { Palette, Sparkles, Loader2, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  neutral: string;
  background: string;
  description?: string;
}

interface AIColorPaletteProps {
  onApply: (palette: ColorPalette) => void;
}

const moods = ['Professional', 'Creative', 'Modern', 'Elegant', 'Vibrant', 'Minimal', 'Bold', 'Calm'];
const industries = ['Technology', 'Healthcare', 'Finance', 'Education', 'E-commerce', 'Real Estate', 'Food & Beverage', 'Fashion'];

export default function AIColorPalette({ onApply }: AIColorPaletteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mood, setMood] = useState('Professional');
  const [industry, setIndustry] = useState('Technology');
  const [palette, setPalette] = useState<ColorPalette | null>(null);

  const generatePalette = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-color-palette`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mood, industry }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate palette');
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setPalette(data.palette);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate palette');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = () => {
    if (palette) {
      onApply(palette);
      setIsOpen(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-pink-600 to-orange-600 text-white rounded-lg hover:from-pink-700 hover:to-orange-700 transition text-sm"
      >
        <Sparkles className="h-4 w-4" />
        <span>AI Color Palette</span>
      </button>
    );
  }

  return (
    <div className="border border-pink-200 rounded-lg p-4 bg-gradient-to-br from-pink-50 to-orange-50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Palette className="h-5 w-5 text-pink-600" />
          <h3 className="font-semibold text-gray-900">AI Color Palette Generator</h3>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mood</label>
          <select
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
          >
            {moods.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
          <select
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
          >
            {industries.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={generatePalette}
          disabled={isGenerating}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <span>Generate Palette</span>
            </>
          )}
        </button>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
            {error}
          </div>
        )}

        {palette && (
          <div className="space-y-3 pt-3 border-t border-gray-200">
            {palette.description && (
              <p className="text-sm text-gray-600 italic">{palette.description}</p>
            )}
            <div className="grid grid-cols-5 gap-2">
              {Object.entries(palette)
                .filter(([key]) => key !== 'description')
                .map(([key, color]) => (
                  <div key={key} className="text-center">
                    <div
                      className="w-full h-12 rounded-lg border-2 border-gray-200 mb-1"
                      style={{ backgroundColor: color }}
                    />
                    <p className="text-xs font-medium text-gray-700 capitalize">{key}</p>
                    <p className="text-xs text-gray-500">{color}</p>
                  </div>
                ))}
            </div>
            <button
              onClick={handleApply}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              <Check className="h-4 w-4" />
              <span>Apply Palette</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
