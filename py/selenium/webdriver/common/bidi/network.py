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

import re
import typing
from dataclasses import dataclass, fields, is_dataclass

from selenium.webdriver.common.bidi.cdp import import_devtools
from selenium.webdriver.common.bidi.session import session_subscribe, session_unsubscribe

from . import script

devtools = import_devtools("")
event_class = devtools.util.event_class


@dataclass
class StringValue:
    value: str
    _type: typing.Literal["string"] = "string"

    def to_json(self):
        json = {}
        for field in fields(self):
            key = field.name
            value = getattr(self, key)
            if value is None:
                continue
            if is_dataclass(value):
                value = value.to_json()
            json[re.sub(r"^_", "", key)] = value
        return json

    @classmethod
    def from_json(cls, json):
        return cls(**json)


@dataclass
class Base64Value:
    value: str
    _type: typing.Literal["base64"] = "base64"

    def to_json(self):
        json = {}
        for field in fields(self):
            key = field.name
            value = getattr(self, key)
            if value is None:
                continue
            if is_dataclass(value):
                value = value.to_json()
            json[re.sub(r"^_", "", key)] = value
        return json

    @classmethod
    def from_json(cls, json):
        return cls(**json)


@dataclass
class UrlPatternPattern:
    protocol: typing.Optional[str]
    hostname: typing.Optional[str]
    port: typing.Optional[str]
    pathname: typing.Optional[str]
    search: typing.Optional[str]
    _type: typing.Literal["pattern"] = "pattern"

    def to_json(self):
        json = {}
        for field in fields(self):
            key = field.name
            value = getattr(self, key)
            if value is None:
                continue
            if is_dataclass(value):
                value = value.to_json()
            json[re.sub(r"^_", "", key)] = value
        return json

    @classmethod
    def from_json(cls, json):
        return cls(**json)


@dataclass
class UrlPatternString:
    pattern: str
    _type: typing.Literal["string"] = "string"

    def to_json(self):
        json = {}
        for field in fields(self):
            key = field.name
            value = getattr(self, key)
            if value is None:
                continue
            if is_dataclass(value):
                value = value.to_json()
            json[re.sub(r"^_", "", key)] = value
        return json

    @classmethod
    def from_json(cls, json):
        return cls(**json)


@dataclass
class CookieHeader:
    name: str
    value: typing.Union[StringValue, Base64Value]

    def to_json(self):
        json = {}
        for field in fields(self):
            key = field.name
            value = getattr(self, key)
            if value is None:
                continue
            if is_dataclass(value):
                value = value.to_json()
            json[re.sub(r"^_", "", key)] = value
        return json

    @classmethod
    def from_json(cls, json):
        return cls(**json)


@dataclass
class Header:
    name: str
    value: typing.Union[StringValue, Base64Value]

    def to_json(self):
        json = {}
        for field in fields(self):
            key = field.name
            value = getattr(self, key)
            if value is None:
                continue
            if is_dataclass(value):
                value = value.to_json()
            json[re.sub(r"^_", "", key)] = value
        return json

    @classmethod
    def from_json(cls, json):
        return cls(**json)


@dataclass
class ContinueRequestParameters:
    request: str
    body: typing.Optional[typing.Union[StringValue, Base64Value]] = None
    cookies: typing.Optional[typing.List[CookieHeader]] = None
    headers: typing.Optional[typing.List[Header]] = None
    method: typing.Optional[str] = None
    url: typing.Optional[str] = None

    def to_json(self):
        json = {}
        for field in fields(self):
            key = field.name
            value = getattr(self, key)
            if value is None:
                continue
            if is_dataclass(value):
                value = value.to_json()
            json[re.sub(r"^_", "", key)] = value
        return json

    @classmethod
    def from_json(cls, json):
        return cls(**json)


@dataclass
class ContinueRequest:
    params: ContinueRequestParameters
    method: typing.Literal["network.continueRequest"] = "network.continueRequest"

    def to_json(self):
        json = {}
        for field in fields(self):
            key = field.name
            value = getattr(self, key)
            if value is None:
                continue
            if is_dataclass(value):
                value = value.to_json()
            json[re.sub(r"^_", "", key)] = value
        return json

    @classmethod
    def from_json(cls, json):
        return cls(**json)

    def cmd(self):
        result = yield self.to_json()
        return result


@dataclass
class Cookie:
    name: str
    value: typing.Union[StringValue, Base64Value]
    domain: str
    path: str
    size: int
    httpOnly: bool
    secure: bool
    sameSite: typing.Literal["strict", "lax", "none"]
    expiry: typing.Optional[int]

    def to_json(self):
        json = {}
        for field in fields(self):
            key = field.name
            value = getattr(self, key)
            if value is None:
                continue
            if is_dataclass(value):
                value = value.to_json()
            json[re.sub(r"^_", "", key)] = value
        return json

    @classmethod
    def from_json(cls, json):
        return cls(**json)


@dataclass
class FetchTimingInfo:
    timeOrigin: float
    requestTime: float
    redirectStart: float
    redirectEnd: float
    fetchStart: float
    dnsStart: float
    dnsEnd: float
    connectStart: float
    connectEnd: float
    tlsStart: float
    requestStart: float
    responseStart: float
    responseEnd: float

    def to_json(self):
        json = {}
        for field in fields(self):
            key = field.name
            value = getattr(self, key)
            if value is None:
                continue
            if is_dataclass(value):
                value = value.to_json()
            json[re.sub(r"^_", "", key)] = value
        return json

    @classmethod
    def from_json(cls, json):
        return cls(**json)


@dataclass
class RequestData:
    request: str
    url: str
    method: str
    headers: typing.Optional[typing.List[Header]]
    cookies: typing.Optional[typing.List[Cookie]]
    headersSize: int
    bodySize: typing.Optional[int]
    timings: FetchTimingInfo

    def to_json(self):
        json = {}
        for field in fields(self):
            key = field.name
            value = getattr(self, key)
            if value is None:
                continue
            if is_dataclass(value):
                value = value.to_json()
            json[re.sub(r"^_", "", key)] = value
        return json

    @classmethod
    def from_json(cls, json):
        return cls(**json)


@dataclass
class BaseParameters:
    isBlocked: bool
    redirectCount: int
    request: RequestData
    timestamp: int
    intercepts: typing.Optional[typing.List[str]] = None
    navigation: typing.Optional[str] = None
    context: typing.Optional[str] = None

    def to_json(self):
        json = {}
        for field in fields(self):
            key = field.name
            value = getattr(self, key)
            if value is None:
                continue
            if is_dataclass(value):
                value = value.to_json()
            json[re.sub(r"^_", "", key)] = value
        return json

    @classmethod
    def from_json(cls, json):
        return cls(**json)


@dataclass
class Initiator:
    _type: typing.Literal["parser", "script", "preflight", "other"]
    columnNumber: typing.Optional[int] = None
    lineNumber: typing.Optional[int] = None
    stackTrace: typing.Optional[script.StackTrace] = None
    request: typing.Optional[str] = None

    def to_json(self):
        json = {}
        for field in fields(self):
            key = field.name
            value = getattr(self, key)
            if value is None:
                continue
            if is_dataclass(value):
                value = value.to_json()
            json[re.sub(r"^_", "", key)] = value
        return json

    @classmethod
    def from_json(cls, json):
        return cls(**json)


@dataclass
class BeforeRequestSentParameters:
    isBlocked: bool
    redirectCount: int
    request: RequestData
    timestamp: int
    initiator: Initiator
    intercepts: typing.Optional[typing.List[str]] = None
    navigation: typing.Optional[str] = None
    context: typing.Optional[str] = None

    def to_json(self):
        json = {}
        for field in fields(self):
            key = field.name
            value = getattr(self, key)
            if value is None:
                continue
            if is_dataclass(value):
                value = value.to_json()
            json[re.sub(r"^_", "", key)] = value
        return json

    @classmethod
    def from_json(cls, json):
        return cls(**json)


@event_class("network.beforeRequestSent")
@dataclass
class BeforeRequestSent:
    params: BeforeRequestSentParameters
    method: typing.Literal["network.beforeRequestSent"] = "network.beforeRequestSent"

    def to_json(self):
        json = {}
        for field in fields(self):
            key = field.name
            value = getattr(self, key)
            if value is None:
                continue
            if is_dataclass(value):
                value = value.to_json()
            json[re.sub(r"^_", "", key)] = value
        return json

    @classmethod
    def from_json(cls, json):
        params = BeforeRequestSentParameters.from_json(json)
        return cls(params)


@dataclass
class AddInterceptParameters:
    phases: typing.List[typing.Literal["beforeRequestSent", "responseStarted", "authRequired"]]
    contexts: typing.Optional[typing.List[str]] = None
    urlPatterns: typing.Optional[
        typing.List[typing.Union[UrlPatternPattern, UrlPatternString]]
    ] = None

    def to_json(self):
        json = {}
        for field in fields(self):
            key = field.name
            value = getattr(self, key)
            if value is None:
                continue
            if is_dataclass(value):
                value = value.to_json()
            json[re.sub(r"^_", "", key)] = value
        return json

    @classmethod
    def from_json(cls, json):
        return cls(**json)


@dataclass
class AddIntercept:
    params: AddInterceptParameters
    method: typing.Literal["network.addIntercept"] = "network.addIntercept"

    def to_json(self):
        json = {}
        for field in fields(self):
            key = field.name
            value = getattr(self, key)
            if value is None:
                continue
            if is_dataclass(value):
                value = value.to_json()
            json[re.sub(r"^_", "", key)] = value
        return json

    @classmethod
    def from_json(cls, json):
        return cls(**json)

    def cmd(self):
        result = yield self.to_json()
        return result


@dataclass
class RemoveInterceptParameters:
    intercept: str

    def to_json(self):
        json = {}
        for field in fields(self):
            key = field.name
            value = getattr(self, key)
            if value is None:
                continue
            if is_dataclass(value):
                value = value.to_json()
            json[re.sub(r"^_", "", key)] = value
        return json

    @classmethod
    def from_json(cls, json):
        return cls(**json)


@dataclass
class RemoveIntercept:
    params: RemoveInterceptParameters
    method: typing.Literal["network.removeIntercept"] = "network.removeIntercept"

    def to_json(self):
        json = {}
        for field in fields(self):
            key = field.name
            value = getattr(self, key)
            if value is None:
                continue
            if is_dataclass(value):
                value = value.to_json()
            json[re.sub(r"^_", "", key)] = value
        return json

    @classmethod
    def from_json(cls, json):
        return cls(**json)

    def cmd(self):
        result = yield self.to_json()
        return result


class Network:
    def __init__(self, conn):

        self.conn = conn
        self.callbacks = {}

    async def add_intercept(self, event, params: AddInterceptParameters):
        await self.conn.execute(session_subscribe(event.event_class))
        result = await self.conn.execute(AddIntercept(params).cmd())
        return result

    async def add_listener(self, event, callback):
        listener = self.conn.listen(event)

        async for event in listener:
            request_data = BeforeRequestSentParameters.from_json(
                event.to_json()["params"]
            )
            await callback(request_data)

    async def continue_request(self, params: ContinueRequestParameters):
        result = await self.conn.execute(ContinueRequest(params).cmd())
        return result

    async def remove_intercept(self, event, params: RemoveInterceptParameters):
        await self.conn.execute(session_unsubscribe(event.event_class))
        await self.conn.execute(RemoveIntercept(params).cmd())