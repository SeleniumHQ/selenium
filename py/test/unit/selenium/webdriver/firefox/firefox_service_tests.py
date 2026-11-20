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

import subprocess
import sys

import pytest

from selenium.webdriver.common import service as common_service
from selenium.webdriver.common import utils
from selenium.webdriver.firefox.service import Service


def test_command_line_args():
    service = Service(service_args=["--log", "trace"])
    found = False

    args = service.command_line_args()

    for idx in range(len(args) - 1):
        if args[idx] == "--log" and args[idx + 1] == "trace":
            found = True
            break

    assert found, "Provided arguments do not exist in array"


def test_stop_does_not_send_shutdown_request(monkeypatch):
    requested = []
    monkeypatch.setattr(common_service.request, "urlopen", lambda url, timeout=None: requested.append(url))

    service = Service(executable_path=sys.executable)
    service.process = subprocess.Popen([sys.executable, "-c", "import time; time.sleep(30)"])
    service.stop()

    assert requested == []
    assert service.process.poll() is not None


def _checked_hosts(monkeypatch, service):
    checked = []
    monkeypatch.setattr(utils, "is_url_connectable", lambda port, host="localhost": checked.append((host, port)))
    service.is_connectable()
    return checked


def test_is_connectable_checks_ipv4_loopback(monkeypatch):
    service = Service(executable_path=sys.executable, port=4444)

    assert _checked_hosts(monkeypatch, service) == [("127.0.0.1", 4444)]


@pytest.mark.parametrize("host_args", [["--host", "::1"], ["--host=::1"]])
def test_is_connectable_keeps_localhost_when_host_is_set(monkeypatch, host_args):
    service = Service(executable_path=sys.executable, port=4444, service_args=host_args)

    assert _checked_hosts(monkeypatch, service) == [("localhost", 4444)]
