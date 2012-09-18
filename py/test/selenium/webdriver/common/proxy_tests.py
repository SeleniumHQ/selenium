#!/usr/bin/python

# Copyright 2012 Software Freedom Conservancy.
#
# Licensed under the Apache License, Version 2.0 (the "License")
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS.
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.


import unittest
from selenium.webdriver.common.proxy import Proxy


class ProxyTests(unittest.TestCase):

    def testCanAddToDesiredCapabilities(self):
        desired_capabilities = {}
        proxy = Proxy()
        proxy.http_proxy = 'some.url:1234'

        proxy.add_to_capabilities(desired_capabilities)

        expected_capabilities = {
            'proxy': {
                'proxyType': 'MANUAL',
                'httpProxy': 'some.url:1234'
            }
        }

        self.assertEqual(expected_capabilities, desired_capabilities)
