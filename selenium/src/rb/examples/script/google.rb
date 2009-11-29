#!/usr/bin/env ruby
#
# Sample Ruby script using the Selenium client API
#
require "rubygems"
gem "selenium-client", ">=1.2.15"
require "selenium/client"

begin
  @browser = Selenium::Client::Driver.new \
      :host => "localhost", 
      :port => 4444, 
      :browser => "*firefox", 
      :url => "http://www.google.com", 
      :timeout_in_second => 60

  @browser.start_new_browser_session
	@browser.open "/"
	@browser.type "q", "Selenium seleniumhq.org"
	@browser.click "btnG", :wait_for => :page
	puts @browser.text?("seleniumhq.org")
ensure
  @browser.close_current_browser_session    
end

