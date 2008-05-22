#!/usr/bin/env ruby

# Copyright 2006 ThoughtWorks, Inc
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


require File.expand_path(File.dirname(__FILE__) + "/../test_helper")

class ExampleTest < Test::Unit::TestCase

	def setup
    @selenium = Selenium::SeleniumDriver.new("localhost", 4444, "*firefox", "http://localhost:4444", 10000);
    @selenium.start
  end
    
  def teardown
    @selenium.stop
  end

  def test_something
		@selenium.open("/selenium-server/tests/html/test_click_page1.html")
		assert(@selenium.get_text("link").index("Click here for next page") != nil, "link 'link' doesn't contain expected text")
		links = @selenium.get_all_links()
		assert(links.length > 3)
		assert_equal("linkToAnchorOnThisPage", links[3])
		@selenium.click("link")
		@selenium.wait_for_page_to_load(5000)
		assert(@selenium.get_location =~ %r"/selenium-server/tests/html/test_click_page2.html")
		@selenium.click("previousPage")
		@selenium.wait_for_page_to_load(5000)
		assert(@selenium.get_location =~ %r"/selenium-server/tests/html/test_click_page1.html")
  end
  
end