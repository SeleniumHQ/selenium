# Licensed to the Software Freedom Conservancy (SFC) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The SFC licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.

"""The supported windows API, returned by ``driver.windows``.

Windows and tabs as objects: open them without switching, drive and capture
them, isolate them in user contexts, and observe their navigations, opening
and closing, and downloads. Nothing here hands back a protocol type or a bare
window handle string.
See https://github.com/SeleniumHQ/selenium/pull/17681
"""

from __future__ import annotations

import base64
import itertools
import logging
import threading
from collections.abc import Callable
from dataclasses import dataclass
from typing import TYPE_CHECKING, Any

from selenium.common.exceptions import (
    InvalidArgumentException,
    NoSuchFrameException,
    NoSuchWindowException,
    TimeoutException,
    WebDriverException,
)
from selenium.webdriver.remote.command import Command

if TYPE_CHECKING:
    from selenium.webdriver.common.print_page_options import PrintOptions
    from selenium.webdriver.remote.webdriver import WebDriver

logger = logging.getLogger(__name__)

_WAITS = ("none", "interactive", "complete")
_STRATEGY_WAITS = {"normal": "complete", "eager": "interactive", "none": "none"}
# events that end the navigation part of a history traversal; a page restored from the
# back/forward cache commits but sends no load event, so readiness is checked separately
_TRAVERSE_EVENTS = (
    "browsingContext.navigationCommitted",
    "browsingContext.fragmentNavigated",
    "browsingContext.historyUpdated",
)
# navigationFailed is left out: Chrome reports one for the page being left when it
# is restored from the back/forward cache, before the traversal commits
# resolves once the document reaches the readiness state, including one that already has
_READY_SCRIPTS = {
    "complete": "new Promise(r => document.readyState === 'complete'"
    " ? r() : addEventListener('load', () => r(), {once: true}))",
    "interactive": "new Promise(r => document.readyState !== 'loading'"
    " ? r() : addEventListener('DOMContentLoaded', () => r(), {once: true}))",
}
_WINDOW_TYPES = ("tab", "window")
_DEFAULT_USER_CONTEXT = "default"

_NAVIGATION_EVENTS: dict[str, str | None] = {
    "browsingContext.navigationStarted": "started",
    "browsingContext.navigationCommitted": "committed",
    "browsingContext.domContentLoaded": "dom_content_loaded",
    "browsingContext.load": "load",
    "browsingContext.navigationFailed": "failed",
    "browsingContext.navigationAborted": "aborted",
    "browsingContext.fragmentNavigated": "fragment",
    "browsingContext.historyUpdated": "history",
}
_WINDOW_EVENTS: dict[str, str | None] = {
    "browsingContext.contextCreated": "opened",
    "browsingContext.contextDestroyed": "closed",
}
_DOWNLOAD_EVENTS: dict[str, str | None] = {
    "browsingContext.downloadWillBegin": "started",
    "browsingContext.downloadEnd": None,  # stage comes from the payload's status
}


@dataclass(frozen=True)
class Navigation:
    """A navigation of a window.

    Returned by the navigation verbs on :class:`Window`, and passed to
    navigation handlers.

    Attributes:
        window: The window that navigated.
        url: The URL of the document. For a completed ``get`` or ``refresh``
            this is the final URL, after redirects.
        stage: For a navigation handler, how far the navigation has got:
            ``started``, ``committed``, ``dom_content_loaded``, ``load``,
            ``failed``, ``aborted``, ``fragment`` or ``history``. ``None`` on
            a navigation verb's result.
    """

    window: Window
    url: str
    stage: str | None = None


@dataclass(frozen=True)
class WindowEvent:
    """A window or tab that opened or closed.

    Attributes:
        window: The window concerned.
        kind: ``opened`` or ``closed``.
        opener: The window that opened it, if any.
        user_context: The user context the window belongs to.
    """

    window: Window
    kind: str
    opener: Window | None
    user_context: UserContext


@dataclass(frozen=True)
class Download:
    """A download started from a window.

    Attributes:
        window: The window the download started from.
        url: The URL being downloaded.
        stage: ``started``, ``completed`` or ``canceled``.
        suggested_filename: The filename the page suggested, on ``started``.
        path: Where the file was saved, on ``completed`` when known.
    """

    window: Window
    url: str
    stage: str
    suggested_filename: str | None = None
    path: str | None = None


class _Capture:
    """Base for binary captures that arrive as base64."""

    __slots__ = ("_base64",)

    def __init__(self, data: str) -> None:
        self._base64 = data

    @property
    def base64(self) -> str:
        """The capture as base64 text."""
        return self._base64

    def _bytes(self) -> bytes:
        return base64.b64decode(self._base64.encode("ascii"))

    def save(self, path: str) -> None:
        """Write the capture to ``path``."""
        with open(path, "wb") as f:
            f.write(self._bytes())


class Screenshot(_Capture):
    """A screenshot of a window, returned by :meth:`Window.screenshot`."""

    __slots__ = ()

    @property
    def png(self) -> bytes:
        """The screenshot as PNG bytes."""
        return self._bytes()

    def __repr__(self) -> str:
        return f"Screenshot({len(self._base64)} base64 chars)"


class PrintedPage(_Capture):
    """A window printed to PDF, returned by :meth:`Window.print_page`."""

    __slots__ = ()

    @property
    def pdf(self) -> bytes:
        """The printed page as PDF bytes."""
        return self._bytes()

    def __repr__(self) -> str:
        return f"PrintedPage({len(self._base64)} base64 chars)"


class Registration:
    """A registered window handler, passed back to its ``remove_*_handler`` to detach it."""

    __slots__ = ("_callback", "_family", "_id", "_scope_user_context", "_scope_window")

    _ids = itertools.count(1)

    def __init__(
        self,
        family: str,
        callback: Callable[[Any], Any],
        scope_window: str | None,
        scope_user_context: str | None,
    ) -> None:
        self._id = next(Registration._ids)
        self._family = family
        self._callback = callback
        self._scope_window = scope_window
        self._scope_user_context = scope_user_context

    def __repr__(self) -> str:
        return f"Registration({self._family}, id={self._id})"


class Window:
    """One top-level window or tab.

    Equal to another ``Window`` for the same window. Accepted anywhere a window
    handle is, such as ``driver.switch_to.window()``. Acting on a window never
    changes which window the driver's own commands target, except
    :meth:`switch_to` and closing the driver's current window.
    """

    __slots__ = ("_handle", "_windows")

    def __init__(self, windows: Windows, handle: str) -> None:
        self._windows = windows
        self._handle = handle

    @property
    def handle(self) -> str:
        """The window handle, for logging and for APIs that take a string."""
        return self._handle

    def __eq__(self, other: object) -> bool:
        return isinstance(other, Window) and other._handle == self._handle

    def __hash__(self) -> int:
        return hash((Window, self._handle))

    def __repr__(self) -> str:
        return f"Window({self._handle!r})"

    @property
    def title(self) -> str:
        """The title of the window's top-level document."""
        return self._windows._title(self._handle)

    @property
    def url(self) -> str:
        """The URL of the window's top-level document."""
        return self._windows._url(self._handle)

    @property
    def opener(self) -> Window | None:
        """The window that opened this one, or ``None``."""
        opener = self._windows._info(self._handle).original_opener
        return self._windows._window(opener) if opener else None

    @property
    def user_context(self) -> UserContext:
        """The user context this window belongs to."""
        return self._windows._user_context_of(self._handle)

    @property
    def is_current(self) -> bool:
        """Whether this is the window the driver's own commands target."""
        return self._windows._is_current(self._handle)

    def get(self, url: str, *, wait: str | None = None) -> Navigation:
        """Navigate this window to ``url``.

        Args:
            url: The URL to load.
            wait: ``none``, ``interactive`` or ``complete``. Defaults to what
                the session's page load strategy waits for.

        Returns:
            The navigation, with the final URL after redirects.
        """
        return self._windows._get(self, url, wait)

    def refresh(self, *, wait: str | None = None) -> Navigation:
        """Reload this window's document."""
        return self._windows._refresh(self, wait)

    def back(self) -> Navigation:
        """Go back one step in this window's history."""
        return self._windows._traverse(self, -1)

    def forward(self) -> Navigation:
        """Go forward one step in this window's history."""
        return self._windows._traverse(self, 1)

    def close(self) -> None:
        """Close this window, and the user context it was opened with ``isolated=True``."""
        self._windows._close(self._handle)

    def activate(self) -> None:
        """Bring this window to the front without changing the driver's current window."""
        self._windows._activate(self._handle)

    def switch_to(self) -> None:
        """Make this the window the driver's own commands target."""
        self._windows._driver.switch_to.window(self._handle)

    def screenshot(self, *, full_page: bool = False) -> Screenshot:
        """Capture this window.

        Args:
            full_page: Capture the whole document rather than the viewport.
        """
        return self._windows._screenshot(self._handle, full_page)

    def print_page(self, print_options: PrintOptions | None = None) -> PrintedPage:
        """Print this window to PDF."""
        return self._windows._print(self._handle, print_options)

    def add_navigation_handler(self, callback: Callable[[Navigation], Any]) -> Registration:
        """Observe this window's navigations; see :meth:`Windows.add_navigation_handler`."""
        return self._windows.add_navigation_handler(callback, window_handle=self)

    def add_download_handler(self, callback: Callable[[Download], Any]) -> Registration:
        """Observe downloads from this window; see :meth:`Windows.add_download_handler`."""
        return self._windows.add_download_handler(callback, window_handle=self)


class UserContext:
    """An isolated partition with its own cookies, storage and permissions.

    Usable as a context manager, which removes it on exit.
    """

    __slots__ = ("_id", "_windows")

    def __init__(self, windows: Windows, user_context_id: str) -> None:
        self._windows = windows
        self._id = user_context_id

    @property
    def id(self) -> str:
        """An opaque identifier, for logging."""
        return self._id

    @property
    def is_default(self) -> bool:
        """Whether this is the session's default user context, which cannot be removed."""
        return self._id == _DEFAULT_USER_CONTEXT

    def __eq__(self, other: object) -> bool:
        return isinstance(other, UserContext) and other._id == self._id

    def __hash__(self) -> int:
        return hash((UserContext, self._id))

    def __repr__(self) -> str:
        return f"UserContext({self._id!r})"

    def open(self, type: str = "tab") -> Window:
        """Open a window in this user context; focus does not move."""
        return self._windows._open(type, self._id)

    def windows(self) -> list[Window]:
        """The open top-level windows in this user context."""
        return [
            self._windows._window(info.context) for info in self._windows._top_level() if info.user_context == self._id
        ]

    def remove(self) -> None:
        """Close this user context's windows and discard its storage."""
        self._windows._remove_user_context(self._id)

    def __enter__(self) -> UserContext:
        return self

    def __exit__(self, *exc: object) -> None:
        try:
            self.remove()
        except WebDriverException:
            logger.debug("user context %s was already gone", self._id)

    def add_navigation_handler(self, callback: Callable[[Navigation], Any]) -> Registration:
        """Observe navigations in this user context's windows, including ones opened later."""
        return self._windows.add_navigation_handler(callback, user_context=self)

    def add_window_handler(self, callback: Callable[[WindowEvent], Any]) -> Registration:
        """Observe windows opening and closing in this user context."""
        return self._windows.add_window_handler(callback, user_context=self)

    def add_download_handler(self, callback: Callable[[Download], Any]) -> Registration:
        """Observe downloads from this user context's windows."""
        return self._windows.add_download_handler(callback, user_context=self)


class Windows:
    """Open, list and observe windows. Returned by ``driver.windows``."""

    def __init__(self, driver: WebDriver) -> None:
        self._driver = driver
        self._lock = threading.RLock()
        self._browsing_context: Any = None
        self._browser: Any = None
        self._session: Any = None
        # windows opened with isolated=True, mapped to the user context to remove with them
        self._owned_user_contexts: dict[str, str] = {}
        self._registrations: dict[str, list[Registration]] = {"navigation": [], "window": [], "download": []}
        self._subscriptions: dict[str, tuple[list[str], list[tuple[str, int]]]] = {}
        self._frames: set[str] = set()

    # -- public ------------------------------------------------------------

    def open(self, type: str = "tab", *, isolated: bool = False) -> Window:
        """Open a window or tab. Focus does not move.

        Args:
            type: ``tab`` or ``window``.
            isolated: Open it in a new user context, with its own cookies and
                storage, that ``Window.close()`` removes along with the window.
                Closing the window another way, such as ``driver.close()``,
                leaves the user context for ``user_contexts()`` to find.

        Returns:
            The new window.
        """
        if not isolated:
            return self._open(type, None)
        self._require_bidi("Opening an isolated window")
        user_context = self._create_user_context()
        try:
            window = self._open(type, user_context)
        except Exception:
            self._bidi_browser().remove_user_context(user_context)
            raise
        with self._lock:
            self._owned_user_contexts[window.handle] = user_context
        return window

    def all(self) -> list[Window]:
        """The open top-level windows, in every user context."""
        return [self._window(handle) for handle in self._driver.window_handles]

    @property
    def current(self) -> Window:
        """The window the driver's own commands target."""
        return self._window(self._driver.current_window_handle)

    def create_user_context(self) -> UserContext:
        """Create an isolated user context to open windows in.

        It inherits the session's ``acceptInsecureCerts``. Remove it with
        :meth:`UserContext.remove`, or use it as a context manager.
        """
        self._require_bidi("Creating a user context")
        return UserContext(self, self._create_user_context())

    def user_contexts(self) -> list[UserContext]:
        """Every user context, the default one included."""
        self._require_bidi("Listing user contexts")
        infos = self._bidi_browser().get_user_contexts().user_contexts
        return [UserContext(self, info.user_context) for info in infos]

    def add_navigation_handler(
        self,
        callback: Callable[[Navigation], Any],
        *,
        window_handle: Window | str | None = None,
        user_context: UserContext | str | None = None,
    ) -> Registration:
        """Call ``callback`` with a :class:`Navigation` at each stage of a navigation.

        Scoped to one window or one user context, never both; with neither it
        observes every window, present and future. Frames are not reported.
        An exception raised by ``callback`` is logged, not raised.
        """
        return self._add("navigation", callback, window_handle, user_context)

    def remove_navigation_handler(self, registration: Registration) -> None:
        """Detach a handler added by ``add_navigation_handler``."""
        self._remove("navigation", registration)

    def clear_navigation_handlers(self) -> None:
        """Detach every navigation handler."""
        self._clear("navigation")

    def add_window_handler(
        self, callback: Callable[[WindowEvent], Any], *, user_context: UserContext | str | None = None
    ) -> Registration:
        """Call ``callback`` with a :class:`WindowEvent` when a window opens or closes.

        An exception raised by ``callback`` is logged, not raised.
        """
        return self._add("window", callback, None, user_context)

    def remove_window_handler(self, registration: Registration) -> None:
        """Detach a handler added by ``add_window_handler``."""
        self._remove("window", registration)

    def clear_window_handlers(self) -> None:
        """Detach every window handler."""
        self._clear("window")

    def add_download_handler(
        self,
        callback: Callable[[Download], Any],
        *,
        window_handle: Window | str | None = None,
        user_context: UserContext | str | None = None,
    ) -> Registration:
        """Call ``callback`` with a :class:`Download` when a download starts and ends.

        Scoped as ``add_navigation_handler`` is. An exception raised by
        ``callback`` is logged, not raised.
        """
        return self._add("download", callback, window_handle, user_context)

    def remove_download_handler(self, registration: Registration) -> None:
        """Detach a handler added by ``add_download_handler``."""
        self._remove("download", registration)

    def clear_download_handlers(self) -> None:
        """Detach every download handler."""
        self._clear("download")

    # -- internal module access (composed with the driver, never exposed) ----

    def _has_bidi(self) -> bool:
        return bool(self._driver.caps.get("webSocketUrl"))

    def _require_bidi(self, what: str) -> None:
        if not self._has_bidi():
            raise WebDriverException(f"{what} needs a session started with options.enable_bidi = True")

    def _bidi_context(self) -> Any:
        if self._browsing_context is None:
            from selenium.webdriver.common._bidi.browsing_context import BrowsingContext

            self._browsing_context = BrowsingContext(self._driver)
        return self._browsing_context

    def _bidi_browser(self) -> Any:
        if self._browser is None:
            from selenium.webdriver.common._bidi.browser import Browser

            self._browser = Browser(self._driver)
        return self._browser

    def _bidi_session(self) -> Any:
        if self._session is None:
            from selenium.webdriver.common._bidi.session import Session

            self._session = Session(self._driver)
        return self._session

    @staticmethod
    def _call(handle: str, fn: Callable[[], Any]) -> Any:
        try:
            return fn()
        except NoSuchFrameException as e:
            raise NoSuchWindowException(f"No window with handle {handle!r}: {e.msg}") from e

    # -- helpers -----------------------------------------------------------

    def _window(self, handle: str) -> Window:
        return Window(self, handle)

    def _is_current(self, handle: str) -> bool:
        try:
            return self._driver.current_window_handle == handle
        except NoSuchWindowException:
            return False

    def _dispatch(
        self, handle: str, classic: Callable[[], Any], bidi: Callable[[], Any], force_bidi: bool = False
    ) -> Any:
        if force_bidi:
            self._require_bidi("This option")
            return self._call(handle, bidi)
        if self._is_current(handle):
            return classic()
        if self._has_bidi():
            return self._call(handle, bidi)
        return self._in_window(handle, classic)

    def _in_window(self, handle: str, fn: Callable[[], Any]) -> Any:
        with self._lock:
            try:
                original = self._driver.current_window_handle
            except NoSuchWindowException:
                original = None
            self._driver.switch_to.window(handle)
            try:
                return fn()
            finally:
                if original is not None and original != handle:
                    try:
                        self._driver.switch_to.window(original)
                    except NoSuchWindowException:
                        pass

    def _info(self, handle: str) -> Any:
        self._require_bidi("Reading window details")
        result = self._call(handle, lambda: self._bidi_context().get_tree(max_depth=0, root=handle))
        return result.contexts[0]

    def _top_level(self) -> list[Any]:
        return self._bidi_context().get_tree(max_depth=0).contexts

    def _session_wait(self) -> str:
        strategy = self._driver.caps.get("pageLoadStrategy", "normal")
        return _STRATEGY_WAITS.get(strategy, "complete")

    def _resolve_wait(self, wait: str | None) -> tuple[str, bool]:
        if wait is None:
            return self._session_wait(), False
        if wait not in _WAITS:
            raise ValueError(f"wait must be one of {', '.join(_WAITS)}, not {wait!r}")
        return wait, wait != self._session_wait()

    def _create_user_context(self) -> str:
        from selenium.webdriver.common._bidi.serialization import UNSET

        accept_insecure = self._driver.caps.get("acceptInsecureCerts")
        info = self._bidi_browser().create_user_context(
            accept_insecure_certs=accept_insecure if isinstance(accept_insecure, bool) else UNSET
        )
        return info.user_context

    def _remove_user_context(self, user_context: str) -> None:
        if user_context == _DEFAULT_USER_CONTEXT:
            raise WebDriverException("The default user context cannot be removed")
        self._require_bidi("Removing a user context")
        self._bidi_browser().remove_user_context(user_context)
        with self._lock:
            for handle in [h for h, uc in self._owned_user_contexts.items() if uc == user_context]:
                del self._owned_user_contexts[handle]

    def _user_context_of(self, handle: str) -> UserContext:
        if not self._has_bidi():
            # without BiDi no other user context can have been created
            return UserContext(self, _DEFAULT_USER_CONTEXT)
        return UserContext(self, self._info(handle).user_context)

    # -- operations --------------------------------------------------------

    def _open(self, type: str, user_context: str | None) -> Window:
        if type not in _WINDOW_TYPES:
            raise ValueError(f"type must be 'tab' or 'window', not {type!r}")
        if user_context is None:
            value = self._driver.execute(Command.NEW_WINDOW, {"type": type})["value"]
            return self._window(value["handle"])
        from selenium.webdriver.common._bidi.browsing_context import CreateType

        result = self._bidi_context().create(type=CreateType(type), background=True, user_context=user_context)
        return self._window(result.context)

    def _title(self, handle: str) -> str:
        return self._dispatch(
            handle,
            lambda: self._driver.title,
            lambda: self._driver.script.execute("() => document.title", context_id=handle),
        )

    def _url(self, handle: str) -> str:
        return self._dispatch(handle, lambda: self._driver.current_url, lambda: self._info(handle).url)

    def _get(self, window: Window, url: str, wait: str | None) -> Navigation:
        wait, override = self._resolve_wait(wait)
        handle = window.handle

        def classic() -> str:
            self._driver.get(url)
            return self._driver.current_url

        def bidi() -> str:
            from selenium.webdriver.common._bidi.browsing_context import ReadinessState

            result = self._bidi_context().navigate(context=handle, url=url, wait=ReadinessState(wait))
            return result.url if wait == "none" else self._info(handle).url

        return Navigation(window, self._dispatch(handle, classic, bidi, force_bidi=override))

    def _refresh(self, window: Window, wait: str | None) -> Navigation:
        wait, override = self._resolve_wait(wait)
        handle = window.handle

        def classic() -> str:
            self._driver.refresh()
            return self._driver.current_url

        def bidi() -> str:
            from selenium.webdriver.common._bidi.browsing_context import ReadinessState

            result = self._bidi_context().reload(context=handle, wait=ReadinessState(wait))
            return result.url if wait == "none" else self._info(handle).url

        return Navigation(window, self._dispatch(handle, classic, bidi, force_bidi=override))

    def _traverse(self, window: Window, delta: int) -> Navigation:
        handle = window.handle

        def classic() -> str:
            if delta < 0:
                self._driver.back()
            else:
                self._driver.forward()
            return self._driver.current_url

        def bidi() -> str:
            # traverseHistory returns before the traversal finishes, so wait for it
            # the way the page load strategy says, as classic back/forward does
            done = threading.Event()
            seen: list[tuple[str, str]] = []

            def listener(method: str) -> Callable[[dict], None]:
                def listen(params: dict) -> None:
                    if params.get("context") == handle and not done.is_set():
                        seen.append((method, params.get("url", "")))
                        done.set()

                return listen

            subscriptions, callbacks = self._listen(list(_TRAVERSE_EVENTS), listener, contexts=[handle])
            try:
                self._bidi_context().traverse_history(context=handle, delta=delta)
                timeout = self._driver.timeouts.page_load or 300
                if not done.wait(timeout):
                    raise TimeoutException(f"History traversal in {handle!r} did not finish in {timeout}s")
            finally:
                self._unlisten(subscriptions, callbacks)
            method, url = seen[0]
            wait = self._session_wait()
            if method == "browsingContext.navigationCommitted" and wait in _READY_SCRIPTS:
                self._await_ready(handle, wait)
            return url or self._info(handle).url

        return Navigation(window, self._dispatch(handle, classic, bidi))

    def _close(self, handle: str) -> None:
        self._dispatch(handle, self._driver.close, lambda: self._bidi_context().close(context=handle))
        with self._lock:
            owned = self._owned_user_contexts.pop(handle, None)
        if owned is not None:
            self._bidi_browser().remove_user_context(owned)

    def _activate(self, handle: str) -> None:
        self._require_bidi("Activating a window")
        self._call(handle, lambda: self._bidi_context().activate(context=handle))

    def _screenshot(self, handle: str, full_page: bool) -> Screenshot:
        def bidi() -> str:
            from selenium.webdriver.common._bidi.browsing_context import CaptureScreenshotParametersOrigin

            origin = (
                CaptureScreenshotParametersOrigin.DOCUMENT if full_page else CaptureScreenshotParametersOrigin.VIEWPORT
            )
            return self._bidi_context().capture_screenshot(context=handle, origin=origin).data

        data = self._dispatch(handle, self._driver.get_screenshot_as_base64, bidi, force_bidi=full_page)
        return Screenshot(data)

    def _print(self, handle: str, print_options: PrintOptions | None) -> PrintedPage:
        def bidi() -> str:
            return self._bidi_context().print(context=handle, **_bidi_print_params(print_options)).data

        return PrintedPage(self._dispatch(handle, lambda: self._driver.print_page(print_options), bidi))

    # -- events ------------------------------------------------------------

    def _add(
        self,
        family: str,
        callback: Callable[[Any], Any],
        window_handle: Window | str | None,
        user_context: UserContext | str | None,
    ) -> Registration:
        if window_handle is not None and user_context is not None:
            raise ValueError("Scope a handler by window_handle or user_context, not both")
        self._require_bidi("Window event handlers")
        handle = window_handle.handle if isinstance(window_handle, Window) else window_handle
        uc = user_context.id if isinstance(user_context, UserContext) else user_context
        registration = Registration(family, callback, handle, uc)
        with self._lock:
            if family not in self._subscriptions:
                self._subscribe(family)
            self._registrations[family].append(registration)
        return registration

    def _remove(self, family: str, registration: Registration) -> None:
        with self._lock:
            if registration in self._registrations[family]:
                self._registrations[family].remove(registration)
            if not self._registrations[family]:
                self._unsubscribe(family)

    def _clear(self, family: str) -> None:
        with self._lock:
            self._registrations[family].clear()
            self._unsubscribe(family)

    def _family_events(self, family: str) -> dict[str, str | None]:
        families: dict[str, dict[str, str | None]] = {
            "navigation": _NAVIGATION_EVENTS,
            "window": _WINDOW_EVENTS,
            "download": _DOWNLOAD_EVENTS,
        }
        return families[family]

    def _connection(self) -> Any:
        connection = self._driver._websocket_connection
        if connection is None:
            raise WebDriverException("The BiDi connection is not open")
        return connection

    def _await_ready(self, handle: str, wait: str) -> None:
        from selenium.webdriver.common._bidi.script import ContextTarget, Script

        try:
            Script(self._driver).evaluate(
                _READY_SCRIPTS[wait],
                target=ContextTarget(context=handle, sandbox="selenium-windows"),
                await_promise=True,
            )
        except WebDriverException:
            # the document went away while loading, e.g. another navigation started
            logger.debug("could not wait for %s in %s", wait, handle, exc_info=True)

    def _subscribe(self, family: str) -> None:
        events = list(self._family_events(family))
        self._subscriptions[family] = self._listen(events, lambda method: self._listener(family, method))

    def _unsubscribe(self, family: str) -> None:
        entry = self._subscriptions.pop(family, None)
        if entry is not None:
            self._unlisten(*entry)

    def _listen(
        self,
        events: list[str],
        make_listener: Callable[[str], Callable[[dict], None]],
        contexts: list[str] | None = None,
    ) -> tuple[list[str], list[tuple[str, int]]]:
        """Subscribe to events, skipping any this browser does not implement."""
        session = self._bidi_session()  # starts BiDi, so the connection exists
        connection = self._connection()
        scope: dict[str, Any] = {"contexts": contexts} if contexts else {}
        # listen before subscribing, so an event sent right after the subscription is not dropped
        callbacks = [(method, connection.add_callback(_RawEvent(method), make_listener(method))) for method in events]
        subscriptions: list[str] = []
        try:
            try:
                subscriptions.append(session.subscribe(events=events, **scope).subscription)
            except InvalidArgumentException as unknown:
                # e.g. Firefox does not know browsingContext.navigationAborted yet
                for method in events:
                    try:
                        subscriptions.append(session.subscribe(events=[method], **scope).subscription)
                    except InvalidArgumentException:
                        logger.debug("%s is not supported by this browser", method)
                if not subscriptions:
                    raise unknown
        except Exception:
            self._unlisten(subscriptions, callbacks)
            raise
        return subscriptions, callbacks

    def _unlisten(self, subscriptions: list[str], callbacks: list[tuple[str, int]]) -> None:
        connection = self._connection()
        for method, callback_id in callbacks:
            connection.remove_callback(_RawEvent(method), callback_id)
        if not subscriptions:
            return
        try:
            self._bidi_session().unsubscribe(subscriptions=subscriptions)
        except WebDriverException:
            logger.debug("could not unsubscribe %s", subscriptions, exc_info=True)

    def _listener(self, family: str, method: str) -> Callable[[dict], None]:
        def listen(params: dict) -> None:
            try:
                self._deliver(family, method, params)
            except Exception:
                logger.exception("Failed to deliver %s", method)

        return listen

    def _is_top_level(self, params: dict) -> bool:
        context = params["context"]
        if "parent" in params:
            if params["parent"] is not None:
                self._frames.add(context)
                return False
            return True
        if context in self._frames:
            return False
        if any(info.context == context for info in self._top_level()):
            return True
        # a frame created before we were listening
        self._frames.add(context)
        return False

    def _deliver(self, family: str, method: str, params: dict) -> None:
        if method == "browsingContext.contextDestroyed":
            # the context is gone, so the tree cannot be asked; its payload says whether it had a parent
            if params.get("parent") is not None or params.get("context") in self._frames:
                return
        elif not self._is_top_level(params):
            return
        handle = params["context"]
        window = self._window(handle)
        if family == "navigation":
            payload: Any = Navigation(window, params.get("url", ""), _NAVIGATION_EVENTS[method])
        elif family == "window":
            opener = params.get("originalOpener")
            payload = WindowEvent(
                window,
                _WINDOW_EVENTS[method] or "",
                self._window(opener) if opener else None,
                UserContext(self, params.get("userContext", _DEFAULT_USER_CONTEXT)),
            )
        else:
            stage = _DOWNLOAD_EVENTS[method] or ("completed" if params.get("status") == "complete" else "canceled")
            payload = Download(
                window,
                params.get("url", ""),
                stage,
                params.get("suggestedFilename"),
                params.get("filepath"),
            )
        with self._lock:
            registrations = list(self._registrations[family])
        user_context = params.get("userContext")
        for registration in registrations:
            if registration._scope_window is not None and registration._scope_window != handle:
                continue
            if registration._scope_user_context is not None:
                if user_context is None:
                    user_context = self._user_context_of(handle).id
                if registration._scope_user_context != user_context:
                    continue
            try:
                registration._callback(payload)
            except Exception:
                logger.exception("A %s handler raised", family)


class _RawEvent:
    """Adapter so the websocket hands a handler the event's raw params."""

    def __init__(self, method: str) -> None:
        self.event_class = method

    @staticmethod
    def from_json(params: dict) -> dict:
        return params


def _bidi_print_params(print_options: PrintOptions | None) -> dict[str, Any]:
    if print_options is None:
        return {}
    from selenium.webdriver.common._bidi.browsing_context import (
        PrintMarginParameters,
        PrintPageParameters,
        PrintParametersOrientation,
    )

    options = print_options.to_dict()
    params: dict[str, Any] = {}
    if "orientation" in options:
        params["orientation"] = PrintParametersOrientation(options["orientation"])
    if "scale" in options:
        params["scale"] = float(options["scale"])
    if "background" in options:
        params["background"] = options["background"]
    if "shrinkToFit" in options:
        params["shrink_to_fit"] = options["shrinkToFit"]
    if "pageRanges" in options:
        params["page_ranges"] = list(options["pageRanges"])
    if "page" in options:
        page: dict[str, Any] = dict(options["page"])
        params["page"] = PrintPageParameters(**{k: float(v) for k, v in page.items()})
    if "margin" in options:
        margin: dict[str, Any] = dict(options["margin"])
        params["margin"] = PrintMarginParameters(**{k: float(v) for k, v in margin.items()})
    return params
