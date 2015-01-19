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

from __future__ import absolute_import
from __future__ import division
from __future__ import print_function
from __future__ import unicode_literals
from selenium.webdriver.common import platforms


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

    @property
    def FIREFOX(self):
        return dict(browserName='firefox', version='',
                    platform=platforms.ANY, javascriptEnabled=True)

    @property
    def INTERNETEXPLORER(self):
        return dict(browserName='internet explorer', version='',
                    platform=platforms.WINDOWS, javascriptEnabled=True)

    @property
    def CHROME(self):
        return dict(browserName='chrome', version='',
                    platform=platforms.ANY, javascriptEnabled=True)

    @property
    def OPERA(self):
        return dict(browserName='opera', version='',
                    platform=platforms.ANY, javascriptEnabled=True)

    @property
    def SAFARI(self):
        return dict(browserName='safari', version='',
                    platform=platforms.ANY, javascriptEnabled=True)

    @property
    def HTMLUNIT(self):
        return dict(browserName='htmlunit', version='',
                    platform=platforms.ANY, javascriptEnabled=False)

    @property
    def HTMLUNITWITHJS(self):
        return dict(browserName='htmlunit', version='',
                    platform=platforms.ANY, javascriptEnabled=True)

    @property
    def IPHONE(self):
        return dict(browserName='iPhone', version='',
                    platform=platforms.MAC, javascriptEnabled=True)

    @property
    def IPAD(self):
        return dict(browserName='iPad', version='',
                    platform=platforms.MAC, javascriptEnabled=True)

    @property
    def ANDROID(self):
        return dict(browserName='android', version='',
                    platform=platforms.ANDROID, javascriptEnabled=True)

    @property
    def PHANTOMJS(self):
        return dict(browserName='phantomjs', version='',
                    platform=platforms.ANY, javascriptEnabled=True)
