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

import dataclasses
import json
import logging
import queue
import threading
from ssl import CERT_NONE
from threading import Thread

from websocket import WebSocketApp

from selenium.common import WebDriverException

# Sentinel pushed onto the event queue to tell the dispatcher thread to stop.
_DISPATCHER_SHUTDOWN = object()


def _snake_to_camel(name: str) -> str:
    """Convert snake_case field name to camelCase for BiDi protocol."""
    parts = name.split("_")
    return parts[0] + "".join(p.title() for p in parts[1:])


class _BiDiEncoder(json.JSONEncoder):
    """JSON encoder for BiDi dataclass instances.

    Converts snake_case field names to camelCase, strips ``None`` values,
    and flattens a ``properties`` field (e.g. ``PointerCommonProperties``)
    directly into its parent action dict as required by the BiDi spec.
    """

    def _convert(self, value):
        """Recursively convert a value, handling nested dataclasses, lists, and dicts."""
        if dataclasses.is_dataclass(value) and not isinstance(value, type):
            return self.default(value)
        if isinstance(value, list):
            return [self._convert(item) for item in value]
        if isinstance(value, dict):
            return {k: self._convert(v) for k, v in value.items()}
        return value

    def default(self, o):
        if dataclasses.is_dataclass(o) and not isinstance(o, type):
            result = {}
            for f in dataclasses.fields(o):
                value = getattr(o, f.name)
                # Skip None values unless the field is explicitly marked
                # retain_none=True in its metadata (e.g. for required-but-nullable
                # BiDi fields that must be sent as JSON null rather than omitted).
                if value is None and not f.metadata.get("retain_none"):
                    continue
                camel_key = _snake_to_camel(f.name)
                # Flatten PointerCommonProperties fields inline into the parent
                if camel_key == "properties" and dataclasses.is_dataclass(value):
                    for pf in dataclasses.fields(value):
                        pv = getattr(value, pf.name)
                        if pv is not None:
                            result[_snake_to_camel(pf.name)] = self._convert(pv)
                else:
                    result[camel_key] = self._convert(value)
            return result
        return super().default(o)


logger = logging.getLogger(__name__)


class WebSocketConnection:
    _max_log_message_size = 9999

    def __init__(self, url, timeout, interval):
        if not isinstance(timeout, (int, float)) or timeout < 0:
            raise WebDriverException("timeout must be a positive number")
        if not isinstance(interval, (int, float)) or timeout < 0:
            raise WebDriverException("interval must be a positive number")

        self.url = url
        self.response_wait_timeout = timeout
        # Retained for backwards compatibility; the connection no longer
        # busy-waits, so the interval no longer influences response latency.
        self.response_wait_interval = interval

        self.session_id = None
        self._ws = None
        self._ws_thread = None

        self._id = 0
        self._id_lock = threading.Lock()

        # Command responses keyed by id, alongside a per-request ``Event`` the
        # receive thread sets when the matching response arrives. Both are
        # guarded by ``_response_lock`` so caller threads and the receive thread
        # share them safely instead of relying on the GIL.
        self._messages = {}
        self._response_events = {}
        self._response_lock = threading.Lock()

        # Event callbacks, guarded by ``_callbacks_lock``. Incoming events are
        # handed to a single long-lived dispatcher thread: this preserves event
        # ordering, bounds thread usage to one regardless of event volume (no
        # thread-per-event exhaustion), and lets us surface callback exceptions
        # instead of losing them on an orphaned thread.
        self.callbacks = {}
        self._callbacks_lock = threading.Lock()
        self._dispatch_queue = queue.Queue()
        self._dispatcher_thread = Thread(target=self._dispatch_events, daemon=True, name="BiDi-event-dispatcher")
        self._dispatcher_thread.start()

        self._open_event = threading.Event()

        self._start_ws()
        if not self._open_event.wait(self.response_wait_timeout):
            raise WebDriverException("Timed out waiting for the BiDi websocket connection to open")

    def close(self):
        # Close the socket first so ``run_forever`` returns; only then join the
        # thread. Joining first would block for the full ``response_wait_timeout``
        # because the thread does not exit until the connection is closed.
        if self._ws is not None:
            try:
                self._ws.close()
            except Exception as e:
                logger.debug(f"Error while closing websocket connection: {e}")
        if self._ws_thread is not None:
            self._ws_thread.join(timeout=self.response_wait_timeout)

        # Stop the dispatcher thread now the receive thread is done producing events.
        self._dispatch_queue.put(_DISPATCHER_SHUTDOWN)
        if self._dispatcher_thread is not None:
            self._dispatcher_thread.join(timeout=self.response_wait_timeout)

        # Drop registered handlers so nothing fires after close, and wake any
        # callers still blocked on a response so they fail fast rather than
        # waiting out the full timeout.
        with self._callbacks_lock:
            self.callbacks.clear()
        with self._response_lock:
            self._messages.clear()
            pending = list(self._response_events.values())
            self._response_events.clear()
        for response_event in pending:
            response_event.set()

        self._open_event.clear()
        self._ws = None

    def execute(self, command):
        with self._id_lock:
            self._id += 1
            current_id = self._id
        payload = self._serialize_command(command)
        payload["id"] = current_id
        if self.session_id:
            payload["sessionId"] = self.session_id

        data = json.dumps(payload, cls=_BiDiEncoder)
        logger.debug(f"-> {data}"[: self._max_log_message_size])

        # Register the waiter before sending so a fast response can't arrive
        # before we are ready to receive it.
        response_event = threading.Event()
        with self._response_lock:
            self._response_events[current_id] = response_event

        self._ws.send(data)

        response_event.wait(self.response_wait_timeout)
        with self._response_lock:
            self._response_events.pop(current_id, None)
            response = self._messages.pop(current_id, None)
        if response is None:
            raise WebDriverException(f"Timed out waiting for response to BiDi command {current_id}")

        if "error" in response:
            error = response["error"]
            if "message" in response:
                error_msg = f"{error}: {response['message']}"
                raise WebDriverException(error_msg)
            else:
                raise WebDriverException(error)
        else:
            result = response["result"]
            return self._deserialize_result(result, command)

    def add_callback(self, event, callback):
        event_name = event.event_class

        def _callback(params):
            callback(event.from_json(params))

        with self._callbacks_lock:
            self.callbacks.setdefault(event_name, []).append(_callback)
        return id(_callback)

    on = add_callback

    def remove_callback(self, event, callback_id):
        event_name = event.event_class
        with self._callbacks_lock:
            for callback in self.callbacks.get(event_name, []):
                if id(callback) == callback_id:
                    self.callbacks[event_name].remove(callback)
                    return

    def _serialize_command(self, command):
        return next(command)

    def _deserialize_result(self, result, command):
        try:
            _ = command.send(result)
            raise WebDriverException("The command's generator function did not exit when expected!")
        except StopIteration as exit:
            return exit.value

    def _start_ws(self):
        def on_open(ws):
            self._open_event.set()

        def on_message(ws, message):
            self._process_message(message)

        def on_error(ws, error):
            logger.debug(f"error: {error}")
            ws.close()

        def run_socket():
            if self.url.startswith("wss://"):
                self._ws.run_forever(sslopt={"cert_reqs": CERT_NONE}, suppress_origin=True)
            else:
                self._ws.run_forever(suppress_origin=True)

        self._ws = WebSocketApp(self.url, on_open=on_open, on_message=on_message, on_error=on_error)
        self._ws_thread = Thread(target=run_socket, daemon=True)
        self._ws_thread.start()

    def _process_message(self, message):
        message = json.loads(message)
        logger.debug(f"<- {message}"[: self._max_log_message_size])

        if "id" in message:
            message_id = message["id"]
            with self._response_lock:
                self._messages[message_id] = message
                response_event = self._response_events.get(message_id)
            if response_event is not None:
                response_event.set()

        if "method" in message:
            # Hand events to the single dispatcher thread instead of spawning a
            # thread per event; this keeps ordering and avoids the receive thread
            # being blocked by a slow callback.
            self._dispatch_queue.put((message["method"], message["params"]))

    def _dispatch_events(self):
        while True:
            item = self._dispatch_queue.get()
            if item is _DISPATCHER_SHUTDOWN:
                break
            method, params = item
            with self._callbacks_lock:
                callbacks = list(self.callbacks.get(method, []))
            for callback in callbacks:
                try:
                    callback(params)
                except Exception:
                    # Never let one handler's failure kill the dispatcher or
                    # silently vanish: log it and keep delivering other events.
                    logger.error(f"Unhandled exception in BiDi event callback for '{method}'", exc_info=True)
