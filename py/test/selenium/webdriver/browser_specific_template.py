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

# flake8: noqa

##CUSTOM_TEST_IMPORT##
from selenium import webdriver
from selenium.##PACKAGE_NAME## import ##GENERAL_FILENAME##
from selenium.test.selenium.webdriver.common.webserver import SimpleWebServer
from selenium.test.selenium.webdriver.common.network import get_lan_ip

def setup_module(module):
    ##CUSTOM_TEST_SETUP##
    webserver = SimpleWebServer(host=get_lan_ip())
    webserver.start()
    ##BROWSER_SPECIFIC_TEST_CLASS##.webserver = webserver
    ##BROWSER_SPECIFIC_TEST_CLASS##.driver = webdriver.##BROWSER_CONSTRUCTOR##


class ##BROWSER_SPECIFIC_TEST_CLASS##(##GENERAL_FILENAME##.##GENERAL_TEST_CLASS##):
    pass


def teardown_module(module):
    try:
        ##BROWSER_SPECIFIC_TEST_CLASS##.webserver.stop()
    except AttributeError:
        pass

    ##BROWSER_SPECIFIC_TEST_CLASS##.driver.quit()
    ##CUSTOM_TEST_TEARDOWN##
