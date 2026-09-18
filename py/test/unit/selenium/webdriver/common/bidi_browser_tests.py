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

"""Unit tests for ``driver.browser.set_download_behavior``.

``downloadBehavior`` is required-but-nullable: sending ``null`` resets the browser default,
and omitting it is not the same thing. The facade previously had to opt this one field out
of its generic "drop the Nones" filter by hand; these pin the behavior either way.
"""

import pathlib

import pytest

from selenium.webdriver.common.bidi.browser import Browser


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
def browser(connection):
    return Browser(connection)


def test_allowing_downloads_sends_the_destination_folder(browser, connection):
    browser.set_download_behavior(allowed=True, destination_folder="/tmp/downloads")

    assert connection.only_command["method"] == "browser.setDownloadBehavior"
    assert connection.only_command["params"] == {
        "downloadBehavior": {"destinationFolder": "/tmp/downloads", "type": "allowed"}
    }


def test_a_path_like_destination_is_coerced_to_a_string(browser, connection):
    browser.set_download_behavior(allowed=True, destination_folder=pathlib.Path("/tmp/downloads"))

    folder = connection.only_command["params"]["downloadBehavior"]["destinationFolder"]
    assert folder == "/tmp/downloads"
    assert type(folder) is str


def test_denying_downloads_sends_the_denied_variant(browser, connection):
    browser.set_download_behavior(allowed=False)

    assert connection.only_command["params"] == {"downloadBehavior": {"type": "denied"}}


def test_resetting_sends_an_explicit_null_rather_than_omitting_the_field(browser, connection):
    # Required-but-nullable: null resets to the browser default, and dropping the key
    # would be a different (invalid) message.
    browser.set_download_behavior(allowed=None)

    assert connection.only_command["params"] == {"downloadBehavior": None}


def test_user_contexts_reach_the_wire_under_their_spec_name(browser, connection):
    browser.set_download_behavior(allowed=False, user_contexts=["uc-1", "uc-2"])

    assert connection.only_command["params"]["userContexts"] == ["uc-1", "uc-2"]


def test_allowing_without_a_destination_raises_before_anything_is_sent(browser, connection):
    with pytest.raises(ValueError):
        browser.set_download_behavior(allowed=True)

    assert connection.sent == []


def test_denying_with_a_destination_raises_before_anything_is_sent(browser, connection):
    with pytest.raises(ValueError):
        browser.set_download_behavior(allowed=False, destination_folder="/tmp/downloads")

    assert connection.sent == []
