#!/usr/bin/python
#
# Copyright 2012 Webdriver_name committers
# Copyright 2012 Google Inc.
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

import os
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
import base64


class Options(object):

    def __init__(self):
        self._binary_location = ''
        self._arguments = []
        self._extension_files = []
        self._experimental_options = {}

    @property
    def binary_location(self):
        """
        Returns the location of the binary otherwise an empty string
        """
        return self._binary_location

    @binary_location.setter
    def binary_location(self, value):
        """
        Allows you to set where the chromium binary lives

        :Args:
         - value: path to the Chromium binary
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
    def extensions(self):
        """
        Returns a list of encoded extensions that will be loaded into chrome

        """
        encoded_extensions = []
        for ext in self._extension_files:
            file_ = open(ext)
            # Should not use base64.encodestring() which inserts newlines every
            # 76 characters (per RFC 1521).  Chromedriver has to remove those
            # unnecessary newlines before decoding, causing performance hit.
            encoded_extensions.append(base64.b64encode(file_.read()))

            file_.close()
        return encoded_extensions

    def add_extension(self, extension):
        """
        Adds the path to the extension to a list that will be used to extract it
        to the ChromeDriver

        :Args:
         - extension: path to the *.crx file
        """
        if extension:
            if os.path.exists(extension):
                self._extension_files.append(extension)
            else:
                raise IOError("Path to the extension doesn't exist")
        else:
            raise ValueError("argument can not be null")

    @property
    def experimental_options(self):
        """
        Returns a dictionary of experimental options for chrome.
        """
        return self._experimental_options

    def add_experimental_option(self, name, value):
        """
        Adds an experimental option which is passed to chrome.

        Args:
          name: The experimental option name.
          value: The option value.
        """
        self._experimental_options[name] = value

    def to_capabilities(self):
        """
            Creates a capabilities with all the options that have been set and

            returns a dictionary with everything
        """
        chrome = DesiredCapabilities.CHROME

        chrome_options = self.experimental_options.copy()
        chrome_options["extensions"] = self.extensions
        chrome_options["binary"] = self.binary_location
        chrome_options["args"] = self.arguments

        chrome["chromeOptions"] = chrome_options

        return chrome
