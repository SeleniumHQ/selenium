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


@pytest.mark.no_driver_after_test
def test_launch_and_close_browser(clean_driver, clean_service):
    driver = clean_driver(service=clean_service)
    driver.quit()


@pytest.mark.no_driver_after_test
def test_we_can_launch_multiple_chrome_instances(clean_driver, clean_service):
    driver1 = clean_driver(service=clean_service)
    driver2 = clean_driver(service=clean_service)
    driver3 = clean_driver(service=clean_service)
    driver1.quit()
    driver2.quit()
    driver3.quit()
