require File.expand_path(File.dirname(__FILE__) + '/../spec_helper')

describe "Selenium Screenshot" do
  
  it "can retrieve logs even when the is no session was started" do
    logs = @selenium.retrieve_last_remote_control_logs
    logs.should =~ %r{request: retrieveLastRemoteControlLogs\[, \]}
    logs.should =~ %r{org.openqa.selenium.server.SeleniumDriverResourceHandler - Got result: OK}
  end

  it "can retrieve logs even when no command were issued" do
    start
    open "http://localhost:4444/selenium-server/tests/html/test_click_page1.html"
    logs = retrieve_last_remote_control_logs
    logs.should =~ %r{request: getNewBrowserSession\[\*chrome, http://google.com:80, \]}
    logs.should =~ %r{request: open\[http://localhost:4444/selenium-server/tests/html/test_click_page1.html, \]}
    logs.should =~ %r{request: retrieveLastRemoteControlLogs\[, \]}
    logs.should =~ %r{org.openqa.selenium.server.SeleniumDriverResourceHandler - Got result: OK}
  end
  
  it "can retrieve logs even when commands were issued" do
    start
    open "http://localhost:4444/selenium-server/tests/html/test_click_page1.html"
    get_title
    logs = retrieve_last_remote_control_logs
    logs.should =~ %r{request: getNewBrowserSession\[\*chrome, http://google.com:80, \]}
    logs.should =~ %r{request: open\[http://localhost:4444/selenium-server/tests/html/test_click_page1.html, \]}
    logs.should =~ %r{request: getTitle\[, \]}
    logs.should =~ %r{request: retrieveLastRemoteControlLogs\[, \]}
    logs.should =~ %r{org.openqa.selenium.server.SeleniumDriverResourceHandler - Got result: OK}
  end
      
end