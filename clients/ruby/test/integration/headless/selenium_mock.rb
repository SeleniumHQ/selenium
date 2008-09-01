#!/usr/bin/env ruby

# Copyright 2008 ThoughtWorks, Inc
#
#  Licensed under the Apache License, Version 2.0 (the "License");
#  you may not use this file except in compliance with the License.
#  You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
#  Unless required by applicable law or agreed to in writing, software
#  distributed under the License is distributed on an "AS IS" BASIS,
#  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#  See the License for the specific language governing permissions and
#  limitations under the License.
#


require File.expand_path(File.dirname(__FILE__) + "/../../test_helper")

class MockTest < Test::Unit::TestCase

	def setup
    @selenium = Selenium::SeleniumDriver.new("localhost", 4444, "*mock", "http://localhost:4444", 10000);
    @selenium.start
  end
    
  def teardown
    @selenium.stop
  end

  def test_something
		@selenium.open("/selenium-server/tests/html/test_i18n.html")
		@selenium.click("foo")
		assert_equal("x", @selenium.title())
		assert(@selenium.is_alert_present());
		links = @selenium.get_all_links()
		assert(links.length == 1)
		assert_equal("1", links[0])
		fields = @selenium.get_all_fields()
		assert(fields.length == 3)
		assert_equal("1", fields[0])
		assert_equal("2", fields[1])
		assert_equal("3", fields[2])
  end
  
end