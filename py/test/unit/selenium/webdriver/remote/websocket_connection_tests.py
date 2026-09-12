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

from selenium.common import WebDriverException
from selenium.webdriver.remote.websocket_connection import WebSocketConnection


@pytest.mark.parametrize("interval", [-0.1, 0])
def test_rejects_non_positive_response_wait_interval(interval):
    with pytest.raises(WebDriverException, match="interval must be a positive number"):
        WebSocketConnection("ws://localhost", timeout=1, interval=interval)


def test_accepts_positive_response_wait_interval(monkeypatch):
    monkeypatch.setattr(WebSocketConnection, "_start_ws", lambda self: None)
    monkeypatch.setattr(WebSocketConnection, "_wait_until", lambda self, condition: None)

    connection = WebSocketConnection("ws://localhost", timeout=1, interval=0.1)

    assert connection.response_wait_timeout == 1
    assert connection.response_wait_interval == 0.1
