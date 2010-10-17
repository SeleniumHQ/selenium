require File.expand_path("../../../spec_helper", __FILE__)

describe Selenium::RSpec::Reporting::SystemCapture do
  let :system_capture do
    c = Selenium::RSpec::Reporting::SystemCapture.new nil, nil, nil 
    
    c.stub! :retrieve_remote_control_logs
    c.stub! :capture_html_snapshot
    c.stub! :capture_page_screenshot
    c.stub! :capture_system_screenshot
    c.stub! :retrieve_browser_network_traffic
  
    c
  end
  
  describe "#capture_system_state" do
    it "retrieves remote control logs" do
      capture = system_capture
      capture.should_receive(:retrieve_remote_control_logs)
      capture.capture_system_state
    end

    it "prints error message when remote control logs cannot be retrieved" do
      capture = system_capture
      capture.should_receive(:retrieve_remote_control_logs).and_raise(StandardError.new("the error message"))
      capture_stderr {
        capture.capture_system_state
      }.should =~ %r{WARNING: Could not retrieve remote control logs: the error message$}
    end

    it "captures an HTML snapshot" do
      capture = system_capture
      capture.should_receive(:capture_html_snapshot)
      capture.capture_system_state
    end

    it "prints error message when HTML snapshot cannot be retrieved" do
      capture = system_capture
      capture.should_receive(:capture_html_snapshot).and_raise(StandardError.new("the error message"))
      capture_stderr {
        capture.capture_system_state
      }.should =~ %r{WARNING: Could not capture HTML snapshot: the error message$}
    end

    it "captures a page screenshot" do
      capture = system_capture
      capture.should_receive(:capture_page_screenshot)
      capture.capture_system_state
    end

    it "prints error message when page screenshot cannot be retrieved" do
      capture = system_capture
      capture.should_receive(:capture_page_screenshot).and_raise(StandardError.new("the error message"))
      capture_stderr {
        capture.capture_system_state
      }.should =~ %r{WARNING: Could not capture page screenshot: the error message$}
    end

    it "captures a system screenshot" do
      capture = system_capture
      capture.should_receive(:capture_system_screenshot)
      capture.capture_system_state
    end

    it "prints error message when system screenshot cannot be retrieved" do
      capture = system_capture
      capture.should_receive(:capture_system_screenshot).and_raise(StandardError.new("the error message"))
      capture_stderr {
        capture.capture_system_state
      }.should =~ %r{WARNING: Could not capture system screenshot: the error message$}
    end
  end
end
