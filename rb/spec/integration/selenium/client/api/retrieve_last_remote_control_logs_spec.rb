require File.expand_path(File.dirname(__FILE__) + '/../spec_helper')

describe "Remote Control Logs Retrieval" do
  # it "can retrieve logs even when the is no session was started" do
  #   selenium_driver.stop
  #   logs = selenium_driver.retrieve_last_remote_control_logs
  #
  #   logs.should =~ %r{request: retrieveLastRemoteControlLogs\[, \]}
  #   logs.should =~ %r{Got result: OK}
  # end
  #
  # it "can retrieve logs even when no command were issued" do
  #   page.open "http://localhost:4444/selenium-server/tests/html/test_click_page1.html"
  #   logs = selenium_driver.retrieve_last_remote_control_logs
  #
  #   logs.should =~ %r{request: getNewBrowserSession\[\*[a-z0-9]+, http://localhost:4567, , \]}
  #   logs.should =~ %r{request: open\[http://localhost:4444/selenium-server/tests/html/test_click_page1.html, \]}
  #   logs.should =~ %r{request: retrieveLastRemoteControlLogs\[, \]}
  #   logs.should =~ %r{org.openqa.selenium.server.SeleniumDriverResourceHandler - Got result: OK}
  # end
  #
  # it "can retrieve logs even when commands were issued" do
  #   page.open "http://localhost:4444/selenium-server/tests/html/test_click_page1.html"
  #   page.get_title
  #   logs = selenium_driver.retrieve_last_remote_control_logs
  #
  #   logs.should =~ %r{request: getNewBrowserSession\[\*[a-z0-9]+, http://localhost:4567, , \]}
  #   logs.should =~ %r{request: open\[http://localhost:4444/selenium-server/tests/html/test_click_page1.html, \]}
  #   logs.should =~ %r{request: getTitle\[, \]}
  #   logs.should =~ %r{request: retrieveLastRemoteControlLogs\[, \]}
  #   logs.should =~ %r{org.openqa.selenium.server.SeleniumDriverResourceHandler - Got result: OK}
  # end
end