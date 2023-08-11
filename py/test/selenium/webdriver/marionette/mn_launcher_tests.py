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

from selenium.webdriver import Firefox


def test_launch_and_close_browser(driver):
    assert "browserName" in driver.capabilities


def test_we_can_launch_multiple_firefox_instances(options):
    driver1 = Firefox(options=options)
    driver2 = Firefox(options=options)
    driver3 = Firefox(options=options)
    driver1.quit()
    driver2.quit()
    driver3.quit()
