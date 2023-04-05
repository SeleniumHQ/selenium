#  Licensed to the Software Freedom Conservancy (SFC) under one
#  or more contributor license agreements.  See the NOTICE file
#  distributed with this work for additional information
#  regarding copyright ownership.  The SFC licenses this file
#  to you under the Apache License, Version 2.0 (the
#  "License"); you may not use this file except in compliance
#  with the License.  You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
#  Unless required by applicable law or agreed to in writing,
#  software distributed under the License is distributed on an
#  "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
#  KIND, either express or implied.  See the License for the
#  specific language governing permissions and limitations
#  under the License.

import pytest

from selenium.common.exceptions import SeleniumManagerException
from selenium.webdriver.common.selenium_manager import SeleniumManager


def test_non_supported_browser_raises_sme():
    msg = r"foo is not a valid browser.  Choose one of: \['chrome', 'firefox', 'edge', 'ie'\]"
    with pytest.raises(SeleniumManagerException, match=msg):
        _ = SeleniumManager().driver_location("foo")


def test_stderr_is_propagated_to_exception_messages():
    msg = r"Selenium manager failed for:.* --browser foo --output json\.\nInvalid browser name: foo\n"
    with pytest.raises(SeleniumManagerException, match=msg):
        manager = SeleniumManager()
        binary = manager.get_binary()
        _ = manager.run((str(binary), "--browser", "foo", "--output", "json"))
