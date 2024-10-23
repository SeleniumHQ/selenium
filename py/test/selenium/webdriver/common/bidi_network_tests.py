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
import trio

from selenium.webdriver.common.bidi.cdp import open_cdp
from selenium.webdriver.common.bidi.network import BeforeRequestSentParameters
from selenium.webdriver.common.bidi.network import ContinueRequestParameters


@pytest.mark.xfail_firefox
@pytest.mark.xfail_safari
@pytest.mark.xfail_edge
async def test_add_request_handler(driver, pages):

    target = pages.url("simpleTest.html")

    def request_filter(params: BeforeRequestSentParameters):
        return params.request["url"] == target

    def request_handler(params: BeforeRequestSentParameters):
        request = params.request["request"]
        json = {"request": request, "url": pages.url("formPage.html")}
        return ContinueRequestParameters(**json)

    ws_url = driver.caps.get("webSocketUrl")
    async with open_cdp(ws_url) as conn:
        async with trio.open_nursery() as nursery:
            nursery.start_soon(
                driver.network.add_request_handler,
                request_filter,
                request_handler,
                conn,
            )
            await trio.sleep(1)
            await driver.network.get(target, conn)
            assert "We Leave From Here" == driver.title
            await trio.sleep(1)
            await driver.network.remove_request_handler()
            await driver.network.get(target, conn)
            assert "Hello WebDriver" == driver.title
