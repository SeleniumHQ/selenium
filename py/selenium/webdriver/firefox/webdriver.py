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


try:
    import http.client as http_client
except ImportError:
    import httplib as http_client

try:
    basestring
except NameError:  # Python 3.x
    basestring = str

import shutil
import socket
import sys

from .firefox_binary import FirefoxBinary
from .remote_connection import FirefoxRemoteConnection
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
from selenium.webdriver.firefox.extension_connection import ExtensionConnection
from selenium.webdriver.firefox.firefox_profile import FirefoxProfile
from selenium.webdriver.remote.webdriver import WebDriver as RemoteWebDriver
from .service import Service
from .options import Options


class WebDriver(RemoteWebDriver):

    # There is no native event support on Mac
    NATIVE_EVENTS_ALLOWED = sys.platform != "darwin"

    def __init__(self, firefox_profile=None, firefox_binary=None, timeout=30,
                 capabilities=None, proxy=None, executable_path="wires", firefox_options=None):
        self.profile = firefox_profile
        self.binary = firefox_binary
        if firefox_options is None:

            if self.profile is None:
                self.profile = FirefoxProfile()

            self.profile.native_events_enabled = (
                self.NATIVE_EVENTS_ALLOWED and self.profile.native_events_enabled)

            if capabilities is None:
                capabilities = DesiredCapabilities.FIREFOX

            if self.binary is None:
                self.binary = capabilities.get("binary") or FirefoxBinary()

            firefox_options = Options()
            firefox_options.binary_location = self.binary if isinstance(self.binary, basestring) else self.binary._get_firefox_start_cmd()
            firefox_options.profile = self.profile
        else:
            if capabilities is None:
                capabilities = firefox_options.to_capabilities()
            else:
                capabilities.update(firefox_options.to_capabilities())

        # marionette
        if capabilities.get("marionette"):
            self.binary = firefox_options.binary_location
            if isinstance(firefox_options.binary_location, FirefoxBinary):
                self.binary = firefox_options.binary_location._get_firefox_start_cmd()

            self.service = Service(executable_path, firefox_binary=self.binary)
            self.service.start()

            executor = FirefoxRemoteConnection(
                remote_server_addr=self.service.service_url)
            RemoteWebDriver.__init__(
                self,
                command_executor=executor,
                desired_capabilities=capabilities,
                keep_alive=True)
        else:
            # Oh well... sometimes the old way is the best way.
            if proxy is not None:
                proxy.add_to_capabilities(capabilities)

            if self.binary is None:
                self.binary = firefox_options.binary_location or FirefoxBinary()

            if self.profile is None:
                self.profile = firefox_options.profile or FirefoxProfile()

            executor = ExtensionConnection("127.0.0.1", self.profile,
                                           self.binary, timeout)
            RemoteWebDriver.__init__(self,
                command_executor=executor,
            desired_capabilities=capabilities,
            keep_alive=True)


        self._is_remote = False

    def quit(self):
        """Quits the driver and close every associated window."""
        try:
            RemoteWebDriver.quit(self)
        except (http_client.BadStatusLine, socket.error):
            # Happens if Firefox shutsdown before we've read the response from
            # the socket.
            pass
        if "specificationLevel" in self.capabilities:
            self.service.stop()
        else:
            self.binary.kill()
            try:
                shutil.rmtree(self.profile.path)
                if self.profile.tempfolder is not None:
                    shutil.rmtree(self.profile.tempfolder)
            except Exception as e:
                print(str(e))

    @property
    def firefox_profile(self):
        return self.profile

    def set_context(self, context):
        self.execute("SET_CONTEXT", {"context": context})
