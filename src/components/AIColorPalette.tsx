import { useState, useRef, useCallback, useEffect } from 'react';
import { Palette, Sparkles, Loader2, Check, Upload, Image, X, HelpCircle, CheckCircle2 } from 'lucide-react';
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

type GenerationMode = 'prompt' | 'image';

const moods = ['Professional', 'Creative', 'Modern', 'Elegant', 'Vibrant', 'Minimal', 'Bold', 'Calm'];
const industries = ['Technology', 'Healthcare', 'Finance', 'Education', 'E-commerce', 'Real Estate', 'Food & Beverage', 'Fashion'];

function extractColorsFromSVG(svgContent: string): string[] {
  const colors: Set<string> = new Set();
  const hexPattern = /#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})\b/g;
  const rgbPattern = /rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)/gi;
  const rgbaPattern = /rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*[\d.]+\s*\)/gi;

  let match;
  while ((match = hexPattern.exec(svgContent)) !== null) {
    let hex = match[0].toLowerCase();
    if (hex.length === 4) {
      hex = `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
    }
    if (hex !== '#000000' && hex !== '#ffffff' && hex !== '#fff' && hex !== '#000') {
      colors.add(hex);
    }
  }

  while ((match = rgbPattern.exec(svgContent)) !== null) {
    const r = parseInt(match[1], 10);
    const g = parseInt(match[2], 10);
    const b = parseInt(match[3], 10);
    const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    if (hex !== '#000000' && hex !== '#ffffff') {
      colors.add(hex);
    }
  }

  while ((match = rgbaPattern.exec(svgContent)) !== null) {
    const r = parseInt(match[1], 10);
    const g = parseInt(match[2], 10);
    const b = parseInt(match[3], 10);
    const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    if (hex !== '#000000' && hex !== '#ffffff') {
      colors.add(hex);
    }
  }

  return Array.from(colors);
}

function generatePaletteFromExtractedColors(extractedColors: string[]): ColorPalette {
  const defaultColors = {
    primary: '#3B82F6',
    secondary: '#10B981',
    accent: '#F59E0B',
    neutral: '#6B7280',
    background: '#F9FAFB',
  };

  if (extractedColors.length === 0) {
    return { ...defaultColors, description: 'Default palette - no colors found in SVG' };
  }

  const sortedColors = [...extractedColors];

  return {
    primary: sortedColors[0] || defaultColors.primary,
    secondary: sortedColors[1] || adjustColor(sortedColors[0], 30),
    accent: sortedColors[2] || adjustColor(sortedColors[0], -30),
    neutral: sortedColors[3] || '#6B7280',
    background: sortedColors[4] || lightenColor(sortedColors[0], 0.9),
    description: `Extracted ${extractedColors.length} colors from SVG: ${extractedColors.slice(0, 3).join(', ')}${extractedColors.length > 3 ? '...' : ''}`,
  };
}

function adjustColor(hex: string, degrees: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  hsl.h = (hsl.h + degrees + 360) % 360;
  const newRgb = hslToRgb(hsl.h, hsl.s, hsl.l);

  return `#${newRgb.r.toString(16).padStart(2, '0')}${newRgb.g.toString(16).padStart(2, '0')}${newRgb.b.toString(16).padStart(2, '0')}`;
}

function lightenColor(hex: string, amount: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return '#F9FAFB';

  const r = Math.round(rgb.r + (255 - rgb.r) * amount);
  const g = Math.round(rgb.g + (255 - rgb.g) * amount);
  const b = Math.round(rgb.b + (255 - rgb.b) * amount);

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return { h: h * 360, s, l };
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h /= 360;
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

export default function AIColorPalette({ onApply }: AIColorPaletteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mood, setMood] = useState('Professional');
  const [industry, setIndustry] = useState('Technology');
  const [palette, setPalette] = useState<ColorPalette | null>(null);
  const [mode, setMode] = useState<GenerationMode>('prompt');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<{ preview: string; file: File } | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [paletteApplied, setPaletteApplied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const paletteRef = useRef<HTMLDivElement>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    const validTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a PNG, JPG, WebP, or SVG image');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be less than 10MB');
      return;
    }

    setError(null);

    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const svgContent = e.target?.result as string;
        setUploadedImage({
          preview: URL.createObjectURL(file),
          file,
        });

        const extractedColors = extractColorsFromSVG(svgContent);
        if (extractedColors.length > 0) {
          const generatedPalette = generatePaletteFromExtractedColors(extractedColors);
          setPalette(generatedPalette);
        }
      };
      reader.readAsText(file);
    } else {
      setUploadedImage({
        preview: URL.createObjectURL(file),
        file,
      });
      setPalette(null);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const clearUploadedImage = useCallback(() => {
    if (uploadedImage?.preview) {
      URL.revokeObjectURL(uploadedImage.preview);
    }
    setUploadedImage(null);
    setPalette(null);
    setPaletteApplied(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [uploadedImage]);

  useEffect(() => {
    if (palette && paletteRef.current) {
      paletteRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [palette]);

  const generatePaletteFromPrompt = async () => {
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

  const generatePaletteFromImage = async () => {
    if (!uploadedImage) {
      setError('Please upload an image first');
      return;
    }

    if (uploadedImage.file.type === 'image/svg+xml') {
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          const base64 = result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
      });
      reader.readAsDataURL(uploadedImage.file);
      const imageBase64 = await base64Promise;

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/extract-colors-from-image`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64,
          mimeType: uploadedImage.file.type,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to extract colors from image');
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setPalette(data.palette);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to extract colors');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerate = () => {
    if (mode === 'prompt') {
      generatePaletteFromPrompt();
    } else {
      generatePaletteFromImage();
    }
  };

  const handleApply = () => {
    if (palette) {
      onApply(palette);
      setPaletteApplied(true);
      setTimeout(() => {
        setIsOpen(false);
        setPaletteApplied(false);
        setPalette(null);
        clearUploadedImage();
      }, 1500);
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
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="text-gray-400 hover:text-pink-600 transition"
            title="How to use"
          >
            <HelpCircle className="h-4 w-4" />
          </button>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {showHelp && (
        <div className="mb-4 p-3 bg-white/80 rounded-lg border border-pink-200 text-sm">
          <p className="font-medium text-gray-900 mb-2">How to use:</p>
          <ul className="space-y-1.5 text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-pink-600 font-bold">1.</span>
              <span><strong>From Prompt:</strong> Choose a mood and industry, then click Generate.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-pink-600 font-bold">2.</span>
              <span><strong>From Image:</strong> Upload your logo or brand image, then click Extract Colors.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-pink-600 font-bold">3.</span>
              <span>When you see "Palette Ready!", click the green <strong>Apply Palette to Page</strong> button.</span>
            </li>
          </ul>
          <p className="mt-2 text-xs text-gray-500">
            After applying, the panel closes automatically and your page colors update.
          </p>
        </div>
      )}

      <div className="flex space-x-2 mb-4">
        <button
          onClick={() => setMode('prompt')}
          className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
            mode === 'prompt'
              ? 'bg-pink-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          <Sparkles className="h-4 w-4" />
          <span>From Prompt</span>
        </button>
        <button
          onClick={() => setMode('image')}
          className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
            mode === 'image'
              ? 'bg-pink-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          <Image className="h-4 w-4" />
          <span>From Image</span>
        </button>
      </div>

      <div className="space-y-3">
        {mode === 'prompt' ? (
          <>
            <p className="text-xs text-gray-500 -mt-1 mb-2">
              Select a mood and industry to generate a professionally designed color palette.
            </p>
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
          </>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Logo or Brand Image
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Supports PNG, JPG, WebP, and SVG. SVG colors are extracted directly.
            </p>

            {!uploadedImage ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition ${
                  isDragging
                    ? 'border-pink-500 bg-pink-50'
                    : 'border-gray-300 hover:border-pink-400 hover:bg-pink-50/50'
                }`}
              >
                <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">
                  Drag and drop or click to upload
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  PNG, JPG, WebP, SVG up to 10MB
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="relative">
                <div className="border border-gray-200 rounded-lg p-2 bg-white">
                  <div className="relative aspect-video w-full overflow-hidden rounded bg-gray-100 flex items-center justify-center">
                    <img
                      src={uploadedImage.preview}
                      alt="Uploaded"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2 px-1">
                    <span className="text-xs text-gray-500 truncate max-w-[200px]">
                      {uploadedImage.file.name}
                    </span>
                    <button
                      onClick={clearUploadedImage}
                      className="text-gray-400 hover:text-red-500 transition"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {uploadedImage.file.type === 'image/svg+xml' && palette && (
                  <p className="text-xs text-green-600 mt-2">
                    Colors extracted directly from SVG
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {(mode === 'prompt' || (mode === 'image' && uploadedImage && uploadedImage.file.type !== 'image/svg+xml')) && (
          <button
            onClick={handleGenerate}
            disabled={isGenerating || (mode === 'image' && !uploadedImage)}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{mode === 'image' ? 'Analyzing...' : 'Generating...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>{mode === 'image' ? 'Extract Colors' : 'Generate Palette'}</span>
              </>
            )}
          </button>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
            {error}
          </div>
        )}

        {palette && (
          <div ref={paletteRef} className="space-y-3 pt-3 border-t border-pink-200 bg-white/60 -mx-4 px-4 pb-1 mt-3 rounded-b-lg">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm font-medium">Palette Ready!</span>
            </div>
            {palette.description && (
              <p className="text-sm text-gray-600 italic">{palette.description}</p>
            )}
            <div className="grid grid-cols-5 gap-2">
              {Object.entries(palette)
                .filter(([key]) => key !== 'description')
                .map(([key, color]) => (
                  <div key={key} className="text-center">
                    <div
                      className="w-full h-12 rounded-lg border-2 border-gray-200 mb-1 shadow-sm"
                      style={{ backgroundColor: color }}
                    />
                    <p className="text-xs font-medium text-gray-700 capitalize">{key}</p>
                    <p className="text-xs text-gray-500">{color}</p>
                  </div>
                ))}
            </div>

            {paletteApplied ? (
              <div className="flex items-center justify-center gap-2 px-4 py-3 bg-green-100 text-green-800 rounded-lg border border-green-200">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">Palette applied to your page!</span>
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={handleApply}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium shadow-sm"
                >
                  <Check className="h-5 w-5" />
                  <span>Apply Palette to Page</span>
                </button>
                <p className="text-xs text-center text-gray-500">
                  Click to use these colors on your current page
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
