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

from selenium.common.exceptions import WebDriverException
from selenium.webdriver.firefox.firefox_binary import FirefoxBinary


@pytest.fixture(params=['foo', FirefoxBinary(firefox_path='foo')],
                ids=['string', 'binary'])
def driver_kwargs(request, driver_kwargs):
    driver_kwargs['firefox_binary'] = request.param
    return driver_kwargs


@pytest.mark.xfail(reason='https://github.com/mozilla/geckodriver/issues/832')
def test_invalid_binary(driver_class, driver_kwargs):
    with pytest.raises(WebDriverException) as excinfo:
        driver_class(**driver_kwargs)
    assert 'no such file or directory' in str(excinfo.value)
