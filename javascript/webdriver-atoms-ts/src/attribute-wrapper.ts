// Wrapper to make the attribute.get function callable from browser script execution
// This wraps the minified getAttribute function to work with Selenium's .apply() pattern
import { get } from './attribute';

// Return the function directly - esbuild will bundle and return this
export default (element: Element, name: string): string | null => {
    return get(element, name);
};



