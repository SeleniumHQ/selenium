#
# Explicit requires in this file so that we can invoke RSpec runner with a
# single:
#   --require 'lib/selenium/rspec/reporting/selenium_test_report_formatter'
#
require "digest/md5"
require "base64"
require "rubygems"
require "spec"
require 'spec/runner/formatter/html_formatter'
require File.expand_path(File.dirname(__FILE__) + "/file_path_strategy")
require File.expand_path(File.dirname(__FILE__) + "/system_capture")
require File.expand_path(File.dirname(__FILE__) + "/html_report")

module Selenium
  module RSpec    
      
    class SeleniumTestReportFormatter < Spec::Runner::Formatter::HtmlFormatter

      def start(example_count)
        super
        # ensure there's at least 1 example group header (normally 0 with deep_test)
        # prevents js and html validity errors
        example_group = Object.new
        def example_group.description; ""; end
        add_example_group(example_group)
        @@file_path_strategy = Selenium::RSpec::Reporting::FilePathStrategy.new(@where)
      end  
  
      def move_progress
        # we don't have current_example_number, and we don't really care about the progress bar
      end  
  
      def extra_failure_content(failure)
        Selenium::RSpec::Reporting::HtmlReport.inject_placeholder(super)
      end
  
      def example_passed(example)
        include_example_group_description example
        super
      end
  
      def example_pending(example_group_description, example, message)
        include_example_group_description example
        super
      end
  
      def example_failed(example, counter, failure)
        include_example_group_description example
        
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
        system_capture = Selenium::RSpec::Reporting::SystemCapture.new(selenium_driver, example, @@file_path_strategy)
        system_capture.capture_system_state                      
      end

        def global_scripts
          Selenium::RSpec::Reporting::HtmlReport.append_javascript(super)
        end

        def global_styles
          Selenium::RSpec::Reporting::HtmlReport.append_css(super)
        end

      protected
        
      def include_example_group_description(example)
        def example.description
          self.class.description.to_s + " :: " + super
        end
      end
  
    end
  end
end