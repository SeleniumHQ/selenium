# Selenium MCP server

`@selenium/mcp` is the official [Model Context Protocol](https://modelcontextprotocol.io) server from the Selenium
project. It lets a coding agent drive a real browser through Selenium: the agent reads the page as an accessibility
snapshot with element refs, and acts on those refs. It never has to write or guess a selector.

It is the Selenium bindings exposed as tools, not a test runner. Selenium Manager comes with the bindings, so there is
no driver to install.

> **Status: v0.** Chrome, headless by default, over stdio, one browser per server. See [What v0 covers](#what-v0-covers).

## Setup

You need Node.js `^22.23.4 || ^24.22.1 || >= 26.12.1` and Chrome. Then add the server to your agent:

**Claude Code**

```sh
claude mcp add selenium -- npx @selenium/mcp@latest
```

**Codex**

```sh
codex mcp add selenium -- npx @selenium/mcp@latest
```

**Cursor**: add to `.cursor/mcp.json` (or `~/.cursor/mcp.json`):

```json
{ "mcpServers": { "selenium": { "command": "npx", "args": ["@selenium/mcp@latest"] } } }
```

**VS Code**: add to `.vscode/mcp.json`:

```json
{ "servers": { "selenium": { "command": "npx", "args": ["@selenium/mcp@latest"] } } }
```

Any other MCP client: run `npx @selenium/mcp@latest` as a stdio server.

## Options

| Flag                       | Meaning                                                                 |
| -------------------------- | ----------------------------------------------------------------------- |
| `--browser <name>`         | `chrome` (default). `edge` and `firefox` start but are not yet tested.  |
| `--headless` / `--headed`  | Run headless (the default) or show the window.                          |
| `--grid <url>`             | Run the browser on a Selenium Grid instead of locally.                  |
| `--allowed-origins <list>` | Semicolon-separated origins or hosts (`*.example.com`) the browser may navigate to. |
| `--blocked-origins <list>` | Semicolon-separated origins or hosts it may not navigate to.            |
| `--allow-unrestricted-file-access` | Let `browser_navigate` open `file://` URLs (blocked by default).  |
| `--log-level <level>`      | Log to stderr: `severe`, `warning` (default), `info`, `fine`, `all`. `all` includes raw WebDriver traffic, so typed text such as passwords. |

Flag names match `@playwright/mcp` wherever they mean the same thing.

## Tools

Tool names and arguments match `@playwright/mcp` wherever the operation is the same, so habits and skills files carry
over.

| Tool                       | What it does                                                         |
| -------------------------- | -------------------------------------------------------------------- |
| `browser_snapshot`         | The page as an accessibility tree with refs. `all: true` adds text and structure. |
| `browser_navigate`         | Go to a URL.                                                         |
| `browser_navigate_back`    | Go back.                                                             |
| `browser_click`            | Click a ref (optionally double or right click).                      |
| `browser_type`             | Replace the text in a ref, optionally pressing Enter.                |
| `browser_fill_form`        | Fill several textboxes, checkboxes, radios and selects at once.       |
| `browser_select_option`    | Choose options in a `<select>` by value or label.                    |
| `browser_press_key`        | Press a key or chord (`Enter`, `Control+a`).                         |
| `browser_hover`            | Move the mouse over a ref.                                           |
| `browser_wait_for`         | Wait for text to appear or go, or for some seconds.                  |
| `browser_handle_dialog`    | Accept or dismiss an alert, confirm or prompt.                       |
| `browser_take_screenshot`  | PNG of the viewport or of one ref.                                   |
| `browser_console_messages` | Console messages and uncaught errors, collected over WebDriver BiDi. |
| `browser_tabs`             | List, open, select or close tabs.                                    |
| `browser_close`            | Close the browser; the next call starts a new one.                   |
| `browser_install`          | Have Selenium Manager install the browser and driver.                |

Every action returns the page's URL, title and a fresh snapshot, so the agent rarely needs to ask for one.

### Snapshots and refs

```
[e1] heading "Login" [level=1]
[e2] textbox "Username"
[e3] textbox "Password"
[e4] button "Login"
[e5] iframe "Help"
  [f5e1] link "Forgot password?"
```

- Roles, names and states come from the bindings' `getAccessibilitySnapshot()`, which computes them in the page
  following WAI-ARIA, html-aam and accname, in a sandbox that page scripts cannot reach. Open shadow roots are included.
- By default a snapshot lists interactive elements, headings, live regions (`alert`, `status`) and frames.
  `browser_snapshot` with `all: true` adds the rest of the visible content.
- A ref stays the same for the same element across snapshots; `browser_navigate` starts over.
- Content inside an iframe gets refs prefixed with the frame's own ref (`f5e1`), and tools act on them directly.
- Password values are never shown.

## What v0 covers

v0 is the smallest useful server: Chrome, headless, stdio, the tools above. Not yet: other browsers under test, HTTP
transport, more than one session, network and storage tools, `browser_evaluate`, and the
`selenium_*` tools (Grid status, `selenium_doctor`). Those come in later releases.

## Security

- No tool runs arbitrary JavaScript in v0.
- `browser_navigate` opens only http(s), `about:blank` and `data:` URLs; `file://` needs
  `--allow-unrestricted-file-access`, and `data:` is refused when `--allowed-origins` is set.
- `--allowed-origins` and `--blocked-origins` restrict where `browser_navigate` can go. They do not stop links,
  redirects or scripts on a page from going elsewhere, so they are not a browser-wide security boundary.
- Snapshots and screenshots are the only page data returned.

## Development

The server lives in the Selenium monorepo so it is built, tested and released with the bindings at the same version.

```sh
bazel test //javascript/selenium-mcp:small-tests        # unit tests, no browser
bazel test //javascript/selenium-mcp:e2e-tests-chrome   # every tool against real Chrome
bazel test //javascript/selenium-mcp:eslint-test //javascript/selenium-mcp:prettier-test
bazel build //javascript/selenium-mcp                    # the npm package
```

See [AGENTS.md](AGENTS.md) for conventions.

## Credits

The community Python Selenium MCP server is the reference this design grew from, and its command coverage is the
checklist for v1.
