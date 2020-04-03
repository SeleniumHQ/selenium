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
from selenium.webdriver.chromium.webdriver import ChromiumDriver
from .options import Options
from .service import Service
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities


DEFAULT_PORT = 0
DEFAULT_SERVICE_LOG_PATH = None


class WebDriver(ChromiumDriver):
    """
    Controls the Microsoft Edge driver and allows you to drive the browser.
    You will need to download either the MicrosoftWebDriver (Legacy)
    or MSEdgeDriver (Chromium) executable from
    https://developer.microsoft.com/en-us/microsoft-edge/tools/webdriver/
    """

    def __init__(self, executable_path='MicrosoftWebDriver.exe', port=DEFAULT_PORT,
                 options=None, service_args=None,
                 capabilities=None, service_log_path=DEFAULT_SERVICE_LOG_PATH,
                 service=None, keep_alive=False, verbose=False):
        """
        Creates a new instance of the edge driver.
        Starts the service and then creates new instance of edge driver.

        :Args:
         - executable_path - Deprecated: path to the executable. If the default is used it assumes the executable is in the $PATH
         - port - Deprecated: port you would like the service to run, if left as 0, a free port will be found.
         - options - this takes an instance of EdgeOptions
         - service_args - Deprecated: List of args to pass to the driver service
         - capabilities - Deprecated: Dictionary object with non-browser specific
           capabilities only, such as "proxy" or "loggingPref".
         - service_log_path - Deprecated: Where to log information from the driver.
         - keep_alive - Whether to configure EdgeRemoteConnection to use HTTP keep-alive.
         - verbose - whether to set verbose logging in the service.
         """
        if executable_path != 'MicrosoftWebDriver.exe':
            warnings.warn('executable_path has been deprecated, please pass in a Service object',
                          DeprecationWarning, stacklevel=2)

        if options is not None and options.use_chromium:
            executable_path = "msedgedriver"

        if service is None:
            service = Service(executable_path, port, service_args, service_log_path)

        super(WebDriver, self).__init__(DesiredCapabilities.EDGE['browserName'], "ms",
                                        port, options,
                                        service_args, capabilities,
                                        service_log_path, service, keep_alive)

    def create_options(self):
        return Options()
