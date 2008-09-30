#!/usr/bin/env ruby
#
# Sample Ruby script using the Selenium client API
#
require "test/unit"
require "rubygems"
require "selenium/client"

begin
  @browser = Selenium::Client::Driver.new("localhost", 4444, "*firefox", "http://www.google.com", 10000);
  @browser.start_new_browser_session
	@browser.open "/"
	@browser.type "q", "Selenium"
	@browser.click "btnG", :wait_for => :page
	puts @browser.text?("selenium.openqa.org")
ensure
  @browser.close_current_browser_session    
end

