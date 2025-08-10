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

from selenium.webdriver.support.ui import WebDriverWait


@pytest.mark.xfail_safari
@pytest.mark.xfail_firefox
@pytest.mark.xfail_remote
def test_check_console_messages(driver, pages, recwarn):
    devtools, connection = driver.start_devtools()
    console_api_calls = []

    assert len(recwarn) == 0

    connection.execute(devtools.runtime.enable())
    connection.on(devtools.runtime.ConsoleAPICalled, console_api_calls.append)
    driver.execute_script("console.log('I love cheese')")
    driver.execute_script("console.error('I love bread')")
    WebDriverWait(driver, 10).until(lambda _: len(console_api_calls) == 2)

    assert console_api_calls[0].type_ == "log"
    assert console_api_calls[0].args[0].value == "I love cheese"
    assert console_api_calls[1].type_ == "error"
    assert console_api_calls[1].args[0].value == "I love bread"


@pytest.mark.xfail_safari
@pytest.mark.xfail_firefox
@pytest.mark.xfail_remote
def test_check_start_twice(clean_driver, clean_options):
    driver1 = clean_driver(options=clean_options)
    devtools1, connection1 = driver1.start_devtools()
    driver1.quit()

    driver2 = clean_driver(options=clean_options)
    devtools2, connection2 = driver2.start_devtools()
    driver2.quit()
