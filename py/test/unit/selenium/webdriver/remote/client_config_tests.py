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

import pytest

from selenium.webdriver.remote.client_config import ClientConfig


@pytest.fixture
def config():
    return ClientConfig(remote_server_addr="http://localhost:4444")


def test_websocket_max_message_size_defaults_to_none(config):
    assert config.websocket_max_message_size is None


def test_websocket_max_message_size_can_be_set(config):
    config.websocket_max_message_size = 2**26
    assert config.websocket_max_message_size == 2**26


def test_websocket_max_message_size_via_constructor():
    cfg = ClientConfig(remote_server_addr="http://localhost:4444", websocket_max_message_size=2**26)
    assert cfg.websocket_max_message_size == 2**26
