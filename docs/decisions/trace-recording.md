# NNNN. Selenium Manager records sessions into Playwright-format traces

- Status: Proposed
- Discussion: <!-- link to this record's PR -->

## Context

When a test fails, users need to see what the browser did: the commands sent, what the page
looked like after each action, and what the page logged or requested. Selenium has no built-in way
to capture this, so users write ad-hoc screenshot and logging hooks in each binding.

Other tools ship a recorded "trace" for this. Playwright's trace archive (`trace.zip` with NDJSON
streams and image resources) is the de facto format, and there are viewers for it outside
Playwright, such as the Vibium record player. Producing that format gives Selenium users existing
viewers for free.

Every binding would have to implement recording itself: intercept commands, capture screenshots,
subscribe to BiDi events, and write the archive. Selenium Manager is already shipped with every
binding and already resolves and launches drivers, so the logic can be written once in Rust.

| Binding    | Current behavior   |
|------------|--------------------|
| Java       | No trace recording |
| Python     | No trace recording |
| Ruby       | No trace recording |
| .NET       | No trace recording |
| JavaScript | No trace recording |

## Decision

1. **Recording lives in Selenium Manager.** A new *pipe mode* (`--pipe`, implied by
   `--record <path>`) starts the driver and keeps running, exposing a local HTTP proxy
   (`127.0.0.1`, free port) in front of it. When it is ready it prints one JSON line:
   `{"proxy_url": "http://127.0.0.1:PORT", "driver_path": "..."}`. Bindings send their regular
   WebDriver HTTP traffic to `proxy_url`. The wire protocol between binding and driver is
   unchanged.
2. **The binding resolves the driver as usual** (service executable, system property or Selenium
   Manager) and passes it with `--driver-path`, so recording does not change which driver or
   browser is used.
3. **What is recorded.** Every non-`GET` command (queries are left out to keep the trace focused),
   with request, result or error. A viewport screenshot is taken after commands that can change
   what is rendered (navigation, clicks, typing, scripts, actions, window changes). Console
   messages and network responses are recorded too. Text typed into password fields is replaced
   with `********`, because traces are meant to be shared.
4. **BiDi first, classic as fallback.** On new session, unless the binding asked for
   `webSocketUrl` itself, the proxy requests `webSocketUrl: true`, owns that BiDi connection, and
   removes `webSocketUrl` from the capabilities returned to the binding. It then uses
   `browsingContext.captureScreenshot`, `log.entryAdded` and `network.responseCompleted`. If the
   binding uses BiDi, or the driver does not offer it, the proxy falls back to classic WebDriver:
   the `screenshot` endpoint, plus Chromium's legacy log endpoint for console messages. No network
   data is recorded in that case.
5. **Trace format.** A Playwright trace archive (`trace.trace`, `trace.network`, `resources/`)
   using **schema version 8**. Playwright upgrades older schemas when it loads them, and v8 is the
   newest version the Vibium record player accepts (v6 to v8), so one file works in both.
6. **Lifecycle.** On `DELETE /session/{id}`, the proxy writes the trace *before* replying, then
   stops the driver and exits. Bindings can therefore end the process right after quitting without
   losing the trace, including on Windows, where the process is killed rather than signalled. On
   SIGINT/SIGTERM, the proxy saves what was recorded and deletes the session.
7. **Binding API.** One opt-in option on the browser options takes the trace path (Java:
   `options.setRecord("trace.zip")`, marked `@Beta`). It is a local-only setting: it is never sent
   to the driver or to a remote end. It applies when the binding starts the driver itself (Chrome,
   Edge and Firefox in this first iteration). Each binding follows its own naming idiom.

## Considered options

- **Implement recording in each binding.** Rejected: five implementations of screenshots, BiDi
  subscriptions and archive writing, which would drift apart.
- **Talk to Selenium Manager over stdin/stdout instead of HTTP.** Rejected: bindings already have
  HTTP command executors. Pointing them at a different URL is a small change in each binding.
- **Share the binding's BiDi connection.** Rejected for now: the proxy would have to multiplex
  WebSocket traffic and event subscriptions. Falling back to classic WebDriver when the binding
  uses BiDi keeps the first iteration simple.
- **Emit the newest Playwright schema (v9/v10).** Rejected: the Vibium player rejects schemas newer
  than v8, while Playwright still reads v8.
- **A Selenium-specific trace format.** Rejected: it would need its own viewer.

## Consequences

- Users get traces with one option and no extra dependencies. The archive opens in the Playwright
  trace viewer and in the Vibium record player.
- When recording, Selenium Manager stays alive for the whole session. Driver service settings
  (port, arguments, log output) other than the executable are not used in pipe mode.
- Screenshots after each action add latency, and the trace is kept in memory until the session
  ends. Sampling or chunking can be added later.
- Bindings using BiDi themselves get traces without console and network data until the proxy can
  share or forward the BiDi connection.
- Follow-ups: implement the option in Python, Ruby, .NET and JavaScript; consider DOM snapshots and
  video (screencast) when browsers support them over BiDi.
