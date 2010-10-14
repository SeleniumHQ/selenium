require File.expand_path(__FILE__ + '/../../spec_helper')
require File.expand_path(File.dirname(__FILE__) + "/../../../lib/selenium/rspec/reporting/system_capture")

describe "Selenium Test Report Formatter" do

  it "Reports accurate test results" do
    dummy_project_dir = File.expand_path(File.join(File.dirname(__FILE__) , "dummy_project"))
    dummy_project_dir.gsub! %{/}, "\\" if Config::CONFIG["host_os"] =~ /mswin/
    console_output = `cd "#{dummy_project_dir}" && rake clean test 2>&1`
    console_output.should =~ /10 examples, 6 failures, 1 pending/
  end
  
  
end