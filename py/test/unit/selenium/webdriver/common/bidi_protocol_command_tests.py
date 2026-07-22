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

"""Unit tests for the generated BiDi command surface.

Drives the actual generated domain classes through a stand-in transport — no
browser — to prove the schema-derived methods build and serialize their params,
validate enum/discriminator arguments before any wire call, dispatch to the
right command, and parse the reply into the generated result type. The runtime
itself is covered by bidi_serialization_tests; here the subject is the generated
code that sits on top of it.
"""

import pytest

from selenium.common.exceptions import WebDriverException
from selenium.webdriver.common._bidi.browsing_context import (
    BrowsingContext,
    CreateResult,
    CreateType,
    GetTreeResult,
    Info,
)
from selenium.webdriver.common._bidi.network import Cookie, InterceptPhase, Network
from selenium.webdriver.common._bidi.serialization import BiDiSerializationError
from selenium.webdriver.common._bidi.storage import PartialCookie
from selenium.webdriver.common._bidi.transport import Transport


class DrivingConnection:
    """Stands in for WebSocketConnection's ``send_cmd``, minus the socket.

    Records the outbound frame (or leaves it None if no command was ever sent)
    and returns a canned reply envelope.
    """

    def __init__(self, reply=None):
        self.reply = reply
        self.sent = None

    def send_cmd(self, method, params):
        self.sent = {"method": method, "params": params}
        return {"result": self.reply}


def _domain(cls, reply=None):
    connection = DrivingConnection(reply=reply)
    return cls(Transport(connection)), connection


# --- dispatch + result parsing ---


def test_a_generated_command_sends_its_frame_and_parses_its_result():
    context, connection = _domain(BrowsingContext, reply={"context": "ctx-1"})

    result = context.create(type=CreateType.TAB)

    assert connection.sent == {"method": "browsingContext.create", "params": {"type": "tab"}}
    assert result == CreateResult(context="ctx-1")


def test_a_nested_union_result_is_deserialized_into_generated_types():
    reply = {
        "contexts": [
            {
                "children": None,
                "clientWindow": "w1",
                "context": "c1",
                "originalOpener": None,
                "url": "about:blank",
                "userContext": "default",
            }
        ]
    }
    context, _ = _domain(BrowsingContext, reply=reply)

    tree = context.get_tree()

    assert isinstance(tree, GetTreeResult)
    assert isinstance(tree.contexts[0], Info)
    assert tree.contexts[0].context == "c1"


# --- argument validation happens before any wire call ---


def test_a_scalar_enum_argument_outside_the_set_raises_before_any_wire_call():
    context, connection = _domain(BrowsingContext)

    with pytest.raises(BiDiSerializationError, match=r"not a valid CreateType"):
        context.create(type="sideways")

    assert connection.sent is None


def test_each_element_of_a_list_enum_argument_is_validated():
    network, connection = _domain(Network)

    with pytest.raises(BiDiSerializationError, match=r"not a valid InterceptPhase"):
        network.add_intercept(phases=[InterceptPhase.AUTH_REQUIRED, "nope"])

    assert connection.sent is None


def test_a_union_discriminator_outside_the_set_raises_before_any_wire_call():
    network, connection = _domain(Network)

    with pytest.raises(BiDiSerializationError, match=r"not a valid discriminator"):
        network.continue_with_auth(request="r", action="bogus")

    assert connection.sent is None


# --- valid arguments serialize and dispatch ---


def test_a_valid_list_enum_argument_is_serialized_to_wire_tokens():
    network, connection = _domain(Network, reply={"intercept": "i-1"})

    network.add_intercept(phases=[InterceptPhase.AUTH_REQUIRED])

    assert connection.sent["method"] == "network.addIntercept"
    assert connection.sent["params"]["phases"] == ["authRequired"]


def test_a_union_discriminator_selects_and_sends_its_variant():
    network, connection = _domain(Network, reply={})

    network.continue_with_auth(request="r", action="cancel")

    assert connection.sent == {"method": "network.continueWithAuth", "params": {"request": "r", "action": "cancel"}}


# --- extras preserved only for a re-sendable extensible type (ADR item 8) ---

_STRING_VALUE = {"type": "string", "value": "v"}


def test_a_re_sendable_extensible_type_round_trips_unknown_wire_keys():
    # storage.PartialCookie is reachable from a command's params, so it keeps and echoes extras.
    cookie = PartialCookie.from_json({"name": "n", "value": _STRING_VALUE, "domain": "d", "vendorSpecific": "x"})
    assert cookie.extensions == {"vendorSpecific": "x"}
    assert cookie.as_json()["vendorSpecific"] == "x"


def test_a_received_only_extensible_type_drops_unknown_wire_keys():
    # network.Cookie is only ever received, never sent back, so unknown keys are ignored, not stored.
    cookie = Cookie.from_json(
        {
            "name": "n",
            "value": _STRING_VALUE,
            "domain": "d",
            "path": "/",
            "size": 1,
            "httpOnly": False,
            "secure": True,
            "sameSite": "lax",
            "vendorSpecific": "x",
        }
    )
    assert not hasattr(cookie, "extensions")
    assert "vendorSpecific" not in cookie.as_json()


# --- construction ---


def test_a_generated_domain_requires_a_driver_or_transport():
    with pytest.raises(WebDriverException, match=r"a WebDriver or Transport is required"):
        BrowsingContext(object())
