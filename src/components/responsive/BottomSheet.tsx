import { ReactNode, useEffect, useRef, useState } from 'react';
import { X, GripHorizontal } from 'lucide-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  snapPoints?: number[];
  initialSnap?: number;
  showHandle?: boolean;
  showClose?: boolean;
  className?: string;
}

export function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  snapPoints = [0.5, 0.9],
  initialSnap = 0,
  showHandle = true,
  showClose = true,
  className = '',
}: BottomSheetProps) {
  const [currentSnap, setCurrentSnap] = useState(initialSnap);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const sheetRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef(0);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setCurrentSnap(initialSnap);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, initialSnap]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    startYRef.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const diff = e.touches[0].clientY - startYRef.current;
    setDragOffset(Math.max(0, diff));
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (dragOffset > 100) {
      if (currentSnap > 0) {
        setCurrentSnap(currentSnap - 1);
      } else {
        onClose();
      }
    } else if (dragOffset < -50 && currentSnap < snapPoints.length - 1) {
      setCurrentSnap(currentSnap + 1);
    }
    setDragOffset(0);
  };

  if (!isOpen) return null;

  const snapHeight = snapPoints[currentSnap] * 100;
  const actualHeight = isDragging
    ? `calc(${snapHeight}vh - ${dragOffset}px)`
    : `${snapHeight}vh`;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
        style={{ opacity: isDragging ? 0.3 : 0.5 }}
      />
      <div
        ref={sheetRef}
        className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-xl flex flex-col transition-all duration-300 ease-out ${className}`}
        style={{
          height: actualHeight,
          maxHeight: '95vh',
          transition: isDragging ? 'none' : undefined,
        }}
      >
        {showHandle && (
          <div
            className="flex justify-center py-3 cursor-grab active:cursor-grabbing touch-none"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
          </div>
        )}

        {(title || showClose) && (
          <div className="flex items-center justify-between px-4 pb-3 border-b">
            {title && <h2 className="text-lg font-semibold text-gray-900">{title}</h2>}
            {showClose && (
              <button
                onClick={onClose}
                className="p-2 -mr-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}

        <div className="flex-1 overflow-auto p-4">
          {children}
        </div>
      </div>
    </div>
  );
}

interface BottomSheetActionProps {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'danger';
  disabled?: boolean;
}

export function BottomSheetAction({
  icon,
  label,
  onClick,
  variant = 'default',
  disabled = false,
}: BottomSheetActionProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center w-full px-4 py-3 min-h-[52px] transition ${
        variant === 'danger'
          ? 'text-red-600 hover:bg-red-50'
          : 'text-gray-700 hover:bg-gray-50'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <span className="mr-3">{icon}</span>
      <span className="font-medium">{label}</span>
    </button>
  );
}
