import { useEffect } from 'react';

export const useKeyboardShortcuts = (shortcuts) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Check for Ctrl/Cmd + key combinations
      const isMod = event.ctrlKey || event.metaKey;
      
      shortcuts.forEach(({ key, ctrl, alt, shift, callback }) => {
        const keyMatch = event.key.toLowerCase() === key.toLowerCase();
        const ctrlMatch = ctrl ? isMod : !isMod;
        const altMatch = alt ? event.altKey : !event.altKey;
        const shiftMatch = shift ? event.shiftKey : !event.shiftKey;
        
        if (keyMatch && ctrlMatch && altMatch && shiftMatch) {
          event.preventDefault();
          callback();
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};
