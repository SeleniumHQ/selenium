#!/usr/bin/python
#
# Copyright 2012 Software freedom conservancy
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

import base64
import httplib
from selenium.webdriver.remote.command import Command
from selenium.webdriver.remote.webdriver import WebDriver as RemoteWebDriver
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
from selenium.common.exceptions import WebDriverException
from service import Service

class WebDriver(RemoteWebDriver):
    """
    Wrapper to communicate with PhantomJS through Ghostdriver.

    You will need to follow all the directions here:
    https://github.com/detro/ghostdriver
    """

    def __init__(self, executable_path="phantomjs",
                 port=0, desired_capabilities=DesiredCapabilities.PHANTOMJS):
        """
        Creates a new instance of the PhantomJS / Ghostdriver.

        Starts the service and then creates new instance of the driver.

        :Args:
         - executable_path - path to the executable. If the default is used it assumes the executable is in the $PATH
         - port - port you would like the service to run, if left as 0, a free port will be found.
         - desired_capabilities: Dictionary object with non-browser specific
           capabilities only, such as "proxy" or "loggingPref".
        """
        self.service = Service(executable_path, port=port)
        self.service.start()

        try:
            RemoteWebDriver.__init__(self,
                command_executor=self.service.service_url,
                desired_capabilities=desired_capabilities)
        except:
            self.quit()
            raise

    def quit(self):
        """
        Closes the browser and shuts down the PhantomJS executable
        that is started when starting the PhantomJS
        """
        try:
            RemoteWebDriver.quit(self)
        except:
            # We don't care about the message because something probably has gone wrong
            pass
        finally:
            self.service.stop()

    def __del__(self):
        try:
            self.service.stop()
        except:
            pass
