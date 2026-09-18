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

"""Unit tests for ``driver.browsing_context.set_viewport``.

``set_viewport`` is the case that most needs the omitted-vs-null distinction: the spec makes
``viewport`` and ``devicePixelRatio`` nullable, so sending ``null`` resets them while omitting
them leaves them alone. The facade expressed that with an ``...`` sentinel of its own; these
pin the behavior across the move onto the layer that models it directly.
"""

import pytest

from selenium.webdriver.common.bidi.browsing_context import BrowsingContext


class FakeConnection:
    def __init__(self):
        self.sent = []

    def send_cmd(self, method, params):
        self.sent.append({"method": method, "params": params})
        return {"result": {}}

    @property
    def only_command(self):
        assert len(self.sent) == 1, f"expected exactly one command, got {self.sent}"
        return self.sent[0]


@pytest.fixture
def connection():
    return FakeConnection()


@pytest.fixture
def browsing_context(connection):
    return BrowsingContext(connection)


def test_a_viewport_dict_is_sent_under_its_spec_keys(browsing_context, connection):
    browsing_context.set_viewport(context="ctx-1", viewport={"width": 251, "height": 301})

    assert connection.only_command["method"] == "browsingContext.setViewport"
    assert connection.only_command["params"] == {"context": "ctx-1", "viewport": {"width": 251, "height": 301}}


def test_an_explicit_null_viewport_is_sent_to_reset_it(browsing_context, connection):
    browsing_context.set_viewport(context="ctx-1", viewport=None, device_pixel_ratio=None)

    assert connection.only_command["params"] == {"context": "ctx-1", "viewport": None, "devicePixelRatio": None}


def test_an_omitted_viewport_is_not_sent_at_all(browsing_context, connection):
    # Omitted and null are different instructions to the browser: leave it alone vs reset it.
    browsing_context.set_viewport(context="ctx-1")

    assert connection.only_command["params"] == {"context": "ctx-1"}


def test_a_device_pixel_ratio_reaches_the_wire_under_its_spec_name(browsing_context, connection):
    browsing_context.set_viewport(context="ctx-1", device_pixel_ratio=2.0)

    assert connection.only_command["params"] == {"context": "ctx-1", "devicePixelRatio": 2.0}


def test_user_contexts_reach_the_wire_under_their_spec_name(browsing_context, connection):
    browsing_context.set_viewport(user_contexts=["uc-1"], viewport={"width": 100, "height": 200})

    assert connection.only_command["params"]["userContexts"] == ["uc-1"]


def test_a_malformed_viewport_is_refused_before_anything_is_sent(browsing_context, connection):
    # width/height are required by the spec, so an incomplete viewport is a local error rather
    # than a round trip that the remote end rejects.
    with pytest.raises(Exception, match=r"(?i)width"):
        browsing_context.set_viewport(context="ctx-1", viewport={"height": 301})

    assert connection.sent == []
