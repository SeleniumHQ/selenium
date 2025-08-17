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

import os
import platform
from unittest.mock import patch

import pytest

from selenium import webdriver


def is_running_wayland():
    return platform.system() == "Linux" and os.getenv("WAYLAND_DISPLAY")


@pytest.mark.skipif(not is_running_wayland(), reason="This test only runs on Linux under Wayland")
def test_firefox_opens_large_when_running_xwayland(firefox_options):
    # setting environment variable `MOZ_ENABLE_WAYLAND=0` forces Firefox
    # to run under XWayland on Wayland based systems
    with patch.dict("os.environ", {"MOZ_ENABLE_WAYLAND": "0"}):
        with webdriver.Firefox(options=firefox_options) as driver:
            size = driver.get_window_size()
            assert size["height"] > 500
            assert size["width"] > 500


@pytest.mark.skipif(not is_running_wayland(), reason="This test only runs on Linux under Wayland")
@pytest.mark.xfail(reason="https://bugzilla.mozilla.org/show_bug.cgi?id=1959040")
def test_firefox_opens_large_when_running_wayland(firefox_options):
    with webdriver.Firefox(options=firefox_options) as driver:
        size = driver.get_window_size()
        assert size["height"] > 500
        assert size["width"] > 500
