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

"""Unit tests for the supported ``driver.permissions`` API.

The public surface is unchanged by the move onto the internal `_bidi` layer, so most of
these pin behavior that predates it. What the move adds is where the wire frame comes
from: the params are built by the generated protocol types rather than assembled by hand,
so the wire keys and the required-field rule come from the schema.
"""

import pytest

from selenium.webdriver.common.bidi.permissions import PermissionDescriptor, Permissions, PermissionState


class FakeConnection:
    """Records what reached the wire. Supports both command paths the modules use."""

    def __init__(self):
        self.sent = []

    def send_cmd(self, method, params):
        self.sent.append({"method": method, "params": params})
        return {"result": {}}

    def execute(self, cmd):
        payload = next(cmd)
        self.sent.append(payload)
        try:
            cmd.send({})
        except StopIteration as exc:
            return exc.value
        raise AssertionError("BiDi command generator did not finish")

    @property
    def only_command(self):
        assert len(self.sent) == 1, f"expected exactly one command, got {self.sent}"
        return self.sent[0]


@pytest.fixture
def connection():
    return FakeConnection()


@pytest.fixture
def permissions(connection):
    return Permissions(connection)


def test_set_permission_sends_the_spec_command(permissions, connection):
    permissions.set_permission("geolocation", PermissionState.GRANTED, "https://example.com")

    assert connection.only_command["method"] == "permissions.setPermission"
    assert connection.only_command["params"] == {
        "descriptor": {"name": "geolocation"},
        "state": "granted",
        "origin": "https://example.com",
    }


def test_a_descriptor_object_is_accepted_as_well_as_a_name(permissions, connection):
    permissions.set_permission(PermissionDescriptor("camera"), PermissionState.DENIED, "https://example.com")

    assert connection.only_command["params"]["descriptor"] == {"name": "camera"}


def test_optional_arguments_reach_the_wire_under_their_spec_names(permissions, connection):
    permissions.set_permission(
        "microphone",
        PermissionState.PROMPT,
        "https://example.com",
        "user-context-1",
        embedded_origin="https://embedded.example.com",
    )

    assert connection.only_command["params"] == {
        "descriptor": {"name": "microphone"},
        "state": "prompt",
        "origin": "https://example.com",
        "userContext": "user-context-1",
        "embeddedOrigin": "https://embedded.example.com",
    }


def test_an_omitted_optional_argument_is_not_sent(permissions, connection):
    permissions.set_permission("geolocation", PermissionState.GRANTED, "https://example.com")

    assert "userContext" not in connection.only_command["params"]
    assert "embeddedOrigin" not in connection.only_command["params"]


def test_an_invalid_state_raises_before_anything_is_sent(permissions, connection):
    with pytest.raises(ValueError, match=r"Invalid permission state"):
        permissions.set_permission("geolocation", "sometimes", "https://example.com")

    assert connection.sent == []


def test_a_missing_origin_raises_before_anything_is_sent(permissions, connection):
    # origin is required by the spec. It was optional in this signature and the omission went
    # to the remote end to reject; it is refused here instead, which is the same outcome
    # without the round trip.
    with pytest.raises(ValueError, match=r"origin is required"):
        permissions.set_permission("geolocation", PermissionState.GRANTED)

    assert connection.sent == []
