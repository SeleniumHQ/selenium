# Copyright 2008-2009 WebDriver committers
# Copyright 2008-2009 Google Inc.
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

"""
The Desired Capabilities implementation.
"""

class DesiredCapabilities(object):
    """
    Set of default supported desired capabilities.

    Use this as a starting point for creating a desired capabilities object for 
    requesting remote webdrivers for connecting to selenium server or selenium grid.


    Usage Example:

        from selenium import webdriver

        selenium_grid_url = "http://198.0.0.1:4444/wd/hub"

        # Create a desired capabilities object as a starting point.
        capabilities = DesiredCapabilities.FIREFOX.copy()
        capabilities['platform'] = "WINDOWS"
        capabilities['version'] = "10"

        # Instantiate an instance of Remote WebDriver with the desired capabilities.
        driver = webdriver.Remote(desired_capabilities=capabilities, 
                                  command_executor=selenium_grid_url)

    Note: Always use '.copy()' on the DesiredCapabilities object to avoid the side
    effects of altering the Global class instance.

    """

    FIREFOX = {
        "browserName": "firefox",
        "version": "",
        "platform": "ANY",
        "javascriptEnabled": True,
    }

    INTERNETEXPLORER = {
        "browserName": "internet explorer",
        "version": "",
        "platform": "WINDOWS",
        "javascriptEnabled": True,
    }

    CHROME = {
        "browserName": "chrome",
        "version": "",
        "platform": "ANY",
        "javascriptEnabled": True,
    }

    OPERA = {
        "browserName": "opera",
        "version": "",
        "platform": "ANY",
        "javascriptEnabled": True,
    }

    SAFARI = {
        "browserName": "safari",
        "version": "",
        "platform": "ANY",
        "javascriptEnabled": True,
    }

    HTMLUNIT = {
        "browserName": "htmlunit",
        "version": "",
        "platform": "ANY",
    }

    HTMLUNITWITHJS = {
        "browserName": "htmlunit",
        "version": "firefox",
        "platform": "ANY",
        "javascriptEnabled": True,
    }

    IPHONE = {
        "browserName": "iPhone",
        "version": "",
        "platform": "MAC",
        "javascriptEnabled": True,
    }

    IPAD = {
        "browserName": "iPad",
        "version": "",
        "platform": "MAC",
        "javascriptEnabled": True,
    }

    ANDROID = {
        "browserName": "android",
        "version": "",
        "platform": "ANDROID",
        "javascriptEnabled": True,
    }

    PHANTOMJS = {
        "browserName":"phantomjs",
        "version": "",
        "platform": "ANY",
        "javascriptEnabled": True,
    }

