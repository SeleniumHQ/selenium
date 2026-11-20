# 18341. Selenium Manager records sessions into Playwright-format traces

- Status: Proposed
- Discussion: https://github.com/SeleniumHQ/selenium/pull/18341

## Context

When a test fails, users need to see what the browser did: the commands sent, what the page
looked like after each action, and what the page logged or requested. Selenium has no built-in way
to capture this, so users write ad-hoc screenshot and logging hooks in each binding.

Other tools ship a recorded "trace" for this. Playwright's trace archive (`trace.zip` with NDJSON
streams and image resources) is the de facto format, and there are viewers for it outside
Playwright, such as the Vibium record player and the WebdriverIO trace viewer. Producing that
format gives Selenium users
existing viewers for free.

A previous proposal (#15311) recorded the desktop with FFmpeg from Selenium Manager. The TLC
declined it in Valencia in favour of browser recording built on WebDriver BiDi. This proposal is
built on BiDi: it records the protocol, not the screen. What remains to decide is where the BiDi
client that records lives: in each binding, or once in Selenium Manager.

Recording in Selenium Manager has to meet three conditions, or it gets in the way:

1. The binding keeps its own BiDi connection: recording must not take it away.
2. The trace is complete (console, network) whether or not the binding uses BiDi itself.
3. Remote sessions (Selenium Grid, cloud providers) can be recorded too.

| Binding    | Current behavior   |
|------------|--------------------|
| Java       | No trace recording |
| Python     | No trace recording |
| Ruby       | No trace recording |
| .NET       | No trace recording |
| JavaScript | No trace recording |

## Decision

1. **Selenium Manager is a local recording proxy in front of any WebDriver endpoint.** In pipe
   mode (`--pipe`, implied by `--record <path>`) it listens on `127.0.0.1` and prints one JSON
   line with its `proxy_url`. In front of a local driver it starts that driver (`--driver-path`,
   resolved by the binding as usual). In front of a remote end it forwards to it (`--upstream
   <url>`) and manages no driver or browser. Bindings send their regular WebDriver traffic to
   `proxy_url`; the wire protocol is unchanged.
2. **BiDi is shared with the binding.** On new session the proxy always requests
   `webSocketUrl: true` and owns the session's single BiDi connection. If the binding asked for
   BiDi, the `webSocketUrl` it gets back points to the proxy, which multiplexes the binding over
   its own connection: command ids are rewritten, and events reach the binding only when it
   subscribed to them. If the binding did not ask, `webSocketUrl` is removed. Classic WebDriver is
   the fallback only when the remote end offers no BiDi (or the connection is lost), with a
   warning.
3. **What is recorded.** Every non-`GET` classic command and every non-query BiDi command sent by
   the binding, with request, result or error; a screenshot after commands that can change what
   is rendered; console messages and network responses.
4. **Redaction.** Traces are meant to be shared, so the proxy hides typed passwords (classic and
   BiDi key actions while a password field is focused), authorization and cookie headers, cookie
   values, capability values named like secrets, and URL user info. A check that cannot be made
   counts as sensitive.
5. **Trace format.** A Playwright trace archive (`trace.trace`, `trace.network`, `resources/`)
   using **schema version 8**. Playwright upgrades older schemas when it loads them, and v8 is
   the newest version the Vibium record player accepts (v6 to v8), so one file works in all the
   viewers (Playwright trace viewer, Vibium record player, WebdriverIO trace viewer).
6. **Lifecycle.** On `DELETE /session/{id}` the proxy writes the trace *before* replying, so
   bindings can end the process right after quitting (on Windows it is killed rather than
   signalled). On SIGINT/SIGTERM it saves what was recorded. A failure to write the trace is
   reported on stdout and logged by the binding; quitting still succeeds.
7. **Binding API.** One opt-in option on the browser options takes the trace path (Java:
   `options.setRecord("trace.zip")`, `@Beta`). It is local-only: never sent to the driver or the
   remote end. It applies to locally started drivers (Chrome, Edge, Firefox) and to
   `RemoteWebDriver`. Credentials of a remote end reach Selenium Manager through its environment,
   never its command line. Each binding follows its own naming idiom.

## Considered options

- **Record in each binding, over its own BiDi connection.** A valid alternative: native, and
  remote sessions come for free. Rejected for now because it means five implementations of
  command interception, screenshots, subscriptions, redaction and archive writing, which would
  drift apart. The trace format and redaction rules would be the same either way.
- **Let Selenium Manager take the BiDi connection** (first version of this proposal). Rejected:
  the binding loses BiDi, or the trace loses console and network when the binding uses BiDi.
- **Open a second, independent BiDi connection from Selenium Manager.** Simpler than
  multiplexing, but depends on every driver and Grid accepting several connections per session.
- **Talk to Selenium Manager over stdin/stdout or WebSocket instead of HTTP.** Rejected: classic
  WebDriver is HTTP and bindings already have HTTP executors; pointing them at another URL is a
  small change in each binding.
- **Emit the newest Playwright schema (v9/v10).** Rejected: the Vibium player rejects schemas
  newer than v8, while Playwright still reads v8.
- **A Selenium-specific trace format.** Rejected: it would need its own viewer.

## Consequences

- Users get traces with one option and no extra dependencies, for local and remote sessions, and
  can keep using BiDi in their tests while recording. The archive opens in the Playwright trace
  viewer, the Vibium record player and the WebdriverIO trace viewer.
- Selenium Manager stays alive for the whole session. Driver service settings (port, arguments,
  log output) other than the executable are not used in pipe mode.
- All traffic of a remote session goes through a local process, and screenshots after actions
  add latency. The trace is kept in memory until the session ends.
- The proxy must keep multiplexing transparent; the BiDi subscription model (ids, legacy
  unsubscribe by event names) is the part that needs care.
- Limitation: `wss://` BiDi endpoints (common with cloud providers) need TLS support for
  Selenium Manager's WebSocket client, which is a dependency change; until then those sessions
  are recorded with classic WebDriver.
- Follow-ups: implement the option in Python, Ruby, .NET and JavaScript; consider DOM snapshots and
  video (screencast) when browsers support them over BiDi.
