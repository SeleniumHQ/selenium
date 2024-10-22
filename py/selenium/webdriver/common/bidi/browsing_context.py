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
from dataclasses import dataclass
from dataclasses import fields
from dataclasses import is_dataclass

from selenium.webdriver.common.bidi.cdp import import_devtools

devtools = import_devtools("")
event_class = devtools.util.event_class


@dataclass
class NavigateParameters:
    context: str
    url: str
    wait: str = "complete"

    def to_json(self):
        json = {}
        for field in fields(self):
            key = field.name
            value = getattr(self, key)
            if not value:
                continue
            if is_dataclass(value):
                value = value.to_json()
            json[re.sub(r"^_", "", key)] = value
        return json

    @classmethod
    def from_json(cls, json):
        return cls(**json)


@dataclass
class Navigate:
    params: NavigateParameters
    method: typing.Literal["browsingContext.navigate"] = "browsingContext.navigate"

    def to_json(self):
        json = {}
        for field in fields(self):
            key = field.name
            value = getattr(self, key)
            if not value:
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
