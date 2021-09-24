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

from abc import ABCMeta, abstractmethod
from typing import NoReturn


class BaseOptions(metaclass=ABCMeta):
    """
    Base class for individual browser options
    """

    def __init__(self):
        super(BaseOptions, self).__init__()
        self._caps = self.default_capabilities
        self.set_capability("pageLoadStrategy", "normal")
        self.mobile_options = None

    @property
    def capabilities(self):
        return self._caps

    def set_capability(self, name, value):
        """ Sets a capability """
        self._caps[name] = value

    @property
    def page_load_strategy(self) -> str:
        """
        :returns: page load strategy if set, otherwise "normal"
        """
        return self._caps["pageLoadStrategy"]

    @page_load_strategy.setter
    def page_load_strategy(self, strategy: str) -> NoReturn:
        """
        Determines the point at which a navigation command is returned:
        https://w3c.github.io/webdriver/#dfn-table-of-page-load-strategies

        :param strategy: the strategy corresponding to a document readiness state
        """
        if strategy in ["normal", "eager", "none"]:
            self.set_capability("pageLoadStrategy", strategy)
        else:
            raise ValueError("Strategy can only be one of the following: normal, eager, none")


    def enable_mobile(self, android_package: str = None, android_activity: str = None, device_serial: str = None):
        """
            Enables mobile browser use for browsers that support it

            :Args:
                android_activity: The name of the android package to start
        """
        if not android_package:
            raise AttributeError("android_package must be passed in")
        self.mobile_options = {
            "androidPackage": android_package
        }
        if android_activity:
            self.mobile_options["androidActivity"] = android_activity
        if device_serial:
            self.mobile_options["androidDeviceSerial"] = device_serial

    @abstractmethod
    def to_capabilities(self):
        """Convert options into capabilities dictionary."""

    @property
    @abstractmethod
    def default_capabilities(self):
        """Return minimal capabilities necessary as a dictionary."""


class ArgOptions(BaseOptions):

    def __init__(self):
        super(ArgOptions, self).__init__()
        self._arguments = []
        self._ignore_local_proxy = False

    @property
    def arguments(self):
        """
        :Returns: A list of arguments needed for the browser
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
            raise ValueError('argument can not be null')

    def ignore_local_proxy_environment_variables(self):
        """
            By calling this you will ignore HTTP_PROXY and HTTPS_PROXY from being picked up and used.
        """
        self._ignore_local_proxy = True

    def to_capabilities(self):
        return self._caps

    @property
    def default_capabilities(self):
        return {}
