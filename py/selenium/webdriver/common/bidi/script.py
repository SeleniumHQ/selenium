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

import typing
from dataclasses import dataclass

from .session import session_subscribe
from .session import session_unsubscribe


class Script:
    def __init__(self, conn):
        self.conn = conn
        self.log_entry_subscribed = False

    def add_console_message_handler(self, handler):
        self._subscribe_to_log_entries()
        return self.conn.add_callback(LogEntryAdded, self._handle_log_entry("console", handler))

    def add_javascript_error_handler(self, handler):
        self._subscribe_to_log_entries()
        return self.conn.add_callback(LogEntryAdded, self._handle_log_entry("javascript", handler))

    def remove_console_message_handler(self, id):
        self.conn.remove_callback(LogEntryAdded, id)
        self._unsubscribe_from_log_entries()

    remove_javascript_error_handler = remove_console_message_handler

    def _subscribe_to_log_entries(self):
        if not self.log_entry_subscribed:
            self.conn.execute(session_subscribe(LogEntryAdded.event_class))
            self.log_entry_subscribed = True

    def _unsubscribe_from_log_entries(self):
        if self.log_entry_subscribed and LogEntryAdded.event_class not in self.conn.callbacks:
            self.conn.execute(session_unsubscribe(LogEntryAdded.event_class))
            self.log_entry_subscribed = False

    def _handle_log_entry(self, type, handler):
        def _handle_log_entry(log_entry):
            if log_entry.type_ == type:
                handler(log_entry)

        return _handle_log_entry


class LogEntryAdded:
    event_class = "log.entryAdded"

    @classmethod
    def from_json(cls, json):
        if json["type"] == "console":
            return ConsoleLogEntry.from_json(json)
        elif json["type"] == "javascript":
            return JavaScriptLogEntry.from_json(json)


@dataclass
class ConsoleLogEntry:
    level: str
    text: str
    timestamp: str
    method: str
    args: typing.List[dict]
    type_: str

    @classmethod
    def from_json(cls, json):
        return cls(
            level=json["level"],
            text=json["text"],
            timestamp=json["timestamp"],
            method=json["method"],
            args=json["args"],
            type_=json["type"],
        )


@dataclass
class JavaScriptLogEntry:
    level: str
    text: str
    timestamp: str
    stacktrace: dict
    type_: str

    @classmethod
    def from_json(cls, json):
        return cls(
            level=json["level"],
            text=json["text"],
            timestamp=json["timestamp"],
            stacktrace=json["stackTrace"],
            type_=json["type"],
        )
