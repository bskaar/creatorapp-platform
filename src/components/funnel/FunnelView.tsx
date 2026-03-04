import { useDeviceType } from '../../hooks/useDeviceType';
import { FunnelFlowView } from './FunnelFlowView';
import { FunnelListView } from './FunnelListView';
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
  forceView?: 'flow' | 'list';
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

  const useListView = forceView === 'list' || (forceView !== 'flow' && (isMobile || (isTablet && isPortrait)));

  if (useListView) {
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
