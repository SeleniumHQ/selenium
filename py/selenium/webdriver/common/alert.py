#Copyright 2007-2009 WebDriver committers
#Copyright 2007-2009 Google Inc.
#
#Licensed under the Apache License, Version 2.0 (the "License");
#you may not use this file except in compliance with the License.
#You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
#Unless required by applicable law or agreed to in writing, software
#distributed under the License is distributed on an "AS IS" BASIS,
#WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#See the License for the specific language governing permissions and
#limitations under the License.

from selenium.webdriver.remote.command import Command


class Alert(object):

    def __init__(self, driver):
        self.driver = driver

    @property
    def text(self):
        """ Gets the text of the Alert """
        return self.driver.execute(Command.GET_ALERT_TEXT)["value"]

    def dismiss(self):
        """ Dismisses the alert available """
        self.driver.execute(Command.DISMISS_ALERT)

    def accept(self):
        """ Accepts the alert available """
        self.driver.execute(Command.ACCEPT_ALERT)

    def send_keys(self, keysToSend):
        """ Send Keys to the Alert """
        self.driver.execute(Command.SET_ALERT_VALUE, {'text': keysToSend})
