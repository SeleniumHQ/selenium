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
from .remote_connection import ChromeRemoteConnection
from .service import Service
from .options import Options


class WebDriver(RemoteWebDriver):
    """
    Controls the ChromeDriver and allows you to drive the browser.

    You will need to download the ChromeDriver executable from
    http://chromedriver.storage.googleapis.com/index.html
    """

    def __init__(self, executable_path="chromedriver", port=0,
                 chrome_options=None, service_args=None,
                 desired_capabilities=None, service_log_path=None):
        """
        Creates a new instance of the chrome driver.

        Starts the service and then creates new instance of chrome driver.

        :Args:
         - executable_path - path to the executable. If the default is used it assumes the executable is in the $PATH
         - port - port you would like the service to run, if left as 0, a free port will be found.
         - desired_capabilities: Dictionary object with non-browser specific
           capabilities only, such as "proxy" or "loggingPref".
         - chrome_options: this takes an instance of ChromeOptions
        """
        if chrome_options is None:
            # desired_capabilities stays as passed in
            if desired_capabilities is None:
                desired_capabilities = self.create_options().to_capabilities()
        else:
            if desired_capabilities is None:
                desired_capabilities = chrome_options.to_capabilities()
            else:
                desired_capabilities.update(chrome_options.to_capabilities())

        self.service = Service(
            executable_path,
            port=port,
            service_args=service_args,
            log_path=service_log_path)
        self.service.start()

        try:
            RemoteWebDriver.__init__(
                self,
                command_executor=ChromeRemoteConnection(
                    remote_server_addr=self.service.service_url),
                desired_capabilities=desired_capabilities)
        except:
            self.quit()
            raise
        self._is_remote = False

    def launch_app(self, id):
        """Launches Chrome app specified by id."""
        return self.execute("launchApp", {'id': id})

    def quit(self):
        """
        Closes the browser and shuts down the ChromeDriver executable
        that is started when starting the ChromeDriver
        """
        try:
            RemoteWebDriver.quit(self)
        except:
            # We don't care about the message because something probably has gone wrong
            pass
        finally:
            self.service.stop()

    def create_options(self):
        return Options()
