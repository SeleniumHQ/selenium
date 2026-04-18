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


from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass, field
from typing import Any

from selenium.webdriver.common.bidi._event_manager import EventConfig, _EventManager
from selenium.webdriver.common.bidi.common import command_builder


class ReadinessState:
    """ReadinessState."""

    NONE = "none"
    INTERACTIVE = "interactive"
    COMPLETE = "complete"


class UserPromptType:
    """UserPromptType."""

    ALERT = "alert"
    BEFOREUNLOAD = "beforeunload"
    CONFIRM = "confirm"
    PROMPT = "prompt"


class CreateType:
    """CreateType."""

    TAB = "tab"
    WINDOW = "window"


class DownloadCompleteParams:
    """DownloadCompleteParams."""

    COMPLETE = "complete"


@dataclass
class Info:
    """Info."""

    children: Any | None = None
    client_window: Any | None = None
    context: Any | None = None
    original_opener: Any | None = None
    url: str | None = None
    user_context: Any | None = None
    parent: Any | None = None


@dataclass
class AccessibilityLocator:
    """AccessibilityLocator."""

    type: str = field(default="accessibility", init=False)
    name: str | None = None
    role: str | None = None


@dataclass
class CssLocator:
    """CssLocator."""

    type: str = field(default="css", init=False)
    value: str | None = None


@dataclass
class ContextLocator:
    """ContextLocator."""

    type: str = field(default="context", init=False)
    context: Any | None = None


@dataclass
class InnerTextLocator:
    """InnerTextLocator."""

    type: str = field(default="innerText", init=False)
    value: str | None = None
    ignore_case: bool | None = None
    match_type: Any | None = None
    max_depth: Any | None = None


@dataclass
class XPathLocator:
    """XPathLocator."""

    type: str = field(default="xpath", init=False)
    value: str | None = None


@dataclass
class BaseNavigationInfo:
    """BaseNavigationInfo."""

    context: Any | None = None
    navigation: Any | None = None
    timestamp: Any | None = None
    url: str | None = None
    user_context: Any | None = None


@dataclass
class ActivateParameters:
    """ActivateParameters."""

    context: Any | None = None


@dataclass
class CaptureScreenshotParameters:
    """CaptureScreenshotParameters."""

    context: Any | None = None
    format: Any | None = None
    clip: Any | None = None


@dataclass
class ImageFormat:
    """ImageFormat."""

    type: str | None = None
    quality: Any | None = None


@dataclass
class ElementClipRectangle:
    """ElementClipRectangle."""

    type: str = field(default="element", init=False)
    element: Any | None = None


@dataclass
class BoxClipRectangle:
    """BoxClipRectangle."""

    type: str = field(default="box", init=False)
    x: Any | None = None
    y: Any | None = None
    width: Any | None = None
    height: Any | None = None


@dataclass
class CaptureScreenshotResult:
    """CaptureScreenshotResult."""

    data: str | None = None


@dataclass
class CloseParameters:
    """CloseParameters."""

    context: Any | None = None
    prompt_unload: bool | None = None


@dataclass
class CreateParameters:
    """CreateParameters."""

    type: Any | None = None
    reference_context: Any | None = None
    background: bool | None = None
    user_context: Any | None = None


@dataclass
class CreateResult:
    """CreateResult."""

    context: Any | None = None
    user_context: Any | None = None


@dataclass
class GetTreeParameters:
    """GetTreeParameters."""

    max_depth: Any | None = None
    root: Any | None = None


@dataclass
class GetTreeResult:
    """GetTreeResult."""

    contexts: Any | None = None


@dataclass
class HandleUserPromptParameters:
    """HandleUserPromptParameters."""

    context: Any | None = None
    accept: bool | None = None
    user_text: str | None = None


@dataclass
class LocateNodesParameters:
    """LocateNodesParameters."""

    context: Any | None = None
    locator: Any | None = None
    serialization_options: Any | None = None
    start_nodes: list[Any] = field(default_factory=list)


@dataclass
class LocateNodesResult:
    """LocateNodesResult."""

    nodes: list[Any] = field(default_factory=list)


@dataclass
class NavigateParameters:
    """NavigateParameters."""

    context: Any | None = None
    url: str | None = None
    wait: Any | None = None


@dataclass
class NavigateResult:
    """NavigateResult."""

    navigation: Any | None = None
    url: str | None = None


@dataclass
class PrintParameters:
    """PrintParameters."""

    context: Any | None = None
    background: bool | None = None
    margin: Any | None = None
    page: Any | None = None
    scale: Any | None = None
    shrink_to_fit: bool | None = None


@dataclass
class PrintMarginParameters:
    """PrintMarginParameters."""

    bottom: Any | None = None
    left: Any | None = None
    right: Any | None = None
    top: Any | None = None


@dataclass
class PrintPageParameters:
    """PrintPageParameters."""

    height: Any | None = None
    width: Any | None = None


@dataclass
class PrintResult:
    """PrintResult."""

    data: str | None = None


@dataclass
class ReloadParameters:
    """ReloadParameters."""

    context: Any | None = None
    ignore_cache: bool | None = None
    wait: Any | None = None


@dataclass
class SetBypassCSPParameters:
    """SetBypassCSPParameters."""

    bypass: Any | None = None
    contexts: list[Any] = field(default_factory=list)
    user_contexts: list[Any] = field(default_factory=list)


@dataclass
class SetViewportParameters:
    """SetViewportParameters."""

    context: Any | None = None
    viewport: Any | None = None
    device_pixel_ratio: Any | None = None
    user_contexts: list[Any] = field(default_factory=list)


@dataclass
class Viewport:
    """Viewport."""

    width: Any | None = None
    height: Any | None = None


@dataclass
class TraverseHistoryParameters:
    """TraverseHistoryParameters."""

    context: Any | None = None
    delta: Any | None = None


@dataclass
class HistoryUpdatedParameters:
    """HistoryUpdatedParameters."""

    context: Any | None = None
    timestamp: Any | None = None
    url: str | None = None
    user_context: Any | None = None


@dataclass
class UserPromptClosedParameters:
    """UserPromptClosedParameters."""

    context: Any | None = None
    accepted: bool | None = None
    type: Any | None = None
    user_context: Any | None = None
    user_text: str | None = None


@dataclass
class UserPromptOpenedParameters:
    """UserPromptOpenedParameters."""

    context: Any | None = None
    handler: Any | None = None
    message: str | None = None
    type: Any | None = None
    user_context: Any | None = None
    default_value: str | None = None


@dataclass
class DownloadWillBeginParams:
    """DownloadWillBeginParams."""

    suggested_filename: str | None = None


@dataclass
class DownloadCanceledParams:
    """DownloadCanceledParams."""

    status: Any | None = None


@dataclass
class DownloadParams:
    """DownloadParams - fields shared by all download end event variants."""

    status: str | None = None
    context: Any | None = None
    navigation: Any | None = None
    timestamp: Any | None = None
    url: str | None = None
    filepath: str | None = None


@dataclass
class DownloadEndParams:
    """DownloadEndParams - params for browsingContext.downloadEnd event."""

    download_params: DownloadParams | None = None

    @classmethod
    def from_json(cls, params: dict) -> DownloadEndParams:
        """Deserialize from BiDi wire-level params dict."""
        dp = DownloadParams(
            status=params.get("status"),
            context=params.get("context"),
            navigation=params.get("navigation"),
            timestamp=params.get("timestamp"),
            url=params.get("url"),
            filepath=params.get("filepath"),
        )
        return cls(download_params=dp)


# BiDi Event Name to Parameter Type Mapping
EVENT_NAME_MAPPING = {
    "context_created": "browsingContext.contextCreated",
    "context_destroyed": "browsingContext.contextDestroyed",
    "navigation_started": "browsingContext.navigationStarted",
    "fragment_navigated": "browsingContext.fragmentNavigated",
    "history_updated": "browsingContext.historyUpdated",
    "dom_content_loaded": "browsingContext.domContentLoaded",
    "load": "browsingContext.load",
    "download_will_begin": "browsingContext.downloadWillBegin",
    "download_end": "browsingContext.downloadEnd",
    "navigation_aborted": "browsingContext.navigationAborted",
    "navigation_committed": "browsingContext.navigationCommitted",
    "navigation_failed": "browsingContext.navigationFailed",
    "user_prompt_closed": "browsingContext.userPromptClosed",
    "user_prompt_opened": "browsingContext.userPromptOpened",
}


def _deserialize_info_list(items: list) -> list | None:
    """Recursively deserialize a list of dicts to Info objects.

    Args:
        items: List of dicts from the API response

    Returns:
        List of Info objects with properly nested children, or None if empty
    """
    if not items or not isinstance(items, list):
        return None

    result = []
    for item in items:
        if isinstance(item, dict):
            # Recursively deserialize children only if the key exists in response
            children_list = None
            if "children" in item:
                children_list = _deserialize_info_list(item.get("children", []))
            info = Info(
                children=children_list,
                client_window=item.get("clientWindow"),
                context=item.get("context"),
                original_opener=item.get("originalOpener"),
                url=item.get("url"),
                user_context=item.get("userContext"),
                parent=item.get("parent"),
            )
            result.append(info)
    return result if result else None


class BrowsingContext:
    """WebDriver BiDi browsingContext module."""

    EVENT_CONFIGS: dict[str, EventConfig] = {}

    def __init__(self, conn) -> None:
        self._conn = conn
        self._event_manager = _EventManager(conn, self.EVENT_CONFIGS)

    def activate(self, context: Any | None = None):
        """Execute browsingContext.activate."""
        if context is None:
            raise TypeError("activate() missing required argument: 'context'")

        params = {
            "context": context,
        }
        params = {k: v for k, v in params.items() if v is not None}
        cmd = command_builder("browsingContext.activate", params)
        result = self._conn.execute(cmd)
        return result

    def capture_screenshot(
        self,
        context: str | None = None,
        format: Any | None = None,
        clip: Any | None = None,
        origin: str | None = None,
    ):
        """Execute browsingContext.captureScreenshot."""
        if context is None:
            raise TypeError("capture_screenshot() missing required argument: 'context'")

        params = {
            "context": context,
            "format": format,
            "clip": clip,
            "origin": origin,
        }
        params = {k: v for k, v in params.items() if v is not None}
        cmd = command_builder("browsingContext.captureScreenshot", params)
        result = self._conn.execute(cmd)
        if result and "data" in result:
            extracted = result.get("data")
            return extracted
        return result

    def close(self, context: Any | None = None, prompt_unload: bool | None = None):
        """Execute browsingContext.close."""
        if context is None:
            raise TypeError("close() missing required argument: 'context'")

        params = {
            "context": context,
            "promptUnload": prompt_unload,
        }
        params = {k: v for k, v in params.items() if v is not None}
        cmd = command_builder("browsingContext.close", params)
        result = self._conn.execute(cmd)
        return result

    def create(
        self,
        type: Any | None = None,
        reference_context: Any | None = None,
        background: bool | None = None,
        user_context: Any | None = None,
    ):
        """Execute browsingContext.create."""
        if type is None:
            raise TypeError("create() missing required argument: 'type'")

        params = {
            "type": type,
            "referenceContext": reference_context,
            "background": background,
            "userContext": user_context,
        }
        params = {k: v for k, v in params.items() if v is not None}
        cmd = command_builder("browsingContext.create", params)
        result = self._conn.execute(cmd)
        if result and "context" in result:
            extracted = result.get("context")
            return extracted
        return result

    def get_tree(self, max_depth: Any | None = None, root: Any | None = None):
        """Execute browsingContext.getTree."""
        params = {
            "maxDepth": max_depth,
            "root": root,
        }
        params = {k: v for k, v in params.items() if v is not None}
        cmd = command_builder("browsingContext.getTree", params)
        result = self._conn.execute(cmd)
        if result and "contexts" in result:
            items = result.get("contexts", [])
            return [
                Info(
                    children=_deserialize_info_list(item.get("children", [])),
                    client_window=item.get("clientWindow"),
                    context=item.get("context"),
                    original_opener=item.get("originalOpener"),
                    url=item.get("url"),
                    user_context=item.get("userContext"),
                    parent=item.get("parent"),
                )
                for item in items
                if isinstance(item, dict)
            ]
        return []

    def handle_user_prompt(self, context: Any | None = None, accept: bool | None = None, user_text: Any | None = None):
        """Execute browsingContext.handleUserPrompt."""
        if context is None:
            raise TypeError("handle_user_prompt() missing required argument: 'context'")

        params = {
            "context": context,
            "accept": accept,
            "userText": user_text,
        }
        params = {k: v for k, v in params.items() if v is not None}
        cmd = command_builder("browsingContext.handleUserPrompt", params)
        result = self._conn.execute(cmd)
        return result

    def locate_nodes(
        self,
        context: str | None = None,
        locator: Any | None = None,
        serialization_options: Any | None = None,
        start_nodes: Any | None = None,
        max_node_count: int | None = None,
    ):
        """Execute browsingContext.locateNodes."""
        if context is None:
            raise TypeError("locate_nodes() missing required argument: 'context'")
        if locator is None:
            raise TypeError("locate_nodes() missing required argument: 'locator'")

        params = {
            "context": context,
            "locator": locator,
            "serializationOptions": serialization_options,
            "startNodes": start_nodes,
            "maxNodeCount": max_node_count,
        }
        params = {k: v for k, v in params.items() if v is not None}
        cmd = command_builder("browsingContext.locateNodes", params)
        result = self._conn.execute(cmd)
        if result and "nodes" in result:
            extracted = result.get("nodes")
            return extracted
        return result

    def navigate(self, context: Any | None = None, url: Any | None = None, wait: Any | None = None):
        """Execute browsingContext.navigate."""
        if context is None:
            raise TypeError("navigate() missing required argument: 'context'")
        if url is None:
            raise TypeError("navigate() missing required argument: 'url'")

        params = {
            "context": context,
            "url": url,
            "wait": wait,
        }
        params = {k: v for k, v in params.items() if v is not None}
        cmd = command_builder("browsingContext.navigate", params)
        result = self._conn.execute(cmd)
        return result

    def print(
        self,
        context: Any | None = None,
        background: bool | None = None,
        margin: Any | None = None,
        page: Any | None = None,
        scale: Any | None = None,
        shrink_to_fit: bool | None = None,
    ):
        """Execute browsingContext.print."""
        if context is None:
            raise TypeError("print() missing required argument: 'context'")

        params = {
            "context": context,
            "background": background,
            "margin": margin,
            "page": page,
            "scale": scale,
            "shrinkToFit": shrink_to_fit,
        }
        params = {k: v for k, v in params.items() if v is not None}
        cmd = command_builder("browsingContext.print", params)
        result = self._conn.execute(cmd)
        if result and "data" in result:
            extracted = result.get("data")
            return extracted
        return result

    def reload(self, context: Any | None = None, ignore_cache: bool | None = None, wait: Any | None = None):
        """Execute browsingContext.reload."""
        if context is None:
            raise TypeError("reload() missing required argument: 'context'")

        params = {
            "context": context,
            "ignoreCache": ignore_cache,
            "wait": wait,
        }
        params = {k: v for k, v in params.items() if v is not None}
        cmd = command_builder("browsingContext.reload", params)
        result = self._conn.execute(cmd)
        return result

    def set_bypass_csp(
        self,
        bypass: Any | None = None,
        contexts: list[Any] | None = None,
        user_contexts: list[Any] | None = None,
    ):
        """Execute browsingContext.setBypassCSP."""
        if bypass is None:
            raise TypeError("set_bypass_csp() missing required argument: 'bypass'")

        params = {
            "bypass": bypass,
            "contexts": contexts,
            "userContexts": user_contexts,
        }
        params = {k: v for k, v in params.items() if v is not None}
        cmd = command_builder("browsingContext.setBypassCSP", params)
        result = self._conn.execute(cmd)
        return result

    def traverse_history(self, context: Any | None = None, delta: Any | None = None):
        """Execute browsingContext.traverseHistory."""
        if context is None:
            raise TypeError("traverse_history() missing required argument: 'context'")
        if delta is None:
            raise TypeError("traverse_history() missing required argument: 'delta'")

        params = {
            "context": context,
            "delta": delta,
        }
        params = {k: v for k, v in params.items() if v is not None}
        cmd = command_builder("browsingContext.traverseHistory", params)
        result = self._conn.execute(cmd)
        return result

    def set_viewport(
        self,
        context: str | None = None,
        viewport: Any = ...,
        user_contexts: Any | None = None,
        device_pixel_ratio: Any = ...,
    ):
        """Execute browsingContext.setViewport.

        Uses sentinel defaults so explicit None is serialized for viewport/devicePixelRatio,
        while omitted arguments are not sent.
        """
        params = {}
        if context is not None:
            params["context"] = context
        if user_contexts is not None:
            params["userContexts"] = user_contexts
        if viewport is not ...:
            params["viewport"] = viewport
        if device_pixel_ratio is not ...:
            params["devicePixelRatio"] = device_pixel_ratio

        cmd = command_builder("browsingContext.setViewport", params)
        result = self._conn.execute(cmd)
        return result

    def add_event_handler(self, event: str, callback: Callable, contexts: list[str] | None = None) -> int:
        """Add an event handler.

        Args:
            event: The event to subscribe to.
            callback: The callback function to execute on event.
            contexts: The context IDs to subscribe to (optional).

        Returns:
            The callback ID.
        """
        return self._event_manager.add_event_handler(event, callback, contexts)

    def remove_event_handler(self, event: str, callback_id: int) -> None:
        """Remove an event handler.

        Args:
            event: The event to unsubscribe from.
            callback_id: The callback ID.
        """
        return self._event_manager.remove_event_handler(event, callback_id)

    def clear_event_handlers(self) -> None:
        """Clear all event handlers."""
        return self._event_manager.clear_event_handlers()


# Event Info Type Aliases
# Event: browsingContext.contextCreated
ContextCreated = globals().get("Info", dict)  # Fallback to dict if type not defined

# Event: browsingContext.contextDestroyed
ContextDestroyed = globals().get("Info", dict)  # Fallback to dict if type not defined

# Event: browsingContext.navigationStarted
NavigationStarted = globals().get("BaseNavigationInfo", dict)  # Fallback to dict if type not defined

# Event: browsingContext.fragmentNavigated
FragmentNavigated = globals().get("BaseNavigationInfo", dict)  # Fallback to dict if type not defined

# Event: browsingContext.historyUpdated
HistoryUpdated = globals().get("HistoryUpdatedParameters", dict)  # Fallback to dict if type not defined

# Event: browsingContext.domContentLoaded
DomContentLoaded = globals().get("BaseNavigationInfo", dict)  # Fallback to dict if type not defined

# Event: browsingContext.load
Load = globals().get("BaseNavigationInfo", dict)  # Fallback to dict if type not defined

# Event: browsingContext.downloadWillBegin
DownloadWillBegin = globals().get("DownloadWillBeginParams", dict)  # Fallback to dict if type not defined

# Event: browsingContext.downloadEnd
DownloadEnd = globals().get("DownloadEndParams", dict)  # Fallback to dict if type not defined

# Event: browsingContext.navigationAborted
NavigationAborted = globals().get("BaseNavigationInfo", dict)  # Fallback to dict if type not defined

# Event: browsingContext.navigationCommitted
NavigationCommitted = globals().get("BaseNavigationInfo", dict)  # Fallback to dict if type not defined

# Event: browsingContext.navigationFailed
NavigationFailed = globals().get("BaseNavigationInfo", dict)  # Fallback to dict if type not defined

# Event: browsingContext.userPromptClosed
UserPromptClosed = globals().get("UserPromptClosedParameters", dict)  # Fallback to dict if type not defined

# Event: browsingContext.userPromptOpened
UserPromptOpened = globals().get("UserPromptOpenedParameters", dict)  # Fallback to dict if type not defined


# Populate EVENT_CONFIGS with event configuration mappings
_globals = globals()
BrowsingContext.EVENT_CONFIGS = {
    "context_created": EventConfig(
        "context_created",
        "browsingContext.contextCreated",
        _globals.get("ContextCreated", dict) if _globals.get("ContextCreated") else dict,
    ),
    "context_destroyed": EventConfig(
        "context_destroyed",
        "browsingContext.contextDestroyed",
        _globals.get("ContextDestroyed", dict) if _globals.get("ContextDestroyed") else dict,
    ),
    "navigation_started": EventConfig(
        "navigation_started",
        "browsingContext.navigationStarted",
        _globals.get("NavigationStarted", dict) if _globals.get("NavigationStarted") else dict,
    ),
    "fragment_navigated": EventConfig(
        "fragment_navigated",
        "browsingContext.fragmentNavigated",
        _globals.get("FragmentNavigated", dict) if _globals.get("FragmentNavigated") else dict,
    ),
    "history_updated": EventConfig(
        "history_updated",
        "browsingContext.historyUpdated",
        _globals.get("HistoryUpdated", dict) if _globals.get("HistoryUpdated") else dict,
    ),
    "dom_content_loaded": EventConfig(
        "dom_content_loaded",
        "browsingContext.domContentLoaded",
        _globals.get("DomContentLoaded", dict) if _globals.get("DomContentLoaded") else dict,
    ),
    "load": EventConfig("load", "browsingContext.load", _globals.get("Load", dict) if _globals.get("Load") else dict),
    "download_will_begin": EventConfig(
        "download_will_begin",
        "browsingContext.downloadWillBegin",
        _globals.get("DownloadWillBegin", dict) if _globals.get("DownloadWillBegin") else dict,
    ),
    "download_end": EventConfig(
        "download_end",
        "browsingContext.downloadEnd",
        _globals.get("DownloadEnd", dict) if _globals.get("DownloadEnd") else dict,
    ),
    "navigation_aborted": EventConfig(
        "navigation_aborted",
        "browsingContext.navigationAborted",
        _globals.get("NavigationAborted", dict) if _globals.get("NavigationAborted") else dict,
    ),
    "navigation_committed": EventConfig(
        "navigation_committed",
        "browsingContext.navigationCommitted",
        _globals.get("NavigationCommitted", dict) if _globals.get("NavigationCommitted") else dict,
    ),
    "navigation_failed": EventConfig(
        "navigation_failed",
        "browsingContext.navigationFailed",
        _globals.get("NavigationFailed", dict) if _globals.get("NavigationFailed") else dict,
    ),
    "user_prompt_closed": EventConfig(
        "user_prompt_closed",
        "browsingContext.userPromptClosed",
        _globals.get("UserPromptClosed", dict) if _globals.get("UserPromptClosed") else dict,
    ),
    "user_prompt_opened": EventConfig(
        "user_prompt_opened",
        "browsingContext.userPromptOpened",
        _globals.get("UserPromptOpened", dict) if _globals.get("UserPromptOpened") else dict,
    ),
}
