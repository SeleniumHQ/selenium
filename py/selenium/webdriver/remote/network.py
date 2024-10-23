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
import trio

from selenium.webdriver.common.bidi import network
from selenium.webdriver.common.bidi.browsing_context import Navigate
from selenium.webdriver.common.bidi.browsing_context import NavigateParameters
from selenium.webdriver.common.bidi.network import AddInterceptParameters
from selenium.webdriver.common.bidi.network import BeforeRequestSent
from selenium.webdriver.common.bidi.network import BeforeRequestSentParameters
from selenium.webdriver.common.bidi.network import ContinueRequestParameters


def default_request_handler(params: BeforeRequestSentParameters):
    return ContinueRequestParameters(request=params.request["request"])


class Network:
    def __init__(self, driver):
        self.network = None
        self.driver = driver
        self.intercept = None
        self.scope = None

    async def add_request_handler(
        self, request_filter=lambda _: True, handler=default_request_handler, conn=None
    ):
        with trio.CancelScope() as scope:
            self.scope = scope
            self.network = network.Network(conn)
            params = AddInterceptParameters(["beforeRequestSent"])
            callback = self._callback(request_filter, handler)
            result = await self.network.add_intercept(
                event=BeforeRequestSent, params=params
            )
            intercept = result["intercept"]
            self.intercept = intercept
            await self.network.add_listener(event=BeforeRequestSent, callback=callback)
            return intercept

    async def get(self, url, conn):
        params = NavigateParameters(context=self.driver.current_window_handle, url=url)
        await conn.execute(Navigate(params).cmd())

    async def remove_request_handler(self):
        await self.network.remove_intercept(
            event=BeforeRequestSent,
            params=network.RemoveInterceptParameters(self.intercept),
        )
        self.scope.cancel()

    def _callback(self, request_filter, handler):
        async def callback(request):
            if request_filter(request):
                request = handler(request)
            else:
                request = default_request_handler(request)
            await self.network.continue_request(request)

        return callback
