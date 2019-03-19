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
from selenium.webdriver.remote.webdriver import WebDriver as RemoteWebDriver
from .service import Service
from .options import Options

DEFAULT_TIMEOUT = 30
DEFAULT_PORT = 0
DEFAULT_HOST = None
DEFAULT_LOG_LEVEL = None
DEFAULT_SERVICE_LOG_PATH = None


class WebDriver(RemoteWebDriver):
    """ Controls the IEServerDriver and allows you to drive Internet Explorer.

    This will automatically search through the $PATH for the driver's binary.
    This behavior can be overridden either at an instance level by passing
    executable_path at the time of instantiation, or at the class level by
    setting the driver_path attribute of the class. The executable_path argument
    will be prioritized over the class's driver_path attribute, if it's set.
    """

    driver_path = "IEDriverServer.exe"

    def __init__(self, executable_path=None, capabilities=None,
                 port=DEFAULT_PORT, timeout=DEFAULT_TIMEOUT, host=DEFAULT_HOST,
                 log_level=DEFAULT_LOG_LEVEL, service_log_path=DEFAULT_SERVICE_LOG_PATH, options=None,
                 ie_options=None, desired_capabilities=None, log_file=None, keep_alive=False):
        """
        Creates a new instance of the chrome driver.

        Starts the service and then creates new instance of chrome driver.

        :Args:
         - executable_path - path to the executable. If the default is used it assumes the executable is provided by the class or is in the $PATH
         - capabilities: capabilities Dictionary object
         - port - port you would like the service to run, if left as 0, a free port will be found.
         - timeout - no longer used, kept for backward compatibility
         - host - IP address for the service
         - log_level - log level you would like the service to run.
         - service_log_path - target of logging of service, may be "stdout", "stderr" or file path.
         - options - IE Options instance, providing additional IE options
         - desired_capabilities - alias of capabilities; this will make the signature consistent with RemoteWebDriver.
         - keep_alive - Whether to configure RemoteConnection to use HTTP keep-alive.
        """
        self.port = port
        self.host = host

        # If both capabilities and desired capabilities are set, ignore desired capabilities.
        if capabilities is None and desired_capabilities:
            capabilities = desired_capabilities

        if options is None:
            if capabilities is None:
                capabilities = self.create_options().to_capabilities()
        else:
            if capabilities is None:
                capabilities = options.to_capabilities()
            else:
                # desired_capabilities stays as passed in
                capabilities.update(options.to_capabilities())

        self.driver_path = executable_path or self.driver_path

        self.iedriver = Service(
            executable_path=self.driver_path,
            port=self.port,
            host=self.host,
            log_level=log_level,
            log_file=service_log_path,
        )

        self.iedriver.start()

        RemoteWebDriver.__init__(
            self,
            command_executor='http://localhost:%d' % self.port,
            desired_capabilities=capabilities,
            keep_alive=keep_alive)
        self._is_remote = False

    def quit(self):
        RemoteWebDriver.quit(self)
        self.iedriver.stop()

    def create_options(self):
        return Options()
