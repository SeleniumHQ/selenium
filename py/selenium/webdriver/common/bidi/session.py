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

from dataclasses import dataclass, field
from typing import Any

from selenium.webdriver.common.bidi.common import command_builder


class UserPromptHandlerType:
    """UserPromptHandlerType."""

    ACCEPT = "accept"
    DISMISS = "dismiss"
    IGNORE = "ignore"


@dataclass
class CapabilitiesRequest:
    """CapabilitiesRequest."""

    always_match: Any | None = None
    first_match: list[Any] = field(default_factory=list)


@dataclass
class CapabilityRequest:
    """CapabilityRequest."""

    accept_insecure_certs: bool | None = None
    browser_name: str | None = None
    browser_version: str | None = None
    platform_name: str | None = None
    proxy: Any | None = None
    unhandled_prompt_behavior: Any | None = None


@dataclass
class AutodetectProxyConfiguration:
    """AutodetectProxyConfiguration."""

    proxy_type: str = field(default="autodetect", init=False)


@dataclass
class DirectProxyConfiguration:
    """DirectProxyConfiguration."""

    proxy_type: str = field(default="direct", init=False)


@dataclass
class ManualProxyConfiguration:
    """ManualProxyConfiguration."""

    proxy_type: str = field(default="manual", init=False)
    http_proxy: str | None = None
    ssl_proxy: str | None = None
    no_proxy: list[Any] = field(default_factory=list)


@dataclass
class SocksProxyConfiguration:
    """SocksProxyConfiguration."""

    socks_proxy: str | None = None
    socks_version: Any | None = None


@dataclass
class PacProxyConfiguration:
    """PacProxyConfiguration."""

    proxy_type: str = field(default="pac", init=False)
    proxy_autoconfig_url: str | None = None


@dataclass
class SystemProxyConfiguration:
    """SystemProxyConfiguration."""

    proxy_type: str = field(default="system", init=False)


@dataclass
class SubscribeParameters:
    """SubscribeParameters."""

    events: list[str] = field(default_factory=list)
    contexts: list[Any] = field(default_factory=list)
    user_contexts: list[Any] = field(default_factory=list)


@dataclass
class UnsubscribeByIDRequest:
    """UnsubscribeByIDRequest."""

    subscriptions: list[Any] = field(default_factory=list)


@dataclass
class UnsubscribeByAttributesRequest:
    """UnsubscribeByAttributesRequest."""

    events: list[str] = field(default_factory=list)


@dataclass
class StatusResult:
    """StatusResult."""

    ready: bool | None = None
    message: str | None = None


@dataclass
class NewParameters:
    """NewParameters."""

    capabilities: Any | None = None


@dataclass
class NewResult:
    """NewResult."""

    session_id: str | None = None
    accept_insecure_certs: bool | None = None
    browser_name: str | None = None
    browser_version: str | None = None
    platform_name: str | None = None
    set_window_rect: bool | None = None
    user_agent: str | None = None
    proxy: Any | None = None
    unhandled_prompt_behavior: Any | None = None
    web_socket_url: str | None = None


@dataclass
class SubscribeResult:
    """SubscribeResult."""

    subscription: Any | None = None


@dataclass
class UserPromptHandler:
    """UserPromptHandler."""

    alert: Any | None = None
    before_unload: Any | None = None
    confirm: Any | None = None
    default: Any | None = None
    file: Any | None = None
    prompt: Any | None = None

    def to_bidi_dict(self) -> dict:
        """Convert to BiDi protocol dict with camelCase keys."""
        result = {}
        if self.alert is not None:
            result["alert"] = self.alert
        if self.before_unload is not None:
            result["beforeUnload"] = self.before_unload
        if self.confirm is not None:
            result["confirm"] = self.confirm
        if self.default is not None:
            result["default"] = self.default
        if self.file is not None:
            result["file"] = self.file
        if self.prompt is not None:
            result["prompt"] = self.prompt
        return result

    def to_dict(self) -> dict:
        """Backward-compatible alias for to_bidi_dict()."""
        return self.to_bidi_dict()


class Session:
    """WebDriver BiDi session module."""

    def __init__(self, conn) -> None:
        self._conn = conn

    def status(self):
        """Execute session.status."""
        params = {}
        params = {k: v for k, v in params.items() if v is not None}
        cmd = command_builder("session.status", params)
        result = self._conn.execute(cmd)
        return result

    def new(self, capabilities: Any | None = None):
        """Execute session.new."""
        if capabilities is None:
            raise TypeError("new() missing required argument: 'capabilities'")

        params = {
            "capabilities": capabilities,
        }
        params = {k: v for k, v in params.items() if v is not None}
        cmd = command_builder("session.new", params)
        result = self._conn.execute(cmd)
        return result

    def end(self):
        """Execute session.end."""
        params = {}
        params = {k: v for k, v in params.items() if v is not None}
        cmd = command_builder("session.end", params)
        result = self._conn.execute(cmd)
        return result

    def subscribe(
        self,
        events: list[Any] | None = None,
        contexts: list[Any] | None = None,
        user_contexts: list[Any] | None = None,
    ):
        """Execute session.subscribe."""
        if events is None:
            raise TypeError("subscribe() missing required argument: 'events'")

        params = {
            "events": events,
            "contexts": contexts,
            "userContexts": user_contexts,
        }
        params = {k: v for k, v in params.items() if v is not None}
        cmd = command_builder("session.subscribe", params)
        result = self._conn.execute(cmd)
        return result

    def unsubscribe(self, events: list[Any] | None = None, subscriptions: list[Any] | None = None):
        """Execute session.unsubscribe."""
        params = {
            "events": events,
            "subscriptions": subscriptions,
        }
        params = {k: v for k, v in params.items() if v is not None}
        cmd = command_builder("session.unsubscribe", params)
        result = self._conn.execute(cmd)
        return result
