module Selenium
  module RSpec
    module Reporting
            
      class HtmlReport

        PLACEHOLDER = "<<placeholder>>"

        def initialize(file_path_strategy)
          @file_path_strategy = file_path_strategy
        end

        def self.inject_placeholder(content)
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
            #{toggable_section(dom_id, :id => "snapshot", :url=> snapshot_url, :name => "Dynamic HTML Snapshot")}
            #{toggable_section(dom_id, :id => "rc_logs", :url=> remote_control_logs_url, :name => "Remote Control Logs")}

            <div>[<a id="#{dom_id}_screenshot_link" href="javascript:toggleVisilibility('#{dom_id}_screenshot', 'System Screenshot');">Show System Screenshot</a>]</div>
            <br/>      
            <div id="#{dom_id}_screenshot" style="display: none">
              <a href="#{screenshot_url}">
                <img width="80%" src="#{screenshot_url}" />
              </a>
            </div>
            <br/>

          EOS
        end

          def self.append_javascript(global_scripts)
            global_scripts + <<-EOF
        function toggleVisilibility(id, description) {
          var section;
          var link;

          section = document.getElementById(id);
          link = document.getElementById(id + "_link");

          if (section.style.display == "block") {
            section.style.display = "none"
            link.innerHTML = "Show " + description
          } else {
            section.style.display = "block"
            link.innerHTML = "Hide " + description
          }
        }
        EOF
          end

        def self.append_css(global_styles)
            global_styles + <<-EOF
            
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

        def toggable_section(dom_id, options)
          <<-EOS
          
          <div>[
            <a id="#{dom_id}_#{options[:id]}_link" 
               href=\"javascript:toggleVisilibility('#{dom_id}_#{options[:id]}', '#{options[:name]}')\">Show #{options[:name]}</a>
          ]</div>
          <br/><br/>
          <div id="#{dom_id}_#{options[:id]}" class="dyn-source">
            <a href="#{options[:url]}">Full screen</a><br/><br/>
            <iframe src="#{options[:url]}" width="100%" height="600px" ></iframe>
          </div>
          
          EOS
        end
        
        def report_header
          super + "\n<script type=\"text/javascript\">moveProgressBar('100.0');</script>"
        end

      end      
    end
    
  end
end