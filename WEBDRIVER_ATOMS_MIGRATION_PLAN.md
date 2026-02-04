# WebDriver Atoms TypeScript Migration Plan

## Overview

Migrate `javascript/webdriver/atoms` directory (16 files, ~1960 lines) from Google Closure Library to TypeScript, following the established patterns from the `javascript/atoms` migration.

## Key Differences from atoms Migration

- **Scope**: WebDriver-specific high-level atom wrappers (narrower focus than base atoms)
- **Dependencies**: Heavy reliance on the already-migrated `javascript/atoms-ts` modules
- **Structure**: Three organizational tiers:
  - Top-level atoms (element.js, attribute.js, inputs.js)
  - Inject atoms (in `inject/` subdirectory - for script injection)
  - Storage atoms (in `storage/` subdirectory - for web storage access)
- **Export modules**: Specialized export wrappers (e.g., exports/inputs.js)

## File Organization & Dependencies

### Dependency Graph Analysis

```
Foundation (depends on atoms-ts):
├── webdriver.atoms.inject (base injection utilities)
│   └── Depends on: bot.inject, goog.json, webdriver.atoms
│
Core WebDriver Atoms:
├── webdriver.atoms.element (281 lines)
│   └── Depends on: bot.action, bot.dom, bot.Keyboard.Keys, goog.array, goog.style, goog.math.Coordinate
│
├── webdriver.atoms.attribute (192 lines)
│   └── Depends on: bot.dom, goog.style
│
├── webdriver.atoms.inputs (205 lines)
│   └── Depends on: bot.action, bot.dom, bot.events, goog.array
│
Inject Atoms (Script Injection Wrappers):
├── webdriver.atoms.inject.action (249 lines)
│   └── Depends on: bot.action, bot.inject, webdriver.atoms.element, webdriver.atoms.inject
│
├── webdriver.atoms.inject.dom (177 lines)
│   └── Depends on: bot.dom, bot.inject, webdriver.atoms.inject
│
├── webdriver.atoms.inject.find_element (113 lines)
│   └── Depends on: bot.dom, bot.inject, webdriver.atoms.inject
│
├── webdriver.atoms.inject.frame (98 lines)
│   └── Depends on: bot.dom, bot.inject, webdriver.atoms.inject
│
├── webdriver.atoms.inject.execute_script (83 lines)
│   └── Depends on: bot.inject, bot.utils, webdriver.atoms.inject
│
├── webdriver.atoms.inject.local_storage (101 lines)
│   └── Depends on: webdriver.atoms.inject, webdriver.atoms.storage.local_storage
│
├── webdriver.atoms.inject.session_storage (101 lines)
│   └── Depends on: webdriver.atoms.inject, webdriver.atoms.storage.session_storage
│
├── webdriver.atoms.inject.appcache (36 lines)
│   └── Depends on: webdriver.atoms.inject, webdriver.atoms.storage.appcache
│
└── webdriver.atoms.inject.sql_database (57 lines)
    └── Depends on: webdriver.atoms.inject
│
Storage Atoms (Web Storage Utilities):
├── webdriver.atoms.storage.local_storage (96 lines)
│   └── Depends on: (no webdriver atoms, direct web APIs)
│
├── webdriver.atoms.storage.session_storage (96 lines)
│   └── Depends on: (no webdriver atoms, direct web APIs)
│
├── webdriver.atoms.storage.appcache (36 lines)
│   └── Depends on: (no webdriver atoms, direct web APIs)
│
Export Modules:
└── webdriver.atoms.exports.inputs (39 lines)
    └── Depends on: webdriver.atoms.inputs
```

## Migration Strategy

### Phase 1: Foundation & Base Utilities

**Files**: 1 file
**Total Lines**: ~50 (estimated for webdriver.atoms.inject base)
**Dependencies**: atoms-ts modules only
**Priority**: FIRST - blocks all other webdriver atoms

1. **webdriver.atoms.inject** (base injection utilities module)
   - Create injection context wrapper
   - Implement JSON serialization helpers
   - Build injection result handling

### Phase 2: Storage Atoms (Independent Web APIs)

**Files**: 3 files
**Total Lines**: ~228
**Dependencies**: None on webdriver atoms, only web APIs
**Priority**: SECOND - no interdependencies, can run in parallel

1. **webdriver.atoms.storage.local_storage** (96 lines)
   - Direct localStorage API wrapper
   - No dependencies on other webdriver atoms

2. **webdriver.atoms.storage.session_storage** (96 lines)
   - Direct sessionStorage API wrapper
   - No dependencies on other webdriver atoms

3. **webdriver.atoms.storage.appcache** (36 lines)
   - Application cache API wrapper
   - No dependencies on other webdriver atoms

### Phase 3: Core WebDriver Atoms

**Files**: 3 files
**Total Lines**: ~678
**Dependencies**: atoms-ts modules (dom, action, events, keyboard, mouse)
**Priority**: THIRD - needed by inject atoms

1. **webdriver.atoms.element** (281 lines)
   - Element visibility and interactability checks
   - Element property accessors (text, attributes, size, location)
   - Element state management
   - Dependencies: bot.action, bot.dom, bot.Keyboard.Keys

2. **webdriver.atoms.attribute** (192 lines)
   - Element attribute getter/setter
   - CSS property access (via goog.style → window.getComputedStyle)
   - Direct attribute manipulation
   - Dependencies: bot.dom

3. **webdriver.atoms.inputs** (205 lines)
   - High-level input automation helpers
   - Clear/set value operations
   - Click and type helpers
   - Dependencies: bot.action, bot.dom, bot.events

### Phase 4: Inject Atoms (Script Injection Wrappers)

**Files**: 9 files
**Total Lines**: ~1048
**Dependencies**: Core atoms + storage atoms + bot modules
**Priority**: FOURTH - builds on Phases 1-3

#### A. Simple Inject Atoms (minimal logic)

1. **webdriver.atoms.inject.execute_script** (83 lines)
   - Script execution wrapper
   - Result serialization
   - Dependencies: bot.inject, webdriver.atoms.inject

2. **webdriver.atoms.inject.appcache** (36 lines)
   - App cache status injection
   - Dependencies: webdriver.atoms.inject, webdriver.atoms.storage.appcache

3. **webdriver.atoms.inject.sql_database** (57 lines)
   - SQL database injection wrapper
   - Dependencies: webdriver.atoms.inject

#### B. Medium Inject Atoms (moderate logic)

4. **webdriver.atoms.inject.frame** (98 lines)
   - Frame/window context switching
   - Dependencies: bot.dom, webdriver.atoms.inject

2. **webdriver.atoms.inject.find_element** (113 lines)
   - Element finding with multiple strategies
   - XPath, CSS selectors, etc.
   - Dependencies: bot.dom, webdriver.atoms.inject

3. **webdriver.atoms.inject.dom** (177 lines)
   - DOM manipulation helpers
   - Cookie handling
   - Dependencies: bot.dom, webdriver.atoms.inject

#### C. Storage Inject Atoms (wrapper pattern)

7. **webdriver.atoms.inject.local_storage** (101 lines)
   - Injection wrapper for localStorage
   - Depends on: webdriver.atoms.inject, webdriver.atoms.storage.local_storage

2. **webdriver.atoms.inject.session_storage** (101 lines)
   - Injection wrapper for sessionStorage
   - Depends on: webdriver.atoms.inject, webdriver.atoms.storage.session_storage

#### D. Complex Inject Atoms (most logic)

9. **webdriver.atoms.inject.action** (249 lines)
   - High-level action injection
   - Uses element utilities
   - Multiple action types
   - Dependencies: bot.action, webdriver.atoms.inject, webdriver.atoms.element

### Phase 5: Export Modules

**Files**: 1 file
**Total Lines**: ~39
**Dependencies**: Core atoms
**Priority**: FIFTH - final consumer-facing wrappers

1. **webdriver.atoms.exports.inputs** (39 lines)
   - Exposed inputs API
   - Result formatting
   - Dependencies: webdriver.atoms.inputs

## Implementation Order (Recommended)

### Execution Timeline

1. **Week 1: Foundation + Storage** (4 files, ~300 lines)
   - Phase 1: webdriver.atoms.inject base
   - Phase 2: All 3 storage modules (can be parallel)
   - Build validation: Verify storage modules compile

2. **Week 2: Core Atoms** (3 files, ~678 lines)
   - Phase 3: attribute.ts (simplest, no other webdriver atom deps)
   - Phase 3: element.ts (moderate complexity)
   - Phase 3: inputs.ts (depends on element for some operations)
   - Build validation: Verify all 3 core atoms compile together

3. **Week 3: Simple Inject Atoms** (3 files, ~176 lines)
   - Phase 4A: execute_script, appcache, sql_database
   - Build validation: Verify all 3 inject atoms compile

4. **Week 4: Medium-Complexity Inject Atoms** (3 files, ~388 lines)
   - Phase 4B: frame, find_element, dom
   - Build validation: Test against core atoms

5. **Week 5: Storage Inject + Action** (3 files, ~351 lines)
   - Phase 4C: local_storage, session_storage inject wrappers
   - Phase 4D: action injection (most complex)
   - Build validation: Full integration test

6. **Week 6: Export Modules** (1 file, ~39 lines)
   - Phase 5: exports/inputs
   - Final build validation: All 16 modules compile together

## Key Patterns & Lessons Learned

### From atoms Migration

1. **Dependency Management**: Always identify complete dependency chain before starting
2. **Type Casting**: Use `as any` sparingly; prefer explicit type definitions
3. **Closure Conversions**:
   - `goog.array.forEach()` → native `forEach()`
   - `goog.style` → `window.getComputedStyle()`
   - `goog.dom.TagName` → string comparisons
   - `goog.math.Coordinate/Size` → simple objects `{x, y}` or `{width, height}`
   - `goog.userAgent` → userAgent module exports
4. **Singleton Patterns**: Convert Closure singleton getters to static class methods
5. **Module Organization**: Each file should export clear, namespaced functions

### Specific to WebDriver Atoms

1. **Injection Context**: The `webdriver.atoms.inject` module is critical for script execution
   - Handle serialization of complex types
   - Manage injection result parsing
   - Coordinate with Closure's goog.json
2. **Browser Compatibility**: Maintain compatibility with older browsers (some atoms support IE9+)
3. **Web Storage APIs**: Modern APIs, minimal Closure usage
4. **Element API Compatibility**: Must match Selenium WebElement interface expectations

## BUILD.bazel Structure

Create `javascript/webdriver-atoms-ts/src/BUILD.bazel` with rules:

```bazel
# Storage atoms (independent)
ts_project(name = "local_storage", ...)
ts_project(name = "session_storage", ...)
ts_project(name = "appcache", ...)

# Core atoms (depend on atoms-ts)
ts_project(name = "element", deps = [":bot", ":dom", ":action", ...])
ts_project(name = "attribute", deps = [":bot", ":dom", ...])
ts_project(name = "inputs", deps = [":bot", ":action", ":element", ...])

# Inject atoms (depend on core)
ts_project(name = "inject_action", deps = [":action", ":element", ":inject", ...])
ts_project(name = "inject_dom", deps = [":dom", ":inject", ...])
# ... etc

# Export modules
ts_project(name = "exports_inputs", deps = [":inputs", ...])
```

## Risk Assessment & Mitigation

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Complex injection context | High | Start with Phase 1, write comprehensive tests |
| Cross-browser compatibility | High | Test against browsers used in Selenium CI |
| Breaking changes to Element API | High | Maintain 100% API compatibility, use integration tests |
| Circular dependencies | Medium | Map all dependencies before starting, use bazel query |
| Type safety issues | Medium | Use strict TypeScript mode, minimize `any` casts |
| Storage API browser support | Low | Use try-catch for older browsers, feature detection |

## Success Criteria

✅ All 16 files migrated to TypeScript
✅ All modules compile with Exit Code 0
✅ Zero breaking changes to public APIs
✅ Full test coverage for critical paths
✅ Documentation updated with new module structure
✅ BUILD.bazel rules created and validated
✅ No Closure Library dependencies remain

## Estimated Effort

- **Phase 1**: 4-6 hours
- **Phase 2**: 6-8 hours (can be parallel)
- **Phase 3**: 10-12 hours
- **Phase 4**: 20-24 hours (dependent work, sequential)
- **Phase 5**: 2-3 hours
- **Testing & Validation**: 8-10 hours
- **Documentation**: 3-4 hours

**Total**: ~60-80 hours (2-3 weeks at 20-30 hrs/week)

## Next Steps

1. ✅ Review this plan and identify any additional dependencies
2. Create `javascript/webdriver-atoms-ts/src` directory structure
3. Begin Phase 1: webdriver.atoms.inject base module
4. Create parallel development branches for each phase
5. Set up continuous integration validation
