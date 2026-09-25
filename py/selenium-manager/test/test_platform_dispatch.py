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

from selenium_manager import _module_name


class PlatformDispatchTest(unittest.TestCase):
    def test_linux_dispatches_on_architecture(self):
        self.assertEqual(_module_name("linux", "x86_64"), "selenium_manager_linux_x86_64")
        self.assertEqual(_module_name("linux", "aarch64"), "selenium_manager_linux_aarch64")

    def test_macos_is_universal(self):
        for machine in ("x86_64", "arm64"):
            self.assertEqual(_module_name("darwin", machine), "selenium_manager_macos")

    def test_windows_binary_covers_every_architecture(self):
        for machine in ("x86", "AMD64", "ARM64"):
            self.assertEqual(_module_name("win32", machine), "selenium_manager_windows")

    def test_unsupported_linux_architecture_lists_the_supported_ones(self):
        with self.assertRaises(SystemExit) as context:
            _module_name("linux", "riscv64")
        self.assertIn("riscv64", str(context.exception))
        self.assertIn("x86_64", str(context.exception))
        self.assertIn("aarch64", str(context.exception))

    def test_unsupported_platform(self):
        with self.assertRaises(SystemExit) as context:
            _module_name("freebsd14", "x86_64")
        self.assertIn("freebsd14", str(context.exception))

    def test_module_names_match_their_distribution_names(self):
        # main() turns the module name into the pip install hint by swapping
        # underscores for hyphens, so the two have to stay in step.
        expected = {
            "selenium_manager_linux_x86_64": "selenium-manager-linux-x86-64",
            "selenium_manager_linux_aarch64": "selenium-manager-linux-aarch64",
            "selenium_manager_macos": "selenium-manager-macos",
            "selenium_manager_windows": "selenium-manager-windows",
        }
        for module_name, distribution in expected.items():
            self.assertEqual(module_name.replace("_", "-"), distribution)


if __name__ == "__main__":
    unittest.main()
