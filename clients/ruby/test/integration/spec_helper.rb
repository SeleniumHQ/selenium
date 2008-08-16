require 'rubygems'
require 'spec'
require 'base64'
require 'fileutils'
require File.expand_path(File.dirname(__FILE__) + "/../../lib/selenium")
require File.expand_path(File.dirname(__FILE__) + "/../../lib/selenium/rspec/rspec_extensions")
require File.expand_path(File.dirname(__FILE__) + "/../../lib/selenium/rspec/reporting/selenium_test_report_formatter")

Spec::Runner.configure do |config|

  config.before(:each) do
    remote_control_server = ENV['SELENIUM_REMOTE_CONTROL'] || "localhost"
    port = ENV['SELENIUM_PORT'] || 4444
    browser = ENV['SELENIUM_BROWSER'] || "*chrome"
    application_host = ENV['SELENIUM_APPLICATION_HOST'] || "localhost"
    application_port = ENV['SELENIUM_APPLICATION_PORT'] || "4444"
    timeout = 60
    @selenium_driver = Selenium::SeleniumDriver.new(remote_control_server, port, browser, "http://#{application_host}:#{application_port}", timeout)
  end

  config.after(:each) do
    Selenium::RSpec::SeleniumTestReportFormatter.capture_system_state(@selenium_driver, self) if execution_error
    @selenium_driver.stop
  end

  def selenium_driver
    @selenium_driver
  end
    
  def page
    @selenium_driver
  end
  
end

