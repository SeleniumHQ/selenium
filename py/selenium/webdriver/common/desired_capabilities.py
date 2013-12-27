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

class __ClassProperty__(property):
    def __get__(self, cls, owner):
        return self.fget.__get__(None, owner)()

class DesiredCapabilities(object):
    """
    Set of supported desired capabilities.
    
    Use this as a starting point for creating a desired capabilities object for 
    requesting remote webdrivers from selenium server or selenium grid.


    Usage Example:

        from selenium import webdriver

        selenium_grid_url = "http://198.0.0.1:4444/wd/hub"

        # Create a desired capabilities object as a starting point.
        capabilities = DesiredCapabilities.FIREFOX 
        capabilities['platform'] = "WINDOWS"
        capabilities['version'] = "10"

        # Instantiate an instance of Remote WebDriver with the desired capabilities.
        driver = webdriver.Remote(desired_capabilities=capabilities, 
                                  command_executor=selenium_grid_url) 


    """

    __FIREFOX__ = {
        "browserName": "firefox",
        "version": "",
        "platform": "ANY",
        "javascriptEnabled": True,
    }

    @__ClassProperty__
    @classmethod
    def FIREFOX(cls):
        return cls.__FIREFOX__.copy()


    __INTERNETEXPLORER__ = {
        "browserName": "internet explorer",
        "version": "",
        "platform": "WINDOWS",
        "javascriptEnabled": True,
    }

    @__ClassProperty__
    @classmethod
    def INTERNETEXPLORER(cls):
        return cls.__FIREFOX__.copy()


    __CHROME__ = {
        "browserName": "chrome",
        "version": "",
        "platform": "ANY",
        "javascriptEnabled": True,
    }

    @__ClassProperty__
    @classmethod
    def CHROME(cls):
        return cls.__CHROME__.copy()

    __OPERA__ = {
        "browserName": "opera",
        "version": "",
        "platform": "ANY",
        "javascriptEnabled": True,
    }

    @__ClassProperty__
    @classmethod
    def OPERA(cls):
        return cls.__OPERA__.copy()

    __SAFARI__ = {
        "browserName": "safari",
        "version": "",
        "platform": "ANY",
        "javascriptEnabled": True,
    }

    @__ClassProperty__
    @classmethod
    def SAFARI(cls):
        return cls.__SAFARI__.copy()

    __HTMLUNIT__ = {
        "browserName": "htmlunit",
        "version": "",
        "platform": "ANY",
    }

    @__ClassProperty__
    @classmethod
    def HTMLUNIT(cls):
        return cls.__HTMLUNIT__.copy()

    __HTMLUNITWITHJS__ = {
        "browserName": "htmlunit",
        "version": "firefox",
        "platform": "ANY",
        "javascriptEnabled": True,
    }

    @__ClassProperty__
    @classmethod
    def HTMLUNITWITHJS(cls):
        return cls.__HTMLUNITWITHJS__.copy()

    __IPHONE__ = {
        "browserName": "iPhone",
        "version": "",
        "platform": "MAC",
        "javascriptEnabled": True,
    }

    @__ClassProperty__
    @classmethod
    def IPHONE(cls):
        return cls.__IPHONE__.copy()

    __IPAD__ = {
        "browserName": "iPad",
        "version": "",
        "platform": "MAC",
        "javascriptEnabled": True,
    }

    @__ClassProperty__
    @classmethod
    def IPAD(cls):
        return cls.__IPAD__.copy()

    __ANDROID__ = {
        "browserName": "android",
        "version": "",
        "platform": "ANDROID",
        "javascriptEnabled": True,
    }

    @__ClassProperty__
    @classmethod
    def ANDROID(cls):
        return cls.__ANDROID__.copy()

    __PHANTOMJS__ = {
        "browserName":"phantomjs",
        "version": "",
        "platform": "ANY",
        "javascriptEnabled": True,
    }

    @__ClassProperty__
    @classmethod
    def PHANTOMJS(cls):
        return cls.__PHANTOMJS__.copy()



