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

from selenium.webdriver.remote.client_config import ClientConfig


@pytest.mark.no_driver_after_test
def test_client_config_is_applied_to_local_driver(clean_driver, clean_options, clean_service):
    client_config = ClientConfig(remote_server_addr="http://unused:1", timeout=90)
    driver = clean_driver(options=clean_options, service=clean_service, client_config=client_config)
    try:
        executor = driver.command_executor
        assert executor.client_config is client_config
        assert client_config.remote_server_addr == clean_service.service_url
        assert executor._conn.connection_pool_kw["timeout"] == 90
    finally:
        driver.quit()


@pytest.mark.no_driver_after_test
def test_keep_alive_warns_and_is_applied(clean_driver, clean_options, clean_service):
    with pytest.warns(DeprecationWarning, match="keep_alive") as record:
        driver = clean_driver(options=clean_options, service=clean_service, keep_alive=False)
    try:
        assert record[0].filename == __file__
        assert driver.command_executor.client_config.keep_alive is False
    finally:
        driver.quit()
