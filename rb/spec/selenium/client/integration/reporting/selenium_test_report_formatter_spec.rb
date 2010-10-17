require File.expand_path(__FILE__ + '/../../spec_helper')
require "selenium/rspec/reporting/system_capture"

describe "Selenium Test Report Formatter" do
  it "Reports accurate test results" do
    dummy_project_dir = File.expand_path(File.join(File.dirname(__FILE__) , "dummy_project"))
    dummy_project_dir.gsub! %{/}, "\\" if Config::CONFIG["host_os"] =~ /mswin/
    
    formatter = File.expand_path("../../../../../../lib/selenium/rspec/reporting/selenium_test_report_formatter", __FILE__)
    specs = Dir[File.join(dummy_project_dir, '*_spec.rb')]
    
    command = [Gem.ruby, "-S", "spec", "_1.3_"]
    command << "--require" << formatter
    command << "--format=Selenium::RSpec::SeleniumTestReportFormatter:./target/integration_tests_report.html"
    command << "--format=progress"                
    command += specs
    command << "2>&1"
    
    command = command.join(" ")
    
    Dir.chdir(dummy_project_dir) do
      console_output = `#{command}`
      console_output.should =~ /10 examples, 6 failures, 1 pending/
    end
  end
end