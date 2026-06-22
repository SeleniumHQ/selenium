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

import sys

import pytest

from selenium.common.exceptions import WebDriverException
from selenium.webdriver.common import utils
from selenium.webdriver.common.service import Service


class _UnreachableService(Service):
    """A driver process that launches successfully but never serves /status."""

    def command_line_args(self):
        return ["-c", "import time; time.sleep(30)"]


def test_start_terminates_process_when_never_connectable(monkeypatch):
    monkeypatch.setattr("selenium.webdriver.common.service.sleep", lambda _: None)

    service = _UnreachableService(executable_path=sys.executable, port=utils.free_port())

    try:
        with pytest.raises(WebDriverException):
            service.start()

        assert service.process.poll() is not None
    finally:
        service.stop()
