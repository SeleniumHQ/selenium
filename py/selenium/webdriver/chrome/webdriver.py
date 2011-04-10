#!/usr/bin/python
#
# Copyright 2011 Webdriver_name committers
# Copyright 2011 Google Inc.
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

import httplib
from selenium.webdriver.remote.webdriver import WebDriver as RemoteWebDriver
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities 
from service import Service

class WebDriver(RemoteWebDriver):

    def __init__(self, executable_path="chromedriver"):
        self.service = Service(executable_path)
        self.service.start()

        RemoteWebDriver.__init__(self, 
            command_executor=self.service.service_url, 
            desired_capabilities=DesiredCapabilities.CHROME)

    def quit(self):
        try:
            RemoteWebDriver.quit(self)
        except httplib.BadStatusLine:
            pass
        finally:
            self.service.stop()
