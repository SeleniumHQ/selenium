require File.expand_path(__FILE__ + '/../../spec_helper')
require File.expand_path(File.dirname(__FILE__) + "/../../../lib/selenium/rspec/reporting/system_capture")

describe "Selenium Test Report Formatter" do

  it "Reports accurate test results" do
    dummy_project_dir = File.expand_path(File.dirname(__FILE__) + "/dummy_project")
    console_output = `cd "#{dummy_project_dir}" && rake clean test`
    console_output.should =~ /7 examples, 5 failures /
  end
  
  
end