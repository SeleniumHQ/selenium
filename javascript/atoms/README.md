# Javascript Atoms

These "atoms" provide reusable building blocks for browser automation
(which is why we call them "atoms"!) They're currently built with the
Google Closure Compiler, but at some point, we'd love to migrate them
to TypeScript since Closure isn't as widely known.

The atoms that have already been migrated to TypeScript are additionally
published to npm as `@selenium/atoms`, for tooling outside the Selenium
bindings that needs to match Selenium's behaviour. `README.npm.md` is the
consumer-facing documentation for that package; this file is for contributors
working on the atoms themselves.

## Testing the Atoms

### Iteratively

While working on the atoms, it can be helpful to be able to iterate on
the code in your IDE of choice, and then run the tests in a
browser. You can do this by starting a debug server:

```shell
bazel run javascript/atoms:closure-test_debug_server
```

And then navigating to: <http://localhost:2310/filez/_main/javascript/atoms/>

You'll be able to browse around the filesystem until you find the test
you want to work on.

These files are symlinked by bazel to the ones in the source code, so
edits you make there will be reflected in the code in the browser,
however, new files and removed files may cause you to need to restart
the `bazel run` command.

### Using Bazel

You can run all the tests for a browser using:

```shell
bazel test //javascript/atoms:closure-test{,-chrome,-edge,-safari}
```

You can also filter to a specific test using the name of the file
stripped of it's `.html` suffix. For example:

```shell
bazel test --test_filter=shown_test --//common:headless=false javascript/atoms:closure-test-chrome
```

### The accessibility snapshot corpus

The `accessibility-snapshot` atom is also held to the shared corpus in
`common/src/web/accessibility/`, which every binding runs as well. Its QUnit
page is `test/accessibility_corpus_typescript_test.html`; opened with
`?record=1` on the debug server it shows the expectations to record. The
corpus README explains the file layout, and these two Node tests check it
without a browser:

```shell
bazel test //javascript/atoms:accessibility-unit-tests //javascript/atoms:accessibility-corpus-consistent
```

### Measuring the accessibility snapshot

`test/accessibility_bench.html` is not a test (the suite only runs
`*_test.html`). Open it from the debug server to time the atom on fixed tree
shapes and count the DOM calls it makes, so one build of the atom can be
compared with another on the same machine:

<http://localhost:2310/filez/_main/javascript/atoms/test/accessibility_bench.html>

The per-element numbers and the call counts are what to compare; absolute
times depend on the machine. Headless Chromium 141, atom at `961f924`:

| shape | elements | µs / element | getComputedStyle / element | getAttribute / element |
| --- | --- | --- | --- | --- |
| list 8000 | 32,001 | 8 | 1.8 | 10.8 |
| table 1000x10 | 11,002 | 27 | 6.7 | 22.5 |
| headings 4000 | 12,000 | 17 | 5.7 | 17.7 |
| document-like 1000 | 12,000 | 15 | 2.5 | 14.7 |
| fan-in 2000 | 4,003 | 28 | 8.5 | 24.5 |
