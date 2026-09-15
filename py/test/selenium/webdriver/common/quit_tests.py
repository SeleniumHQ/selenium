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
from urllib3.exceptions import MaxRetryError

from selenium.common.exceptions import InvalidSessionIdException


@pytest.mark.no_driver_after_test
def test_quit(driver, pages):
    driver.quit()
    # Which error surfaces depends on what is left listening: against a local
    # driver the process is gone, so urllib3 fails to connect; against a Grid the
    # server is still up but the session has been removed.
    with pytest.raises((InvalidSessionIdException, MaxRetryError)):
        pages.load("simpleTest.html")
