# TypeScript Fragments

This directory contains the modern TypeScript-based fragment generation infrastructure, which replaces the Closure Compiler approach with esbuild.

## Why Replace Closure Compiler?

1. **Google Closure Library is deprecated** - No longer actively maintained
2. **Closure Compiler has limited TypeScript support** - Cannot process esbuild bundles
3. **esbuild is fast** - Much faster build times
4. **Native ES modules** - No need for shims or wrappers during migration

## How It Works

```
┌─────────────────────────────────────────────────────────────────────┐
│ 1. TypeScript Source (atoms/*.ts)                                   │
│    - Pure TypeScript with proper types                              │
│    - ES modules (import/export)                                     │
└────────────────────────┬────────────────────────────────────────────┘
                         │
                         ▼ Compiled by ts_project
┌─────────────────────────────────────────────────────────────────────┐
│ 2. Entry Point (ts-fragments/*.ts)                                  │
│    - Imports the function to export                                 │
│    - Assigns to globalThis.__fragment__                             │
└────────────────────────┬────────────────────────────────────────────┘
                         │
                         ▼ Bundled by esbuild (tree-shaking + minify)
┌─────────────────────────────────────────────────────────────────────┐
│ 3. Bundled JS                                                       │
│    - Single minified IIFE                                           │
│    - Dead code eliminated                                           │
└────────────────────────┬────────────────────────────────────────────┘
                         │
                         ▼ Wrapped by fragment_wrapper.js
┌─────────────────────────────────────────────────────────────────────┐
│ 4. Final Fragment                                                   │
│    function(){                                                      │
│      return (function(){                                            │
│        <bundled code>                                               │
│        return this.__fragment__.apply(null, arguments);             │
│      }).apply(window, arguments);                                   │
│    }                                                                │
└─────────────────────────────────────────────────────────────────────┘
```

## The Wrapper Pattern

The wrapper pattern is critical for Selenium fragments (see [fragment.bzl](../../private/fragment.bzl)):

```javascript
function(){
  return (function(){
    %output%;
    return this.__fragment__.apply(null, arguments);
  }).apply(window, arguments);
}
```

This ensures:
1. **Isolated scope** - The fragment never pollutes the global scope
2. **Window context** - `this === window` so `navigator`/`document` are accessible
3. **Function invocation** - The exported function can be called with arguments

## Creating a New Fragment

### 1. Create the Entry Point

Create a file in `ts-fragments/` that imports and exposes your function:

```typescript
// ts-fragments/my-function.ts
import { myFunction } from '../dist/myModule';

(globalThis as unknown as { __fragment__: typeof myFunction }).__fragment__ = myFunction;
```

Note: Import from `../dist/` to use the compiled JS output from `ts_project`.

### 2. Add the BUILD Rule

```python
# ts-fragments/BUILD.bazel
load("//javascript/private:ts_fragment.bzl", "ts_fragment")

ts_fragment(
    name = "my-function",
    entry_point = "my-function.ts",
    deps = [
        "//javascript/atoms:myModule_ts",  # The ts_project target
    ],
)
```

### 3. Build and Test

```bash
bazel build //javascript/atoms/ts-fragments:my-function

# Test in Node.js (mock window)
node -e "
global.window = global;
const fn = $(cat bazel-bin/javascript/atoms/ts-fragments/my-function.js);
console.log(fn('arg1', 'arg2'));
"
```

## Comparison with Closure Compiler

| Aspect | Closure Compiler | esbuild |
|--------|-----------------|---------|
| Build speed | Slow (Java-based) | Fast (Go-based) |
| Tree-shaking | Excellent | Good |
| Minification | Excellent | Good |
| Source maps | Yes | Yes |
| TypeScript | Via shim layer | Direct (ES modules) |
| Future-proof | Deprecated | Active development |

## Migration Path

1. Migrate atoms to TypeScript (ongoing in `javascript/atoms/*.ts`)
2. Create entry points in `ts-fragments/` for each fragment
3. Once all atoms are TypeScript, switch fragments from Closure to esbuild
4. Remove Closure Compiler dependency
