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

"""Unit tests for the supported ``driver.webextension`` API.

The public surface — argument rules, the result shape, the guidance raised when extension
support is switched off — is unchanged by the move onto the internal `_bidi` layer. What
the move settles is that the ``extensionData`` variant is chosen by the schema's union
rather than by a hand-written dict.
"""

import pytest

from selenium.webdriver.common.bidi.webextension import WebExtension


class FakeConnection:
    def __init__(self, reply=None, error=None):
        self.sent = []
        self.reply = reply if reply is not None else {"extension": "ext-1"}
        self.error = error

    def send_cmd(self, method, params):
        self.sent.append({"method": method, "params": params})
        if self.error is not None:
            raise self.error
        return {"result": self.reply}

    @property
    def only_command(self):
        assert len(self.sent) == 1, f"expected exactly one command, got {self.sent}"
        return self.sent[0]


@pytest.fixture
def connection():
    return FakeConnection()


@pytest.fixture
def webextension(connection):
    return WebExtension(connection)


def test_installing_an_unpacked_path_picks_the_path_variant(webextension, connection):
    webextension.install(path="/tmp/unpacked")

    assert connection.only_command["method"] == "webExtension.install"
    assert connection.only_command["params"] == {"extensionData": {"path": "/tmp/unpacked", "type": "path"}}


def test_installing_an_archive_picks_the_archive_path_variant(webextension, connection):
    webextension.install(archive_path="/tmp/ext.xpi")

    assert connection.only_command["params"] == {"extensionData": {"path": "/tmp/ext.xpi", "type": "archivePath"}}


def test_installing_base64_picks_the_base64_variant(webextension, connection):
    webextension.install(base64_value="UEsDBAo=")

    assert connection.only_command["params"] == {"extensionData": {"value": "UEsDBAo=", "type": "base64"}}


def test_install_returns_the_result_dict(webextension):
    # The documented return is the raw result dict, so the typed result is unwrapped again.
    assert webextension.install(path="/tmp/unpacked") == {"extension": "ext-1"}


@pytest.mark.parametrize(
    "kwargs",
    [{}, {"path": "/a", "base64_value": "b"}, {"path": "/a", "archive_path": "/b", "base64_value": "c"}],
    ids=["none", "two", "three"],
)
def test_install_requires_exactly_one_source(webextension, connection, kwargs):
    with pytest.raises(ValueError, match=r"Exactly one of path, archive_path, or base64_value"):
        webextension.install(**kwargs)

    assert connection.sent == []


def test_install_explains_a_disabled_extension_support_failure(connection):
    connection.error = RuntimeError("Method not available")

    with pytest.raises(RuntimeError, match=r"Enable unsafe extension debugging"):
        WebExtension(connection).install(path="/tmp/unpacked")


def test_uninstall_accepts_an_extension_id(webextension, connection):
    webextension.uninstall("ext-1")

    assert connection.only_command["method"] == "webExtension.uninstall"
    assert connection.only_command["params"] == {"extension": "ext-1"}


def test_uninstall_accepts_the_install_result_dict(webextension, connection):
    webextension.uninstall({"extension": "ext-1"})

    assert connection.only_command["params"] == {"extension": "ext-1"}


def test_uninstall_requires_an_extension(webextension, connection):
    with pytest.raises(ValueError, match=r"extension parameter is required"):
        webextension.uninstall(None)

    assert connection.sent == []
