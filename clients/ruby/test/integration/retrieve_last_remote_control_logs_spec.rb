require File.expand_path(File.dirname(__FILE__) + '/spec_helper')

describe "Selenium Screenshot" do
  
  xit "can retrieve logs even when the is no session is closed" do
    pending "interfeers with other tests"
    stop
    logs = @selenium.retrieve_last_remote_control_logs
    logs.should =~ /java.util.logging.LogRecord/
  end

  it "can retrieve logs even when no command were issued" do
    open "http://amazon.fr"
    logs = @selenium.retrieve_last_remote_control_logs
    logs.should =~ /java.util.logging.LogRecord/
  end
  
  it "can retrieve logs even when commands were issued" do
    open "http://amazon.fr"
    get_title
    logs = @selenium.retrieve_last_remote_control_logs
    logs.should =~ /java.util.logging.LogRecord/
  end
      
end