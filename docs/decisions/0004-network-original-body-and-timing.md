# 0004. Network responses expose their original body and request timing

- Status: Proposed
- Date: 2026-06-11
- Discussion: https://github.com/SeleniumHQ/selenium/pull/17674

## Context

The high-level network handlers let users mutate or stub requests and responses, but they
cannot **read the original response body**. The two most common monitoring needs are
therefore unmet:

1. **Read the body** of a response (to assert on an API payload, or to fetch-then-patch:
   read the real body, edit one field, return the edited version).
2. **Read request timing** — DNS, connect, TLS, request, response phases — for
   performance assertions.

Both are now supported by the BiDi protocol. `network.addDataCollector` registers a
collector for a data type (`response`, and increasingly `request`) with a
`maxEncodedDataSize` cap; `network.getData` returns the captured `bytes` for a request id;
`network.removeDataCollector`/`disownData` manage lifecycle. Timing already arrives on
every request: `network.RequestData.timings` is a `FetchTimingInfo` with thirteen fields
(`timeOrigin`, `requestTime`, `redirectStart/End`, `fetchStart`, `dnsStart/End`,
`connectStart/End`, `tlsStart`, `requestStart`, `responseStart`, `responseEnd`).

The constraint: data collectors are **newer and unevenly implemented**. Firefox supports
the `response` type (with `maxEncodedDataSize` required) and recently added `request`;
Chromium supports it (Puppeteer consumes it) but coverage and quirks differ (e.g. known
Firefox redirect-timing edge cases). So body-read must degrade gracefully where a browser
lacks support, rather than hard-failing. Timing, by contrast, is plain event data with no
collector dependency.

Playwright exposes `response.body()/text()/json()` and `route.fetch()` (fetch-then-patch),
plus a `request.timing` dict — the shape users expect.

## Decision

Bindings expose, on their existing `Response`/`Request` wrappers:

- **`body()` / `text()` / `json()`** on a response, reading the **original** payload via a
  data collector (`addDataCollector` + `getData`). The binding manages collector
  lifecycle; users do not handle collector ids for the common case. Where the browser does
  not support data collectors, these methods raise a **clear, typed "unsupported"
  error** — never a silent empty body. Bindings SHOULD expose a capability check so users
  can branch.
- **Fetch-then-patch**: a response handler can read the original body, modify it, and
  supply the modified version (mapping to `provideResponse`, carrying over status and
  headers). This reuses the body-read mechanism above.
- **`timing`** on a request, exposing the `FetchTimingInfo` fields through named
  accessors. Timing is always available (no collector), so it never raises "unsupported".
- Convenience header accessors consistent with the wrappers: `header_value(name)` and an
  all-headers accessor, since collectors and timing make richer introspection common.

Code sketch — Python (reference implementation):

```python
def handler(response):
    if response.body_supported():            # capability gate
        data = response.json()               # original body via addDataCollector + getData
        print(response.status, data["items"])
    t = response.request.timing              # always available
    print(t.response_end - t.request_time)   # total ms

driver.network.add_response_handler("**/api/**", handler)

# Fetch-then-patch: read original, edit, return edited
def patch(response):
    body = response.json()
    body["feature_flag"] = True
    response.provide(json=body)              # -> provideResponse, status/headers carried over

driver.network.add_response_handler("**/api/config", patch)
```

Code sketch — other bindings (idiomatic shape, same semantics):

```java
driver.network().addResponseHandler("**/api/**", response -> {
    if (response.bodySupported()) {
        String text = response.text();       // original body
    }
    FetchTiming t = response.request().timing();
});
```

## Considered options

- **Body-read via managed data collectors, with a typed unsupported error + capability
  gate; always-on timing (chosen)** — gives the Playwright-shaped API where the browser
  supports it and fails honestly where it does not; timing needs no gate.
- **Wait for universal browser support before exposing body-read** — avoids the
  degradation path, but withholds a high-value, already-shipping feature from users on
  browsers that do support it (Firefox, Chromium). Rejected: gate, don't withhold.
- **Expose raw `add_data_collector`/`get_data` only** — already generated, but pushes
  collector-id and lifecycle management onto every user and offers no `body()`/`json()`
  ergonomics. Rejected as the user-facing answer; the raw commands remain as an escape
  hatch.
- **Silently return an empty body when unsupported** — superficially simpler, but turns a
  capability gap into a silent wrong result. Rejected outright.

## Consequences

- Users can assert on and patch real response payloads, and assert on request timing, in a
  consistent shape across bindings.
- Body-read carries a **browser-support matrix** the binding must track and document;
  tests for it gate on capability. Collector `maxEncodedDataSize` caps mean very large
  bodies may be truncated — bindings choose and document a default cap.
- Bindings own collector lifecycle (add on demand, remove/disown appropriately) so users
  do not leak collectors.
- Timing exposure is cheap and unconditional; it can land ahead of body-read.

## Binding status

| Binding    | Status  | Notes / tracking link                                                |
|------------|---------|----------------------------------------------------------------------|
| Java       | pending |                                                                      |
| Python     | pending | request/response handler wrappers exist; body-read + timing not yet built; raw `add_data_collector`/`get_data` generated |
| Ruby       | pending |                                                                      |
| .NET       | pending |                                                                      |
| JavaScript | pending |                                                                      |

## Appendix

Spec surface: `network.addDataCollector` (`dataTypes`, `maxEncodedDataSize`,
`collectorType` default `blob`), `network.getData` (`dataType`, `collector?`, `disown?`,
`request`) → `{bytes: BytesValue}`, `network.removeDataCollector`, `network.disownData`.
Timing: `network.RequestData.timings: network.FetchTimingInfo` (thirteen float fields).
Implementation status as of mid-2026: Firefox supports `response` (and added `request`)
with known redirect-timing fixes in progress; Chromium supports data collectors (consumed
by Puppeteer). This unevenness is the reason for the capability gate in the decision.
