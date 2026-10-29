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

from selenium.webdriver.common.window import WindowTypes


@pytest.mark.xfail_safari
def test_session_status(driver):
    result = driver._session.status()
    assert result is not None
    assert "ready" in result
    assert "message" in result
    assert isinstance(result["ready"], bool)
    assert isinstance(result["message"], str)


@pytest.mark.xfail_safari
def test_session_status_not_closed_with_one_window(driver):
    # initial session status
    initial_status = driver._session.status()
    assert initial_status is not None

    # Open new window and tab
    driver.switch_to.new_window(WindowTypes.WINDOW)
    driver.switch_to.new_window(WindowTypes.TAB)

    # Close one window
    driver.close()

    # Session should still be active
    status_after_closing = driver._session.status()
    assert status_after_closing is not None
    assert "ready" in status_after_closing
    assert "message" in status_after_closing
