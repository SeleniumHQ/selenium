# Async Python Bindings — Architecture Design

## Overview

This document describes the design for adding native async/await support to the Selenium Python bindings. The goal is a generated async namespace (`selenium.webdriver.async_`) that mirrors the full sync WebDriver API, backed by a true async HTTP transport and native async WebSocket, without touching or breaking any existing sync code.

**Driving requirement:** Python usage is becoming increasingly async (pytest-asyncio test suites, FastAPI applications, etc.). Users want to write `await driver.get(url)` without workarounds.

---

## Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Namespace | `selenium.webdriver.async_` | `async` is a Python keyword; PEP 8 convention for reserved names |
| Async framework | anyio | Supports both asyncio and trio backends with one implementation |
| HTTP transport | httpx (`AsyncClient`) | anyio-compatible, nearly identical interface to urllib3/requests |
| WebSocket (BiDi) | websockets library with anyio backend | Mature, widely used, native async |
| Min Python version | 3.10 | Required for `match`, `TypeAlias`, and reliable anyio support |
| I/O-bound properties | Become `async def` methods of same name | Python has no `async` property; `await driver.title()` |
| BiDi callbacks | Native `async def`, dispatched via anyio task group | Thread-bridging is fragile; native async is correct |
| Code generation | New `py/generate_async.py`, AST-based | Sync API changes propagate automatically on regeneration |
| Dependencies | Optional extra: `pip install selenium[async]` | Does not affect users who only need sync |
| Naming | `AsyncWebDriver`, `AsyncChrome`, etc. | Explicit; makes the distinction visible at the call site |

---

## Target User API

```python
import pytest
from selenium.webdriver.async_ import Chrome
from selenium.webdriver.async_.support.wait import AsyncWebDriverWait
from selenium.webdriver.async_.support import expected_conditions as EC
from selenium.webdriver.common.by import By

@pytest.mark.anyio
async def test_search():
    async with Chrome() as driver:
        await driver.get("https://example.com")
        el = await driver.find_element(By.ID, "q")
        await el.send_keys("selenium")

        wait = AsyncWebDriverWait(driver, 10)
        await wait.until(EC.title_contains("Search"))

        assert "Search" in await driver.title()
```

The sync API is unchanged:

```python
from selenium.webdriver import Chrome   # unaffected

def test_search():
    with Chrome() as driver:
        driver.get("https://example.com")
        assert "Example" in driver.title
```

---

## File Structure

```
py/
├── generate_async.py                          # NEW — AST-based generator script
├── ASYNC_DESIGN.md                            # this document
└── selenium/
    └── webdriver/
        └── async_/
            ├── __init__.py                    # exports AsyncChrome, AsyncFirefox, etc.
            ├── remote/
            │   ├── __init__.py
            │   ├── remote_connection.py       # HAND-WRITTEN: AsyncRemoteConnection (httpx)
            │   ├── websocket_connection.py    # HAND-WRITTEN: AsyncWebSocketConnection
            │   ├── webdriver.py               # GENERATED: AsyncWebDriver
            │   ├── webelement.py              # GENERATED: AsyncWebElement
            │   ├── shadowroot.py              # GENERATED: AsyncShadowRoot
            │   ├── switch_to.py               # GENERATED: AsyncSwitchTo
            │   ├── alert.py                   # GENERATED: AsyncAlert
            │   ├── fedcm.py                   # GENERATED: AsyncFedCM
            │   └── mobile.py                  # GENERATED: AsyncMobile
            ├── chrome/
            │   ├── __init__.py
            │   └── webdriver.py               # GENERATED: AsyncChrome
            ├── firefox/
            │   ├── __init__.py
            │   └── webdriver.py               # GENERATED: AsyncFirefox
            ├── edge/
            │   ├── __init__.py
            │   └── webdriver.py               # GENERATED: AsyncEdge
            ├── safari/
            │   ├── __init__.py
            │   └── webdriver.py               # GENERATED: AsyncSafari
            ├── common/
            │   ├── __init__.py
            │   └── action_chains.py           # GENERATED: AsyncActionChains
            └── support/
                ├── __init__.py
                ├── wait.py                    # GENERATED: AsyncWebDriverWait
                ├── expected_conditions.py     # GENERATED: async EC callables
                └── select.py                  # GENERATED: AsyncSelect
```

BiDi high-level modules (`Script`, `Network`, `BrowsingContext`, etc.) live in
`selenium/webdriver/common/bidi/` and are already generated from CDDL. Async variants
will be a new target added to `generate_bidi.py` in Phase 5.

---

## Why the Existing Code Is Well-Suited

Every public method on `WebDriver` and `WebElement` routes through one chokepoint:

- `WebDriver.execute(command, params)` → `RemoteConnection.execute()`
- `WebElement._execute(command, params)` → same path via `self._parent`

Making `execute()` and `_execute()` async cascades correctly through every method above
them. The generator only needs to identify these patterns and add `async`/`await`
in the right places. No structural refactoring of the sync code is required.

---

## The Two Hand-Written Pieces

### `AsyncRemoteConnection` (httpx)

Replaces urllib3. A single `httpx.AsyncClient` is created when the connection opens
and closed when it does, rather than one per request as the sync code does.

```python
class AsyncRemoteConnection:
    def __init__(self, remote_server_addr, client_config):
        self._url = remote_server_addr
        self._client_config = client_config
        self._client: httpx.AsyncClient | None = None

    async def open(self):
        self._client = httpx.AsyncClient(
            verify=self._client_config.ca_certs,
            timeout=self._client_config.timeout,
        )

    async def close(self):
        if self._client:
            await self._client.aclose()
            self._client = None

    async def execute(self, command, params):
        method, url = self._commands[command]
        url = self._url + url   # substitute $sessionId etc.
        response = await self._client.request(method, url, json=params)
        return self._process_response(response)  # same logic as sync version
```

Browser-specific subclasses (`AsyncChromeRemoteConnection`, etc.) override `browser_name`
and `_commands` exactly as their sync equivalents — these are generated.

### `AsyncWebSocketConnection` (websockets + anyio)

Replaces the thread-backed `WebSocketConnection`. Instead of a background daemon thread
polling with `sleep()`, the receive loop runs as a long-lived anyio task inside the
driver's task group. Callbacks are `async def` and dispatched as new tasks in that group.

```python
class AsyncWebSocketConnection:
    async def connect(self, task_group):
        self._ws = await websockets.connect(self.url)
        self._task_group = task_group
        task_group.start_soon(self._receive_loop)

    async def execute(self, command):
        async with self._send_lock:
            self._id += 1
            current_id = self._id
        payload = self._serialize_command(command)
        payload["id"] = current_id
        event = anyio.Event()
        self._pending[current_id] = event
        await self._ws.send(json.dumps(payload))
        with anyio.fail_after(self._timeout):
            await event.wait()
        return self._results.pop(current_id)

    async def _receive_loop(self):
        async for raw in self._ws:
            message = json.loads(raw)
            if "id" in message:
                self._results[message["id"]] = message
                if event := self._pending.pop(message["id"], None):
                    event.set()
            if "method" in message:
                for cb in self.callbacks.get(message["method"], []):
                    self._task_group.start_soon(cb, message["params"])

    def add_callback(self, event, async_callback):
        self.callbacks.setdefault(event.event_class, []).append(
            lambda params: async_callback(event.from_json(params))
        )
```

---

## The Generator (`generate_async.py`)

Reads each sync source file as a Python AST, applies transformation rules, writes the
async output. AST-based transformation is safer than regex — it respects scope, nesting,
and decorators correctly.

### Transformation Rules

| Sync pattern | Async transformation |
|---|---|
| `def method(self, ...)` that calls `self.execute(` | `async def method(self, ...)` |
| `self.execute(...)` | `await self.execute(...)` |
| `def _execute(self, ...)` | `async def _execute(self, ...)` |
| `self._execute(...)` | `await self._execute(...)` |
| `@property` + body calls `self.execute(` | Remove `@property`, make `async def` |
| `@property` + body is pure attribute access | Keep as `@property` (no network call) |
| `def __enter__(self)` | `async def __aenter__(self)` |
| `def __exit__(self, ...)` | `async def __aexit__(self, ...)` |
| `time.sleep(x)` | `await anyio.sleep(x)` |
| `@contextmanager` | `@asynccontextmanager` |
| `RemoteConnection` import/reference | `AsyncRemoteConnection` |
| `WebSocketConnection` | `AsyncWebSocketConnection` |
| `WebElement` type refs | `AsyncWebElement` |
| `WebDriverWait` | `AsyncWebDriverWait` |
| Sync `Callable` callback types | `AsyncCallable` / `Callable[..., Coroutine]` |

The generator maintains a **property allowlist** for properties that must stay as
properties (pure attribute access, no network I/O): `session_id`, `name`, `mobile`,
`capabilities`, `desired_capabilities`, `command_executor`, `file_detector`.
Everything else with `@property` that touches `execute()` becomes an async method.

The generator takes `--sync-root` and `--output-dir` flags and can be run standalone
outside Bazel for development:

```bash
python generate_async.py \
  --sync-root py/selenium/webdriver \
  --output-dir py/selenium/webdriver/async_
```

---

## Async Driver Lifecycle (anyio Task Group)

`AsyncWebDriver` owns a single anyio task group for its lifetime. BiDi WebSocket receive
loops run inside it as concurrent tasks alongside user code. Users **must** use
`async with` — this is documented explicitly and enforced at runtime.

```python
class AsyncWebDriver:
    async def __aenter__(self) -> Self:
        self._task_group_ctx = anyio.create_task_group()
        self._task_group = await self._task_group_ctx.__aenter__()
        await self.command_executor.open()
        self.start_session(self.capabilities)
        return self

    async def __aexit__(self, *exc_info):
        await self.quit()
        await self._task_group_ctx.__aexit__(*exc_info)

    async def _start_bidi(self):
        ws_url = self.caps.get("webSocketUrl")
        self._websocket_connection = AsyncWebSocketConnection(
            ws_url,
            self.command_executor.client_config.websocket_timeout,
            self.command_executor.client_config.websocket_interval,
        )
        await self._websocket_connection.connect(self._task_group)
```

If a user instantiates without a context manager and calls methods, a clear
`RuntimeError("AsyncWebDriver must be used as an async context manager")` is raised.

---

## I/O-Bound Properties That Become Methods

These are the only places the async API diverges from sync. All other public methods
keep the same call signature with `await` added.

### `AsyncWebDriver`

| Sync (property) | Async (method call) |
|---|---|
| `driver.title` | `await driver.title()` |
| `driver.current_url` | `await driver.current_url()` |
| `driver.page_source` | `await driver.page_source()` |
| `driver.current_window_handle` | `await driver.current_window_handle()` |
| `driver.window_handles` | `await driver.window_handles()` |
| `driver.timeouts` | `await driver.timeouts()` |
| `driver.orientation` | `await driver.orientation()` |
| `driver.log_types` | `await driver.log_types()` |

### `AsyncWebElement`

| Sync (property) | Async (method call) |
|---|---|
| `element.tag_name` | `await element.tag_name()` |
| `element.text` | `await element.text()` |
| `element.location` | `await element.location()` |
| `element.size` | `await element.size()` |
| `element.rect` | `await element.rect()` |
| `element.accessible_name` | `await element.accessible_name()` |
| `element.aria_role` | `await element.aria_role()` |
| `element.screenshot_as_base64` | `await element.screenshot_as_base64()` |
| `element.screenshot_as_png` | `await element.screenshot_as_png()` |

### Properties that stay as properties (no network call)

`driver.session_id`, `driver.name`, `driver.mobile`, `driver.capabilities`,
`element.id`, `element.session_id`, `element.parent`

---

## `AsyncWebDriverWait`

```python
class AsyncWebDriverWait(Generic[D]):
    async def until(self, method, message=""):
        end_time = anyio.current_time() + self._timeout
        while True:
            try:
                value = await method(self._driver)   # method must be async callable
                if value:
                    return value
            except self._ignored_exceptions:
                pass
            if anyio.current_time() > end_time:
                break
            await anyio.sleep(self._poll)
        raise TimeoutException(message)
```

`expected_conditions` callables become `async def __call__(self, driver)`. User-supplied
condition functions must be `async def`.

---

## Bazel Wiring

The generator is wired into Bazel following the same pattern as `generate_bidi.py` /
`py/private/generate_bidi.bzl`.

### New file: `py/private/generate_async.bzl`

```python
def _generate_async_impl(ctx):
    generator = ctx.executable.generator
    output_dir = ctx.attr.output_dir

    extra_outputs = []
    for src in ctx.files.extra_srcs:
        out = ctx.actions.declare_file(output_dir + "/" + src.basename)
        ctx.actions.symlink(output=out, target_file=src)
        extra_outputs.append(out)

    gen_outputs = [
        ctx.actions.declare_file(output_dir + "/" + name)
        for name in ctx.attr.generated_files
    ]

    ctx.actions.run(
        inputs = ctx.files.sync_srcs,
        outputs = gen_outputs,
        executable = generator,
        arguments = [
            "--sync-root", ctx.files.sync_srcs[0].dirname,
            "--output-dir", gen_outputs[0].dirname,
        ],
        use_default_shell_env = True,
    )

    return [DefaultInfo(files = depset(gen_outputs + extra_outputs))]

generate_async = rule(
    implementation = _generate_async_impl,
    attrs = {
        "generator":        attr.label(executable=True, cfg="exec", mandatory=True),
        "sync_srcs":        attr.label_list(allow_files=[".py"], mandatory=True),
        "extra_srcs":       attr.label_list(allow_files=[".py"], default=[]),
        "generated_files":  attr.string_list(mandatory=True),
        "output_dir":       attr.string(mandatory=True),
    },
)
```

### Additions to `py/BUILD.bazel`

```python
load("//py/private:generate_async.bzl", "generate_async")

py_binary(
    name = "generate_async",
    srcs = ["generate_async.py"],
    srcs_version = "PY3",
    # stdlib ast only; no third-party deps needed
)

generate_async(
    name = "create-async-src",
    generator = ":generate_async",
    output_dir = "selenium/webdriver/async_",
    sync_srcs = [
        "selenium/webdriver/remote/webdriver.py",
        "selenium/webdriver/remote/webelement.py",
        "selenium/webdriver/remote/shadowroot.py",
        "selenium/webdriver/remote/switch_to.py",
        "selenium/webdriver/remote/alert.py",
        "selenium/webdriver/remote/fedcm.py",
        "selenium/webdriver/remote/mobile.py",
        "selenium/webdriver/chrome/webdriver.py",
        "selenium/webdriver/firefox/webdriver.py",
        "selenium/webdriver/edge/webdriver.py",
        "selenium/webdriver/safari/webdriver.py",
        "selenium/webdriver/common/action_chains.py",
        "selenium/webdriver/support/wait.py",
        "selenium/webdriver/support/expected_conditions.py",
        "selenium/webdriver/support/select.py",
    ],
    extra_srcs = [
        # Hand-written files copied verbatim into the async_ package
        "//py/selenium/webdriver/async_/remote:remote_connection.py",
        "//py/selenium/webdriver/async_/remote:websocket_connection.py",
    ],
    generated_files = [
        "remote/webdriver.py",
        "remote/webelement.py",
        "remote/shadowroot.py",
        "remote/switch_to.py",
        "remote/alert.py",
        "remote/fedcm.py",
        "remote/mobile.py",
        "chrome/webdriver.py",
        "firefox/webdriver.py",
        "edge/webdriver.py",
        "safari/webdriver.py",
        "common/action_chains.py",
        "support/wait.py",
        "support/expected_conditions.py",
        "support/select.py",
        "__init__.py",
    ],
)

py_library(
    name = "async",
    srcs = [":create-async-src"],
    deps = [
        ":common",
        requirement("anyio"),
        requirement("httpx"),
        requirement("websockets"),
    ],
)
```

---

## Test Structure

Tests live in `py/test/selenium/webdriver/async_/` mirroring the sync structure.
Every public API method has a test. Tests are copied from the sync equivalents and
mechanically adapted (see transformation rules below).

```
py/test/selenium/webdriver/async_/
    __init__.py
    conftest.py                           # async fixtures: driver, pages
    common/
        __init__.py
        navigation_tests.py
        element_finding_tests.py
        children_finding_tests.py
        element_property_tests.py
        typing_tests.py
        click_tests.py
        visibility_tests.py
        window_switching_tests.py
        takes_screenshots_tests.py
        timeout_tests.py
        page_load_timeout_tests.py
        quit_tests.py
        executing_javascript_tests.py
        executing_async_javascript_tests.py
        rendered_webelement_tests.py
        form_handling_tests.py
        select_element_handling_tests.py
        ... (one file per sync test file)
    support/
        __init__.py
        webdriverwait_tests.py
        expected_conditions_tests.py
    chrome/
        __init__.py
        chrome_tests.py
    firefox/
        __init__.py
        firefox_tests.py
```

### `py/test/selenium/webdriver/async_/conftest.py`

This is a new file — not copied. The async driver lifecycle requires different fixture
semantics. Notably there is no global driver singleton; each test gets a clean
`async with` scope.

```python
import pytest
from selenium.webdriver.async_ import Chrome, Firefox, Edge
from test.selenium.webdriver.common.webserver import SimpleWebServer

@pytest.fixture
def anyio_backend():
    return "asyncio"   # override per-test or per-session for trio

@pytest.fixture
async def driver(request):
    driver_name = getattr(request, "param", "chrome").lower()
    driver_classes = {"chrome": Chrome, "firefox": Firefox, "edge": Edge}
    cls = driver_classes[driver_name]
    options = _build_options(driver_name, request)
    async with cls(options=options) as d:
        yield d

@pytest.fixture
def pages(driver, webserver):
    class Pages:
        def url(self, name):
            return webserver.where_is(name)

        async def load(self, name):
            await driver.get(self.url(name))

    return Pages()
```

### Test file transformation

Given sync test `test/selenium/webdriver/common/navigation_tests.py`:

```python
def test_should_return_page_title(driver, pages):
    pages.load("simpleTest.html")
    assert driver.title == "Hello WebDriver World"
```

Async equivalent in `test/selenium/webdriver/async_/common/navigation_tests.py`:

```python
import pytest

@pytest.mark.anyio
async def test_should_return_page_title(driver, pages):
    await pages.load("simpleTest.html")
    assert await driver.title() == "Hello WebDriver World"
```

Mechanical transformation rules for copying sync tests:

1. Add `@pytest.mark.anyio` before every test function
2. `def test_` → `async def test_`
3. `pages.load(x)` → `await pages.load(x)`
4. `driver.title` → `await driver.title()` (and all other I/O properties; see full list above)
5. All network-calling driver/element methods gain `await`
6. `with driver:` → `async with driver:`

These are mechanical enough that a companion script (`generate_async_tests.py`) could
automate the copy with a manual review pass for fixture-specific logic.

### Bazel test targets

Add to `py/BUILD.bazel`:

```python
ASYNC_TEST_DEPS = TEST_DEPS + [
    requirement("anyio"),
    requirement("pytest-anyio"),
    requirement("httpx"),
    requirement("websockets"),
]

# test-<browser>-async — asyncio backend
[
    py_test_suite(
        name = "test-%s-async" % browser,
        size = "large",
        srcs = glob(["test/selenium/webdriver/async_/**/*.py"]),
        args = [
            "--instafail",
            "--anyio-backends=asyncio",
        ] + BROWSERS[browser]["args"],
        data = BROWSERS[browser]["data"],
        env_inherit = ["DISPLAY"],
        tags = ["no-sandbox"] + BROWSERS[browser]["tags"],
        target_compatible_with = BROWSERS[browser]["target_compatible_with"],
        test_suffix = "%s-async" % browser,
        deps = [
            ":init-tree",
            ":async",
            ":webserver",
        ] + ASYNC_TEST_DEPS,
    )
    for browser in ["chrome", "firefox", "edge"]
]

# test-<browser>-async-trio — trio backend (optional, for anyio compatibility validation)
[
    py_test_suite(
        name = "test-%s-async-trio" % browser,
        size = "large",
        srcs = glob(["test/selenium/webdriver/async_/**/*.py"]),
        args = [
            "--instafail",
            "--anyio-backends=trio",
        ] + BROWSERS[browser]["args"],
        data = BROWSERS[browser]["data"],
        env_inherit = ["DISPLAY"],
        tags = ["no-sandbox"] + BROWSERS[browser]["tags"],
        target_compatible_with = BROWSERS[browser]["target_compatible_with"],
        test_suffix = "%s-async-trio" % browser,
        deps = [
            ":init-tree",
            ":async",
            ":webserver",
            requirement("trio"),
        ] + ASYNC_TEST_DEPS,
    )
    for browser in ["chrome", "firefox", "edge"]
]
```

---

## Delivery Phases

Code and tests are delivered together — each phase ends with working Bazel targets.

### Phase 1 — Foundations (hand-written, no generation)

- `py/generate_async.py` — AST transformer; validate tooling on one file before full wiring
- `AsyncRemoteConnection` in `async_/remote/remote_connection.py`
- `AsyncWebSocketConnection` in `async_/remote/websocket_connection.py`
- Package scaffolding: all `__init__.py` files
- Optional dependency declaration in `setup.cfg` / `MODULE.bazel`
- `py/private/generate_async.bzl` and `py_binary` target in `BUILD.bazel`
- **Tests:** none yet — no public API

### Phase 2 — Core driver (first generated output)

- Generate `AsyncWebDriver` from `remote/webdriver.py`
- Generate `AsyncWebElement` from `remote/webelement.py`
- Generate `AsyncShadowRoot`, `AsyncSwitchTo`, `AsyncAlert`
- Wire `async_/remote/__init__.py`
- **Tests:** `navigation_tests`, `element_finding_tests`, `element_property_tests`, `quit_tests`

### Phase 3 — Browser-specific drivers

- Generate `AsyncChrome`, `AsyncFirefox`, `AsyncEdge`, `AsyncSafari`, `AsyncRemote`
- Wire top-level `async_/__init__.py` so `from selenium.webdriver.async_ import Chrome` works
- **Tests:** Browser-specific smoke tests, `window_switching_tests`, `takes_screenshots_tests`

### Phase 4 — Support utilities

- Generate `AsyncWebDriverWait` from `support/wait.py`
- Generate `AsyncExpectedConditions` from `support/expected_conditions.py`
- Generate `AsyncSelect` from `support/select.py`
- Generate `AsyncActionChains` from `common/action_chains.py`
- **Tests:** `webdriverwait_tests`, `expected_conditions_tests`, `select_element_handling_tests`

### Phase 5 — BiDi async integration

- Add async target to `generate_bidi.py`: emit `async def` stubs for `Script`, `Network`,
  `BrowsingContext`, `Input`, `Browser`, etc.
- Wire `AsyncWebSocketConnection` into `AsyncWebDriver._start_bidi()`
- Async callbacks dispatched via the driver's task group
- **Tests:** `bidi_script_tests`, `bidi_network_tests` (async copies)

### Phase 6 — Hardening and documentation

- Migration guide: "sync → async in 3 steps" (change import, add `async with`,
  add `await`, rename I/O properties to method calls)
- Type stub file (`.pyi`) generation for the async namespace (correct `Awaitable` return types)
- pytest-anyio fixture examples in docs
- Full parity sweep — every remaining sync test file in `test/selenium/webdriver/common/`
  has an async counterpart
- **Goal:** `wc -l test/selenium/webdriver/common/*.py` ≈ `wc -l test/selenium/webdriver/async_/common/*.py`

---

## Explicitly Out of Scope for V1

- **`EventFiringWebDriver`** — the decorator/wrapper pattern is complex to adapt; defer to V2
- **`RelativeLocator` async** — low priority; sync version works since it takes already-found elements
- **Thread-safety across concurrent drivers** — each `AsyncWebDriver` instance is independent
- **The legacy `bidi_connection()` CDP method** — already async in the sync driver; left as-is in V1
- **Remote Grid auth flows** — `ClientConfig` is shared unchanged; no new auth mechanisms needed

---

## Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Generator produces wrong code for edge cases (nested generators, `yield`, `contextmanager`) | Generator has an explicit allowlist of files it transforms; complex files are hand-written or skipped |
| User forgets `async with`, gets confusing errors | Raise `RuntimeError("AsyncWebDriver must be used as an async context manager")` in gate methods |
| httpx version compatibility | Pin `httpx>=0.27`; async API stable since 0.23 |
| Properties becoming methods breaks `expected_conditions` assumptions | EC generator is part of Phase 4; both sides generated together, always in agreement |
| websockets library API changes | Pin `websockets>=12`; connection interface stable since v10 |
| Generator requires Bazel input enumeration upfront | Generated file list is static and maintained alongside the generator; a CI check can verify no drift |

---

## Open Question Before Phase 1 Starts

The Bazel `py_library` targets for the async namespace reference generated files declared
upfront. The right pattern is a `genrule` or custom rule (as above) that runs
`generate_async.py` and stamps all outputs, with `py_library` depending on it. The
existing `generate_bidi.py` Bazel wiring is the model — confirm with the build owners
which Bazel version idioms are in use before writing the final `BUILD.bazel` entries,
as the `ctx.actions.run` + `declare_file` pattern has minor version-specific nuances
in this repository.
