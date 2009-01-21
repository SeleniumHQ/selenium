module Selenium
  module RSpec
    module Reporting
      
      class FilePathStrategy
      
        def initialize(final_report_file_path)
          @final_report_file_path = final_report_file_path
          @relative_dir = nil
        end

        def base_report_dir
          @base_report_dir ||= File.dirname(File.expand_path(@final_report_file_path))
        end

        def relative_dir
          return @relative_dir if @relative_dir
          
          file_name_without_extension = File.basename(@final_report_file_path).sub(/\.[^\.]*$/, "")
          @relative_dir ||=  "resources/" + file_name_without_extension
        end

        def relative_file_path_for_html_capture(example)
          "#{relative_dir}/example_#{example_hash(example)}.html"
        end

        def relative_file_path_for_system_screenshot(example)
          "#{relative_dir}/example_#{example_hash(example)}_system_screenshot.png"
        end

        def relative_file_path_for_page_screenshot(example)
          "#{relative_dir}/example_#{example_hash(example)}_page_screenshot.png"
        end

        def relative_file_path_for_remote_control_logs(example)
          "#{relative_dir}/example_#{example_hash(example)}_remote_control.log"
        end

        def file_path_for_html_capture(example)
          file_path relative_file_path_for_html_capture(example)
        end

        def file_path_for_system_screenshot(example)
          file_path relative_file_path_for_system_screenshot(example)
        end

        def file_path_for_page_screenshot(example)
          file_path relative_file_path_for_page_screenshot(example)
        end

        def file_path_for_remote_control_logs(example)
          file_path relative_file_path_for_remote_control_logs(example)
        end

        def file_path(relative_file_path)
          the_file_path = base_report_dir + "/" + relative_file_path
          parent_dir = File.dirname(the_file_path)
          FileUtils.mkdir_p(parent_dir) unless File.directory?(parent_dir)
          the_file_path
        end

        def example_hash(example)
          Digest::MD5.hexdigest example.backtrace.first
        end
      
      end
      
    end      
  end
end