require 'rubygems'
require 'spec'
require 'base64'
require 'fileutils'
require File.expand_path(File.dirname(__FILE__) + "/../../lib/selenium")
require File.expand_path(File.dirname(__FILE__) + "/../../lib/selenium/rspec/rspec_extensions")
require File.expand_path(File.dirname(__FILE__) + "/../../lib/selenium/rspec/screenshot_formatter")

Spec::Runner.configure do |config|
  include SeleniumHelper

  config.before(:each) do
    remote_control_server = ENV['SELENIUM_REMOTE_CONTROL'] || "localhost"
    port = ENV['SELENIUM_PORT'] || 4444
    browser = ENV['SELENIUM_BROWSER'] || "*chrome"
    application_host = ENV['SELENIUM_APPLICATION_HOST'] || "google.com"
    application_port = ENV['SELENIUM_APPLICATION_PORT'] || "80"
    timeout = 60
    @selenium = Selenium::SeleniumDriver.new(remote_control_server, port, browser, "http://#{application_host}:#{application_port}", timeout)
  end

  config.after(:each) do
    puts ">>>> spec helper : capture_system_state"
    Selenium::RSpec::SeleniumTestReportFormatter.capture_system_state(@selenium, self) #if execution_error
    @selenium.stop
  end
      
end

