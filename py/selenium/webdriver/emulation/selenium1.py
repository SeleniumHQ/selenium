#!/usr/bin/python
#
# Copyright 2011 Webdriver_name committers
# Copyright 2011 Google Inc.
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

from selenium.selenium import selenium
import selenium.webdriver.emulation.base as base
import selenium.webdriver.emulation.navigation as navigation

class DrivenSelenium(selenium):
  def __init__(self, driver, browserUrl):
	self.driver = driver
	self.browserUrl = browserUrl
	
  def start(self, browserConfigurationOptions=None):
    # This become a no-op. Should we blow up at this point?
    pass

  @property
  def webdriver(self):
	return self.driver
	
  def __getattribute__(self, attr):
    if not attr.startswith('_') and hasattr(navigation, attr):
      value = getattr(navigation, attr)
      if issubclass(value, base.BaseCommand):
        return value(self.driver, self.browserUrl)
	
    return super(DrivenSelenium, self).__getattribute__(attr)
