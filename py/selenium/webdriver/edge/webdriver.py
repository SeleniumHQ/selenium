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
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
from selenium.webdriver.edge.service import Service
from selenium.webdriver.chromium.webdriver import ChromiumDriver


DEFAULT_PORT = 0
DEFAULT_SERVICE_LOG_PATH = None


class WebDriver(ChromiumDriver):

    def __init__(self, executable_path='MicrosoftWebDriver.exe',
                 capabilities=None, port=DEFAULT_PORT, verbose=False,
                 service_log_path=None, log_path=DEFAULT_SERVICE_LOG_PATH,
                 service=None, options=None, keep_alive=False, is_legacy=True,
                 service_args=None):
        """
        Creates a new instance of the edge driver.
        Starts the service and then creates new instance of edge driver.

        :Args:
         - executable_path - Deprecated: path to the executable. If the default is used it assumes the executable is in the $PATH
         - capabilities - Dictionary object with non-browser specific capabilities only, such as "proxy" or "loggingPref".
           Only available in Legacy mode
         - port - Deprecated: port you would like the service to run, if left as 0, a free port will be found.
         - verbose - whether to set verbose logging in the service. Only available in Legacy Mode
         - service_log_path - Deprecated: Where to log information from the driver.
         - keep_alive - Whether to configure EdgeRemoteConnection to use HTTP keep-alive.
         - service_args - Deprecated: List of args to pass to the driver service
         - is_legacy: Whether to use MicrosoftWebDriver.exe (legacy) or MSEdgeDriver.exe (chromium-based). Defaults to True.
         """
        if not is_legacy:
            executable_path = "msedgedriver"

        service = service or Service(executable_path,
                                     port=port,
                                     verbose=verbose,
                                     log_path=service_log_path,
                                     is_legacy=is_legacy)

        super(WebDriver, self).__init__(
            executable_path,
            port,
            options,
            service_args,
            DesiredCapabilities.EDGE,
            service_log_path,
            service,
            keep_alive)
