require File.expand_path("../../../spec_helper", __FILE__)

describe Selenium::RSpec::Reporting::SystemCapture do

  it "capture_system_state retrieves remote control logs" do
    capture = Selenium::RSpec::Reporting::SystemCapture.new nil, nil, nil
    capture.stub!(:capture_html_snapshot)
    capture.stub!(:capture_page_screenshot)
    capture.stub!(:capture_system_screenshot)
    capture.stub!(:retrieve_browser_network_traffic)

    capture.should_receive(:retrieve_remote_control_logs)
    capture.capture_system_state
  end

  it "capture_system_state print error message when remote control logs cannot be retrieved" do
    capture = Selenium::RSpec::Reporting::SystemCapture.new nil, nil, nil
    capture.stub!(:capture_html_snapshot)
    capture.stub!(:capture_page_screenshot)
    capture.stub!(:capture_system_screenshot)
    capture.stub!(:retrieve_browser_network_traffic)

    capture.should_receive(:retrieve_remote_control_logs).and_raise(StandardError.new("the error message"))
    capture_stderr {
      capture.capture_system_state
    }.should =~ %r{WARNING: Could not retrieve remote control logs: the error message$}
  end

  it "capture_system_state captures an HTML snapshot" do
    capture = Selenium::RSpec::Reporting::SystemCapture.new nil, nil, nil
    capture.stub!(:retrieve_remote_control_logs)
    capture.stub!(:capture_page_screenshot)
    capture.stub!(:capture_system_screenshot)
    capture.stub!(:retrieve_browser_network_traffic)

    capture.should_receive(:capture_html_snapshot)
    capture.capture_system_state
  end

  it "capture_system_state print error message when HTML snapshot cannot be retrieved" do
    capture = Selenium::RSpec::Reporting::SystemCapture.new nil, nil, nil
    capture.stub!(:retrieve_remote_control_logs)
    capture.stub!(:capture_page_screenshot)
    capture.stub!(:capture_system_screenshot)
    capture.stub!(:retrieve_browser_network_traffic)

    capture.should_receive(:capture_html_snapshot).and_raise(StandardError.new("the error message"))
    capture_stderr {
      capture.capture_system_state
    }.should =~ %r{WARNING: Could not capture HTML snapshot: the error message$}
  end

  it "capture_system_state captures a page screenshot" do
    capture = Selenium::RSpec::Reporting::SystemCapture.new nil, nil, nil
    capture.stub!(:retrieve_remote_control_logs)
    capture.stub!(:capture_html_snapshot)
    capture.stub!(:capture_system_screenshot)
    capture.stub!(:retrieve_browser_network_traffic)

    capture.should_receive(:capture_page_screenshot)
    capture.capture_system_state
  end

  it "capture_system_state print error message when page screenshot cannot be retrieved" do
    capture = Selenium::RSpec::Reporting::SystemCapture.new nil, nil, nil
    capture.stub!(:retrieve_remote_control_logs)
    capture.stub!(:capture_html_snapshot)
    capture.stub!(:capture_system_screenshot)
    capture.stub!(:retrieve_browser_network_traffic)

    capture.should_receive(:capture_page_screenshot).and_raise(StandardError.new("the error message"))
    capture_stderr {
      capture.capture_system_state
    }.should =~ %r{WARNING: Could not capture page screenshot: the error message$}
  end

  it "capture_system_state captures a system screenshot" do
    capture = Selenium::RSpec::Reporting::SystemCapture.new nil, nil, nil
    capture.stub!(:retrieve_remote_control_logs)
    capture.stub!(:capture_html_snapshot)
    capture.stub!(:capture_page_screenshot)
    capture.stub!(:retrieve_browser_network_traffic)

    capture.should_receive(:capture_system_screenshot)
    capture.capture_system_state
  end

  it "capture_system_state print error message when system screenshot cannot be retrieved" do
    capture = Selenium::RSpec::Reporting::SystemCapture.new nil, nil, nil
    capture.stub!(:retrieve_remote_control_logs)
    capture.stub!(:capture_html_snapshot)
    capture.stub!(:capture_page_screenshot)
    capture.stub!(:retrieve_browser_network_traffic)

    capture.should_receive(:capture_system_screenshot).and_raise(StandardError.new("the error message"))
    capture_stderr {
      capture.capture_system_state
    }.should =~ %r{WARNING: Could not capture system screenshot: the error message$}
  end

end
