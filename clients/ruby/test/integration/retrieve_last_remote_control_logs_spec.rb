require File.expand_path(File.dirname(__FILE__) + '/spec_helper')

describe "Selenium Screenshot" do
  
  xit "can retrieve logs even when the is no session is closed" do
    pending "interfeers with other tests"
    stop
    logs = @selenium.retrieve_last_remote_control_logs
    logs.should =~ /java.util.logging.LogRecord/
  end

  it "can retrieve logs even when no command were issued" do
    open "http://google.com"
    logs = retrieve_last_remote_control_logs
    logs.should =~ %r{request: getNewBrowserSession\[\*chrome, http://google.com:80, \]}
    logs.should =~ %r{request: open\[http://amazon.fr, \]}
    logs.should =~ %r{request: retrieveLastRemoteControlLogs\[, \]}
    logs.should =~ %r{org.openqa.selenium.server.SeleniumDriverResourceHandler - Got result: OK}
  end
  
  it "can retrieve logs even when commands were issued" do
    open "http://google.com"
    get_title
    logs = retrieve_last_remote_control_logs
    logs.should =~ %r{request: getNewBrowserSession\[\*chrome, http://google.com:80, \]}
    logs.should =~ %r{request: open\[http://amazon.fr, \]}
    logs.should =~ %r{request: getTitle\[, \]}
    logs.should =~ %r{request: retrieveLastRemoteControlLogs\[, \]}
    logs.should =~ %r{org.openqa.selenium.server.SeleniumDriverResourceHandler - Got result: OK}
  end
      
end