require 'rubygems'
require 'spec'
require 'base64'
require 'fileutils'
require File.expand_path(File.dirname(__FILE__) + "/rspec_extensions")
require File.expand_path(File.dirname(__FILE__) + "/reporting/selenium_test_report_formatter")

Spec::Runner.configure do |config|

  config.after(:each) do
    begin 
      Selenium::RSpec::SeleniumTestReportFormatter.capture_system_state(selenium_driver, self) if execution_error
      if selenium_driver.session_started?
        selenium_driver.set_context "Ending example '#{self.description}'"
      end
    rescue Exception => e
      STDERR.puts "Problem while capturing system state" + e
    end
  end

end

