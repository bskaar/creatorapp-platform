import { useState } from 'react';
import { GripVertical, Edit2, Copy, Trash2 } from 'lucide-react';
import BlockEditor from './BlockEditor';

interface Block {
  id: string;
  type: string;
  content: any;
  styles?: any;
}

interface DraggableBlockProps {
  block: Block;
  index: number;
  isEditing: boolean;
  onEdit: () => void;
  onUpdate: (content: any) => void;
  onStyleUpdate: (styles: any) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onDragStart: (index: number) => void;
  onDragOver: (index: number) => void;
  onDragEnd: () => void;
  isDragging: boolean;
  isDragOver: boolean;
  getPaddingClass: (padding: string) => string;
  getAlignmentClass: (alignment: string) => string;
}

export default function DraggableBlock({
  block,
  index,
  isEditing,
  onEdit,
  onUpdate,
  onStyleUpdate,
  onDuplicate,
  onDelete,
  onDragStart,
  onDragOver,
  onDragEnd,
  isDragging,
  isDragOver,
  getPaddingClass,
  getAlignmentClass,
}: DraggableBlockProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver(index);
      }}
      onDragEnd={onDragEnd}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-200 ${
        isDragging ? 'opacity-50 scale-95' : ''
      } ${isDragOver ? 'border-2 border-blue-500 scale-105' : 'border-2 border-transparent'}`}
    >
      <div className="group relative">
        {(isHovered || isEditing) && (
          <div className="absolute top-2 left-2 right-2 flex items-center justify-between bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-2 z-10 border border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded">
                <GripVertical className="h-4 w-4 text-gray-400" />
              </div>
              <span className="text-xs font-medium text-gray-600 capitalize">
                {block.type} Block
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={onEdit}
                className={`p-1.5 rounded transition ${
                  isEditing ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'
                }`}
                title="Edit block"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                onClick={onDuplicate}
                className="p-1.5 hover:bg-gray-100 text-gray-600 rounded transition"
                title="Duplicate block"
              >
                <Copy className="h-4 w-4" />
              </button>
              <button
                onClick={onDelete}
                className="p-1.5 hover:bg-red-50 text-red-600 rounded transition"
                title="Delete block"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {isEditing ? (
          <div className="border-2 border-blue-500 rounded-lg">
            <BlockEditor
              block={block}
              onUpdate={onUpdate}
              onStyleUpdate={onStyleUpdate}
            />
          </div>
        ) : (
          <BlockPreview
            block={block}
            getPaddingClass={getPaddingClass}
            getAlignmentClass={getAlignmentClass}
          />
        )}
      </div>
    </div>
  );
}

function BlockPreview({ block, getPaddingClass, getAlignmentClass }: any) {
  const padding = getPaddingClass(block.styles?.padding || 'medium');
  const alignment = getAlignmentClass(block.styles?.alignment || 'left');

  switch (block.type) {
    case 'hero':
      return (
        <div
          className={`bg-gradient-to-r from-blue-600 to-blue-800 text-white ${padding}`}
          style={
            block.content.backgroundImage
              ? {
                  backgroundImage: `url(${block.content.backgroundImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }
              : {}
          }
        >
          <div className={`max-w-4xl ${alignment} space-y-4`}>
            <h1 className="text-4xl md:text-6xl font-bold">{block.content.headline}</h1>
            <p className="text-xl text-blue-100">{block.content.subheadline}</p>
            {block.content.ctaText && (
              <button className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition">
                {block.content.ctaText}
              </button>
            )}
          </div>
        </div>
      );

    case 'text':
      return (
        <div className={`${padding} ${alignment}`}>
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed">{block.content.text}</p>
          </div>
        </div>
      );

    case 'features':
      return (
        <div className={`${padding}`}>
          <div className={`max-w-6xl ${alignment} space-y-8`}>
            {block.content.headline && (
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900">{block.content.headline}</h2>
                {block.content.subheadline && (
                  <p className="text-xl text-gray-600 mt-2">{block.content.subheadline}</p>
                )}
              </div>
            )}
            <div className="grid md:grid-cols-3 gap-8">
              {block.content.features?.map((feature: any, idx: number) => (
                <div key={idx} className="text-center">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      );

    case 'image':
      return (
        <div className={`${padding} ${alignment}`}>
          <img
            src={block.content.url || 'https://via.placeholder.com/800x400'}
            alt={block.content.alt || 'Image'}
            className="rounded-lg w-full"
          />
          {block.content.caption && (
            <p className="text-sm text-gray-600 mt-2 text-center">{block.content.caption}</p>
          )}
        </div>
      );

    case 'cta':
      return (
        <div className={`bg-gradient-to-r from-blue-600 to-blue-800 text-white ${padding}`}>
          <div className={`max-w-4xl ${alignment} text-center space-y-4`}>
            <h2 className="text-3xl font-bold">{block.content.headline}</h2>
            {block.content.description && (
              <p className="text-xl text-blue-100">{block.content.description}</p>
            )}
            {block.content.buttonText && (
              <button className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition">
                {block.content.buttonText}
              </button>
            )}
          </div>
        </div>
      );

    default:
      return (
        <div className={`${padding} ${alignment}`}>
          <div className="text-gray-500 italic">Preview not available for {block.type}</div>
        </div>
      );
  }
}
