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

import base64
import os

from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
from selenium.webdriver.chromium.options import ChromiumOptions


class Options(ChromiumOptions):
    KEY = "goog:chromeOptions"

    @property
    def default_capabilities(self):
        return DesiredCapabilities.CHROME.copy()

    def to_capabilities(self):
        """
        Creates a capabilities with all the options that have been set and

        :Returns: A dictionary with everything
        """
        return super(Options, self).to_capabilities(self.KEY)
