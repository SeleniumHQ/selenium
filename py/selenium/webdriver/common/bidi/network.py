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

import base64
from collections.abc import Callable
from typing import Any, Optional, Union
from enum import Enum

from selenium.webdriver.common.bidi.common import command_builder
from selenium.webdriver.remote.websocket_connection import WebSocketConnection


class BytesValueType(str, Enum):
    STRING = "string"
    BASE64 = "base64"


class BytesValue:
    """Represents network.BytesValue that can be either string (UTF-8) or base64-encoded binary data."""

    def __init__(self, value: Union[str, bytes]):
        if isinstance(value, str):
            self._type = BytesValueType.STRING
            self._value = value
        elif isinstance(value, bytes):
            self._type = BytesValueType.BASE64
            self._value = base64.b64encode(value).decode("ascii")
        else:
            raise ValueError("Value must be str or bytes")

    @property
    def type(self) -> str:
        return self._type.value

    @property
    def value(self) -> str:
        return self._value

    def to_dict(self) -> dict:
        return {"type": self._type.value, "value": self._value}

    @classmethod
    def from_dict(cls, data: dict) -> "BytesValue":
        value_type = data.get("type")
        value = data.get("value")

        if value_type == BytesValueType.STRING.value:
            return cls.from_string(value)
        elif value_type == BytesValueType.BASE64.value:
            return cls.from_base64(value)
        else:
            raise ValueError(f"Unknown BytesValue type: {value_type}")

    @classmethod
    def from_string(cls, value: str) -> "BytesValue":
        instance = cls.__new__(cls)
        instance._type = BytesValueType.STRING
        instance._value = value
        return instance

    @classmethod
    def from_bytes(cls, data: bytes) -> "BytesValue":
        instance = cls.__new__(cls)
        instance._type = BytesValueType.BASE64
        instance._value = base64.b64encode(data).decode("ascii")
        return instance

    @classmethod
    def from_base64(cls, encoded: str) -> "BytesValue":
        instance = cls.__new__(cls)
        instance._type = BytesValueType.BASE64
        instance._value = encoded
        return instance

    def to_bytes(self) -> bytes:
        """Deserialize protocol bytes to byte sequence."""
        if self._type == BytesValueType.STRING:
            return self._value.encode("utf-8")
        else:
            return base64.b64decode(self._value)


class NetworkEvent:
    """Represents a network event."""

    def __init__(self, event_class: str, **kwargs: Any) -> None:
        self.event_class = event_class
        self.params = kwargs

    @classmethod
    def from_json(cls, json: dict[str, Any]) -> NetworkEvent:
        return cls(event_class=json.get("event_class", ""), **json)


class Network:
    EVENTS = {
        "before_request": "network.beforeRequestSent",
        "response_started": "network.responseStarted",
        "response_completed": "network.responseCompleted",
        "auth_required": "network.authRequired",
        "fetch_error": "network.fetchError",
        "continue_request": "network.continueRequest",
        "continue_auth": "network.continueWithAuth",
    }

    PHASES = {
        "before_request": "beforeRequestSent",
        "response_started": "responseStarted",
        "auth_required": "authRequired",
    }

    def __init__(self, conn: WebSocketConnection) -> None:
        self.conn = conn
        self.intercepts: list[str] = []
        self.callbacks: dict[str | int, Any] = {}
        self.subscriptions: dict[str, list[int]] = {}
        self.data_collectors: list[str] = []

    def _add_intercept(
        self,
        phases: list[str] | None = None,
        contexts: list[str] | None = None,
        url_patterns: list[Any] | None = None,
    ) -> dict[str, Any]:
        """Add an intercept to the network.

        Args:
            phases: A list of phases to intercept. Default is None (empty list).
            contexts: A list of contexts to intercept. Default is None.
            url_patterns: A list of URL patterns to intercept. Default is None.

        Returns:
            str: intercept id
        """
        if phases is None:
            phases = []
        params = {}
        if contexts is not None:
            params["contexts"] = contexts
        if url_patterns is not None:
            params["urlPatterns"] = url_patterns
        if len(phases) > 0:
            params["phases"] = phases
        else:
            params["phases"] = ["beforeRequestSent"]
        cmd = command_builder("network.addIntercept", params)

        result: dict[str, Any] = self.conn.execute(cmd)
        self.intercepts.append(result["intercept"])
        return result

    def _remove_intercept(self, intercept: str | None = None) -> None:
        """Remove a specific intercept, or all intercepts.

        Args:
            intercept: The intercept to remove. Default is None.

        Raises:
            ValueError: If intercept is not found.

        Note:
            If intercept is None, all intercepts will be removed.
        """
        if intercept is None:
            intercepts_to_remove = self.intercepts.copy()  # create a copy before iterating
            for intercept_id in intercepts_to_remove:  # remove all intercepts
                self.conn.execute(command_builder("network.removeIntercept", {"intercept": intercept_id}))
                self.intercepts.remove(intercept_id)
        else:
            try:
                self.conn.execute(command_builder("network.removeIntercept", {"intercept": intercept}))
                self.intercepts.remove(intercept)
            except Exception as e:
                raise Exception(f"Exception: {e}")

    def _on_request(self, event_name: str, callback: Callable[[Request], Any]) -> int:
        """Set a callback function to subscribe to a network event.

        Args:
            event_name: The event to subscribe to.
            callback: The callback function to execute on event.
                Takes Request object as argument.

        Returns:
            int: callback id
        """
        event = NetworkEvent(event_name)

        def _callback(event_data: NetworkEvent) -> None:
            request = Request(
                network=self,
                request_id=event_data.params["request"].get("request", None),
                body_size=event_data.params["request"].get("bodySize", None),
                cookies=event_data.params["request"].get("cookies", None),
                resource_type=event_data.params["request"].get("goog:resourceType", None),
                headers=event_data.params["request"].get("headers", None),
                headers_size=event_data.params["request"].get("headersSize", None),
                timings=event_data.params["request"].get("timings", None),
                url=event_data.params["request"].get("url", None),
            )
            callback(request)

        callback_id: int = self.conn.add_callback(event, _callback)

        if event_name in self.callbacks:
            self.callbacks[event_name].append(callback_id)
        else:
            self.callbacks[event_name] = [callback_id]

        return callback_id

    def add_request_handler(
        self,
        event: str,
        callback: Callable[[Request], Any],
        url_patterns: list[Any] | None = None,
        contexts: list[str] | None = None,
    ) -> int:
        """Add a request handler to the network.

        Args:
            event: The event to subscribe to.
            callback: The callback function to execute on request interception.
                Takes Request object as argument.
            url_patterns: A list of URL patterns to intercept. Default is None.
            contexts: A list of contexts to intercept. Default is None.

        Returns:
            int: callback id
        """
        try:
            event_name = self.EVENTS[event]
            phase_name = self.PHASES[event]
        except KeyError:
            raise Exception(f"Event {event} not found")

        result = self._add_intercept(phases=[phase_name], url_patterns=url_patterns, contexts=contexts)
        callback_id = self._on_request(event_name, callback)

        if event_name in self.subscriptions:
            self.subscriptions[event_name].append(callback_id)
        else:
            params: dict[str, Any] = {}
            params["events"] = [event_name]
            self.conn.execute(command_builder("session.subscribe", params))
            self.subscriptions[event_name] = [callback_id]

        self.callbacks[callback_id] = result["intercept"]
        return callback_id

    def remove_request_handler(self, event: str, callback_id: int) -> None:
        """Remove a request handler from the network.

        Args:
            event: The event to unsubscribe from.
            callback_id: The callback id to remove.
        """
        try:
            event_name = self.EVENTS[event]
        except KeyError:
            raise Exception(f"Event {event} not found")

        net_event = NetworkEvent(event_name)

        self.conn.remove_callback(net_event, callback_id)
        self._remove_intercept(self.callbacks[callback_id])
        del self.callbacks[callback_id]
        self.subscriptions[event_name].remove(callback_id)
        if len(self.subscriptions[event_name]) == 0:
            params: dict[str, Any] = {}
            params["events"] = [event_name]
            self.conn.execute(command_builder("session.unsubscribe", params))
            del self.subscriptions[event_name]

    def clear_request_handlers(self) -> None:
        """Clear all request handlers from the network."""
        for event_name in self.subscriptions:
            for callback_id in self.subscriptions[event_name].copy():
                net_event = NetworkEvent(event_name)
                self.conn.remove_callback(net_event, callback_id)
                if callback_id in self.callbacks:
                    self._remove_intercept(self.callbacks[callback_id])
                    del self.callbacks[callback_id]
        self.subscriptions = {}

    def add_response_handler(self, event, callback, url_patterns=None, contexts=None, intercept=False):
        """Add a response handler to the network.

        Parameters:
        ----------
            event (str): The event to subscribe to. Can be "response_started" or "response_completed".
            callback (function): The callback function to execute on response event.
                Takes Response object as argument.
            url_patterns (list, optional): A list of URL patterns to match.
                Default is None.
            contexts (list, optional): A list of contexts to match.
                Default is None.
            intercept (bool, optional): Whether to create an intercept (block the response).
                Only works with "response_started". Default is False.
                Note: If intercept=True, you MUST call response.continue_response()
                in your callback or navigation will hang.

        Returns:
        -------
            int : callback id
        """
        try:
            event_name = self.EVENTS[event]
        except KeyError:
            raise Exception(f"Event {event} not found")

        # Only response_started can be intercepted (for continue_response)
        intercept_id = None
        if intercept:
            if event not in self.PHASES:
                raise ValueError(f"Event {event} does not support interception")
            phase_name = self.PHASES[event]
            result = self._add_intercept(phases=[phase_name], url_patterns=url_patterns, contexts=contexts)
            intercept_id = result["intercept"]

        callback_id = self._on_response(event_name, callback)

        if event_name in self.subscriptions:
            self.subscriptions[event_name].append(callback_id)
        else:
            params: dict[str, Any] = {}
            params["events"] = [event_name]
            self.conn.execute(command_builder("session.subscribe", params))
            self.subscriptions[event_name] = [callback_id]

        if intercept_id:
            self.callbacks[callback_id] = intercept_id
        else:
            self.callbacks[callback_id] = None

        return callback_id

    def remove_response_handler(self, event, callback_id):
        """Remove a response handler from the network.

        Parameters:
        ----------
            event (str): The event to unsubscribe from.
            callback_id (int): The callback id to remove.
        """
        try:
            event_name = self.EVENTS[event]
        except KeyError:
            raise Exception(f"Event {event} not found")

        net_event = NetworkEvent(event_name)

        self.conn.remove_callback(net_event, callback_id)

        # Remove intercept if it was created for this handler
        if callback_id in self.callbacks and self.callbacks[callback_id] is not None:
            self._remove_intercept(self.callbacks[callback_id])
            del self.callbacks[callback_id]

        if event_name in self.subscriptions:
            self.subscriptions[event_name].remove(callback_id)
            if len(self.subscriptions[event_name]) == 0:
                del self.subscriptions[event_name]

    def clear_response_handlers(self):
        """Clear all response handlers from the network."""
        response_events = ["response_started", "response_completed"]

        for event in response_events:
            try:
                event_name = self.EVENTS[event]
                if event_name in self.subscriptions:
                    for callback_id in self.subscriptions[event_name].copy():
                        net_event = NetworkEvent(event_name)
                        self.conn.remove_callback(net_event, callback_id)

                        # Remove intercept if one exists
                        if callback_id in self.callbacks and self.callbacks[callback_id] is not None:
                            self._remove_intercept(self.callbacks[callback_id])
                            del self.callbacks[callback_id]

                    del self.subscriptions[event_name]
            except KeyError:
                # Event not found, skip
                continue

    def _on_response(self, event_name, callback):
        """Set a callback function to subscribe to a response network event.

        Parameters:
        ----------
            event_name (str): The event to subscribe to.
            callback (function): The callback function to execute on event.
                Takes Response object as argument.

        Returns:
        -------
            int : callback id
        """
        event = NetworkEvent(event_name)

        def _callback(event_data):
            # Response events contain both request and response data in params
            response_data = event_data.params.get("response", {})
            request_data = event_data.params.get("request", {})
            request_id = request_data.get("request")

            # Create a Response object with the response data and request ID
            response = Response(
                network=self,
                request_id=request_id,
                url=response_data.get("url"),
                protocol=response_data.get("protocol"),
                status_code=response_data.get("status"),
                status_text=response_data.get("statusText"),
                headers=response_data.get("headers", []),
                mime_type=response_data.get("mimeType"),
                from_cache=response_data.get("fromCache", False),
                bytes_received=response_data.get("bytesReceived"),
                headers_size=response_data.get("headersSize"),
                body_size=response_data.get("bodySize"),
                content=response_data.get("content"),
                auth_challenges=response_data.get("authChallenges"),
            )
            callback(response)

        callback_id = self.conn.add_callback(event, _callback)

        if event_name in self.callbacks:
            self.callbacks[event_name].append(callback_id)
        else:
            self.callbacks[event_name] = [callback_id]

        return callback_id

    def add_auth_handler(self, username: str, password: str) -> int:
        """Add an authentication handler to the network.

        Args:
            username: The username to authenticate with.
            password: The password to authenticate with.

        Returns:
            int: callback id
        """
        event = "auth_required"

        def _callback(request: Request) -> None:
            request._continue_with_auth(username, password)

        return self.add_request_handler(event, _callback)

    def remove_auth_handler(self, callback_id: int) -> None:
        """Remove an authentication handler from the network.

        Args:
            callback_id: The callback id to remove.
        """
        event = "auth_required"
        self.remove_request_handler(event, callback_id)

    def add_data_collector(
        self,
        data_types: list,
        max_encoded_data_size: int,
        collector_type: str = "blob",
        contexts: list = None,
        user_contexts: list = None,
    ):
        """Add a data collector to the network.

        Parameters:
        ----------
            data_types (list): A list of data types to collect (e.g., ["response"]).`
            max_encoded_data_size (int): Maximum size of encoded data.
            collector_type (str, optional): Type of collector. Default is "blob".
            contexts (list, optional): A list of browsing contexts to intercept.
                Default is None.
            user_contexts (list, optional): A list of user contexts to intercept.
                Default is None.

        Returns:
        -------
            str : collector id

        Raises:
        ------
            ValueError: If both contexts and user_contexts are provided.
        """
        if contexts is not None and user_contexts is not None:
            raise ValueError("Cannot specify both contexts and user_contexts, specify one")

        params = {
            "dataTypes": data_types,
            "maxEncodedDataSize": max_encoded_data_size,
            "collectorType": collector_type,
        }

        if contexts is not None:
            params["contexts"] = contexts
        if user_contexts is not None:
            params["userContexts"] = user_contexts

        cmd = command_builder("network.addDataCollector", params)
        result = self.conn.execute(cmd)
        collector_id = result["collector"]
        self.data_collectors.append(collector_id)
        return collector_id

    def remove_data_collector(self, collector_id: str):
        """Remove a data collector from the network.

        Parameters:
        ----------
            collector_id (str): The collector id to remove.

        Raises:
        ------
            ValueError: If collector is not found.
        """
        if collector_id not in self.data_collectors:
            raise ValueError(f"Collector {collector_id} not found")

        params = {"collector": collector_id}
        cmd = command_builder("network.removeDataCollector", params)
        self.conn.execute(cmd)
        self.data_collectors.remove(collector_id)

    def get_data(self, data_type: str, request_id: str, collector_id: str = None, disown: bool = False):
        """Retrieve network data for a request.

        Parameters:
        ----------
            data_type (str): The type of data to retrieve (e.g., "response").
            request_id (str): The request id to get data for.
            collector_id (str, optional): The collector id to use.
                Default is None.
            disown (bool, optional): Whether to disown the data from the collector.
                Default is False.

        Returns:
        -------
            BytesValue : The network data as BytesValue.

        Raises:
        ------
            ValueError: If disown is True but collector_id is None.
        """
        if disown and collector_id is None:
            raise ValueError("Cannot disown data without specifying a collector")

        params = {
            "dataType": data_type,
            "request": request_id,
            "disown": disown,
        }

        if collector_id is not None:
            params["collector"] = collector_id

        cmd = command_builder("network.getData", params)
        result = self.conn.execute(cmd)
        return BytesValue.from_dict(result["bytes"])


class Request:
    """Represents an intercepted network request."""

    def __init__(
        self,
        network: Network,
        request_id: Any,
        body_size: int | None = None,
        cookies: Any = None,
        resource_type: str | None = None,
        headers: Any = None,
        headers_size: int | None = None,
        method: str | None = None,
        timings: Any = None,
        url: str | None = None,
    ) -> None:
        self.network = network
        self.request_id = request_id
        self.body_size = body_size
        self.cookies = cookies
        self.resource_type = resource_type
        self.headers = headers
        self.headers_size = headers_size
        self.method = method
        self.timings = timings
        self.url = url

    def fail_request(self) -> None:
        """Fail this request."""
        if not self.request_id:
            raise ValueError("Request not found.")

        params: dict[str, Any] = {"request": self.request_id}
        self.network.conn.execute(command_builder("network.failRequest", params))

    def continue_request(
        self,
        body: Any = None,
        method: str | None = None,
        headers: Any = None,
        cookies: Any = None,
        url: str | None = None,
    ) -> None:
        """Continue after intercepting this request."""
        if not self.request_id:
            raise ValueError("Request not found.")

        params: dict[str, Any] = {"request": self.request_id}
        if body is not None:
            params["body"] = body
        if method is not None:
            params["method"] = method
        if headers is not None:
            params["headers"] = headers
        if cookies is not None:
            params["cookies"] = cookies
        if url is not None:
            params["url"] = url

        self.network.conn.execute(command_builder("network.continueRequest", params))

    def _continue_with_auth(self, username: str | None = None, password: str | None = None) -> None:
        """Continue with authentication.

        Args:
            username: The username to authenticate with.
            password: The password to authenticate with.

        Note:
            If username or password is None, it attempts auth with no credentials.
        """
        params: dict[str, Any] = {}
        params["request"] = self.request_id

        if not username or not password:  # no credentials is valid option
            params["action"] = "default"
        else:
            params["action"] = "provideCredentials"
            params["credentials"] = {"type": "password", "username": username, "password": password}

        self.network.conn.execute(command_builder("network.continueWithAuth", params))


class Response:
    """Represents a network response - network.ResponseData type."""

    def __init__(
        self,
        network: Network,
        request_id: str,
        url: str = None,
        protocol: str = None,
        status_code: int = None,
        status_text: str = None,
        headers: list = None,
        mime_type: str = None,
        from_cache: bool = False,
        bytes_received: int = None,
        headers_size: Optional[int] = None,
        body_size: Optional[int] = None,
        content: dict = None,
        auth_challenges: Optional[list] = None,
    ):
        self.network: Network = network
        self.request_id: str = request_id
        self.url: str = url
        self.protocol: str = protocol
        self.status_code: int = status_code
        self.status_text: str = status_text
        self.headers: list = headers or []
        self.mime_type: str = mime_type
        self.from_cache: bool = from_cache
        self.bytes_received: int = bytes_received
        self.headers_size: Optional[int] = headers_size
        self.body_size: Optional[int] = body_size
        self.content: dict = content
        self.auth_challenges: Optional[list] = auth_challenges

    def continue_response(self, cookies=None, credentials=None, headers=None, reason_phrase=None, status_code=None):
        """Continue a response blocked by a network intercept.

        This can be called in the responseStarted phase to modify the status
        and headers of the response.

        Parameters:
        ----------
            cookies (list, optional): A list of Set-Cookie headers to set.
            credentials (dict, optional): Authentication credentials with keys:
                - type: "password"
                - username: str
                - password: str
            headers (list, optional): A list of headers to set.
            reason_phrase (str, optional): The HTTP status text (e.g., "OK", "Not Found").
            status_code (int, optional): The HTTP status code (e.g., 200, 404).

        Raises:
        ------
            ValueError: If request_id is not available.
        """
        if not self.request_id:
            raise ValueError("Response not found.")

        params = {"request": self.request_id}
        if cookies is not None:
            params["cookies"] = cookies
        if credentials is not None:
            params["credentials"] = credentials
        if headers is not None:
            params["headers"] = headers
        if reason_phrase is not None:
            params["reasonPhrase"] = reason_phrase
        if status_code is not None:
            params["statusCode"] = status_code

        self.network.conn.execute(command_builder("network.continueResponse", params))
