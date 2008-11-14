#!/usr/bin/env ruby
#
# Sample Test:Unit based test case using the selenium-client API
#
require "test/unit"
require "rubygems"
gem "selenium-client", ">=1.2.9"
require "selenium/client"

class ExampleTest < Test::Unit::TestCase
	attr_reader :browser
   
  def setup
    @browser = Selenium::Client::Driver.new "localhost", 4444, "*firefox", "http://www.google.com", 10000
    browser.start_new_browser_session
  end
    
  def teardown
    browser.close_current_browser_session
  end
  
  def test_page_search
		browser.open "/"
		assert_equal "Google", browser.title
		browser.type "q", "Selenium"
		browser.click "btnG", :wait_for => :page
		assert_equal "Selenium - Google Search", browser.title
		assert_equal "Selenium", browser.field("q")
		assert browser.text?("selenium.openqa.org")
		assert browser.element?("link=Cached")
  end
    
end
