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

from typing import Any, Callable, Optional, Union

from selenium.webdriver.common.bidi.common import command_builder

from .session import Session


class ReadinessState:
    """Represents the stage of document loading at which a navigation command will return."""

    NONE = "none"
    INTERACTIVE = "interactive"
    COMPLETE = "complete"


class UserPromptType:
    """Represents the possible user prompt types."""

    ALERT = "alert"
    BEFORE_UNLOAD = "beforeunload"
    CONFIRM = "confirm"
    PROMPT = "prompt"


class NavigationInfo:
    """Provides details of an ongoing navigation."""

    def __init__(
        self,
        context: str,
        navigation: Optional[str],
        timestamp: int,
        url: str,
    ):
        self.context = context
        self.navigation = navigation
        self.timestamp = timestamp
        self.url = url

    @classmethod
    def from_json(cls, json: dict) -> "NavigationInfo":
        """Creates a NavigationInfo instance from a dictionary.

        Parameters:
        -----------
            json: A dictionary containing the navigation information.

        Returns:
        -------
            NavigationInfo: A new instance of NavigationInfo.
        """
        context = json.get("context")
        if context is None or not isinstance(context, str):
            raise ValueError("context is required and must be a string")

        navigation = json.get("navigation")
        if navigation is not None and not isinstance(navigation, str):
            raise ValueError("navigation must be a string")

        timestamp = json.get("timestamp")
        if timestamp is None or not isinstance(timestamp, int) or timestamp < 0:
            raise ValueError("timestamp is required and must be a non-negative integer")

        url = json.get("url")
        if url is None or not isinstance(url, str):
            raise ValueError("url is required and must be a string")

        return cls(context, navigation, timestamp, url)


class BrowsingContextInfo:
    """Represents the properties of a navigable."""

    def __init__(
        self,
        context: str,
        url: str,
        children: Optional[list["BrowsingContextInfo"]],
        client_window: str,
        user_context: str,
        parent: Optional[str] = None,
        original_opener: Optional[str] = None,
    ):
        self.context = context
        self.url = url
        self.children = children
        self.parent = parent
        self.user_context = user_context
        self.original_opener = original_opener
        self.client_window = client_window

    @classmethod
    def from_json(cls, json: dict) -> "BrowsingContextInfo":
        """Creates a BrowsingContextInfo instance from a dictionary.

        Parameters:
        -----------
            json: A dictionary containing the browsing context information.

        Returns:
        -------
            BrowsingContextInfo: A new instance of BrowsingContextInfo.
        """
        children = None
        raw_children = json.get("children")
        if raw_children is not None:
            if not isinstance(raw_children, list):
                raise ValueError("children must be a list if provided")

            children = []
            for child in raw_children:
                if not isinstance(child, dict):
                    raise ValueError(f"Each child must be a dictionary, got {type(child)}")
                children.append(BrowsingContextInfo.from_json(child))

        context = json.get("context")
        if context is None or not isinstance(context, str):
            raise ValueError("context is required and must be a string")

        url = json.get("url")
        if url is None or not isinstance(url, str):
            raise ValueError("url is required and must be a string")

        parent = json.get("parent")
        if parent is not None and not isinstance(parent, str):
            raise ValueError("parent must be a string if provided")

        user_context = json.get("userContext")
        if user_context is None or not isinstance(user_context, str):
            raise ValueError("userContext is required and must be a string")

        original_opener = json.get("originalOpener")
        if original_opener is not None and not isinstance(original_opener, str):
            raise ValueError("originalOpener must be a string if provided")

        client_window = json.get("clientWindow")
        if client_window is None or not isinstance(client_window, str):
            raise ValueError("clientWindow is required and must be a string")

        return cls(
            context=context,
            url=url,
            children=children,
            client_window=client_window,
            user_context=user_context,
            parent=parent,
            original_opener=original_opener,
        )


class DownloadWillBeginParams(NavigationInfo):
    """Parameters for the downloadWillBegin event."""

    def __init__(
        self,
        context: str,
        navigation: Optional[str],
        timestamp: int,
        url: str,
        suggested_filename: str,
    ):
        super().__init__(context, navigation, timestamp, url)
        self.suggested_filename = suggested_filename

    @classmethod
    def from_json(cls, json: dict) -> "DownloadWillBeginParams":
        """Creates a DownloadWillBeginParams instance from a dictionary.

        Parameters:
        -----------
            json: A dictionary containing the download parameters.

        Returns:
        -------
            DownloadWillBeginParams: A new instance of DownloadWillBeginParams.
        """
        context = json.get("context")
        if context is None or not isinstance(context, str):
            raise ValueError("context is required and must be a string")

        navigation = json.get("navigation")
        if navigation is not None and not isinstance(navigation, str):
            raise ValueError("navigation must be a string")

        timestamp = json.get("timestamp")
        if timestamp is None or not isinstance(timestamp, int) or timestamp < 0:
            raise ValueError("timestamp is required and must be a non-negative integer")

        url = json.get("url")
        if url is None or not isinstance(url, str):
            raise ValueError("url is required and must be a string")

        suggested_filename = json.get("suggestedFilename")
        if suggested_filename is None or not isinstance(suggested_filename, str):
            raise ValueError("suggestedFilename is required and must be a string")

        return cls(
            context=context,
            navigation=navigation,
            timestamp=timestamp,
            url=url,
            suggested_filename=suggested_filename,
        )


class UserPromptOpenedParams:
    """Parameters for the userPromptOpened event."""

    def __init__(
        self,
        context: str,
        handler: str,
        message: str,
        type: str,
        default_value: Optional[str] = None,
    ):
        self.context = context
        self.handler = handler
        self.message = message
        self.type = type
        self.default_value = default_value

    @classmethod
    def from_json(cls, json: dict) -> "UserPromptOpenedParams":
        """Creates a UserPromptOpenedParams instance from a dictionary.

        Parameters:
        -----------
            json: A dictionary containing the user prompt parameters.

        Returns:
        -------
            UserPromptOpenedParams: A new instance of UserPromptOpenedParams.
        """
        context = json.get("context")
        if context is None or not isinstance(context, str):
            raise ValueError("context is required and must be a string")

        handler = json.get("handler")
        if handler is None or not isinstance(handler, str):
            raise ValueError("handler is required and must be a string")

        message = json.get("message")
        if message is None or not isinstance(message, str):
            raise ValueError("message is required and must be a string")

        type_value = json.get("type")
        if type_value is None or not isinstance(type_value, str):
            raise ValueError("type is required and must be a string")

        default_value = json.get("defaultValue")
        if default_value is not None and not isinstance(default_value, str):
            raise ValueError("defaultValue must be a string if provided")

        return cls(
            context=context,
            handler=handler,
            message=message,
            type=type_value,
            default_value=default_value,
        )


class UserPromptClosedParams:
    """Parameters for the userPromptClosed event."""

    def __init__(
        self,
        context: str,
        accepted: bool,
        type: str,
        user_text: Optional[str] = None,
    ):
        self.context = context
        self.accepted = accepted
        self.type = type
        self.user_text = user_text

    @classmethod
    def from_json(cls, json: dict) -> "UserPromptClosedParams":
        """Creates a UserPromptClosedParams instance from a dictionary.

        Parameters:
        -----------
            json: A dictionary containing the user prompt closed parameters.

        Returns:
        -------
            UserPromptClosedParams: A new instance of UserPromptClosedParams.
        """
        context = json.get("context")
        if context is None or not isinstance(context, str):
            raise ValueError("context is required and must be a string")

        accepted = json.get("accepted")
        if accepted is None or not isinstance(accepted, bool):
            raise ValueError("accepted is required and must be a boolean")

        type_value = json.get("type")
        if type_value is None or not isinstance(type_value, str):
            raise ValueError("type is required and must be a string")

        user_text = json.get("userText")
        if user_text is not None and not isinstance(user_text, str):
            raise ValueError("userText must be a string if provided")

        return cls(
            context=context,
            accepted=accepted,
            type=type_value,
            user_text=user_text,
        )


class HistoryUpdatedParams:
    """Parameters for the historyUpdated event."""

    def __init__(
        self,
        context: str,
        timestamp: int,
        url: str,
    ):
        self.context = context
        self.timestamp = timestamp
        self.url = url

    @classmethod
    def from_json(cls, json: dict) -> "HistoryUpdatedParams":
        """Creates a HistoryUpdatedParams instance from a dictionary.

        Parameters:
        -----------
            json: A dictionary containing the history updated parameters.

        Returns:
        -------
            HistoryUpdatedParams: A new instance of HistoryUpdatedParams.
        """
        context = json.get("context")
        if context is None or not isinstance(context, str):
            raise ValueError("context is required and must be a string")

        timestamp = json.get("timestamp")
        if timestamp is None or not isinstance(timestamp, int) or timestamp < 0:
            raise ValueError("timestamp is required and must be a non-negative integer")

        url = json.get("url")
        if url is None or not isinstance(url, str):
            raise ValueError("url is required and must be a string")

        return cls(
            context=context,
            timestamp=timestamp,
            url=url,
        )


class BrowsingContextEvent:
    """Base class for browsing context events."""

    def __init__(self, event_class: str, **kwargs):
        self.event_class = event_class
        self.params = kwargs

    @classmethod
    def from_json(cls, json: dict) -> "BrowsingContextEvent":
        """Creates a BrowsingContextEvent instance from a dictionary.

        Parameters:
        -----------
            json: A dictionary containing the event information.

        Returns:
        -------
            BrowsingContextEvent: A new instance of BrowsingContextEvent.
        """
        event_class = json.get("event_class")
        if event_class is None or not isinstance(event_class, str):
            raise ValueError("event_class is required and must be a string")

        return cls(event_class=event_class, **json)


class BrowsingContext:
    """BiDi implementation of the browsingContext module."""

    EVENTS = {
        "context_created": "browsingContext.contextCreated",
        "context_destroyed": "browsingContext.contextDestroyed",
        "dom_content_loaded": "browsingContext.domContentLoaded",
        "download_will_begin": "browsingContext.downloadWillBegin",
        "fragment_navigated": "browsingContext.fragmentNavigated",
        "history_updated": "browsingContext.historyUpdated",
        "load": "browsingContext.load",
        "navigation_aborted": "browsingContext.navigationAborted",
        "navigation_committed": "browsingContext.navigationCommitted",
        "navigation_failed": "browsingContext.navigationFailed",
        "navigation_started": "browsingContext.navigationStarted",
        "user_prompt_closed": "browsingContext.userPromptClosed",
        "user_prompt_opened": "browsingContext.userPromptOpened",
    }

    def __init__(self, conn):
        self.conn = conn
        self.subscriptions = {}
        self.callbacks = {}

    def activate(self, context: str) -> None:
        """Activates and focuses the given top-level traversable.

        Parameters:
        -----------
            context: The browsing context ID to activate.

        Raises:
        ------
            Exception: If the browsing context is not a top-level traversable.
        """
        params = {"context": context}
        self.conn.execute(command_builder("browsingContext.activate", params))

    def capture_screenshot(
        self,
        context: str,
        origin: str = "viewport",
        format: Optional[dict] = None,
        clip: Optional[dict] = None,
    ) -> str:
        """Captures an image of the given navigable, and returns it as a Base64-encoded string.

        Parameters:
        -----------
            context: The browsing context ID to capture.
            origin: The origin of the screenshot, either "viewport" or "document".
            format: The format of the screenshot.
            clip: The clip rectangle of the screenshot.

        Returns:
        -------
            str: The Base64-encoded screenshot.
        """
        params: dict[str, Any] = {"context": context, "origin": origin}
        if format is not None:
            params["format"] = format
        if clip is not None:
            params["clip"] = clip

        result = self.conn.execute(command_builder("browsingContext.captureScreenshot", params))
        return result["data"]

    def close(self, context: str, prompt_unload: bool = False) -> None:
        """Closes a top-level traversable.

        Parameters:
        -----------
            context: The browsing context ID to close.
            prompt_unload: Whether to prompt to unload.

        Raises:
        ------
            Exception: If the browsing context is not a top-level traversable.
        """
        params = {"context": context, "promptUnload": prompt_unload}
        self.conn.execute(command_builder("browsingContext.close", params))

    def create(
        self,
        type: str,
        reference_context: Optional[str] = None,
        background: bool = False,
        user_context: Optional[str] = None,
    ) -> str:
        """Creates a new navigable, either in a new tab or in a new window, and returns its navigable id.

        Parameters:
        -----------
            type: The type of the new navigable, either "tab" or "window".
            reference_context: The reference browsing context ID.
            background: Whether to create the new navigable in the background.
            user_context: The user context ID.

        Returns:
        -------
            str: The browsing context ID of the created navigable.
        """
        params: dict[str, Any] = {"type": type}
        if reference_context is not None:
            params["referenceContext"] = reference_context
        if background is not None:
            params["background"] = background
        if user_context is not None:
            params["userContext"] = user_context

        result = self.conn.execute(command_builder("browsingContext.create", params))
        return result["context"]

    def get_tree(
        self,
        max_depth: Optional[int] = None,
        root: Optional[str] = None,
    ) -> list[BrowsingContextInfo]:
        """Returns a tree of all descendent navigables including the given parent itself, or all top-level contexts
        when no parent is provided.

        Parameters:
        -----------
            max_depth: The maximum depth of the tree.
            root: The root browsing context ID.

        Returns:
        -------
            List[BrowsingContextInfo]: A list of browsing context information.
        """
        params: dict[str, Any] = {}
        if max_depth is not None:
            params["maxDepth"] = max_depth
        if root is not None:
            params["root"] = root

        result = self.conn.execute(command_builder("browsingContext.getTree", params))
        return [BrowsingContextInfo.from_json(context) for context in result["contexts"]]

    def handle_user_prompt(
        self,
        context: str,
        accept: Optional[bool] = None,
        user_text: Optional[str] = None,
    ) -> None:
        """Allows closing an open prompt.

        Parameters:
        -----------
            context: The browsing context ID.
            accept: Whether to accept the prompt.
            user_text: The text to enter in the prompt.
        """
        params: dict[str, Any] = {"context": context}
        if accept is not None:
            params["accept"] = accept
        if user_text is not None:
            params["userText"] = user_text

        self.conn.execute(command_builder("browsingContext.handleUserPrompt", params))

    def locate_nodes(
        self,
        context: str,
        locator: dict,
        max_node_count: Optional[int] = None,
        serialization_options: Optional[dict] = None,
        start_nodes: Optional[list[dict]] = None,
    ) -> list[dict]:
        """Returns a list of all nodes matching the specified locator.

        Parameters:
        -----------
            context: The browsing context ID.
            locator: The locator to use.
            max_node_count: The maximum number of nodes to return.
            serialization_options: The serialization options.
            start_nodes: The start nodes.

        Returns:
        -------
            List[Dict]: A list of nodes.
        """
        params: dict[str, Any] = {"context": context, "locator": locator}
        if max_node_count is not None:
            params["maxNodeCount"] = max_node_count
        if serialization_options is not None:
            params["serializationOptions"] = serialization_options
        if start_nodes is not None:
            params["startNodes"] = start_nodes

        result = self.conn.execute(command_builder("browsingContext.locateNodes", params))
        return result["nodes"]

    def navigate(
        self,
        context: str,
        url: str,
        wait: Optional[str] = None,
    ) -> dict:
        """Navigates a navigable to the given URL.

        Parameters:
        -----------
            context: The browsing context ID.
            url: The URL to navigate to.
            wait: The readiness state to wait for.

        Returns:
        -------
            Dict: A dictionary containing the navigation result.
        """
        params = {"context": context, "url": url}
        if wait is not None:
            params["wait"] = wait

        result = self.conn.execute(command_builder("browsingContext.navigate", params))
        return result

    def print(
        self,
        context: str,
        background: bool = False,
        margin: Optional[dict] = None,
        orientation: str = "portrait",
        page: Optional[dict] = None,
        page_ranges: Optional[list[Union[int, str]]] = None,
        scale: float = 1.0,
        shrink_to_fit: bool = True,
    ) -> str:
        """Creates a paginated representation of a document, and returns it as a PDF document represented as a
        Base64-encoded string.

        Parameters:
        -----------
            context: The browsing context ID.
            background: Whether to include the background.
            margin: The margin parameters.
            orientation: The orientation, either "portrait" or "landscape".
            page: The page parameters.
            page_ranges: The page ranges.
            scale: The scale.
            shrink_to_fit: Whether to shrink to fit.

        Returns:
        -------
            str: The Base64-encoded PDF document.
        """
        params = {
            "context": context,
            "background": background,
            "orientation": orientation,
            "scale": scale,
            "shrinkToFit": shrink_to_fit,
        }
        if margin is not None:
            params["margin"] = margin
        if page is not None:
            params["page"] = page
        if page_ranges is not None:
            params["pageRanges"] = page_ranges

        result = self.conn.execute(command_builder("browsingContext.print", params))
        return result["data"]

    def reload(
        self,
        context: str,
        ignore_cache: Optional[bool] = None,
        wait: Optional[str] = None,
    ) -> dict:
        """Reloads a navigable.

        Parameters:
        -----------
            context: The browsing context ID.
            ignore_cache: Whether to ignore the cache.
            wait: The readiness state to wait for.

        Returns:
        -------
            Dict: A dictionary containing the navigation result.
        """
        params: dict[str, Any] = {"context": context}
        if ignore_cache is not None:
            params["ignoreCache"] = ignore_cache
        if wait is not None:
            params["wait"] = wait

        result = self.conn.execute(command_builder("browsingContext.reload", params))
        return result

    def set_viewport(
        self,
        context: Optional[str] = None,
        viewport: Optional[dict] = None,
        device_pixel_ratio: Optional[float] = None,
        user_contexts: Optional[list[str]] = None,
    ) -> None:
        """Modifies specific viewport characteristics on the given top-level traversable.

        Parameters:
        -----------
            context: The browsing context ID.
            viewport: The viewport parameters.
            device_pixel_ratio: The device pixel ratio.
            user_contexts: The user context IDs.

        Raises:
        ------
            Exception: If the browsing context is not a top-level traversable.
        """
        params: dict[str, Any] = {}
        if context is not None:
            params["context"] = context
        if viewport is not None:
            params["viewport"] = viewport
        if device_pixel_ratio is not None:
            params["devicePixelRatio"] = device_pixel_ratio
        if user_contexts is not None:
            params["userContexts"] = user_contexts

        self.conn.execute(command_builder("browsingContext.setViewport", params))

    def traverse_history(self, context: str, delta: int) -> dict:
        """Traverses the history of a given navigable by a delta.

        Parameters:
        -----------
            context: The browsing context ID.
            delta: The delta to traverse by.

        Returns:
        -------
            Dict: A dictionary containing the traverse history result.
        """
        params = {"context": context, "delta": delta}
        result = self.conn.execute(command_builder("browsingContext.traverseHistory", params))
        return result

    def _on_event(self, event_name: str, callback: Callable) -> int:
        """Set a callback function to subscribe to a browsing context event.

        Parameters:
        ----------
            event_name: The event to subscribe to.
            callback: The callback function to execute on event.

        Returns:
        -------
            int: callback id
        """
        event = BrowsingContextEvent(event_name)

        def _callback(event_data):
            if event_name == self.EVENTS["context_created"] or event_name == self.EVENTS["context_destroyed"]:
                info = BrowsingContextInfo.from_json(event_data.params)
                callback(info)
            elif event_name == self.EVENTS["download_will_begin"]:
                params = DownloadWillBeginParams.from_json(event_data.params)
                callback(params)
            elif event_name == self.EVENTS["user_prompt_opened"]:
                params = UserPromptOpenedParams.from_json(event_data.params)
                callback(params)
            elif event_name == self.EVENTS["user_prompt_closed"]:
                params = UserPromptClosedParams.from_json(event_data.params)
                callback(params)
            elif event_name == self.EVENTS["history_updated"]:
                params = HistoryUpdatedParams.from_json(event_data.params)
                callback(params)
            else:
                # For navigation events
                info = NavigationInfo.from_json(event_data.params)
                callback(info)

        callback_id = self.conn.add_callback(event, _callback)

        if event_name in self.callbacks:
            self.callbacks[event_name].append(callback_id)
        else:
            self.callbacks[event_name] = [callback_id]

        return callback_id

    def add_event_handler(self, event: str, callback: Callable, contexts: Optional[list[str]] = None) -> int:
        """Add an event handler to the browsing context.

        Parameters:
        ----------
            event: The event to subscribe to.
            callback: The callback function to execute on event.
            contexts: The browsing context IDs to subscribe to.

        Returns:
        -------
            int: callback id
        """
        try:
            event_name = self.EVENTS[event]
        except KeyError:
            raise Exception(f"Event {event} not found")

        callback_id = self._on_event(event_name, callback)

        if event_name in self.subscriptions:
            self.subscriptions[event_name].append(callback_id)
        else:
            params = {"events": [event_name]}
            if contexts is not None:
                params["browsingContexts"] = contexts
            session = Session(self.conn)
            self.conn.execute(session.subscribe(**params))
            self.subscriptions[event_name] = [callback_id]

        return callback_id

    def remove_event_handler(self, event: str, callback_id: int) -> None:
        """Remove an event handler from the browsing context.

        Parameters:
        ----------
            event: The event to unsubscribe from.
            callback_id: The callback id to remove.
        """
        try:
            event_name = self.EVENTS[event]
        except KeyError:
            raise Exception(f"Event {event} not found")

        event_obj = BrowsingContextEvent(event_name)

        self.conn.remove_callback(event_obj, callback_id)
        if event_name in self.subscriptions:
            callbacks = self.subscriptions[event_name]
            if callback_id in callbacks:
                callbacks.remove(callback_id)
                if not callbacks:
                    params = {"events": [event_name]}
                    session = Session(self.conn)
                    self.conn.execute(session.unsubscribe(**params))
                    del self.subscriptions[event_name]

    def clear_event_handlers(self) -> None:
        """Clear all event handlers from the browsing context."""
        for event_name in self.subscriptions:
            event = BrowsingContextEvent(event_name)
            for callback_id in self.subscriptions[event_name]:
                self.conn.remove_callback(event, callback_id)
            params = {"events": [event_name]}
            session = Session(self.conn)
            self.conn.execute(session.unsubscribe(**params))
        self.subscriptions = {}
