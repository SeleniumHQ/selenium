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
from selenium.webdriver.firefox.firefox_binary import FirefoxBinary
from selenium.webdriver.firefox.firefox_profile import FirefoxProfile


class Log(object):
    def __init__(self):
        self.level = None

    def to_capabilities(self):
        if self.level is not None:
            return {"log": {"level": self.level}}
        return {}


class Options(object):
    KEY = "moz:firefoxOptions"

    def __init__(self):
        self._binary = None
        self._profile = None
        self._arguments = []
        self.log = Log()

    @property
    def binary(self):
        """Returns the location of the binary."""
        return self._binary

    @binary.setter
    def binary(self, new_binary):
        """Sets location of the browser binary, either by string or
        ``FirefoxBinary`` instance.

        """
        if not isinstance(new_binary, FirefoxBinary):
            new_binary = FirefoxBinary(new_binary)
        self._binary = new_binary

    @property
    def binary_location(self):
        return self.binary

    @binary.setter
    def binary_location(self, value):
        self.binary = value

    @property
    def profile(self):
        """Returns the Firefox profile to use."""
        return self._profile

    @profile.setter
    def profile(self, new_profile):
        """Sets location of the browser profile to use, either by string
        or ``FirefoxProfile``.

        """
        if not isinstance(new_profile, FirefoxProfile):
            new_profile = FirefoxProfile(new_profile)
        self._profile = new_profile

    @property
    def arguments(self):
        """Returns a list of browser process arguments."""
        return self._arguments

    def add_argument(self, argument):
        """Add argument to be used for the browser process."""
        if argument is None:
            raise ValueError()
        self._arguments.append(argument)

    def to_capabilities(self):
        """Marshals the Firefox options to a `moz:firefoxOptions`
        object.

        """
        # This intentionally looks at the internal properties
        # so if a binary or profile has _not_ been set,
        # it will defer to geckodriver to find the system Firefox
        # and generate a fresh profile.
        opts = {}

        if self._binary is not None:
            opts["binary"] = self._binary._start_cmd
        if self._profile is not None:
            opts["profile"] = self._profile.encoded
        if len(self._arguments) > 0:
            opts["args"] = self._arguments

        opts.update(self.log.to_capabilities())

        if len(opts) > 0:
            return {Options.KEY: opts}
        return {}
