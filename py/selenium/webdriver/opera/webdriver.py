#!/usr/bin/python
#
# Copyright 2011-2013 Sofware freedom conservancy
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

try:
    import http.client as http_client
except ImportError:
    import httplib as http_client

import os
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
from selenium.webdriver.remote.webdriver import WebDriver as RemoteWebDriver
from selenium.webdriver.chrome.webdriver import WebDriver as ChromiumDriver
from .service import Service
from .options import Options


class OperaDriver(ChromiumDriver):
    """
    Controls the new OperaDriver and allows you
    to drive the Opera browser based on Chromium.
    """

    def __init__(self, executable_path=None, port=0,
                 opera_options=None, service_args=None,
                 desired_capabilities=None, service_log_path=None):
        """
        Creates a new instance of the operadriver.

        Starts the service and then creates new instance of operadriver.

        :Args:
         - executable_path - path to the executable. If the default is used
                             it assumes the executable is in the $PATH
         - port - port you would like the service to run, if left as 0,
                  a free port will be found.
         - desired_capabilities: Dictionary object with non-browser specific
           capabilities only, such as "proxy" or "loggingPref".
         - chrome_options: this takes an instance of ChromeOptions
        """

        executable_path = (executable_path if executable_path is not None
                           else "operadriver")
        ChromiumDriver.__init__(self,
                                executable_path=executable_path,
                                port=port,
                                chrome_options=opera_options,
                                service_args=service_args,
                                desired_capabilities=desired_capabilities,
                                service_log_path=service_log_path)

    def create_options(self):
        return Options()


class PrestoDriver(RemoteWebDriver):
    """
    Controls the OperaDriver and allows you to drive the Opera browser
    based on Presto.
    """

    def __init__(self, executable_path=None, port=0,
                 desired_capabilities=DesiredCapabilities.OPERA):
        """
        Creates a new instance of the Opera driver.

        Starts the service and then creates new instance of Opera Driver.

        :Args:
         - executable_path - path to the executable. If the default is used
                             it assumes the executable is in the
                             Environment Variable SELENIUM_SERVER_JAR
         - port - port you would like the service to run, if left as 0,
                  a free port will be found.
         - desired_capabilities: Dictionary object with desired capabilities -
                                 may be used to provide various Opera switches.
        """
        if executable_path is None:
            try:
                executable_path = os.environ["SELENIUM_SERVER_JAR"]
            except:
                raise Exception("No executable path given, please add one \
                      to Environment Variable 'SELENIUM_SERVER_JAR'")
        self.service = Service(executable_path, port=port)
        self.service.start()

        RemoteWebDriver.__init__(self,
                                 command_executor=self.service.service_url,
                                 desired_capabilities=desired_capabilities)
        self._is_remote = False

    def quit(self):
        """
        Closes the browser and shuts down the OperaDriver executable
        that is started when starting the OperaDriver
        """
        try:
            RemoteWebDriver.quit(self)
        except http_client.BadStatusLine:
            pass
        finally:
            self.service.stop()


class WebDriver(PrestoDriver, OperaDriver):

    class ServiceType:
        PRESTO = 1
        CHROMIUM = 2

    def __init__(self,
                 desired_capabilities=None,
                 executable_path=None,
                 port=0,
                 service_log_path=None,
                 service_args=None,
                 opera_options=None):
        engine = (desired_capabilities.get('engine', None)
                  if desired_capabilities else None)
        if (engine == WebDriver.ServiceType.CHROMIUM or
                opera_options and opera_options.android_package_name):
            OperaDriver.__init__(self, executable_path=executable_path,
                                 port=port, opera_options=opera_options,
                                 service_args=service_args,
                                 desired_capabilities=desired_capabilities,
                                 service_log_path=service_log_path)
        else:
            if service_log_path:
                print("Warning! service_log_path shouldn't be used " +
                      "with Presto based Opera")
            if service_args:
                print("Warning! service_args shouldn't be used with " +
                      "Presto based Opera")
            if opera_options:
                print("Warning! opera_options shouldn't be used with " +
                      "Presto based Opera")
            if not desired_capabilities:
                desired_capabilities = DesiredCapabilities.OPERA
            PrestoDriver.__init__(self, executable_path=executable_path,
                                  port=port,
                                  desired_capabilities=desired_capabilities)
