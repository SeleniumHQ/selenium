#!/usr/bin/env ruby
#
# Sample Test:Unit based test case using the selenium-client API
#
require "test/unit"
require "rubygems"
gem "selenium-client", ">=1.2.15"
require "selenium/client"

class ExampleTest < Test::Unit::TestCase
	attr_reader :browser
   
  def setup
    @browser = Selenium::Client::Driver.new \
        :host => "localhost", 
        :port => 4444, 
        :browser => "*firefox", 
        :url => "http://www.google.com", 
        :timeout_in_second => 60

    browser.start_new_browser_session
  end
    
  def teardown
    browser.close_current_browser_session
  end
  
  def test_page_search
		browser.open "/"
		assert_equal "Google", browser.title
		browser.type "q", "Selenium seleniumhq"
		browser.click "btnG", :wait_for => :page
		assert_equal "Selenium seleniumhq - Google Search", browser.title
		assert_equal "Selenium seleniumhq", browser.field("q")
		assert browser.text?("seleniumhq.org")
		assert browser.element?("link=Cached")
  end
    
end
