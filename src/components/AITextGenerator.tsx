import { useState } from 'react';
import { Sparkles, Loader2, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AITextGeneratorProps {
  type: 'headline' | 'subheadline' | 'cta' | 'feature' | 'paragraph' | 'testimonial' | 'improve';
  currentText?: string;
  context?: string;
  onGenerate: (text: string) => void;
  placeholder?: string;
}

export default function AITextGenerator({
  type,
  currentText,
  context,
  onGenerate,
  placeholder = 'Describe what you want...',
}: AITextGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showInput, setShowInput] = useState(false);

  const generateText = async (customPrompt?: string) => {
    setIsGenerating(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-generate-text`;

      let finalPrompt = customPrompt || prompt;

      if (type === 'improve' && currentText) {
        finalPrompt = `Improve this text: ${currentText}`;
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: finalPrompt,
          type,
          context,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate text');
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      onGenerate(data.text);
      setPrompt('');
      setShowInput(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate text');
    } finally {
      setIsGenerating(false);
    }
  };

  const quickPrompts: Record<string, string[]> = {
    headline: [
      'Create an exciting headline about',
      'Write a professional headline for',
      'Generate an urgency-driven headline about',
    ],
    cta: [
      'Get started now',
      'Sign up today',
      'Try it free',
    ],
    paragraph: [
      'Write about the benefits of',
      'Explain how this helps customers',
      'Describe the main features',
    ],
  };

  if (!showInput) {
    return (
      <button
        onClick={() => setShowInput(true)}
        className="flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-violet-600 to-blue-600 text-white rounded-lg hover:from-violet-700 hover:to-blue-700 transition text-sm"
      >
        <Sparkles className="h-4 w-4" />
        <span>Generate with AI</span>
      </button>
    );
  }

  return (
    <div className="border border-violet-200 rounded-lg p-4 bg-gradient-to-br from-violet-50 to-blue-50">
      <div className="flex items-center space-x-2 mb-3">
        <Sparkles className="h-5 w-5 text-violet-600" />
        <h3 className="font-semibold text-gray-900">AI Text Generator</h3>
      </div>

      {quickPrompts[type] && (
        <div className="mb-3">
          <p className="text-xs text-gray-600 mb-2">Quick prompts:</p>
          <div className="flex flex-wrap gap-2">
            {quickPrompts[type].map((quick, idx) => (
              <button
                key={idx}
                onClick={() => generateText(quick)}
                disabled={isGenerating}
                className="text-xs px-3 py-1 bg-white border border-violet-200 rounded-full hover:bg-violet-50 transition disabled:opacity-50"
              >
                {quick}
              </button>
            ))}
          </div>
        </div>
      )}

      {type === 'improve' && currentText ? (
        <div className="space-y-3">
          <div className="text-sm text-gray-600 bg-white p-3 rounded border">
            Current: "{currentText}"
          </div>
          <button
            onClick={() => generateText()}
            disabled={isGenerating}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Improving...</span>
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                <span>Improve Text</span>
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={placeholder}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm"
          />

          <div className="flex items-center space-x-2">
            <button
              onClick={() => generateText()}
              disabled={isGenerating || !prompt.trim()}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Generate</span>
                </>
              )}
            </button>
            <button
              onClick={() => {
                setShowInput(false);
                setPrompt('');
                setError(null);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
          {error}
        </div>
      )}
    </div>
  );
}
