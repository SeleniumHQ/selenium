require 'rubygems'
gem "rspec", "=1.1.11"
gem "selenium-client", ">=1.2.9"
require "selenium/client"
require "selenium/rspec/spec_helper"

describe "Google Search" do
	attr_reader :selenium_driver
	alias :page :selenium_driver

  before(:all) do
      @selenium_driver = Selenium::Client::Driver.new "localhost", 4444, "*firefox", "http://www.google.com", 10000    
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
    page.type "q", "Selenium"
    page.click "btnG", :wait_for => :page
    page.value("q").should eql("Selenium")
    page.text?("selenium.openqa.org").should be_true
    page.title.should eql("Selenium - Google Search")
  end
    
end