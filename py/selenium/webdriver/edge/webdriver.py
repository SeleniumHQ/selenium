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
import warnings

from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
from selenium.webdriver.edge.service import Service
from selenium.webdriver.remote.remote_connection import RemoteConnection
from selenium.webdriver.remote.webdriver import WebDriver as RemoteWebDriver

DEFAULT_PORT = 0
DEFAULT_SERVICE_LOG_PATH = None


class WebDriver(RemoteWebDriver):

    def __init__(self, executable_path='MicrosoftWebDriver.exe',
                 capabilities=None, port=DEFAULT_PORT, verbose=False,
                 service_log_path=None, log_path=DEFAULT_SERVICE_LOG_PATH,
                 service=None, options=None, keep_alive=False):
        """
        Creates a new instance of the chrome driver.

        Starts the service and then creates new instance of chrome driver.

        :Args:
         - executable_path - path to the executable. If the default is used it assumes the executable is in the $PATH
         - capabilities - Dictionary object with non-browser specific
           capabilities only, such as "proxy" or "loggingPref".
         - port - port you would like the service to run, if left as 0, a free port will be found.
         - verbose - whether to set verbose logging in the service
         - service_log_path - Where to log information from the driver.
         - keep_alive - Whether to configure EdgeRemoteConnection to use HTTP keep-alive.
         """
        if port != DEFAULT_PORT:
            warnings.warn('port has been deprecated, please pass in a Service object',
                          DeprecationWarning, stacklevel=2)
        self.port = port

        if service_log_path != DEFAULT_SERVICE_LOG_PATH:
            warnings.warn('service_log_path has been deprecated, please pass in a Service object',
                          DeprecationWarning, stacklevel=2)
        if capabilities is not None:
            warnings.warn('capabilities has been deprecated, please pass in a Service object',
                          DeprecationWarning, stacklevel=2)
        if service_log_path != DEFAULT_SERVICE_LOG_PATH:
            warnings.warn('service_log_path has been deprecated, please pass in a Service object',
                          DeprecationWarning, stacklevel=2)
        if verbose:
            warnings.warn('verbose has been deprecated, please pass in a Service object',
                          DeprecationWarning, stacklevel=2)

        if service:
            self.service = service
        else:
            self.service = Service(executable_path, port=self.port, verbose=verbose,
                                   log_path=service_log_path)
        self.service.start()

        if capabilities is None:
            capabilities = DesiredCapabilities.EDGE

        RemoteWebDriver.__init__(
            self,
            command_executor=RemoteConnection(self.service.service_url,
                                              resolve_ip=False,
                                              keep_alive=keep_alive),
            desired_capabilities=capabilities)
        self._is_remote = False

    @property
    def edge_service(self):
        warnings.warn("'edge_service' has been deprecated, please use 'service'",
                      DeprecationWarning, stacklevel=2)
        return self.service

    def quit(self):
        RemoteWebDriver.quit(self)
        self.service.stop()
