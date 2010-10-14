require File.expand_path(File.dirname(__FILE__) + '/../../../unit_test_helper')

unit_tests do
  
  test "capture_system_state retrieves remote control logs" do
    capture = Selenium::RSpec::Reporting::SystemCapture.new nil, nil, nil
    capture.stubs(:capture_html_snapshot)
    capture.stubs(:capture_page_screenshot)
    capture.stubs(:capture_system_screenshot)
    capture.stubs(:retrieve_browser_network_traffic)
    
    capture.expects(:retrieve_remote_control_logs)
    capture.capture_system_state
  end

  test "capture_system_state print error message when remote control logs cannot be retrieved" do
    capture = Selenium::RSpec::Reporting::SystemCapture.new nil, nil, nil
    capture.stubs(:capture_html_snapshot)
    capture.stubs(:capture_page_screenshot)
    capture.stubs(:capture_system_screenshot)
    capture.stubs(:retrieve_browser_network_traffic)
        
    capture.expects(:retrieve_remote_control_logs).raises(StandardError.new("the error message"))
    assert_stderr_match %r{WARNING: Could not retrieve remote control logs: the error message$} do 
      capture.capture_system_state
    end
  end

  test "capture_system_state captures an HTML snapshot" do
    capture = Selenium::RSpec::Reporting::SystemCapture.new nil, nil, nil
    capture.stubs(:retrieve_remote_control_logs)
    capture.stubs(:capture_page_screenshot)
    capture.stubs(:capture_system_screenshot)
    capture.stubs(:retrieve_browser_network_traffic)
    
    capture.expects(:capture_html_snapshot)
    capture.capture_system_state
  end

  test "capture_system_state print error message when HTML snapshot cannot be retrieved" do
    capture = Selenium::RSpec::Reporting::SystemCapture.new nil, nil, nil
    capture.stubs(:retrieve_remote_control_logs)
    capture.stubs(:capture_page_screenshot)
    capture.stubs(:capture_system_screenshot)
    capture.stubs(:retrieve_browser_network_traffic)
        
    capture.expects(:capture_html_snapshot).raises(StandardError.new("the error message"))
    assert_stderr_match %r{WARNING: Could not capture HTML snapshot: the error message$} do 
      capture.capture_system_state
    end
  end

  test "capture_system_state captures a page screenshot" do
    capture = Selenium::RSpec::Reporting::SystemCapture.new nil, nil, nil
    capture.stubs(:retrieve_remote_control_logs)
    capture.stubs(:capture_html_snapshot)
    capture.stubs(:capture_system_screenshot)
    capture.stubs(:retrieve_browser_network_traffic)
    
    capture.expects(:capture_page_screenshot)
    capture.capture_system_state
  end

  test "capture_system_state print error message when page screenshot cannot be retrieved" do
    capture = Selenium::RSpec::Reporting::SystemCapture.new nil, nil, nil
    capture.stubs(:retrieve_remote_control_logs)
    capture.stubs(:capture_html_snapshot)
    capture.stubs(:capture_system_screenshot)
    capture.stubs(:retrieve_browser_network_traffic)
        
    capture.expects(:capture_page_screenshot).raises(StandardError.new("the error message"))
    assert_stderr_match %r{WARNING: Could not capture page screenshot: the error message$} do 
      capture.capture_system_state
    end
  end

  test "capture_system_state captures a system screenshot" do
    capture = Selenium::RSpec::Reporting::SystemCapture.new nil, nil, nil
    capture.stubs(:retrieve_remote_control_logs)
    capture.stubs(:capture_html_snapshot)
    capture.stubs(:capture_page_screenshot)
    capture.stubs(:retrieve_browser_network_traffic)
    
    capture.expects(:capture_system_screenshot)
    capture.capture_system_state
  end

  test "capture_system_state print error message when system screenshot cannot be retrieved" do
    capture = Selenium::RSpec::Reporting::SystemCapture.new nil, nil, nil
    capture.stubs(:retrieve_remote_control_logs)
    capture.stubs(:capture_html_snapshot)
    capture.stubs(:capture_page_screenshot)
    capture.stubs(:retrieve_browser_network_traffic)
        
    capture.expects(:capture_system_screenshot).raises(StandardError.new("the error message"))
    assert_stderr_match %r{WARNING: Could not capture system screenshot: the error message$} do 
      capture.capture_system_state
    end
  end

end
