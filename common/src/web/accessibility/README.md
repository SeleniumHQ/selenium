# Accessibility snapshot corpus

The cross-binding contract for the accessibility snapshot of
[ADR 18205](../../../../docs/decisions/18205-accessibility-tree-snapshot.md).
Every binding runs every page here in each browser it tests and compares its
snapshot to the recorded expectation. The atom's own suite
(`//javascript/atoms:closure-test`, page `accessibility_corpus_typescript_test.html`)
is the first consumer and the thing that records the expectations.

## Layout

```
NNN-name.html                 the page
NNN-name.expected.json        the snapshot of the whole page, as JSON
NNN-name.expected.txt         the same snapshot in the text form of ADR §1
NNN-name.expected.full.json   the unpruned snapshot (interestingOnly false)
NNN-name.expected.full.txt    and its text form
NNN-name.expected[.full].<engine>.json / .txt
                              only where a divergence is recorded below;
                              <engine> is chromium, firefox or webkit
index.json                    the list of page names, in order
```

Each `.html` is a plain page with no test harness. The snapshot is taken of
the whole document, so the root is the `html` element as role `document`
named from the title. Every page is recorded twice: pruned, the default
(ADR §2), and unpruned, with `interestingOnly` false, where every rendered
element produces a node and `generic`, `none` and `presentation` are kept.

## Conventions

- Every rendered element carries an `id`, since every one appears in the
  unpruned form. `expected.json` stores `"element": "<id>"`; a binding maps
  each reference it gets back to its id with one `getAttribute("id")` call.
  Text leaves have no `element` key. The root `html` element has `id="root"`
  and the body `id="body"`.
- Links use absolute `https://example.com/...` hrefs, so the `url` a link
  node records does not depend on where the corpus is served from.
- Empty `description` and `states` are still written (`""` and `{}`), so the
  JSON matches `javascript/atoms/typescript/accessibility-node.schema.json`
  literally. `//javascript/atoms:accessibility-corpus-consistent` checks
  every expectation against that schema and checks that each `.txt` is the
  renderer's output over its `.json`.
- `expected.txt` is produced by the reference renderer
  (`javascript/atoms/typescript/testing/accessibility-text.ts`), never by
  hand. The bindings' `toText` ports are held to these files.
- Pages must be deterministic across engines: no focus, no user-agent text,
  no timing. Images use `../map.png` from this directory's parent.

## Adding or re-recording a page

1. Add `NNN-name.html` and its name to `index.json`.
2. Run the atom's debug server and open the corpus runner in record mode:

   ```sh
   bazel run //javascript/atoms:closure-test_debug_server
   # http://localhost:2310/filez/_main/javascript/atoms/test/accessibility_corpus_typescript_test.html?record=1
   ```

   The page shows the JSON and text it computed for every corpus page, in
   both forms; copy them into the `.expected.json`, `.expected.txt`,
   `.expected.full.json` and `.expected.full.txt` files.
3. Run the corpus page in every browser:

   ```sh
   bazel test //javascript/atoms:closure-test{,-chrome,-edge,-safari} --test_filter=accessibility_corpus_typescript_test
   ```

## Known divergences

Where an engine computes something different from the recorded expectation
and the difference is the engine's rather than a bug in the atom, record an
engine-specific expectation file and list it here with the reason.

_None recorded yet._
