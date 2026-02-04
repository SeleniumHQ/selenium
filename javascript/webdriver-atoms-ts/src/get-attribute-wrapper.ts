// Wrapper for getAttribute that exports to window.__getAttribute__
import { get } from './attribute';

// Export function to window object for browser execution
(globalThis as any).__getAttribute__ = (element: Element, name: string): string | null => {
    return get(element, name);
};
