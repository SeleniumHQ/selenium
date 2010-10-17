require File.expand_path("../../../spec_helper", __FILE__)

describe Selenium::RSpec::Reporting::FilePathStrategy do
  describe "#final_report_file_path" do
    it "final_report_file_path is the path provided in the constructor when not nil" do
      strategy = Selenium::RSpec::Reporting::FilePathStrategy.new "/some/dir/a_final_report.html"
      strategy.final_report_file_path.should == "/some/dir/a_final_report.html"
    end

    it "final_report_file_path default to a temporary path when the path provided in the constructor is nil" do
      strategy = Selenium::RSpec::Reporting::FilePathStrategy.new nil
      strategy.final_report_file_path.should =~ /tmp|temp|\.Trash/i
      strategy.final_report_file_path.should =~ /index.html$/
    end
  end

  describe "base_report_dir" do
    it "base_report_dir is resource/<name of the report> under the final report base directory" do
      strategy = Selenium::RSpec::Reporting::FilePathStrategy.new "/some/dir/a_final_report.html"
      strategy.base_report_dir.should == File.expand_path("/some/dir")
    end

    it "base_report_dir is distinct when the only the report name changes" do
      first_strategy = Selenium::RSpec::Reporting::FilePathStrategy.new "/some/dir/a_final_report.html"
      second_strategy = Selenium::RSpec::Reporting::FilePathStrategy.new "/another/dir/another_final_report.html"
      first_strategy.base_report_dir.should == File.expand_path("/some/dir")
      second_strategy.base_report_dir.should == File.expand_path("/another/dir")
    end
  end

  describe "#relative_file_path_for_*" do
    it "is based on the example hash for html capture" do
      strategy = Selenium::RSpec::Reporting::FilePathStrategy.new "a_report.html"
      example = mock(:reporting_uid => "the_hash").as_null_object
      strategy.relative_file_path_for_html_capture(example).should == "resources/a_report/example_the_hash.html"
    end

    it "is based on the example hash for system screenshot" do
      strategy = Selenium::RSpec::Reporting::FilePathStrategy.new "the_report.html"
      example = mock(:reporting_uid => "the_hash").as_null_object
      strategy.relative_file_path_for_system_screenshot(example).should == "resources/the_report/example_the_hash_system_screenshot.png"
    end

    it "is based on the example hash for page screenshot" do
      strategy = Selenium::RSpec::Reporting::FilePathStrategy.new "the_report.html"
      example = mock(:reporting_uid => "the_hash").as_null_object
      strategy.relative_file_path_for_page_screenshot(example).should == "resources/the_report/example_the_hash_page_screenshot.png"
    end

    it "is based on the example hash for remote control logs" do
      strategy = Selenium::RSpec::Reporting::FilePathStrategy.new "the_report.html"
      example = mock(:reporting_uid => "the_hash").as_null_object
      strategy.relative_file_path_for_remote_control_logs(example).should == "resources/the_report/example_the_hash_remote_control.log"
    end
  end

  describe "#file_path" do
    it "concatenates the base_report_dir and the relative path" do
      strategy = Selenium::RSpec::Reporting::FilePathStrategy.new "report.html"
      FileUtils.stub!(:mkdir_p)
      strategy.stub!(:base_report_dir).and_return("/base/report/dir")
      strategy.file_path("relative/path/file.html").should == "/base/report/dir/relative/path/file.html"
    end

    it "creates the base_report_dir directory if it does not exists" do
      strategy = Selenium::RSpec::Reporting::FilePathStrategy.new "report.html"
      strategy.stub!(:base_report_dir).and_return("/base/report/dir")
      File.stub!(:directory?).with("/base/report/dir/relative/path").and_return(false)

      FileUtils.should_receive(:mkdir_p).with("/base/report/dir/relative/path")
      strategy.file_path "relative/path/file.html"
    end

    it "does not create the base_report_dir directory if it does exists" do
      strategy = Selenium::RSpec::Reporting::FilePathStrategy.new "report.html"
      strategy.stub!(:base_report_dir).and_return("/base/report/dir")
      File.stub!(:directory?).with("/base/report/dir/relative/path").and_return(true)

      FileUtils.should_not_receive(:mkdir_p)
      strategy.file_path "relative/path/file.html"
    end
  end

  describe "file_path_for_*" do
    it "returns the absolute file path for the captured html file" do
      strategy = Selenium::RSpec::Reporting::FilePathStrategy.new "a_final_report.html"
      example = mock(:reporting_uid => "the_hash").as_null_object

      strategy.should_receive(:file_path).with("resources/a_final_report/example_the_hash.html") \
        .and_return(:the_absolute_file_path)
      strategy.file_path_for_html_capture(example).should == :the_absolute_file_path
    end

    it "returns the absolute file path for the system screenshot png file" do
      strategy = Selenium::RSpec::Reporting::FilePathStrategy.new "a_final_report.html"
      example = mock(:reporting_uid => "the_hash").as_null_object

      strategy.should_receive(:file_path).with("resources/a_final_report/example_the_hash_system_screenshot.png")\
        .and_return(:the_absolute_file_path)
      strategy.file_path_for_system_screenshot(example).should == :the_absolute_file_path
    end

    it "returns the absolute file path for the page screenshot png file" do
      strategy = Selenium::RSpec::Reporting::FilePathStrategy.new "a_final_report.html"
      example = mock(:reporting_uid => "the_hash").as_null_object

      strategy.should_receive(:file_path).with("resources/a_final_report/example_the_hash_page_screenshot.png")\
        .and_return(:the_absolute_file_path)
      strategy.file_path_for_page_screenshot(example).should == :the_absolute_file_path
    end

    it "file_path_for_remote_control_logs return the absolute file path for the log file" do
      strategy = Selenium::RSpec::Reporting::FilePathStrategy.new "a_final_report.html"
      example = mock(:reporting_uid => "the_hash").as_null_object

      strategy.should_receive(:file_path).with("resources/a_final_report/example_the_hash_remote_control.log")\
        .and_return(:the_absolute_file_path)
      strategy.file_path_for_remote_control_logs(example).should == :the_absolute_file_path
    end

    it "return the absolute file path for the log file" do
      strategy = Selenium::RSpec::Reporting::FilePathStrategy.new "a_final_report.html"
      example = mock(:reporting_uid => "the_hash").as_null_object

      strategy.should_receive(:file_path).with("resources/a_final_report/example_the_hash_browser_network_traffic.log")\
        .and_return(:the_absolute_file_path)
      strategy.file_path_for_browser_network_traffic(example).should == :the_absolute_file_path
    end
  end
end
