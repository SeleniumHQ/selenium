require File.expand_path("../spec_helper", __FILE__)
require "selenium/server"

describe Selenium::Server do
  let(:mock_process) { mock(ChildProcess).as_null_object }
  let(:mock_poller)  { mock("SocketPoller", :connected? => true, :closed? => true)}
  
  it "raises an error if the jar file does not exist" do
    lambda {
      Selenium::Server.new("selenium-server-test.jar")
    }.should raise_error(Errno::ENOENT)
  end
  
  it "uses the given jar file and port" do
    File.should_receive(:exist?).with("selenium-server-test.jar").and_return(true)
    
    ChildProcess.should_receive(:build).
                 with("java", "-jar", "selenium-server-test.jar", "-port", "1234").
                 and_return(mock_process)
    
    server = Selenium::Server.new("selenium-server-test.jar", :port => 1234)
    server.stub!(:socket).and_return(mock_poller)
    
    server.start
  end
  
  it "adds additional args" do
    File.should_receive(:exist?).with("selenium-server-test.jar").and_return(true)
    
    ChildProcess.should_receive(:build).
                 with("java", "-jar", "selenium-server-test.jar", "-port", "1234", "foo", "bar").
                 and_return(mock_process)
    
    server = Selenium::Server.new("selenium-server-test.jar", :port => 1234)
    server.stub!(:socket).and_return(mock_poller)
    
    server << ["foo", "bar"]
    
    server.start
  end
  
end
