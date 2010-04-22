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

from __future__ import with_statement

__all__ = [ "WebDriver", "WebDriverError", "NoSuchElementException" ]

from selenium.common.exceptions import ErrorInResponseException
from selenium.remote.command import Command
from selenium.remote.webdriver import WebDriver as RemoteWebDriver
from driver import ChromeDriver

class WebDriver(RemoteWebDriver):

    def __init__(self):
        RemoteWebDriver.__init__(self,
            command_executor=ChromeDriver(),
            browser_name='chrome', platform='ANY', version='',
            javascript_enabled=True)

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

def _test():
    wd = WebDriver()
    wd.get("http://www.google.com")
    print "Current URL: %s" % wd.get_current_url()
    print "2 + 2 = %s" % wd.execute_script("return 2 + 2;")
    q = wd.find_element_by_name("q")
    q.send_keys("Sauce Labs")
    b = wd.find_element_by_name("btnG")
    b.click()
    wd.save_screenshot("google.jpg")
    print "Screenshot saved to google.jpg"
    wd.quit()

if __name__ == "__main__":
    _test()
