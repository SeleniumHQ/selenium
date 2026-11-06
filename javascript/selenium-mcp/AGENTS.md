<!-- Guidance for AI agents working on the Selenium MCP server -->

## Code location

- Server: `javascript/selenium-mcp/lib/`
  - `server.js`: MCP server and tool registration
  - `session.js`: browser lifecycle, options, Grid URL, console capture over BiDi
  - `snapshot.js`: the in-page accessibility walk and the ref table
  - `tools/`: one file per tool group (`navigate`, `interact`, `inspect`, `bidi`)
- CLI: `javascript/selenium-mcp/bin/selenium-mcp.js`, flags parsed in `lib/cli.js`
- Tests: `test/unit/` (no browser, jsdom) and `test/e2e/` (real browser, in-memory MCP client)

## Common commands

- Unit tests: `bazel test //javascript/selenium-mcp:small-tests`
- Browser tests: `bazel test //javascript/selenium-mcp:e2e-tests-chrome`
- Lint: `bazel test //javascript/selenium-mcp:eslint-test //javascript/selenium-mcp:prettier-test`

## Rules for tools

- Match `@playwright/mcp` names, arguments and semantics wherever the operation is the same. `selenium_*` is only for
  what Selenium alone can offer.
- The tool list is sent to the agent on every turn. Keep descriptions short; `test/unit/tools_test.js` enforces the
  token budget and the exact tool set.
- Tools take refs, never selectors. Errors meant for the agent are `ToolError`s with a next step in the message
  ("Call browser_snapshot to get fresh refs").
- Actions return `actionResult(...)` so the agent gets a fresh snapshot without another call.
- Never write to stdout outside the MCP transport; logs go to stderr.

## Code conventions

Follow `javascript/selenium-webdriver/AGENTS.md` for logging (`selenium-webdriver/lib/logging`, logger names under
`selenium.mcp.`), deprecation and JSDoc.

`collectNodes` in `lib/snapshot.js` runs inside the page and is serialized with `Function#toString`: it must not use
anything from its module scope.
