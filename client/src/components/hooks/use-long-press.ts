import { useCallback, useRef } from 'react';

interface UseLongPressOptions {
  onLongPress: () => void;
  onShortPress?: () => void;
  delay?: number;
}

export function useLongPress(options: UseLongPressOptions) {
  const { onLongPress, onShortPress, delay = 500 } = options;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressRef = useRef(false);

  const start = useCallback((event: React.TouchEvent | React.MouseEvent) => {
    event.preventDefault();
    isLongPressRef.current = false;
    
    timeoutRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      onLongPress();
    }, delay);
  }, [onLongPress, delay]);

  const clear = useCallback((event?: React.TouchEvent | React.MouseEvent) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    if (!isLongPressRef.current && onShortPress && event) {
      onShortPress();
    }
  }, [onShortPress]);

  return {
    onMouseDown: start,
    onMouseUp: clear,
    onMouseLeave: clear,
    onTouchStart: start,
    onTouchEnd: clear,
  };
}
