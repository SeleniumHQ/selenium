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
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
from selenium.webdriver.common.options import ArgOptions


class Log(object):
    def __init__(self):
        self.level = None

    def to_capabilities(self) -> dict:
        if self.level:
            return {"log": {"level": self.level}}
        return {}


class Options(ArgOptions):
    KEY = "safari.options"

    def __init__(self):
        super(Options, self).__init__()
        self._binary_location = None
        self._preferences: dict = {}
        self.log = Log()

    @property
    def binary_location(self) -> str:
        """
        :Returns: The location of the browser binary otherwise an empty string
        """
        return self._binary_location

    @binary_location.setter
    def binary_location(self, value: str):
        """
        Allows you to set the browser binary to launch

        :Args:
         - value : path to the browser binary
        """
        self._binary_location = value

    def to_capabilities(self) -> dict:
        """Marshals the  options to an desired capabilities object.
        """
        # This intentionally looks at the internal properties
        # so if a binary or profile has _not_ been set,
        # it will defer to geckodriver to find the system Firefox
        # and generate a fresh profile.
        caps = self._caps
        opts = {}

        if self._arguments:
            opts["args"] = self._arguments
        if self._binary_location:
            opts["binary"] = self._binary_location
        opts.update(self.log.to_capabilities())

        if opts:
            caps[Options.KEY] = opts

        return caps

    @property
    def default_capabilities(self) -> dict:
        return DesiredCapabilities.SAFARI.copy()
