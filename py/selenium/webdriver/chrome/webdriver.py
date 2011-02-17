# Copyright 2008-2009 WebDriver committers
# Copyright 2008-2009 Google Inc.
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
from __future__ import with_statement
__all__ = ["WebDriver"]
from selenium.webdriver.remote.command import Command
from selenium.webdriver.remote.webdriver import WebDriver as RemoteWebDriver
from driver import ChromeDriver
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities

class WebDriver(RemoteWebDriver):
    def __init__(self):
        RemoteWebDriver.__init__(self,
            command_executor=ChromeDriver(custom_profile=None, 
            untrusted_certificates=False),
            desired_capabilities=DesiredCapabilities.CHROME)
    
    def start_client(self):
        self.command_executor.start()

    def stop_client(self):
        self.command_executor.stop()

    def wait_for_load_complete(self):
        # Interface compatibility
        return

    def save_screenshot(self, jpeg_file):
        image = self._execute(Command.SCREENSHOT)['value']
        with open(jpeg_file, "w") as fo:
            fo.write(image.decode("base64"))
