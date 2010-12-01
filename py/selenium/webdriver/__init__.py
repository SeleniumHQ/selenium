#!/usr/bin/python
#
# Copyright 2008-2010 Webdriver_name committers
# Copyright 2008-2010 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.


def connect(driver_name, server_address='http://127.0.0.1:4444', browser_name='', version='', platform='ANY', javascript_enabled=True):
    """Usage:
        driver_name: use 'firefox', 'ie', 'chrome' or 'remote'.
        server_address: only needed if you are using 'remote'. Do not add /wd/hub/ we will do that for you.
        browser_name: only needed if you are using 'remote'. Use the browser you want to test on,
            or leave blank and we will pick any available browser on the machine.
        version: choose a browser version, or leave blank and we will pick any available version.
        platform, choose a platform or leave default of 'ANY'
        javascript_enabled: True or False. Default is True.
    """
    driver_name = driver_name.strip('*').lower()
    path = '/wd/hub'
    if driver_name.lower() == 'firefox':
        from firefox.webdriver import WebDriver as firefox_driver
        return firefox_driver()
    if driver_name.lower() == 'ie':
        from ie.webdriver import WebDriver as ie_driver
        return ie_driver()
    if driver_name.lower() == 'chrome':
        from chrome.webdriver import WebDriver as chrome_driver
        return chrome_driver()
    if driver_name.lower() == 'remote':
        if not path.startswith("/"):
            path = "/" + path
        if not server_address.startswith("http://"):
            server_address = "http://" + server_address
        from remote import webdriver as remote_driver
        wd = remote_driver.connect(driver_name, server_address, path, browser_name, version, platform, javascript_enabled)
        return wd
