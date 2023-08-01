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
import typing

from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
from selenium.webdriver.common.options import ArgOptions


class Options(ArgOptions):
    # @see https://developer.apple.com/documentation/webkit/about_webdriver_for_safari
    AUTOMATIC_INSPECTION = "safari:automaticInspection"
    AUTOMATIC_PROFILING = "safari:automaticProfiling"

    SAFARI_TECH_PREVIEW = "Safari Technology Preview"

    @property
    def default_capabilities(self) -> typing.Dict[str, str]:
        return DesiredCapabilities.SAFARI.copy()

    @property
    def automatic_inspection(self) -> bool:
        """:Returns: The option Automatic Inspection value"""
        return self._caps.get(self.AUTOMATIC_INSPECTION)

    @automatic_inspection.setter
    def automatic_inspection(self, value: bool) -> None:
        """Sets the option Automatic Inspection to value.

        :Args:
         - value: boolean value
        """
        if not isinstance(value, bool):
            raise TypeError("Automatic Inspection must be a boolean")
        self.set_capability(self.AUTOMATIC_INSPECTION, value)

    @property
    def automatic_profiling(self) -> bool:
        """:Returns: The options Automatic Profiling value"""
        return self._caps.get(self.AUTOMATIC_PROFILING)

    @automatic_profiling.setter
    def automatic_profiling(self, value: bool) -> None:
        """Sets the option Automatic Profiling to value.

        :Args:
         - value: boolean value
        """
        if not isinstance(value, bool):
            raise TypeError("Automatic Profiling must be a boolean")
        self.set_capability(self.AUTOMATIC_PROFILING, value)

    @property
    def use_technology_preview(self) -> bool:
        """:Returns: whether BROWSER_NAME is equal to Safari Technology Preview"""
        return self._caps.get("browserName") == self.SAFARI_TECH_PREVIEW

    @use_technology_preview.setter
    def use_technology_preview(self, value: bool) -> None:
        """Sets browser name to Safari Technology Preview if value else to
        safari.

        :Args:
         - value: boolean value
        """
        if not isinstance(value, bool):
            raise TypeError("Use Technology Preview must be a boolean")
        self.set_capability("browserName", self.SAFARI_TECH_PREVIEW if value else "safari")
