# LLM-Facing Documentation

- Status: Proposed
- Owner: unassigned
- Scope: this repo (API reference + shipped artifacts), with flagged tasks in `SeleniumHQ/seleniumhq.github.io`

## Purpose

Selenium's documentation is written for humans reading a browser. A growing share of it is instead
read by models — during training, during retrieval, and live via fetch when a coding agent is asked
to "write a Selenium test". When that reading goes badly, the model falls back on its stale priors
and emits `DesiredCapabilities`, `executable_path=`, `find_element_by_id`, a third-party driver
manager, and a `sleep` where a wait belongs. Users then attribute that code to Selenium.

This plan makes the documentation this repo produces legible and authoritative to machine readers,
so that the code models generate is the code the project actually recommends.

## Current state

### The pipeline

Five independent generators, one aggregator, one publish step:

| Binding | Generator | Bazel target |
| --- | --- | --- |
| Java | Javadoc | `//java/src/org/openqa/selenium/grid:all-javadocs` |
| Python | Sphinx + `pydata_sphinx_theme` | `//py:docs` |
| Ruby | YARD | `//rb:docs` |
| JavaScript | JSDoc + `clean-jsdoc-theme` | `//javascript/selenium-webdriver:docs` |
| .NET | DocFX | `//dotnet:docs` |

`./go all:docs` (`Rakefile:202`) invokes each `<lang>:docs` task, which stages HTML into
`build/docs/api/<lang>`. `.github/workflows/update-documentation.yml` uploads that as an artifact
and commits it to the `gh-pages` branch under `docs/api/`, served at
`https://www.selenium.dev/selenium/docs/api/<lang>/`. It is called from `release.yml:258`.

### Findings

1. **The API reference is invisible to `llms.txt`.** `https://www.selenium.dev/llms.txt` exists and
   is good — it covers the narrative docs and already carries "notes for tools generating Selenium
   code". It contains no link to any API reference. `https://www.selenium.dev/selenium/docs/api/llms.txt`
   is a 404. The reference is a large, authoritative corpus with no machine-readable entry point.

2. **HTML only; existing machine-readable indexes are thrown away.** Sphinx emits `objects.inv`,
   Javadoc emits `element-list`, DocFX emits `xrefmap.yml`. All three are produced today as
   byproducts, none are advertised, linked, or placed at a documented path.

3. **Docs regenerate only at release.** Every `<lang>:docs` task aborts on a nightly/snapshot
   version unless passed `force` (`rake_tasks/java.rake:350`, `python.rake:116`, `ruby.rake:133`,
   `dotnet.rake:82`, `node.rake:121`), and the workflow only runs from `release.yml`. New API is
   undiscoverable to crawlers and fetch-time retrieval for the whole release cycle.

4. **Python has a duplicate-content problem that actively poisons model output.** Three copies
   compete: `selenium.dev/selenium/docs/api/py` (release), `selenium-python-api-docs.readthedocs.io`
   (per-commit, per `py/docs/.readthedocs.yaml`), and the unofficial, years-stale
   `selenium-python.readthedocs.io` that dominates search and model recall. No `html_baseurl`, no
   `rel=canonical` on any of them. `py/docs/source/index.rst` points readers at Read the Docs as the
   fresher source, reinforcing the split.

5. **Fetch fidelity varies sharply by generator.** Javadoc and Sphinx extract cleanly to text.
   Fetching the .NET landing page through a normal text extractor failed to return content within a
   five-minute budget; DocFX's `outputFormat: apiPage` is commented out in `dotnet/docs/docfx.json`
   with the note "generation with errors". YARD and `clean-jsdoc-theme` navigation is client-side.
   Where extraction fails, the model gets nothing and substitutes its priors.

6. **Java has no orientation page.** There is no `overview.html`, so the Javadoc landing page is a
   bare table of ~120 package names with no "start here", no task framing, and no link back to the
   narrative docs. Per-package prose is in decent shape (112 `package-info.java` across 126 package
   directories) — the entry point is the gap.

7. **Deprecations are not available as data.** Markers exist in source (30 Java files with
   `@Deprecated`, 7 JavaScript, 5 Python, 4 Ruby, 3 .NET `[Obsolete]`) and the project has a written
   deprecation policy, but there is no single "this is gone, use that instead" dataset. That mapping
   is precisely the highest-value artifact for correcting model output, and it does not exist in any
   consumable form.

8. **Nothing LLM-facing ships inside the installed artifact.** The wheel, gem, jar, npm package and
   nupkg contain no `llms.txt`, no agent instructions, no pointer to canonical guidance. An agent
   working in a user's repo has the package on disk and no grounding from it.

## Plan

Six tracks. Track C is five fully independent per-binding tasks. Waves below give the parallelism.

### Track A — Machine-readable entry points for the API reference

- **A1. `docs/api/llms.txt`.** Generated as part of `all:docs`. Names each binding's reference, its
  stable URL pattern, the location of its symbol inventory (A3), and the guidance dataset (D2).
  Mirrors the tone of the existing site `llms.txt`.
- **A2. `docs/api/index.html`.** A real landing page at `/selenium/docs/api/`: pick your language,
  what this is versus the narrative docs, current version, link to the previous version. Today that
  path has no page of its own.
- **A3. Publish the inventories.** Copy `objects.inv`, `element-list` and `xrefmap.yml` to
  documented, stable paths under `docs/api/<lang>/` and describe their format in A1. Cheap: they are
  already generated.
- **A4. Canonical + sitemap.** Emit `rel=canonical` and a per-binding `sitemap.xml`; add the
  `Sitemap:` reference for `/selenium/docs/api/` (site repo — see B).

### Track B — Canonical-URL hygiene (partly cross-repo)

- **B1. Settle the one canonical home for the Python API docs.** Set `html_baseurl` in
  `py/docs/source/conf.py`, have the Read the Docs build emit `rel=canonical` at that base, and
  rewrite the `index.rst` wording so the release build is named as authoritative and Read the Docs as
  the preview.
- **B2. Link the API reference from the site `llms.txt`.** Cross-repo. Add a per-language API
  reference section, and state the relationship: narrative docs for how, API reference for exact
  signatures.
- **B3. Reduce recall of the unofficial Python docs.** Cross-repo/outreach. Options, in order of
  effort: a clearly-labelled canonical Python API landing page that outranks it, a request to the
  maintainer for a deprecation banner and canonical link, and explicit correction in the guidance
  dataset (D2).

### Track C — Make each generator's output extract cleanly (five parallel tasks)

Each task ends with the same acceptance check: fetch the landing page and one deep symbol page
through a plain text extractor, and assert the class name, method signatures, and parameter docs all
survive.

- **C1. Java.** Add `overview.html` with orientation and links to selenium.dev; confirm the Javadoc
  invocation emits no-frames output and consider `-linksource`.
- **C2. Python.** Add `html_baseurl`, `sphinx.ext.intersphinx`, and `sphinx.ext.linkcode` pointing at
  GitHub (`html_show_sourcelink` is on today with nowhere useful to go).
- **C3. Ruby.** Ensure the YARD index is content rather than a frameset and that class pages carry
  their own navigation; pass a landing README that orients rather than repeats install steps.
- **C4. JavaScript.** Verify `clean-jsdoc-theme` member pages are server-rendered and readable with
  JavaScript disabled; add narrative-doc links to the theme menu in `jsdoc_conf.json`.
- **C5. .NET.** Highest-risk of the five. Reopen `outputFormat: apiPage` in `dotnet/docs/docfx.json`,
  or emit a Markdown/plain-text sidecar per type, so the .NET surface is extractable at all.

### Track D — The guidance dataset

- **D1. Generate deprecation data from source.** Per binding, extract deprecation markers and their
  replacement text into `deprecations.json`; merge into one cross-binding file published under
  `docs/api/`. Makes the deprecation policy machine-checkable as a side effect.
- **D2. Curate the anti-pattern → replacement corpus.** The small, high-leverage file: driver paths
  and third-party driver managers → Selenium Manager; `DesiredCapabilities` → Options; `sleep` and
  mixed implicit/explicit waits → explicit waits; CDP → BiDi; `find_element_by_*` → `By`. Each entry
  gets the wrong form, the right form, the version it changed in, and a canonical doc link. Publish
  as data, reference from A1 and B2, and reuse the wording already in the site `llms.txt` notes.
- **D3. Publish the ADRs.** `docs/decisions/` holds the authoritative reasoning (for example
  `17670-bidi-implementation-boundaries.md`). Include them in the published set and index them in
  A1 — "why the API is this way" is what stops a model inventing an alternative.

### Track E — Ship guidance inside the artifacts

- **E1.** Add a short `llms.txt` (or `AGENTS.md`) to the wheel, gem, npm package, jar and nupkg:
  version, canonical doc URLs, the D2 rules in brief. Every task is independent per binding.
- **E2.** Publish an official Selenium agent skill / MCP-ready description built from D2 and D3, so
  agents can be pointed at project-authored guidance instead of inferring it.

### Track F — Cadence and verification

- **F1. Nightly docs.** Publish nightly builds to a separate `nightly/` path so new API is
  discoverable without clobbering the release reference. The `force` argument already exists.
- **F2. Documentation-coverage gate.** Per-binding CI check that new public API arrives documented.
  Small unit-test-shaped checks, not browser tests.
- **F3. Fetch-fidelity check in CI.** Automate the C-track acceptance check across all five
  bindings so extraction never silently regresses.
- **F4. Measure it.** A fixed prompt set ("write a Selenium test that…", one per binding) scored for
  the D2 anti-patterns. Run once **before** any other work to get a baseline, and again at the end.
  Without this the whole plan is unfalsifiable.

## Parallelism

```
Wave 0  (no dependencies — all concurrent)
        F4 baseline · C1 · C2 · C3 · C4 · C5 · A3 · D1 · D2

Wave 1  (needs Wave 0 output paths / dataset)
        A1 · A2 · A4 · B1 · D3 · F1 · F2 · F3

Wave 2  (needs canonical URLs from B1, dataset from D)
        B2 · B3 · E1 (×5 bindings, concurrent) · E2

Wave 3  F4 re-run against the baseline
```

Notes on ordering: **F4's baseline must run first** or there is nothing to compare against. D2 is in
Wave 0 because A1, B2 and E1 all consume it; it is editorial work and needs no code. The five C
tasks touch five disjoint directories and five disjoint Bazel targets — no coordination needed
beyond a shared acceptance check. Within Wave 2, the five E1 tasks are likewise disjoint.

## Risk

Docs generation touches build/test wiring (`rake_tasks/`, `.github/workflows/`) — tooling with wide
blast radius, per the repo's own guidance. Every track is additive to published output; none changes
public API or wire behavior. C5 (.NET DocFX) carries real risk of breaking the existing .NET docs
build and should land on its own. B2, B3 and A4 require changes in `seleniumhq.github.io` and
coordination with the docs team.
