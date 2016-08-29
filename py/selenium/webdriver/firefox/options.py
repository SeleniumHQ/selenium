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

from selenium.common.exceptions import WebDriverException
from selenium.webdriver.firefox.firefox_profile import FirefoxProfile


class Options(object):

    def __init__(self):
        self._binary_location = ''
        self._profile = None
        self._arguments = []
        self._extension_files = []
        self._extensions = []
        self._firefox_options = {}

    @property
    def binary_location(self):
        """
        Returns the location of the binary otherwise an empty string
        """
        return self._binary_location

    @binary_location.setter
    def binary_location(self, value):
        """
        Allows you to set where the firefox binary lives

        :Args:
         - value: path to the firefox binary
        """
        self._binary_location = value

    @property
    def arguments(self):
        """
        Returns a list of arguments needed for the browser
        """
        return self._arguments

    def add_argument(self, argument):
        """
        Adds an argument to the list

        :Args:
         - Sets the arguments
        """
        if argument:
            self._arguments.append(argument)
        else:
            raise ValueError("argument can not be null")

    @property
    def profile(self):
        """
            Returns a FirefoxProfile object if one has been set before else None

        """
        return self._profile

    @profile.setter
    def profile(self, value):
        if not isinstance(value, FirefoxProfile):
            raise WebDriverException("When passing in a value to profile,"
                                     " please pass in a FirefoxProfile object.")
        self._profile = value

    def to_capabilities(self):
        """
            Creates a capabilities with all the options that have been set and

            returns a dictionary with everything
        """
        desired = {}
        if self.binary_location:
            desired["binary"] = self.binary_location
        if self._profile:
            desired["firefox_profile"] = self._profile.encoded
        desired["args"] = self.arguments
        capabilities = {"desiredCapabilities": desired}
        return capabilities
