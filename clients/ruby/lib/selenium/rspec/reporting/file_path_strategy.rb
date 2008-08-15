module Selenium
  module RSpec
    module Reporting
      
      class FilePathStrategy
      
        def initialize(final_report_file_path)
          @final_report_file_path = final_report_file_path
        end

        def base_report_dir
          return @base_report_dir if @base_report_dir

          parent = File.dirname(File.expand_path(@final_report_file_path))
          @base_report_dir =  parent + "/" + relative_dir
        end

        def relative_dir
          return @relative_dir if @relative_dir
          
          file_name_without_extension = File.basename(@final_report_file_path).sub /\.[^\.]*$/, ""
          @relative_dir ||=  "resources/" + file_name_without_extension
        end

        def relative_file_path_for_html_capture(example)
          "#{relative_dir}/example_#{example_hash(example)}.html"
        end

        def relative_file_path_for_png_capture(example)
          "#{relative_dir}/example_#{example_hash(example)}.png"
        end

        def relative_file_path_for_remote_control_logs(example)
          "#{relative_dir}/example_#{example_hash(example)}_remote_control.log"
        end

        def file_path_for_html_capture(example)
          puts ">>>>>>>>> file_path_for_html_capture"
          file_path relative_file_path_for_html_capture(example)
        end

        def file_path_for_png_capture(example)
          file_path relative_file_path_for_png_capture(example)
        end

        def file_path_for_remote_control_logs(example)
          file_path relative_file_path_for_remote_control_logs(example)
        end

        def file_path(relative_file_path)
          puts ">>>>>>>>> file_path : #{base_report_dir.inspect}"
          FileUtils.mkdir_p(base_report_dir) unless File.directory?(base_report_dir)
          base_report_dir + "/" + relative_file_path
        end

        def example_hash(example)
          Digest::MD5.hexdigest example.implementation_backtrace.first
        end
      
      end
      
    end      
  end
end