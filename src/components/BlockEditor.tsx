import { useState } from 'react';
import { Type, Image, Palette } from 'lucide-react';
import AITextGenerator from './AITextGenerator';
import ImageSearchModal from './ImageSearchModal';

interface BlockEditorProps {
  block: any;
  onUpdate: (content: Record<string, any>) => void;
  onStyleUpdate?: (styles: Record<string, any>) => void;
}

export default function BlockEditor({ block, onUpdate, onStyleUpdate }: BlockEditorProps) {
  const [activeTab, setActiveTab] = useState<'content' | 'style'>('content');
  const [content, setContent] = useState(block.content);
  const [showImageSearch, setShowImageSearch] = useState(false);
  const [styles, setStyles] = useState(block.styles || {
    backgroundColor: '',
    textColor: '',
    padding: 'medium',
    alignment: 'left',
  });

  const handleContentChange = (key: string, value: any) => {
    const updated = { ...content, [key]: value };
    setContent(updated);
    onUpdate(updated);
  };

  const handleStyleChange = (key: string, value: any) => {
    const updated = { ...styles, [key]: value };
    setStyles(updated);
    if (onStyleUpdate) onStyleUpdate(updated);
  };

  const handleFeatureChange = (index: number, field: string, value: string) => {
    const updatedFeatures = [...(content.features || [])];
    updatedFeatures[index] = { ...updatedFeatures[index], [field]: value };
    handleContentChange('features', updatedFeatures);
  };

  const addFeature = () => {
    const updatedFeatures = [...(content.features || []), { title: 'New Feature', description: 'Description' }];
    handleContentChange('features', updatedFeatures);
  };

  const removeFeature = (index: number) => {
    const updatedFeatures = content.features.filter((_: any, i: number) => i !== index);
    handleContentChange('features', updatedFeatures);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex space-x-2 border-b">
        <button
          onClick={() => setActiveTab('content')}
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'content'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Type className="h-4 w-4 inline mr-2" />
          Content
        </button>
        <button
          onClick={() => setActiveTab('style')}
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'style'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Palette className="h-4 w-4 inline mr-2" />
          Style
        </button>
      </div>

      {activeTab === 'content' ? (
        <div className="space-y-4">
          {block.type === 'features' && content.features ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Headline</label>
                <input
                  type="text"
                  value={content.headline || ''}
                  onChange={(e) => handleContentChange('headline', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
                />
                <AITextGenerator
                  type="headline"
                  currentText={content.headline}
                  context={`Creating a headline for ${block.type} block`}
                  onGenerate={(text) => handleContentChange('headline', text)}
                  placeholder="Describe what your headline should be about..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Features</label>
                {content.features.map((feature: any, index: number) => (
                  <div key={index} className="mb-3 p-4 border border-gray-200 rounded-lg">
                    <input
                      type="text"
                      value={feature.title}
                      onChange={(e) => handleFeatureChange(index, 'title', e.target.value)}
                      placeholder="Feature title"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
                    />
                    <textarea
                      value={feature.description}
                      onChange={(e) => handleFeatureChange(index, 'description', e.target.value)}
                      placeholder="Feature description"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
                      rows={2}
                    />
                    <button
                      onClick={() => removeFeature(index)}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  onClick={addFeature}
                  className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 text-gray-600 hover:text-blue-600"
                >
                  + Add Feature
                </button>
              </div>
            </div>
          ) : (
            Object.entries(content).map(([key, value]) => {
              if (Array.isArray(value) || typeof value !== 'string') return null;

              const keyLower = key.toLowerCase();
              const isTextField = keyLower.includes('text') && !keyLower.includes('cta') || keyLower.includes('description') || key === 'quote';
              const isHeadline = keyLower.includes('headline');
              const isSubheadline = keyLower.includes('subheadline');
              const isCTA = keyLower.includes('cta') || keyLower.includes('button');
              const isImageField = key === 'url' && block.type === 'image';
              const isBackgroundImage = key === 'backgroundImage';

              return (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </label>
                  {isTextField ? (
                    <>
                      <textarea
                        value={value}
                        onChange={(e) => handleContentChange(key, e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
                        rows={3}
                      />
                      <AITextGenerator
                        type={key === 'quote' ? 'testimonial' : 'paragraph'}
                        currentText={value}
                        context={`Writing ${key} for ${block.type} block`}
                        onGenerate={(text) => handleContentChange(key, text)}
                        placeholder={`Describe what you want for ${key}...`}
                      />
                    </>
                  ) : isImageField || isBackgroundImage ? (
                    <>
                      <input
                        type="url"
                        value={value}
                        onChange={(e) => handleContentChange(key, e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
                      />
                      <button
                        onClick={() => setShowImageSearch(true)}
                        className="flex items-center space-x-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                      >
                        <Image className="h-4 w-4" />
                        <span>Search Images</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <input
                        type={key.includes('url') || key.includes('Url') ? 'url' : 'text'}
                        value={value}
                        onChange={(e) => handleContentChange(key, e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
                      />
                      {(isHeadline || isSubheadline || isCTA) && (
                        <AITextGenerator
                          type={isHeadline ? 'headline' : isSubheadline ? 'subheadline' : 'cta'}
                          currentText={value}
                          context={`Creating ${key} for ${block.type} block`}
                          onGenerate={(text) => handleContentChange(key, text)}
                          placeholder={`Describe what you want for ${key}...`}
                        />
                      )}
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={styles.backgroundColor || '#ffffff'}
                onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                className="h-10 w-20 rounded border border-gray-300"
              />
              <input
                type="text"
                value={styles.backgroundColor || ''}
                onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                placeholder="#ffffff or transparent"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Text Color</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={styles.textColor || '#000000'}
                onChange={(e) => handleStyleChange('textColor', e.target.value)}
                className="h-10 w-20 rounded border border-gray-300"
              />
              <input
                type="text"
                value={styles.textColor || ''}
                onChange={(e) => handleStyleChange('textColor', e.target.value)}
                placeholder="#000000"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Padding</label>
            <select
              value={styles.padding || 'medium'}
              onChange={(e) => handleStyleChange('padding', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="none">None</option>
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
              <option value="xlarge">Extra Large</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Text Alignment</label>
            <select
              value={styles.alignment || 'left'}
              onChange={(e) => handleStyleChange('alignment', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
        </div>
      )}

      {showImageSearch && (
        <ImageSearchModal
          onSelect={(url, alt) => {
            if (block.type === 'image') {
              handleContentChange('url', url);
              handleContentChange('alt', alt);
            } else {
              handleContentChange('backgroundImage', url);
            }
            setShowImageSearch(false);
          }}
          onClose={() => setShowImageSearch(false)}
          initialQuery={block.type}
        />
      )}
    </div>
  );
}
