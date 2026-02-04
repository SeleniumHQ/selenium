# WebDriver Atoms TypeScript Migration - Detailed Analysis

## File Manifest with Metrics

| Phase | File | Lines | Status | Dependencies |
|-------|------|-------|--------|--------------|
| **Phase 1: Foundation** | | | | |
| | webdriver.atoms.inject | ~50 | Blueprint | atoms-ts only |
| **Phase 2: Storage** | | | | |
| | storage/local_storage | 96 | Independent | None |
| | storage/session_storage | 96 | Independent | None |
| | storage/appcache | 36 | Independent | None |
| **Phase 3: Core** | | | | |
| | element | 281 | High value | bot.dom, bot.action |
| | attribute | 192 | High value | bot.dom |
| | inputs | 205 | High value | bot.action, element |
| **Phase 4: Inject** | | | | |
| | inject/execute_script | 83 | Medium | inject base |
| | inject/appcache | 36 | Simple | storage.appcache |
| | inject/sql_database | 57 | Simple | inject base |
| | inject/frame | 98 | Medium | bot.dom |
| | inject/find_element | 113 | Medium | bot.dom |
| | inject/dom | 177 | Medium | bot.dom, element |
| | inject/local_storage | 101 | Medium | storage.local_storage |
| | inject/session_storage | 101 | Medium | storage.session_storage |
| | inject/action | 249 | Complex | element, inputs |
| **Phase 5: Export** | | | | |
| | exports/inputs | 39 | Simple | inputs |
| **TOTAL** | **16 files** | **~1960** | **100%** | **atoms-ts modules** |

## Dependency Matrix

```
Legend:
→ depends on
◆ is blocked by (reverse dependency)
```

### Initialization Order

```
START
  ↓
Phase 1: webdriver.atoms.inject (base module)
  ↓ (unblocks all others)
  ├─→ Phase 2: storage/* (3 parallel)
  │    ├─→ local_storage
  │    ├─→ session_storage
  │    └─→ appcache
  │
  ├─→ Phase 3: core atoms (3 sequential)
  │    ├─→ attribute.ts (no dependencies on other webdriver atoms)
  │    ├─→ element.ts (no dependencies on other webdriver atoms)
  │    └─→ inputs.ts (can use element utilities)
  │
  └─→ Phase 4: inject/* (depends on Phase 2 + 3)
       ├─→ Tier 1 (simple, no cross-dependencies):
       │    ├─→ execute_script
       │    ├─→ appcache (→ storage.appcache)
       │    └─→ sql_database
       │
       ├─→ Tier 2 (medium):
       │    ├─→ frame
       │    ├─→ find_element
       │    └─→ dom (can use element utilities)
       │
       ├─→ Tier 3 (storage wrappers):
       │    ├─→ local_storage (→ storage.local_storage)
       │    └─→ session_storage (→ storage.session_storage)
       │
       └─→ Tier 4 (complex):
            └─→ action (→ element, inputs)
              ↓
      Phase 5: exports/* (final wrappers)
         └─→ exports/inputs (→ inputs)
              ↓
            END (All modules compiled)
```

## Closure to TypeScript Conversion Patterns

### Pattern 1: Namespace to Module Export

**Before (Closure):**

```javascript
goog.provide('webdriver.atoms.element');
goog.require('bot.dom');

webdriver.atoms.element.isDisplayed = function(element) {
  return bot.dom.isShown(element);
};

webdriver.atoms.element.getAttribute = function(element, name) {
  return element.getAttribute(name);
};
```

**After (TypeScript):**

```typescript
import * as dom from '../../atoms-ts/src/dom';

export function isDisplayed(element: Element): boolean {
  return dom.isShown(element);
}

export function getAttribute(element: Element, name: string): string | null {
  return element.getAttribute(name);
}
```

### Pattern 2: Object to Class Conversion

**Before (Closure):**

```javascript
webdriver.atoms.element.Size = function(width, height) {
  this.width = width;
  this.height = height;
};
```

**After (TypeScript):**

```typescript
export interface Size {
  width: number;
  height: number;
}

export function getSize(element: Element): Size {
  const rect = element.getBoundingClientRect();
  return { width: rect.width, height: rect.height };
}
```

### Pattern 3: Script Injection Conversion

**Before (Closure):**

```javascript
goog.provide('webdriver.atoms.inject.action');
goog.require('bot.action');

webdriver.atoms.inject.action = {};
webdriver.atoms.inject.action.click = function(element) {
  return bot.action.click(element);
};
```

**After (TypeScript):**

```typescript
import * as action from '../../atoms-ts/src/action';
import { injectScript } from './inject';

export function click(element: Element): void {
  return injectScript(() => {
    return action.click(element);
  });
}
```

### Pattern 4: JSON Serialization

**Before (Closure):**

```javascript
goog.require('goog.json');
goog.json.serialize(result);
```

**After (TypeScript):**

```typescript
JSON.stringify(result);  // Native JSON API
```

### Pattern 5: Array Iteration

**Before (Closure):**

```javascript
goog.require('goog.array');
goog.array.forEach(elements, function(elem) {
  return elem.getAttribute('name');
});
```

**After (TypeScript):**

```typescript
elements.forEach((elem: Element) => {
  return elem.getAttribute('name');
});
// or map:
elements.map((elem: Element) => elem.getAttribute('name'));
```

## Critical Implementation Notes

### For inject/action.ts

The action injection module is the most complex because it:

1. Bridges between webdriver elements and bot.action functions
2. Handles coordinate translation
3. Manages element state during actions
4. Supports multiple browser event types

**Key considerations:**

- Must handle MSPointerEvent for IE10 (already done in bot atoms)
- Must coordinate with touchscreen for mobile
- Must preserve event ordering

### For element.ts

The element module is a bridge between WebDriver and bot DOM functions:

1. Size calculation (must handle transform matrices)
2. Visibility detection (uses bot.dom.isShown with opacity handling)
3. Attribute access (must handle HTML attributes vs DOM properties)
4. CSS property access (must use getComputedStyle)

**Key considerations:**

- CSS property names can differ from JavaScript property names
- Some properties are read-only
- Must handle pseudo-elements separately

### For storage/* modules

These are the simplest because they directly wrap Web Storage APIs:

- No Closure Library usage
- No bot module dependencies
- Simple try-catch error handling for cross-origin issues

**Key considerations:**

- sessionStorage and localStorage throw on private browsing in some browsers
- AppCache is deprecated, but still in use in some Selenium tests
- Must handle QuotaExceededError

## Testing Strategy

### Unit Tests

- Each module tested in isolation
- Mock element/DOM as needed
- Test browser compatibility variations

### Integration Tests

- Test inject modules calling through to bot modules
- Test element operations on real DOM
- Test storage operations in different contexts

### Cross-Browser Tests

- IE11 (if still supported)
- Firefox latest
- Chrome latest
- Safari latest
- Edge (Chromium-based)

## Configuration Files Needed

### tsconfig.json (if not inherited)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "declaration": true,
    "strict": true
  }
}
```

### BUILD.bazel Template

```bazel
load("//common:defs.bzl", "ts_project")

ts_project(
    name = "module_name",
    srcs = ["module_name.ts"],
    declaration = True,
    declaration_map = True,
    resolve_json_module = True,
    source_map = True,
    tsconfig = "tsconfig.json",
    deps = [
        "//javascript/atoms-ts/src:module_dep",
        # other internal deps
    ],
    visibility = ["//javascript:__subpackages__"],
)
```

## Success Metrics

### Build Metrics

- ✅ All 16 modules compile without errors
- ✅ Zero TypeScript strict mode violations
- ✅ All type definitions properly inferred or explicit
- ✅ Source maps generated correctly

### API Metrics

- ✅ 100% of public functions exported
- ✅ All function signatures match original
- ✅ All return types compatible with original

### Code Quality Metrics

- ✅ No `any` types in critical paths (max 5%)
- ✅ JSDoc comments converted to TypeScript
- ✅ Consistent naming conventions

### Coverage Metrics

- ✅ All critical paths tested
- ✅ Browser compatibility verified
- ✅ Integration tests passing
