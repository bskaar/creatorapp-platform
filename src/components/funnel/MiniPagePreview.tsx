import { memo } from 'react';
import { BlockRenderer } from '../publicSite/BlockRenderer';
import type { Block } from '../publicSite/types';
import { LayoutGrid as Layout } from 'lucide-react';

interface MiniPagePreviewProps {
  blocks: Block[];
  primaryColor?: string;
  pageType?: string;
}

function MiniPagePreviewComponent({ blocks, primaryColor = '#3B82F6', pageType }: MiniPagePreviewProps) {
  if (!blocks || blocks.length === 0) {
    return (
      <div className="h-40 bg-gray-50 flex flex-col items-center justify-center">
        <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center mb-2">
          <Layout className="h-5 w-5 text-gray-400" />
        </div>
        <p className="text-xs text-gray-400 text-center px-4">
          {pageType ? `${pageType.replace('_', ' ')} page` : 'No content yet'}
        </p>
      </div>
    );
  }

  const PREVIEW_WIDTH = 1200;
  const CONTAINER_WIDTH = 260;
  const CONTAINER_HEIGHT = 160;
  const SCALE = CONTAINER_WIDTH / PREVIEW_WIDTH;

  return (
    <div
      className="relative overflow-hidden bg-white"
      style={{
        width: CONTAINER_WIDTH,
        height: CONTAINER_HEIGHT,
      }}
    >
      <div
        style={{
          width: PREVIEW_WIDTH,
          transform: `scale(${SCALE})`,
          transformOrigin: 'top left',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        {blocks.map((block) => (
          <BlockRenderer
            key={block.id}
            block={block}
            primaryColor={primaryColor}
          />
        ))}
      </div>
      <div
        className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)',
        }}
      />
    </div>
  );
}

export const MiniPagePreview = memo(MiniPagePreviewComponent);
