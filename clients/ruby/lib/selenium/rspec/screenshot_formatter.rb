require "digest/md5"
require "base64"
require "rubygems"
require "spec"
require 'spec/runner/formatter/html_formatter'

module Selenium
  module RSpec
    class ScreenshotFormatter < Spec::Runner::Formatter::HtmlFormatter
      PLACEHOLDER = "<<placeholder>>"

      ################### Hooks? ########
  
      def start(example_count)
        super
        # ensure there's at least 1 example group header (normally 0 with deep_test)
        # prevents js and html validity errors
        example_group = Object.new
        def example_group.description; ""; end
        add_example_group(example_group)
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
  

      ###### Called from After each ####

      def self.capture_browser_state(selenium_driver, example)
        # Selenium RC seems to 'freeze' every so often when calling getHTMLSource, especially when DeepTest timeout is low, I need to investigate...
        # Set deeptest :timeout_in_seconds => 30 to see it happen
        capture_html_snapshot selenium_driver, example  
        capture_screenshot selenium_driver, example
      end
  
      def self.capture_html_snapshot(selenium_driver, example)
        html = selenium_driver.get_html_source
        File.open(file_for_html_capture(example), "w") { |f| f.write html }
      end

      def self.capture_screenshot(selenium_driver, example)
        selenium_driver.window_maximize
        encodedImage = selenium_driver.capture_screenshot_to_string
        pngImage = Base64.decode64(encodedImage)
        File.open(file_for_screenshot_capture(example), "w") { |f| f.write pngImage }
      end
  
      ################### Instrumentation ########
  
      def html_capture(example)
        dom_id = "example_" + self.class.hash_for_example(example)
        screenshot_url = self.class.relative_file_for_png_capture(example)
        snapshot_url = self.class.relative_file_for_html_capture(example)
        <<-EOS
          <div>[<a id="#{dom_id}_screenshot_link" href="javascript:toggleVisilibility('#{dom_id}_screenshot', 'Screenshot');">Show screenshot</a>]</div>
          <br/>      
          <div id="#{dom_id}_screenshot" style="display: none">
            <a href="#{screenshot_url}">
              <img width="80%" src="#{screenshot_url}" />
            </a>
          </div>
          <br/>
      
          <div>[<a id="#{dom_id}_snapshot_link" href=\"javascript:toggleVisilibility('#{dom_id}_snapshot', 'Snapshot')\">Show snapshot</a>]</div>
          <br/><br/>
          <div id="#{dom_id}_snapshot" class="dyn-source">
            <a href="#{snapshot_url}">Full screen</a><br/><br/>
            <iframe src="#{snapshot_url}" width="100%" height="600px" ></iframe>
          </div>
        EOS
      end
  
  
      def self.relative_file_for_html_capture(example)
        "resources/example_#{hash_for_example(example)}.html"
      end

      def self.relative_file_for_png_capture(example)
        "resources/example_#{hash_for_example(example)}.png"
      end
  
      def self.file_for_html_capture(example)
        file_name = capture_root_dir + "/example_#{hash_for_example(example)}.html"
        FileUtils.mkdir_p(capture_root_dir) unless File.directory?(capture_root_dir)
        file_name    
      end

      def self.file_for_screenshot_capture(example)
        file_name = capture_root_dir + "/example_#{hash_for_example(example)}.png"
        FileUtils.mkdir_p(capture_root_dir) unless File.directory?(capture_root_dir)
        file_name    
      end
  
      def self.hash_for_example(example)
        Digest::MD5.hexdigest example.implementation_backtrace.first
      end
  
  
      def self.capture_root_dir
        root_dir + "/resources"
      end

      def self.root_dir
        (ENV['CC_BUILD_ARTIFACTS'] || './tmp/rspec_report')
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