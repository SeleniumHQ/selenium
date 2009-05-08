require 'rubygems'
require 'spec'
require 'base64'
require 'fileutils'
require File.expand_path(File.dirname(__FILE__) + "/rspec_extensions")
require File.expand_path(File.dirname(__FILE__) + "/reporting/selenium_test_report_formatter")

Spec::Runner.configure do |config|

  config.prepend_after(:each) do
    begin 
      if actual_failure?
        Selenium::RSpec::SeleniumTestReportFormatter.capture_system_state(selenium_driver, self)
      end
      if selenium_driver.session_started?
        selenium_driver.set_context "Ending example '#{self.description}'"
      end
    rescue Exception => e
      STDERR.puts "Problem while capturing system state" + e
    end
  end

  config.append_before(:each) do
    begin 
      if selenium_driver && selenium_driver.session_started?
        selenium_driver.set_context "Starting example '#{self.description}'"
      end
    rescue Exception => e
      STDERR.puts "Problem while setting context on example start" + e
    end
  end

end

