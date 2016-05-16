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

import unittest
import logging
import tempfile
import shutil
from os.path import join, basename, dirname
from selenium import webdriver
from selenium.webdriver.firefox.firefox_binary import FirefoxBinary
from selenium.webdriver.firefox.options import Options


class FirefoxBinaryTests(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.custom_ff_path = cls.copy_system_ff_to_tmp_dir()
        cls.custom_ff_dir = dirname(cls.custom_ff_path)

    @classmethod
    def tearDownClass(cls):
        shutil.rmtree(cls.custom_ff_dir, ignore_errors=True)

    def tearDown(self):
        self.driver.quit()

    @staticmethod
    def copy_system_ff_to_tmp_dir():
        """Copy the system Firefox binary to a temporary directory."""
        default_ff_bin = FirefoxBinary()
        system_ff_path = default_ff_bin._get_firefox_start_cmd()
        tmp_dir = tempfile.mkdtemp()
        shutil.copy(system_ff_path, tmp_dir)
        return join(tmp_dir, basename(system_ff_path))

    def test_we_can_launch_with_custom_ff_binary_str(self):
        self.driver = webdriver.Firefox(firefox_binary=self.custom_ff_path)
        self.assertEqual(self.custom_ff_path, self.driver.binary._start_cmd)

    def test_we_can_launch_with_custom_ff_binary_obj(self):
        custom_ff_bin = FirefoxBinary(self.custom_ff_path)
        self.driver = webdriver.Firefox(firefox_binary=custom_ff_bin)
        self.assertEqual(self.custom_ff_path, self.driver.binary._start_cmd)

    def test_we_can_launch_with_dummy_options(self):
        self.driver = webdriver.Firefox(firefox_options=Options())
        self.assertNotEqual(self.custom_ff_path, self.driver.binary._start_cmd)

    def test_we_can_launch_with_dummy_options_and_custom_ff_binary_str(self):
        self.driver = webdriver.Firefox(firefox_binary=self.custom_ff_path,
                                        firefox_options=Options())
        self.assertEqual(self.custom_ff_path, self.driver.binary._start_cmd)

    def test_we_can_launch_with_dummy_options_and_custom_ff_binary_obj(self):
        custom_ff_bin = FirefoxBinary(self.custom_ff_path)
        self.driver = webdriver.Firefox(firefox_binary=custom_ff_bin,
                                        firefox_options=Options())
        self.assertEqual(self.custom_ff_path, self.driver.binary._start_cmd)

    def test_we_can_launch_with_options_binary_location(self):
        firefox_options = Options()
        firefox_options.binary_location = self.custom_ff_path
        self.driver = webdriver.Firefox(firefox_options=firefox_options)
        self.assertEqual(self.custom_ff_path, self.driver.binary._start_cmd)

    def test_custom_ff_bin_obj_should_overwrite_options_binary_location(self):
        firefox_options = Options()
        firefox_options.binary_location = self.copy_system_ff_to_tmp_dir()
        custom_ff_bin = FirefoxBinary(self.custom_ff_path)
        self.driver = webdriver.Firefox(firefox_binary=custom_ff_bin,
                                        firefox_options=firefox_options)
        self.assertEqual(self.custom_ff_path, self.driver.binary._start_cmd)

    def test_custom_ff_bin_str_should_overwrite_options_binary_location(self):
        firefox_options = Options()
        firefox_options.binary_location = self.copy_system_ff_to_tmp_dir()
        self.driver = webdriver.Firefox(firefox_binary=self.custom_ff_path,
                                        firefox_options=firefox_options)
        self.assertEqual(self.custom_ff_path, self.driver.binary._start_cmd)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    unittest.main()
