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

import psutil
import unittest
import logging
from selenium import webdriver


class PhantomJSLauncherTests(unittest.TestCase):

    def testLaunchAndCloseBrowserWithoutLeakingCookieTempFileDescriptor(self):

        # psutil module is used to get num open file descritors across platforms
        self.p = psutil.Process()

        self.num_fds_samples = []

        self.driver = webdriver.PhantomJS()
        self.driver.quit()

        self.num_fds_samples.append(self.p.num_fds())

        self.driver = webdriver.PhantomJS()
        self.driver.quit()

        self.num_fds_samples.append(self.p.num_fds())

        self.driver = webdriver.PhantomJS()
        self.driver.quit()

        self.num_fds_samples.append(self.p.num_fds())

        assert max(self.num_fds_samples) == min(self.num_fds_samples)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    unittest.main()
