module Selenium
  module RSpec
    module Reporting
            
      class HtmlReport

        PLACEHOLDER = "<<placeholder>>"

        def initialize(file_path_strategy)
          @file_path_strategy = file_path_strategy
        end

        def self.inject_place_holder(content)
          content + Selenium::RSpec::Reporting::HtmlReport::PLACEHOLDER
        end
        
        def replace_placeholder_with_system_state_content(result, example)
          result.gsub! PLACEHOLDER, html_capture(example)
        end
        
        def html_capture(example)
          dom_id = "example_" + @file_path_strategy.example_hash(example)
          screenshot_url = @file_path_strategy.relative_file_path_for_png_capture(example)
          snapshot_url = @file_path_strategy.relative_file_path_for_html_capture(example)
          remote_control_logs_url = @file_path_strategy.relative_file_path_for_remote_control_logs(example)
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
end