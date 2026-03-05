import { useDeviceType } from '../../hooks/useDeviceType';
import { FunnelFlowView } from './FunnelFlowView';
import { FunnelListView } from './FunnelListView';
import { FunnelGridView } from './FunnelGridView';
import type { Database } from '../../lib/database.types';

type Page = Database['public']['Tables']['pages']['Row'];

interface FunnelViewProps {
  funnelId: string;
  pages: Page[];
  onDeletePage: (pageId: string) => void;
  onDuplicatePage?: (pageId: string) => void;
  onToggleStatus?: (pageId: string, newStatus: 'published' | 'draft') => void;
  onReorderPages?: (pages: Page[]) => void;
  onAddPage: () => void;
  forceView?: 'flow' | 'list' | 'grid';
}

export function FunnelView({
  funnelId,
  pages,
  onDeletePage,
  onDuplicatePage,
  onToggleStatus,
  onReorderPages,
  onAddPage,
  forceView,
}: FunnelViewProps) {
  const { isMobile, isPortrait, isTablet } = useDeviceType();

  const shouldUseMobileView = isMobile || (isTablet && isPortrait);

  if (forceView === 'grid') {
    return (
      <FunnelGridView
        funnelId={funnelId}
        pages={pages}
        onDeletePage={onDeletePage}
        onDuplicatePage={onDuplicatePage}
        onAddPage={onAddPage}
      />
    );
  }

  if (forceView === 'list' || (shouldUseMobileView && forceView !== 'flow')) {
    return (
      <FunnelListView
        funnelId={funnelId}
        pages={pages}
        onDeletePage={onDeletePage}
        onDuplicatePage={onDuplicatePage}
        onToggleStatus={onToggleStatus}
        onReorderPages={onReorderPages}
        onAddPage={onAddPage}
      />
    );
  }

  if (forceView === 'flow') {
    return (
      <FunnelFlowView
        funnelId={funnelId}
        pages={pages}
        onDeletePage={onDeletePage}
        onDuplicatePage={onDuplicatePage}
        onReorderPages={onReorderPages}
        onAddPage={onAddPage}
      />
    );
  }

  return (
    <FunnelGridView
      funnelId={funnelId}
      pages={pages}
      onDeletePage={onDeletePage}
      onDuplicatePage={onDuplicatePage}
      onAddPage={onAddPage}
    />
  );
}
