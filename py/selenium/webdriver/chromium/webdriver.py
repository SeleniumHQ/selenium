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

import sys
import warnings

from selenium.webdriver.chromium.remote_connection import ChromiumRemoteConnection
from selenium.webdriver.remote.webdriver import WebDriver as RemoteWebDriver

DEFAULT_PORT = 0
DEFAULT_SERVICE_LOG_PATH = None


class ChromiumDriver(RemoteWebDriver):
    """
    Controls the WebDriver instance of ChromiumDriver and allows you to drive the browser.
    """

    def __init__(self, browser_name, vendor_prefix,
                 port=DEFAULT_PORT, options=None, service_args=None,
                 desired_capabilities=None, service_log_path=DEFAULT_SERVICE_LOG_PATH,
                 service=None, keep_alive=True):
        """
        Creates a new WebDriver instance of the ChromiumDriver.
        Starts the service and then creates new WebDriver instance of ChromiumDriver.

        :Args:
         - browser_name - Browser name used when matching capabilities.
         - vendor_prefix - Company prefix to apply to vendor-specific WebDriver extension commands.
         - port - Deprecated: port you would like the service to run, if left as 0, a free port will be found.
         - options - this takes an instance of ChromiumOptions
         - service_args - Deprecated: List of args to pass to the driver service
         - desired_capabilities - Deprecated: Dictionary object with non-browser specific
           capabilities only, such as "proxy" or "loggingPref".
         - service_log_path - Deprecated: Where to log information from the driver.
         - keep_alive - Whether to configure ChromiumRemoteConnection to use HTTP keep-alive.
        """
        if desired_capabilities is not None:
            warnings.warn('desired_capabilities has been deprecated, please pass in a Service object',
                          DeprecationWarning, stacklevel=2)
        if port != DEFAULT_PORT:
            warnings.warn('port has been deprecated, please pass in a Service object',
                          DeprecationWarning, stacklevel=2)
        self.port = port
        if service_log_path != DEFAULT_SERVICE_LOG_PATH:
            warnings.warn('service_log_path has been deprecated, please pass in a Service object',
                          DeprecationWarning, stacklevel=2)

        if options is None:
            # desired_capabilities stays as passed in
            if desired_capabilities is None:
                desired_capabilities = self.create_options().to_capabilities()
        else:
            if desired_capabilities is None:
                desired_capabilities = options.to_capabilities()
            else:
                desired_capabilities.update(options.to_capabilities())

        self.vendor_prefix = vendor_prefix

        if service is None:
            raise AttributeError('service cannot be None')

        self.service = service
        self.service.start()
        global nursery
        nursery = None


        try:
            RemoteWebDriver.__init__(
                self,
                command_executor=ChromiumRemoteConnection(
                    remote_server_addr=self.service.service_url,
                    browser_name=browser_name, vendor_prefix=vendor_prefix,
                    keep_alive=keep_alive),
                desired_capabilities=desired_capabilities)
        except Exception:
            self.quit()
            raise
        self._is_remote = False

    def launch_app(self, id):
        """Launches Chromium app specified by id."""
        return self.execute("launchApp", {'id': id})

    def get_network_conditions(self):
        """
        Gets Chromium network emulation settings.

        :Returns:
            A dict. For example:
            {'latency': 4, 'download_throughput': 2, 'upload_throughput': 2,
            'offline': False}
        """
        return self.execute("getNetworkConditions")['value']

    def set_network_conditions(self, **network_conditions):
        """
        Sets Chromium network emulation settings.

        :Args:
         - network_conditions: A dict with conditions specification.

        :Usage:
            ::

                driver.set_network_conditions(
                    offline=False,
                    latency=5,  # additional latency (ms)
                    download_throughput=500 * 1024,  # maximal throughput
                    upload_throughput=500 * 1024)  # maximal throughput

            Note: 'throughput' can be used to set both (for download and upload).
        """
        self.execute("setNetworkConditions", {
            'network_conditions': network_conditions
        })

    def execute_cdp_cmd(self, cmd, cmd_args):
        """
        Execute Chrome Devtools Protocol command and get returned result
        The command and command args should follow chrome devtools protocol domains/commands, refer to link
        https://chromedevtools.github.io/devtools-protocol/

        :Args:
         - cmd: A str, command name
         - cmd_args: A dict, command args. empty dict {} if there is no command args
        :Usage:
            ::
                driver.execute_cdp_cmd('Network.getResponseBody', {'requestId': requestId})
        :Returns:
            A dict, empty dict {} if there is no result to return.
            For example to getResponseBody:
            {'base64Encoded': False, 'body': 'response body string'}
        """
        return self.execute("executeCdpCommand", {'cmd': cmd, 'params': cmd_args})['value']

    def get_sinks(self):
        """
        :Returns: A list of sinks avaliable for Cast.
        """
        return self.execute('getSinks')['value']

    def get_issue_message(self):
        """
        :Returns: An error message when there is any issue in a Cast session.
        """
        return self.execute('getIssueMessage')['value']

    def set_sink_to_use(self, sink_name):
        """
        Sets a specific sink, using its name, as a Cast session receiver target.

        :Args:
         - sink_name: Name of the sink to use as the target.
        """
        return self.execute('setSinkToUse', {'sinkName': sink_name})

    def start_tab_mirroring(self, sink_name):
        """
        Starts a tab mirroring session on a specific receiver target.

        :Args:
         - sink_name: Name of the sink to use as the target.
        """
        return self.execute('startTabMirroring', {'sinkName': sink_name})

    def stop_casting(self, sink_name):
        """
        Stops the existing Cast session on a specific receiver target.

        :Args:
         - sink_name: Name of the sink to stop the Cast session.
        """
        return self.execute('stopCasting', {'sinkName': sink_name})

    def quit(self):
        """
        Closes the browser and shuts down the ChromiumDriver executable
        that is started when starting the ChromiumDriver
        """
        try:
            RemoteWebDriver.quit(self)
        except Exception:
            # We don't care about the message because something probably has gone wrong
            pass
        finally:
            self.service.stop()

    def create_options(self):
        pass

    async def get_devtools_connection(self):
        assert sys.version_info >= (3, 6)

        import contextvars
        from selenium.webdriver.support import cdp

        MAX_WS_MESSAGE_SIZE = 2**24

        ws_url = self.capabilities.get(self.vendor_prefix["debuggerAddress"])

        async with trio.open_nursery() as nursery:
            conn = await connect_cdp(nursery, ws_url)
            cdp.set_global_connection(conn)
            try:
                with cdp.connection_context(conn):
                    yield conn
            finally:
                await conn.aclose()

