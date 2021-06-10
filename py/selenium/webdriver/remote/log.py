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

import json
import pkgutil
import sys

from contextlib import asynccontextmanager
from importlib import import_module

from selenium.common.exceptions import WebDriverException
from selenium.webdriver.common.by import By

cdp = None


def import_cdp():
    global cdp
    if not cdp:
        cdp = import_module("selenium.webdriver.common.bidi.cdp")


class Log():
    """
        This class allows access to logging APIs that use the new WebDriver Bidi
        protocol.

        This class is not to be used directly and should be used from the webdriver
        base classes.
    """

    def __init__(self, driver) -> None:
        assert sys.version_info >= (3, 7)
        self.driver = driver
        _pkg = '.'.join(__name__.split('.')[:-1])
        self._mutation_listener_js = pkgutil.get_data(_pkg, 'mutation-listener.js').decode('utf8').strip()

    @asynccontextmanager
    async def mutation_events(self) -> dict:
        """
        Listens for mutation events and emits them as it finds them

        :Usage:
             ::
               async with driver.log.mutation_events() as event:
                    pages.load("dynamic.html")
                    driver.find_element(By.ID, "reveal").click()
                    WebDriverWait(driver, 5)\
                        .until(EC.visibility_of(driver.find_element(By.ID, "revealed")))

                assert event["attribute_name"] == "style"
                assert event["current_value"] == ""
                assert event["old_value"] == "display:none;"

        """

        assert sys.version_info >= (3, 7)
        global cdp
        async with self._get_bidi_connection():
            global devtools
            page = cdp.get_session_context('page.enable')
            await page.execute(devtools.page.enable())
            runtime = cdp.get_session_context('runtime.enable')
            await runtime.execute(devtools.runtime.enable())
            await runtime.execute(devtools.runtime.add_binding("__webdriver_attribute"))
            self.driver.pin_script(self._mutation_listener_js)
            script_key = await page.execute(devtools.page.add_script_to_evaluate_on_new_document(self._mutation_listener_js))
            self.driver.pin_script(self._mutation_listener_js, script_key)
            self.driver.execute_script(f"return {self._mutation_listener_js}")
            event = {}
            async with runtime.wait_for(devtools.runtime.BindingCalled) as evnt:
                yield event

            payload = json.loads(evnt.value.payload)
            elements: list = self.driver.find_elements(By.CSS_SELECTOR, "*[data-__webdriver_id={}".format(payload['target']))
            if not elements:
                elements.append(None)
            event["element"] = elements[0]
            event["attribute_name"] = payload['name']
            event["current_value"] = payload['value']
            event["old_value"] = payload['oldValue']

    @asynccontextmanager
    async def add_js_error_listener(self):
        """
        Listens for JS errors and when the contextmanager exits check if there were JS Errors

        :Usage:
             ::

                async with driver.log.add_js_error_listener() as error:
                    driver.find_element(By.ID, "throwing-mouseover").click()
                assert bool(error)
                assert error.exception_details.stack_trace.call_frames[0].function_name == "onmouseover"
        """
        global cdp
        async with self._get_bidi_connection():
            global devtools
            session = cdp.get_session_context('page.enable')
            await session.execute(devtools.page.enable())
            session = cdp.get_session_context('runtime.enable')
            await session.execute(devtools.runtime.enable())
            js_exception = devtools.runtime.ExceptionThrown(None, None)
            async with session.wait_for(devtools.runtime.ExceptionThrown) as exception:
                yield js_exception
            js_exception.timestamp = exception.value.timestamp
            js_exception.exception_details = exception.value.exception_details

    @asynccontextmanager
    async def add_listener(self, event_type) -> dict:
        '''
        Listens for certain events that are passed in.

        :Args:
         - event_type: The type of event that we want to look at.

         :Usage:
             ::

                async with driver.log.add_listener(Console.log) as messages:
                    driver.execute_script("console.log('I like cheese')")
                assert messages["message"] == "I love cheese"

        '''

        global cdp
        from selenium.webdriver.common.bidi.console import Console

        async with self._get_bidi_connection():
            global devtools
            session = cdp.get_session_context('page.enable')
            await session.execute(devtools.page.enable())
            session = cdp.get_session_context('runtime.enable')
            await session.execute(devtools.runtime.enable())
            console = {
                "message": None,
                "level": None
            }
            async with session.wait_for(devtools.runtime.ConsoleAPICalled) as messages:
                yield console

            if event_type == Console.ERROR:
                console["message"] = messages.value.args[0].value
                console["level"] = messages.value.args[0].type_
            if event_type == Console.ALL:
                console["message"] = messages.value.args[0].value
                console["level"] = messages.value.args[0].type_

    @asynccontextmanager
    async def _get_bidi_connection(self):
        global cdp
        import_cdp()
        ws_url = None
        if self.driver.caps.get("se:cdp"):
            ws_url = self.driver.caps.get("se:cdp")
            version = self.driver.caps.get("se:cdpVersion").split(".")[0]
        else:
            version, ws_url = self._get_cdp_details()

        if not ws_url:
            raise WebDriverException("Unable to find url to connect to from capabilities")

        cdp.import_devtools(version)

        global devtools
        devtools = import_module("selenium.webdriver.common.devtools.v{}".format(version))
        async with cdp.open_cdp(ws_url) as conn:
            targets = await conn.execute(devtools.target.get_targets())
            target_id = targets[0].target_id
            async with conn.open_session(target_id) as session:
                yield session

    def _get_cdp_details(self):
        import json
        import urllib3

        http = urllib3.PoolManager()
        _firefox = False
        if self.driver.caps.get("browserName") == "chrome":
            debugger_address = self.driver.caps.get(f"{self.driver.vendor_prefix}:{self.driver.caps.get('browserName')}Options").get("debuggerAddress")
        else:
            _firefox = True
            debugger_address = self.driver.caps.get("moz:debuggerAddress")
        res = http.request('GET', f"http://{debugger_address}/json/version")
        data = json.loads(res.data)

        browser_version = data.get("Browser")
        websocket_url = data.get("webSocketDebuggerUrl")

        import re
        if _firefox:
            # Mozilla Automation Team asked to only support 85
            # until WebDriver Bidi is available.
            version = 85
        else:
            version = re.search(r".*/(\d+)\.", browser_version).group(1)

        return version, websocket_url
