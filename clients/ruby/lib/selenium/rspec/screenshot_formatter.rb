#
# Explicit requires in this file so that we can invoke RSpec runner with a
# single:
#   --require 'lib/selenium/rspec/screenshot_formatter'
#
require "digest/md5"
require "base64"
require "rubygems"
require "spec"
require 'spec/runner/formatter/html_formatter'
require File.expand_path(File.dirname(__FILE__) + "/reporting/file_path_strategy")
require File.expand_path(File.dirname(__FILE__) + "/reporting/system_capture")

module Selenium
  module RSpec
    
      
    class SeleniumTestReportFormatter < Spec::Runner::Formatter::HtmlFormatter
      PLACEHOLDER = "<<placeholder>>"

      #
      # Hooks?
      #
  
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
        super + PLACEHOLDER
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
        result.gsub! PLACEHOLDER, html_capture(example)
        old_output.puts result
        old_output.flush
      ensure
        @output = old_output
      end
  
      # Should be called from config.after(:each) in spec helper
      def self.capture_system_state(selenium_driver, example)
        puts ">>>> formatter : capture_system_state"

        puts @@file_path_strategy.inspect
        system_capture = Selenium::RSpec::Reporting::SystemCapture.new(
                               selenium_driver, example, @@file_path_strategy)
        system_capture.capture_system_state                      
      end
  
  
      ################### Instrumentation ########
  
      def html_capture(example)
        dom_id = "example_" + @@file_path_strategy.example_hash(example)
        screenshot_url = @@file_path_strategy.relative_file_path_for_png_capture(example)
        snapshot_url = @@file_path_strategy.relative_file_path_for_html_capture(example)
        remote_control_logs_url = @@file_path_strategy.relative_file_path_for_remote_control_logs(example)
        <<-EOS
          <div>[<a id="#{dom_id}_screenshot_link" href="javascript:toggleVisilibility('#{dom_id}_screenshot', 'Screenshot');">Show system screenshot</a>]</div>
          <br/>      
          <div id="#{dom_id}_screenshot" style="display: none">
            <a href="#{screenshot_url}">
              <img width="80%" src="#{screenshot_url}" />
            </a>
          </div>
          <br/>
      
          <div>[<a id="#{dom_id}_snapshot_link" href=\"javascript:toggleVisilibility('#{dom_id}_snapshot', 'HTML Snapshot')\">Show HTML snapshot</a>]</div>
          <br/><br/>
          <div id="#{dom_id}_snapshot" class="dyn-source">
            <a href="#{snapshot_url}">Full screen</a><br/><br/>
            <iframe src="#{snapshot_url}" width="100%" height="600px" ></iframe>
          </div>

          <div>[<a id="#{dom_id}_rc_logs_link" href=\"javascript:toggleVisilibility('#{dom_id}_rc_logs', 'Remote Control Logs')\">Show Remote Control Logs</a>]</div>
          <br/><br/>
          <div id="#{dom_id}_rc_logs" class="dyn-source">
            <a href="#{remote_control_logs_url}">Full screen</a><br/><br/>
            <iframe src="#{remote_control_logs_url}" width="100%" height="600px" ></iframe>
          </div>
        EOS
      end
    
      def include_example_group_description(example)
        def example.description
          self.class.description.to_s + " :: " + super
        end
      end
  
      def report_header
        super + "\n<script type=\"text/javascript\">moveProgressBar('100.0');</script>"
      end

      def global_scripts
        super + <<-EOF
    function toggleVisilibility(id, description) {
      var section;
      var link;

      section = document.getElementById(id);
      link = document.getElementById(id + "_link");

      if (section.style.display == "block") {
        section.style.display = "none"
        link.innerHTML = description
      } else {
        section.style.display = "block"
        link.innerHTML = "Hide " + description
      }
    }
    EOF
      end

      def global_styles
        super + <<-EOF
    div.rspec-report textarea {
      width: 100%;
    }

    div.rspec-report .dyn-source {
      background: #FFFFEE none repeat scroll 0%;
      border:1px dotted black;
      color: #000000;
      display: none;
      margin: 0.5em 2em;
      padding: 0.5em;
    }
    EOF
      end
    end
  end
end