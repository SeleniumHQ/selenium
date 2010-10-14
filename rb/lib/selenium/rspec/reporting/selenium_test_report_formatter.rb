#
# Explicit requires in this file so that we can invoke RSpec runner with a
# single:
#   --require 'lib/selenium/rspec/reporting/selenium_test_report_formatter'
#
require "digest/md5"
require "base64"
require 'tmpdir'
require "rubygems"
gem "rspec", ">=1.2.8"
require "spec"
require 'spec/runner/formatter/html_formatter'
require File.expand_path(File.dirname(__FILE__) + "/file_path_strategy")
require File.expand_path(File.dirname(__FILE__) + "/system_capture")
require File.expand_path(File.dirname(__FILE__) + "/html_report")

module Selenium
  module RSpec    
      
    class SeleniumTestReportFormatter < Spec::Runner::Formatter::HtmlFormatter

      def initialize(options, output)
        super
        raise "Unexpected output type #{output.inspect}" unless output.kind_of?(String)
        @@file_path_strategy = Selenium::RSpec::Reporting::FilePathStrategy.new(output)
      end

      def start(example_count)
        super
        # ensure there's at least 1 example group header (normally 0 with deep_test)
        # prevents js and html validity errors
        example_group = Object.new
        def example_group.description; ""; end
        example_group_started example_group
      end  
  
      def move_progress
        # we don't have current_example_number, and we don't really care about the progress bar
      end  
  
      def extra_failure_content(failure)
        Selenium::RSpec::Reporting::HtmlReport.inject_placeholder(super)
      end
  
      def example_pending(example_proxy, message, deprecated_pending_location=nil)
        super
      end
  
      def example_failed(example, counter, failure)        
        old_output = @output
        @output = StringIO.new
        super
        
        result = @output.string
        report = Selenium::RSpec::Reporting::HtmlReport.new(@@file_path_strategy)
        report.replace_placeholder_with_system_state_content(result, example)
        old_output.puts result
        old_output.flush
      ensure
        @output = old_output
      end
  
      # Should be called from config.after(:each) in spec helper
      def self.capture_system_state(selenium_driver, example)
        system_capture = Selenium::RSpec::Reporting::SystemCapture.new(selenium_driver, example, file_path_strategy)
        system_capture.capture_system_state                      
      end

      def global_scripts
        Selenium::RSpec::Reporting::HtmlReport.append_javascript(super)
      end
      
      def global_styles
        Selenium::RSpec::Reporting::HtmlReport.append_css(super)
      end

      def self.file_path_strategy
	      ### HACK ####
	      # When running with DeepTest the class instance variable could not have been set
	      # For now you must set the env variable before launching the tests. We need to revisit the way DeepTest
	      # and RSpec reporting work for a proper fix.
	      @@file_path_strategy ||= Selenium::RSpec::Reporting::FilePathStrategy.new(ENV["SELENIUM_TEST_REPORT_FILE"])
	    end
  
    end
  end
end
