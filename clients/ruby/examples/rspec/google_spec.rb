require 'rubygems'
gem "rspec", "=1.2.6"
gem "selenium-client", ">=1.2.15"
require "selenium/client"
require "selenium/rspec/spec_helper"

describe "Google Search" do
	attr_reader :selenium_driver
	alias :page :selenium_driver

  before(:all) do
      @selenium_driver = Selenium::Client::Driver.new \
          :host => "localhost", 
          :port => 4444, 
          :browser => "*firefox", 
          :url => "http://www.google.com", 
          :timeout_in_second => 60
  end
  
  before(:each) do
    selenium_driver.start_new_browser_session
  end
  
  # The system capture need to happen BEFORE closing the Selenium session 
  append_after(:each) do    
    @selenium_driver.close_current_browser_session
  end

  it "can find Selenium" do    
    page.open "/"
    page.title.should eql("Google")
    page.type "q", "Selenium seleniumhq"
    page.click "btnG", :wait_for => :page
    page.value("q").should eql("Selenium seleniumhq")
    page.text?("seleniumhq.org").should be_true
    page.title.should eql("Selenium seleniumhq - Google Search")
    page.text?("seleniumhq.org").should be_true
		page.element?("link=Cached").should be_true		
  end
    
end
