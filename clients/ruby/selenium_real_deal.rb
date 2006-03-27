#!/usr/bin/env ruby

require 'test/unit'
require 'selenium'

class ExampleTest < Test::Unit::TestCase

	def setup
        @selenium = Selenium::SeleneseInterpreter.new("localhost", 4444, "*firefox", "http://localhost:4444", 10000);
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
		@selenium.assert_location("/selenium-server/tests/html/test_click_page2.html")
		@selenium.click("previousPage")
		@selenium.wait_for_page_to_load(5000)
		@selenium.assert_location("/selenium-server/tests/html/test_click_page1.html")
    end
end