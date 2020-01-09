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


DEFAULT_PORT = 0
DEFAULT_SERVICE_LOG_PATH = None


class WebDriver(ChromiumDriver):
    """
    Controls the ChromeDriver and allows you to drive the browser.
    You will need to download the ChromeDriver executable from
    http://chromedriver.storage.googleapis.com/index.html
    """

    def __init__(self, executable_path="chromedriver", port=DEFAULT_PORT,
                 options=None, service_args=None,
                 desired_capabilities=None, service_log_path=DEFAULT_SERVICE_LOG_PATH,
                 chrome_options=None, service=None, keep_alive=True):
        """
        Creates a new instance of the chrome driver.
        Starts the service and then creates new instance of chrome driver.

        :Args:
         - executable_path - Deprecated: path to the executable. If the default is used it assumes the executable is in the $PATH
         - port - Deprecated: port you would like the service to run, if left as 0, a free port will be found.
         - options - this takes an instance of ChromeOptions
         - service_args - Deprecated: List of args to pass to the driver service
         - desired_capabilities - Deprecated: Dictionary object with non-browser specific
           capabilities only, such as "proxy" or "loggingPref".
         - service_log_path - Deprecated: Where to log information from the driver.
         - keep_alive - Whether to configure ChromeRemoteConnection to use HTTP keep-alive.
        """
        if chrome_options:
            warnings.warn('use options instead of chrome_options',
                          DeprecationWarning, stacklevel=2)
            options = chrome_options

        if service is None:
            service = Service(executable_path, port, service_args, service_log_path)

        super(WebDriver, self).__init__(executable_path, port, options,
                                        service_args, desired_capabilities,
                                        service_log_path, service, keep_alive)

    def create_options(self):
        return Options()
